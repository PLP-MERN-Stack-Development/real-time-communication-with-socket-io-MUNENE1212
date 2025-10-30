import { useState, useEffect } from 'react'
import { useSocket } from '../socket/socket'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import UserList from './UserList'
import RoomList from './RoomList'
import CreateRoomModal from './CreateRoomModal'
import NotificationManager from './NotificationManager'
import './ChatRoom.css'

function ChatRoom({ username, onLogout }) {
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    createRoom,
    joinRoom,
    lastMessage
  } = useSocket()

  const [unreadCount, setUnreadCount] = useState(0)
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Handle window focus for unread count
  useEffect(() => {
    const handleFocus = () => {
      setIsWindowFocused(true)
      setUnreadCount(0)
    }

    const handleBlur = () => {
      setIsWindowFocused(false)
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Handle new messages and notifications
  useEffect(() => {
    if (lastMessage && !lastMessage.system) {
      // Don't show notification for own messages
      if (lastMessage.sender !== username) {
        if (!isWindowFocused) {
          setUnreadCount(prev => prev + 1)
        }

        // Show in-app notification
        setNotificationMessage(lastMessage)
        setShowNotification(true)

        // Play sound
        playNotificationSound()

        // Show browser notification
        showBrowserNotification(lastMessage)
      }
    }
  }, [lastMessage, isWindowFocused, username])

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGm98OScTgwOUKbj8LdjHAU2jdXty3YqBSd+zPLbkD4KFF606+2nVRIJRp7f8r5sIAUrlc/y2og3CBdqvO/jm04NEE+m4/C4ZBwFNo3V7s15KwUmfszy3Y9AAAADAwYJDA8SEhQXGhwfISMlJygqKiwtLi8wMDEyMjM0NDU1NjY3Nzg4OTk5Ojk5OTk5OTk5OTk5OTk4ODg4Nzc2NjU1NDQzMzIxMTAvLy4tLCsqKCcmJCMhHx0bGBYUERAPCwkGBAEA')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (error) {
      // Ignore audio errors
    }
  }

  const showBrowserNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('New Message', {
        body: `${message.sender}: ${message.message}`,
        icon: '/chat-icon.png',
        badge: '/chat-icon.png'
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      setTimeout(() => notification.close(), 5000)
    }
  }

  const handleSendMessage = (message) => {
    if (selectedUser) {
      sendPrivateMessage(selectedUser.id, message)
    } else {
      const roomId = currentRoom?.id || 'global'
      sendMessage(message, roomId)
    }
  }

  const handleCloseNotification = () => {
    setShowNotification(false)
  }

  const handleCreateRoom = ({ name, isPrivate }) => {
    createRoom(name, isPrivate)
  }

  const handleSelectRoom = (room) => {
    setSelectedUser(null)  // Clear private chat when switching rooms
    joinRoom(room.id)
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="header-left">
          <h2>{currentRoom?.name || 'Real-Time Chat'}</h2>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
        <div className="header-right">
          <span className="username-display">@{username}</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="chat-body">
        <RoomList
          rooms={rooms}
          currentRoom={currentRoom}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={() => setShowCreateRoomModal(true)}
        />

        <div className="chat-main">
          {selectedUser && (
            <div className="private-chat-header">
              <span>Private chat with {selectedUser.username}</span>
              <button onClick={() => setSelectedUser(null)} className="close-private">
                ×
              </button>
            </div>
          )}
          <MessageList
            messages={messages}
            currentUsername={username}
            selectedUser={selectedUser}
            currentRoom={currentRoom}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={(isTyping) => setTyping(isTyping, currentRoom?.id || 'global')}
            typingUsers={typingUsers.filter(user => user !== username)}
          />
        </div>

        <UserList
          users={users.filter(user => user.username !== username)}
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
        />
      </div>

      {showNotification && notificationMessage && (
        <NotificationManager
          message={notificationMessage}
          onClose={handleCloseNotification}
        />
      )}

      {showCreateRoomModal && (
        <CreateRoomModal
          onClose={() => setShowCreateRoomModal(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  )
}

export default ChatRoom
