import ThemeToggle from './ThemeToggle'
import './Header.css'

function Header({ username, isLoggedIn, onLogout, showBackButton, onBack, title, theme, onThemeToggle, onRefresh, onMessages, unreadCount = 0 }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          {showBackButton && (
            <button onClick={onBack} className="back-btn" aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          )}
          <div className="brand">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--neon-cyan)" />
                    <stop offset="100%" stopColor="var(--neon-magenta)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-text">
              <h1 className="brand-name">ChatFlow</h1>
              {title && <span className="page-title">{title}</span>}
            </div>
          </div>
        </div>

        <div className="header-right">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          {isLoggedIn && username && (
            <>
              {onRefresh && (
                <button onClick={onRefresh} className="refresh-btn" title="Refresh Page Data" aria-label="Refresh">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Refresh</span>
                </button>
              )}
              {onMessages && (
                <button onClick={onMessages} className="messages-btn" title="View Messages" aria-label="Messages">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 10h6M9 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="messages-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
              )}
              <div className="user-badge">
                <div className="user-avatar-small">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="username-text">{username}</span>
              </div>
              <button onClick={onLogout} className="logout-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
