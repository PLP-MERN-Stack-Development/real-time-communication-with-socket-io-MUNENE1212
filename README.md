# Real-Time Chat Application with Socket.io

A fully-featured real-time chat application built with React, Node.js, Express, and Socket.io. This application demonstrates bidirectional communication between clients and server with advanced features like private messaging, message reactions, typing indicators, and real-time notifications.

## Features Implemented

### Core Features
- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Simple username-based authentication with persistent sessions
- **Multiple Chat Rooms**: Create and join public or private chat rooms
- **Online User List**: View all currently connected users with online status indicators
- **Connection Status**: Visual indicator showing connection state to the server

### Advanced Features
1. **Public & Private Rooms**:
   - Create public rooms that anyone can join
   - Create private rooms with invite-only access
   - Switch between rooms seamlessly
   - Room-specific message history
2. **Private Messaging**: Direct message any online user privately
3. **Smart Message Reactions**:
   - React to messages with emojis (👍, ❤️, 😂, 😮, 🎉, 🔥)
   - One reaction per user per message
   - Click same emoji to remove reaction
   - Visual indicator showing your active reaction
4. **Typing Indicators**: See when other users are composing messages (room-specific)
5. **Real-time Notifications**:
   - In-app toast notifications for new messages
   - Browser notifications (with permission)
   - Sound alerts for incoming messages
6. **Unread Message Count**: Track unread messages when window is not focused
7. **Message Pagination**: Load older messages on demand
8. **Responsive Design**: Works seamlessly on desktop and mobile devices
9. **Auto-reconnection**: Automatically reconnects on connection loss

## Project Structure

```
real-time-communication-with-socket-io/
├── client/                          # React front-end
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.jsx        # Main chat interface
│   │   │   ├── ChatRoom.css
│   │   │   ├── Login.jsx           # User authentication
│   │   │   ├── Login.css
│   │   │   ├── MessageList.jsx     # Message display with reactions
│   │   │   ├── MessageList.css
│   │   │   ├── MessageInput.jsx    # Message input with typing indicator
│   │   │   ├── MessageInput.css
│   │   │   ├── UserList.jsx        # Online users sidebar
│   │   │   ├── UserList.css
│   │   │   ├── RoomList.jsx        # Room management sidebar
│   │   │   ├── RoomList.css
│   │   │   ├── CreateRoomModal.jsx # Create room modal
│   │   │   ├── CreateRoomModal.css
│   │   │   ├── NotificationManager.jsx  # Toast notifications
│   │   │   └── NotificationManager.css
│   │   ├── socket/
│   │   │   └── socket.js           # Socket.io client setup & hooks
│   │   ├── App.jsx                 # Main app component
│   │   ├── App.css
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── vite.config.js              # Vite configuration
│   ├── package.json                # Client dependencies
│   └── .env                        # Environment variables
├── server/                          # Node.js back-end
│   ├── server.js                   # Express & Socket.io server
│   ├── package.json                # Server dependencies
│   └── .env                        # Environment variables
├── Week5-Assignment.md             # Assignment instructions
└── README.md                       # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (v4.4 or higher) - [See MongoDB Setup Guide](./MONGODB_SETUP.md)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd real-time-communication-with-socket-io
   ```

2. **Set up MongoDB** (Choose one)

   **Option A: Local MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   sudo systemctl start mongodb

   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Option B: MongoDB Atlas (Cloud - Free)**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
   - See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure environment variables**

   Server `.env`:
   ```
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/realtime-chat
   ```

   For MongoDB Atlas, use:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realtime-chat
   ```

   Client `.env`:
   ```
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the server** (from the `server` directory)
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`

2. **Start the client** (from the `client` directory, in a new terminal)
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:5173`

3. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Enter a username to join the chat
   - Open multiple browser windows/tabs to test real-time features

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **Socket.io**: Real-time bidirectional event-based communication
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling for Node.js
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing

### Frontend
- **React**: UI library for building interactive interfaces
- **Vite**: Fast build tool and development server
- **Socket.io-client**: Client library for Socket.io
- **CSS3**: Styling with animations and responsive design

## How to Use the Application

