import { useState, useEffect } from 'react'
import './HomePage.css'

function HomePage({ username, onLogout, onNavigate, socketData }) {
  const { isConnected, users, rooms } = socketData
  const [stats, setStats] = useState({
    onlineUsers: 0,
    activeRooms: 0
  })

  useEffect(() => {
    setStats({
      onlineUsers: users?.length || 0,
      activeRooms: rooms?.length || 0
    })
  }, [users, rooms])

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
