import { useState, useEffect } from 'react'
import './HomePage.css'

function HomePage({ username, onLogout, onNavigate, socketData }) {
  const { isConnected, users, rooms, offlineMessages, clearOfflineMessages } = socketData
  const [stats, setStats] = useState({
    onlineUsers: 0,
    activeRooms: 0
  })
  const [showOfflineNotification, setShowOfflineNotification] = useState(false)

  useEffect(() => {
    setStats({
      onlineUsers: users?.length || 0,
      activeRooms: rooms?.length || 0
    })
  }, [users, rooms])

  useEffect(() => {
    if (offlineMessages && offlineMessages.length > 0) {
      setShowOfflineNotification(true)
    }
  }, [offlineMessages])

  const handleDismissOfflineNotification = () => {
    setShowOfflineNotification(false)
    clearOfflineMessages()
  }

  const handleViewOfflineMessages = () => {
    // Navigate to private messages
    onNavigate('private')
    // Don't clear messages yet - let them see in the chat
  }

  const navigationOptions = [
    {
      id: 'browse-rooms',
      title: 'Browse Rooms',
      description: 'Join existing chat rooms and connect with others',
      icon: '🏠',
      action: () => onNavigate('rooms')
    },
    {
      id: 'private-chat',
      title: 'Start Private Chat',
      description: 'Begin a one-on-one conversation with an online user',
      icon: '💬',
      action: () => onNavigate('private')
    },
    {
      id: 'create-room',
      title: 'Create New Room',
      description: 'Start your own public or private chat room',
      icon: '➕',
      action: () => onNavigate('create')
    },
    {
      id: 'global-chat',
      title: 'Global Chat',
      description: 'Join the main chat room with all users',
      icon: '🌐',
      action: () => onNavigate('global')
    }
  ]

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Header Section */}
        <header className="home-header">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, {username}!</h1>
            <p className="welcome-subtitle">Choose how you'd like to connect</p>
          </div>
          <div className="header-actions">
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>

        {/* Offline Messages Notification */}
        {showOfflineNotification && offlineMessages.length > 0 && (
          <div className="offline-notification-banner">
            <div className="offline-notification-content" onClick={handleViewOfflineMessages}>
              <div className="offline-notification-icon">📬</div>
              <div className="offline-notification-text">
                <h3>You have {offlineMessages.length} new message{offlineMessages.length > 1 ? 's' : ''} while you were away!</h3>
                <div className="offline-message-preview">
                  {offlineMessages.slice(0, 3).map((msg, index) => (
                    <div key={msg.id || index} className="offline-message-item">
                      <strong>{msg.sender}:</strong> {msg.message.substring(0, 50)}{msg.message.length > 50 ? '...' : ''}
                    </div>
                  ))}
                  {offlineMessages.length > 3 && (
                    <div className="offline-message-more">
                      +{offlineMessages.length - 3} more message{offlineMessages.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="offline-notification-cta">
                  Click to view messages →
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissOfflineNotification();
                }}
                className="offline-notification-close"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-value">{stats.onlineUsers}</span>
              <span className="stat-label">Online Users</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏠</span>
            <div className="stat-info">
              <span className="stat-value">{stats.activeRooms}</span>
              <span className="stat-label">Active Rooms</span>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="navigation-section">
          <h2 className="section-title">Get Started</h2>
          <div className="navigation-grid">
            {navigationOptions.map(option => (
              <button
                key={option.id}
                className="nav-card"
                onClick={option.action}
                aria-label={option.title}
              >
                <span className="nav-icon">{option.icon}</span>
                <h3 className="nav-title">{option.title}</h3>
                <p className="nav-description">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <footer className="home-footer">
          <p className="footer-text">Real-time communication powered by Socket.IO</p>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