### Login
1. Open the application in your browser
2. Enter a username (2-20 characters)
3. Click "Join Chat" to enter the Global Chat room

### Managing Rooms
1. **View Rooms**: The left sidebar shows all available public and private rooms
2. **Create a Room**:
   - Click the "+" button in the room sidebar header
   - Enter a room name (2-30 characters)
   - Choose whether the room is public or private
   - Click "Create Room"
3. **Join a Room**: Click on any public room to join it
4. **Switch Rooms**: Click on a different room to switch to it
5. **Private Rooms**: Only accessible to invited members

### Sending Messages
1. Type your message in the input field at the bottom
2. Press Enter or click the send button
3. Your message will appear in the current room's chat with your username and timestamp
4. Messages are room-specific - each room has its own message history

### Private Messaging
1. Look at the "Online Users" sidebar on the right
2. Click on any user to start a private conversation
3. Messages will be marked with a "Private" badge
4. Click the × button to return to the room chat

### Reacting to Messages
1. Hover over any message to see reaction options
2. Click on an emoji to react (👍, ❤️, 😂, 😮, 🎉, 🔥)
3. **You can only have one reaction per message**
4. Click the same emoji again to remove your reaction
5. Your active reaction is highlighted in blue
6. See reaction counts below each message
7. Hover over reactions to see who reacted

### Typing Indicators
- When other users are typing, you'll see "X is typing..." above the message input
- Your own typing status is broadcast to other users

### Notifications
- When the window is not focused, you'll see an unread count in the header
- Toast notifications appear for new messages
- Browser notifications (if permission is granted)
- Sound alerts play for incoming messages

## Socket.io Events

### Client → Server
- `user_join(username)`: User joins the chat
- `send_message({ message, roomId })`: Send a message to a room
- `private_message({ to, message })`: Send a private message
- `typing({ isTyping, roomId })`: Update typing status in a room
- `add_reaction({ messageId, emoji, roomId })`: Add/remove reaction (one per user)
- `create_room({ name, isPrivate })`: Create a new room
- `join_room(roomId)`: Join a specific room
- `leave_room(roomId)`: Leave a room
- `invite_to_room({ roomId, userId })`: Invite user to private room
- `accept_invitation(roomId)`: Accept room invitation

### Server → Client
- `user_list(users[])`: Updated list of online users
- `user_joined({ username, id, room })`: New user joined notification
- `user_left({ username, id })`: User left notification
- `receive_message(message)`: New message in current room
- `private_message(message)`: New private message
- `typing_users(users[])`: List of users currently typing in current room
- `reaction_update({ messageId, reactions, userReactions })`: Updated reactions
- `room_list(rooms[])`: List of all available rooms
- `room_created(room)`: New room created notification
- `room_joined({ room, messages })`: Successfully joined a room
- `user_joined_room({ username, roomId })`: User joined the room
- `user_left_room({ username, roomId })`: User left the room
- `room_invitation({ room, inviter })`: Invitation to private room
- `connect`: Connection established
- `disconnect`: Connection lost

## Performance Optimizations

1. **Message Limit**: Server stores only the last 100 messages per room to prevent memory issues
2. **Room-based Broadcasting**: Messages only sent to users in the same room
3. **Smart Reactions**: One reaction per user enforced on server, prevents spam
4. **Debounced Typing**: Typing indicator stops after 1 second of inactivity
5. **Auto-reconnection**: Socket.io automatically reconnects with exponential backoff
6. **Efficient Re-renders**: React components only re-render when relevant data changes
7. **Socket.io Rooms**: Native Socket.io rooms for efficient message routing

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1920px+)
- Laptops (1024px+)
- Tablets (768px+)
- Mobile phones (320px+)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential features to add:
- [ ] Image and file sharing
- [ ] Message editing and deletion
- [ ] Multiple chat rooms/channels
- [ ] User profiles and avatars
- [ ] Message search functionality
- [ ] Read receipts
- [ ] Push notifications
- [ ] Database persistence
- [ ] User authentication with JWT
- [ ] End-to-end encryption

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat)

## License

This project is part of a Week 5 assignment for learning real-time communication with Socket.io.

## Author

Created as part of the MERN Stack course assignment. 