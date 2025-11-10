// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [offlineMessages, setOfflineMessages] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message, roomId) => {
    socket.emit('send_message', { message, roomId });
  };

  // Send a private message
  const sendPrivateMessage = (to, message, toUsername) => {
    socket.emit('private_message', { to, message, toUsername });
  };

  // Load private message history
  const loadPrivateMessages = (withUsername) => {
    socket.emit('load_private_messages', { withUsername });
  };

  // Set typing status
  const setTyping = (isTyping, roomId) => {
    socket.emit('typing', { isTyping, roomId });
  };

  // Room management
  const createRoom = (name, isPrivate) => {
    socket.emit('create_room', { name, isPrivate });
  };

  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
  };

  const leaveRoom = (roomId) => {
    socket.emit('leave_room', roomId);
  };

  const inviteToRoom = (roomId, userId) => {
    socket.emit('invite_to_room', { roomId, userId });
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessagesLoaded = ({ withUsername, messages: loadedMessages }) => {
      // Replace existing private messages with loaded ones for this conversation
      setMessages((prev) => {
        // Filter out any existing private messages with this user
        const filtered = prev.filter(msg => {
          if (!msg.isPrivate) return true;
          return msg.sender !== withUsername && msg.recipientUsername !== withUsername;
        });
        // Add the loaded messages
        return [...filtered, ...loadedMessages];
      });
    };

    // User events
    const onUserList = (userList) => {
      console.log('Received user_list event:', userList);
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Room events
    const onRoomList = (roomList) => {
      setRooms(roomList);
    };

    const onRoomJoined = ({ room, messages: roomMessages }) => {
      setCurrentRoom(room);
      setMessages(roomMessages);
    };

    const onRoomCreated = (room) => {
      setRooms((prev) => [...prev, room]);
    };

    const onUserJoinedRoom = ({ username }) => {
      // Optionally add a system message
    };

    const onUserLeftRoom = ({ username }) => {
      // Optionally add a system message
    };

    const onOfflineMessageNotification = (notification) => {
      console.log('Received offline message notification:', notification);
      setOfflineMessages((prev) => [...prev, notification]);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('private_messages_loaded', onPrivateMessagesLoaded);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_list', onRoomList);
    socket.on('room_joined', onRoomJoined);
    socket.on('room_created', onRoomCreated);
    socket.on('user_joined_room', onUserJoinedRoom);
    socket.on('user_left_room', onUserLeftRoom);
    socket.on('offline_message_notification', onOfflineMessageNotification);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('private_messages_loaded', onPrivateMessagesLoaded);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_list', onRoomList);
      socket.off('room_joined', onRoomJoined);
      socket.off('room_created', onRoomCreated);
      socket.off('user_joined_room', onUserJoinedRoom);
      socket.off('user_left_room', onUserLeftRoom);
      socket.off('offline_message_notification', onOfflineMessageNotification);
    };
  }, []);

  const clearOfflineMessages = () => {
    setOfflineMessages([]);
  };

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    offlineMessages,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    loadPrivateMessages,
    setTyping,
    createRoom,
    joinRoom,
    leaveRoom,
    inviteToRoom,
    clearOfflineMessages,
  };
};

export default socket; 