import { useState, useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import UserList from './UserList'
import RoomList from './RoomList'
import CreateRoomModal from './CreateRoomModal'
import InviteModal from './InviteModal'
import UserSelectionModal from './UserSelectionModal'
import RoomsBrowser from './RoomsBrowser'
import NotificationManager from './NotificationManager'
import './ChatRoom.css'

function ChatRoom({ username, onLogout, initialNavigation, onBackToHome, socketData }) {
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    sendMessage,
    sendPrivateMessage,
    loadPrivateMessages,
    setTyping,
    createRoom,
    joinRoom,
    inviteToRoom,
    lastMessage
  } = socketData

  const [unreadCount, setUnreadCount] = useState(0)
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false)
  const [showRoomsBrowser, setShowRoomsBrowser] = useState(false)
  const [roomToInvite, setRoomToInvite] = useState(null)

  // Handle initial navigation from home page
  useEffect(() => {
    if (initialNavigation) {
      console.log('Initial navigation:', initialNavigation, 'Users:', users, 'Rooms:', rooms)
      switch (initialNavigation) {
        case 'create':
          setShowCreateRoomModal(true)
          break
        case 'private':
          setShowUserSelectionModal(true)
          break
        case 'rooms':
          setShowRoomsBrowser(true)
          break
        case 'global':
          joinRoom('global')
          break
        default:
          break
      }
    }
  }, [initialNavigation])

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
      // Use socket ID if online, otherwise null (username is always required)
      const recipientSocketId = selectedUser.id || null
      sendPrivateMessage(recipientSocketId, message, selectedUser.username)
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

  const handleInviteToRoom = (room) => {
    setRoomToInvite(room)
    setShowInviteModal(true)
  }

  const handleInvite = (roomId, userId) => {
    inviteToRoom(roomId, userId)
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    // Load private message history when user is selected
    if (user && user.username) {
      loadPrivateMessages(user.username)
    }
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="header-left">
          {onBackToHome && (
            <button onClick={onBackToHome} className="back-button" title="Back to Home">
              ← Home
            </button>
          )}
          {selectedUser ? (
            <>
              <h2>💬 {selectedUser.username}</h2>
              <span className={`private-user-status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
                {selectedUser.isOnline ? '● Online' : '● Offline'}
              </span>
            </>
          ) : (
            <>
              <h2>{currentRoom?.name || 'Real-Time Chat'}</h2>
              <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Connected' : '● Disconnected'}
              </span>
            </>
          )}
        </div>
        <div className="header-right">
          {selectedUser && (
            <button onClick={() => setSelectedUser(null)} className="close-private-btn">
              Close Chat
            </button>
          )}
          <span className="username-display">@{username}</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
      </div>

      <div className="chat-body">
        <RoomList
          rooms={rooms}
          currentRoom={currentRoom}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={() => setShowCreateRoomModal(true)}
          onInviteToRoom={handleInviteToRoom}
        />

        <div className="chat-main">
          <MessageList
            messages={messages}
            currentUsername={username}
            selectedUser={selectedUser}
            currentRoom={currentRoom}
            onSelectUser={handleSelectUser}
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

      {showInviteModal && roomToInvite && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false)
            setRoomToInvite(null)
          }}
          room={roomToInvite}
          users={users}
          onInvite={handleInvite}
          currentUsername={username}
        />
      )}

      {showUserSelectionModal && (
        <UserSelectionModal
          isOpen={showUserSelectionModal}
          onClose={() => setShowUserSelectionModal(false)}
          users={users}
          currentUsername={username}
          onSelectUser={handleSelectUser}
        />
      )}

      {showRoomsBrowser && (
        <RoomsBrowser
          isOpen={showRoomsBrowser}
          onClose={() => setShowRoomsBrowser(false)}
          rooms={rooms}
          onJoinRoom={handleSelectRoom}
          currentUsername={username}
        />
      )}
    </div>
  )
}

export default ChatRoom
