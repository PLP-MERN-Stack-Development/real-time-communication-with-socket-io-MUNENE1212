// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Import Models
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory cache for active users and typing status
const activeUsers = {};  // socketId -> user data
const typingUsers = {};  // key -> { username, roomId }

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', async (username) => {
    try {
      // Find user in database (must be authenticated)
      let user = await User.findOne({ username });

      if (!user) {
        // User not found - they must register first
        socket.emit('error', { message: 'User not found. Please register first.' });
        return;
      }

      // Update user status
      user.socketId = socket.id;
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      // Store in active users cache
      activeUsers[socket.id] = {
        username,
        id: socket.id,
        currentRoom: 'global',
        userId: user._id
      };

      // Join the global room by default
      socket.join('global');

      // Get all rooms from database
      const rooms = await Room.find().sort({ createdAt: -1 });

      // Ensure global room exists
      let globalRoom = rooms.find(r => r.name === 'Global Chat');
      if (!globalRoom) {
        globalRoom = await Room.create({
          name: 'Global Chat',
          isPrivate: false,
          createdBy: 'system',
          members: []
        });
        rooms.unshift(globalRoom);
      }

      // Send all registered users (not just online ones)
      const allUsers = await User.find().select('username isOnline lastSeen').lean();
      const userList = allUsers.map(u => {
        const activeUser = Object.values(activeUsers).find(au => au.username === u.username);
        return {
          username: u.username,
          id: activeUser?.id || null,
          isOnline: !!activeUser,
          lastSeen: u.lastSeen
        };
      });

      io.emit('user_list', userList);
      io.to('global').emit('user_joined', { username, id: socket.id, room: 'global' });

      // Send room list with MongoDB IDs
      const roomList = rooms.map(r => ({
        id: r._id.toString(),
        name: r.name,
        isPrivate: r.isPrivate,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
        members: r.members
      }));
      socket.emit('room_list', roomList);

      // Load and send global room message history
      const globalMessages = await Message.find({ roomId: 'global' })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const formattedGlobalMessages = globalMessages.reverse().map(msg => ({
        id: msg._id.toString(),
        message: msg.message,
        sender: msg.sender,
        senderId: msg.senderId || '',
        timestamp: msg.createdAt,
        roomId: msg.roomId,
        isPrivate: msg.isPrivate || false,
        reactions: msg.reactions || {},
        userReactions: msg.userReactions || {}
      }));

      // Send global room data with message history
      socket.emit('room_joined', {
        room: {
          id: globalRoom._id.toString(),
          name: globalRoom.name,
          isPrivate: globalRoom.isPrivate,
          createdBy: globalRoom.createdBy,
          createdAt: globalRoom.createdAt,
          members: globalRoom.members
        },
        messages: formattedGlobalMessages
      });

      // Check for undelivered private messages (offline messages)
      const offlineMessages = await Message.find({
        recipientUsername: username,
        isPrivate: true,
        delivered: false
      }).sort({ createdAt: 1 }).lean();

      // Send notifications for offline messages and mark as delivered
      if (offlineMessages.length > 0) {
        for (const msg of offlineMessages) {
          socket.emit('offline_message_notification', {
            id: msg._id.toString(),
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.createdAt,
            count: offlineMessages.length
          });

          // Mark as delivered
          await Message.findByIdAndUpdate(msg._id, { delivered: true });
        }

        console.log(`Delivered ${offlineMessages.length} offline messages to ${username}`);
      }

      console.log(`${username} joined the chat`);
    } catch (error) {
      console.error('Error in user_join:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle chat messages
  socket.on('send_message', async ({ message, roomId = 'global' }) => {
    try {
      const sender = activeUsers[socket.id]?.username || 'Anonymous';

      // Save message to MongoDB
      const newMessage = await Message.create({
        roomId,
        sender,
        senderId: socket.id,
        message,
        isPrivate: false
      });

      // Prepare message object to send to clients
      const messageObj = {
        id: newMessage._id.toString(),
        message: newMessage.message,
        sender: newMessage.sender,
        senderId: newMessage.senderId,
        timestamp: newMessage.createdAt.toISOString(),
        roomId: newMessage.roomId
      };

      // Emit to all users in the specific room
      io.to(roomId).emit('receive_message', messageObj);

      console.log(`Message saved in room ${roomId} by ${sender}`);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ isTyping, roomId = 'global' }) => {
    if (activeUsers[socket.id]) {
      const username = activeUsers[socket.id].username;
      const key = `${socket.id}-${roomId}`;

      if (isTyping) {
        typingUsers[key] = { username, roomId };
      } else {
        delete typingUsers[key];
      }

      // Get typing users for this room only
      const roomTypingUsers = Object.values(typingUsers)
        .filter(u => u.roomId === roomId)
        .map(u => u.username);

      io.to(roomId).emit('typing_users', roomTypingUsers);
    }
  });

  // Handle loading private message history
  socket.on('load_private_messages', async ({ withUsername }) => {
    try {
      const currentUsername = activeUsers[socket.id]?.username;

      if (!currentUsername) {
        return socket.emit('error', { message: 'User not authenticated' });
      }

      // Create deterministic private room ID based on usernames (alphabetically sorted)
      const privateRoomId = `private_${[currentUsername, withUsername].sort().join('_')}`;

      // Get private messages between these two users
      const privateMessages = await Message.find({
        roomId: privateRoomId,
        isPrivate: true
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Format messages for client
      const formattedMessages = privateMessages.reverse().map(msg => ({
        id: msg._id.toString(),
        message: msg.message,
        sender: msg.sender,
        senderId: msg.senderId || '',
        recipientUsername: msg.sender === currentUsername ? withUsername : currentUsername,
        timestamp: msg.createdAt,
        isPrivate: true,
        reactions: msg.reactions || {},
        userReactions: msg.userReactions || {}
      }));

      socket.emit('private_messages_loaded', {
        withUsername,
        messages: formattedMessages
      });

      console.log(`Loaded ${formattedMessages.length} private messages between ${currentUsername} and ${withUsername}`);
    } catch (error) {
      console.error('Error loading private messages:', error);
      socket.emit('error', { message: 'Failed to load private messages' });
    }
  });

  // Handle private messages
  socket.on('private_message', async ({ to, message, toUsername }) => {
    try {
      const sender = activeUsers[socket.id]?.username || 'Anonymous';

      // toUsername is required now (since we can message offline users)
      const recipientUsername = toUsername;
      if (!recipientUsername) {
        return socket.emit('error', { message: 'Recipient username is required' });
      }

      // Find recipient's socket ID if they're online
      const recipientUser = Object.values(activeUsers).find(u => u.username === recipientUsername);
      const recipientSocketId = recipientUser?.id || null;

      // Create deterministic private room ID based on usernames (alphabetically sorted)
      const privateRoomId = `private_${[sender, recipientUsername].sort().join('_')}`;

      // Save message to database (works for both online and offline users)
      const newMessage = await Message.create({
        roomId: privateRoomId,
        sender,
        senderId: socket.id,
        message,
        isPrivate: true,
        recipientUsername: recipientUsername,
        delivered: !!recipientSocketId,  // Mark as delivered only if recipient is online
        read: false,
        reactions: new Map(),
        userReactions: new Map()
      });

      const messageData = {
        id: newMessage._id.toString(),
        sender,
        senderId: socket.id,
        recipientId: recipientSocketId,
        recipientUsername: recipientUsername,
        message,
        timestamp: newMessage.createdAt,
        isPrivate: true,
        reactions: {},
        userReactions: {}
      };

      // Send to recipient ONLY if they're online
      if (recipientSocketId) {
        socket.to(recipientSocketId).emit('private_message', messageData);
        console.log(`Private message delivered to online user: ${sender} -> ${recipientUsername}`);
      } else {
        console.log(`Private message saved for offline user: ${sender} -> ${recipientUsername}`);
      }

      // Send back to sender for confirmation
      socket.emit('private_message', messageData);
    } catch (error) {
      console.error('Error sending private message:', error);
      socket.emit('error', { message: 'Failed to send private message' });
    }
  });

  // Handle message reactions - only one reaction per user per message
  socket.on('add_reaction', async ({ messageId, emoji, roomId = 'global' }) => {
    try {
      const username = activeUsers[socket.id]?.username || 'Anonymous';

      // Find the message in MongoDB
      const message = await Message.findById(messageId);
      if (!message) {
        return socket.emit('error', { message: 'Message not found' });
      }

      // Get current reactions as objects
      const reactions = message.reactions ? Object.fromEntries(message.reactions) : {};
      const userReactions = message.userReactions ? Object.fromEntries(message.userReactions) : {};

      // Check if user already reacted
      const previousEmoji = userReactions[username];

      if (previousEmoji) {
        // Remove previous reaction
        if (reactions[previousEmoji]) {
          reactions[previousEmoji].users = reactions[previousEmoji].users.filter(u => u !== username);

          if (reactions[previousEmoji].users.length === 0) {
            delete reactions[previousEmoji];
          }
        }
      }

      // If clicking the same emoji, just remove it (toggle off)
      if (previousEmoji === emoji) {
        delete userReactions[username];
      } else {
        // Add new reaction
        if (!reactions[emoji]) {
          reactions[emoji] = { emoji, users: [] };
        }
        reactions[emoji].users.push(username);
        userReactions[username] = emoji;
      }

      // Update message in database
      message.reactions = new Map(Object.entries(reactions));
      message.userReactions = new Map(Object.entries(userReactions));
      await message.save();

      // Broadcast reaction update to all users in the room
      io.to(roomId).emit('reaction_update', {
        messageId,
        reactions,
        userReactions
      });

    } catch (error) {
      console.error('Error handling reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // Handle room creation
  socket.on('create_room', async ({ name, isPrivate = false }) => {
    try {
      const username = activeUsers[socket.id]?.username || 'Anonymous';

      // Create room in MongoDB
      const newRoom = await Room.create({
        name,
        isPrivate,
        createdBy: username,
        members: isPrivate ? [username] : []
      });

      const roomData = {
        id: newRoom._id.toString(),
        name: newRoom.name,
        isPrivate: newRoom.isPrivate,
        createdBy: newRoom.createdBy,
        createdAt: newRoom.createdAt,
        members: newRoom.members
      };

      // If private room, only the creator joins automatically
      if (isPrivate) {
        socket.join(newRoom._id.toString());
        activeUsers[socket.id].currentRoom = newRoom._id.toString();
        socket.emit('room_created', roomData);
        socket.emit('room_joined', { room: roomData, messages: [] });
      } else {
        // Broadcast to all users
        const allRooms = await Room.find().sort({ createdAt: -1 });
        const roomList = allRooms.map(r => ({
          id: r._id.toString(),
          name: r.name,
          isPrivate: r.isPrivate,
          createdBy: r.createdBy,
          createdAt: r.createdAt,
          members: r.members
        }));
        io.emit('room_list', roomList);
        socket.emit('room_created', roomData);
      }

      console.log(`${username} created room: ${name} (${isPrivate ? 'Private' : 'Public'})`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Handle joining a room
  socket.on('join_room', async (roomId) => {
    try {
      const username = activeUsers[socket.id]?.username || 'Anonymous';
      const room = await Room.findById(roomId);

      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }

      // Check if room is private
      if (room.isPrivate && !room.members.includes(username)) {
        return socket.emit('error', { message: 'This is a private room' });
      }

      // Leave current room
      const currentRoom = activeUsers[socket.id]?.currentRoom;
      if (currentRoom) {
        socket.leave(currentRoom);
      }

      // Join new room
      socket.join(roomId);
      activeUsers[socket.id].currentRoom = roomId;

      // Add user to room members if not already there
      if (!room.members.includes(username)) {
        room.members.push(username);
        await room.save();
      }

      // Get recent messages for this room (last 50)
      const roomMessages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Format messages for client
      const formattedMessages = roomMessages.reverse().map(msg => ({
        id: msg._id.toString(),
        message: msg.message,
        sender: msg.sender,
        senderId: msg.senderId,
        timestamp: msg.createdAt.toISOString(),
        roomId: msg.roomId,
        isPrivate: msg.isPrivate
      }));

      const roomData = {
        id: room._id.toString(),
        name: room.name,
        isPrivate: room.isPrivate,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        members: room.members
      };

      socket.emit('room_joined', { room: roomData, messages: formattedMessages });

      // Notify room members
      io.to(roomId).emit('user_joined_room', { username, roomId });

      console.log(`${username} joined room: ${room.name}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle leaving a room
  socket.on('leave_room', (roomId) => {
    const username = users[socket.id]?.username || 'Anonymous';

    socket.leave(roomId);

    if (rooms[roomId]) {
      rooms[roomId].members = rooms[roomId].members.filter(id => id !== socket.id);
    }

    // Notify room members
    io.to(roomId).emit('user_left_room', { username, roomId });

    console.log(`${username} left room: ${rooms[roomId]?.name}`);
  });

  // Handle inviting user to private room
  socket.on('invite_to_room', ({ roomId, userId }) => {
    const room = rooms[roomId];
    const inviter = users[socket.id]?.username || 'Anonymous';

    if (!room || !room.isPrivate) {
      return;
    }

    // Send invitation to the user
    io.to(userId).emit('room_invitation', {
      room,
      inviter,
      roomId
    });
  });

  // Handle accepting room invitation
  socket.on('accept_invitation', (roomId) => {
    const room = rooms[roomId];

    if (room && room.isPrivate) {
      if (!room.members.includes(socket.id)) {
        room.members.push(socket.id);
      }
      socket.emit('room_list', Object.values(rooms));
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    if (activeUsers[socket.id]) {
      const { username, currentRoom } = activeUsers[socket.id];

      try {
        // Update user status in database
        await User.findOneAndUpdate(
          { username },
          { isOnline: false, lastSeen: new Date(), socketId: null }
        );

        // Notify room members if user was in a room
        if (currentRoom) {
          io.to(currentRoom).emit('user_left_room', { username, roomId: currentRoom });
        }

        io.emit('user_left', { username, id: socket.id });
        console.log(`${username} left the chat`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }

    // Clean up typing indicators for this user
    Object.keys(typingUsers).forEach(key => {
      if (key.startsWith(socket.id)) {
        delete typingUsers[key];
      }
    });

    delete activeUsers[socket.id];

    // Send updated user list with all registered users
    User.find().select('username isOnline lastSeen').lean().then(allUsers => {
      const userList = allUsers.map(u => {
        const activeUser = Object.values(activeUsers).find(au => au.username === u.username);
        return {
          username: u.username,
          id: activeUser?.id || null,
          isOnline: !!activeUser,
          lastSeen: u.lastSeen
        };
      });
      io.emit('user_list', userList);
    });
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Create new user (password will be hashed automatically by pre-save hook)
    const user = await User.create({
      username,
      password,
      isOnline: false
    });

    // Return user data without password
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Return user data without password
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// API routes
app.get('/api/messages/:roomId?', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const query = roomId ? { roomId } : {};
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server with MongoDB is running');
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`MongoDB connection established`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io }; 