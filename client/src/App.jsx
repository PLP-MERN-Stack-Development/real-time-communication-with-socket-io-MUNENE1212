import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './components/Login'
import LandingPage from './components/LandingPage'
import HomePage from './components/HomePage'
import ChatRoom from './components/ChatRoom'
import { useSocket } from './socket/socket'
import { useTheme } from './hooks/useTheme'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [currentView, setCurrentView] = useState('home') // 'home' or 'chat'
  const [initialNavigation, setInitialNavigation] = useState(null)

  // Get all socket data from one place
  const socketData = useSocket()

  // Theme management
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    // Check if user was previously logged in
    const savedUsername = localStorage.getItem('chatUsername')
    if (savedUsername) {
      setUsername(savedUsername)
      setIsLoggedIn(true)
      setShowLanding(false)
      socketData.connect(savedUsername)
    }

    // Cleanup on unmount
    return () => {
      if (socketData.isConnected) {
        socketData.disconnect()
      }
    }
  }, [])

  const handleLogin = (name) => {
    setUsername(name)
    setIsLoggedIn(true)
    localStorage.setItem('chatUsername', name)
    socketData.connect(name)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setCurrentView('home')
    setInitialNavigation(null)
    localStorage.removeItem('chatUsername')
    socketData.disconnect()
  }

  const handleNavigate = (destination) => {
    setInitialNavigation(destination)
    setCurrentView('chat')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setInitialNavigation(null)
  }

  const handleRefresh = () => {
    // Refresh by reconnecting socket - this will fetch fresh data
    if (socketData.isConnected) {
      socketData.disconnect()
      setTimeout(() => {
        socketData.connect(username)
      }, 100)
    }
  }

  const handleGetStarted = () => {
    setShowLanding(false)
  }

  const handleViewMessages = () => {
    handleNavigate('private')
  }

  return (
    <div className="app">
      {!isLoggedIn ? (
        showLanding ? (
          <>
            <Header
              theme={theme}
              onThemeToggle={toggleTheme}
              isLoggedIn={false}
            />
            <LandingPage
              onGetStarted={handleGetStarted}
              theme={theme}
              onThemeToggle={toggleTheme}
            />
            <Footer />
          </>
        ) : (
          <>
            <Header
              theme={theme}
              onThemeToggle={toggleTheme}
              isLoggedIn={false}
            />
            <Login onLogin={handleLogin} />
          </>
        )
      ) : (
        <>
          <Header
            username={username}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            showBackButton={currentView === 'chat'}
            onBack={handleBackToHome}
            title={currentView === 'home' ? 'Dashboard' : 'Chat'}
            theme={theme}
            onThemeToggle={toggleTheme}
            onRefresh={handleRefresh}
            onMessages={handleViewMessages}
            unreadCount={socketData.offlineMessages?.length || 0}
          />
          <main className="app-main">
            {currentView === 'home' ? (
              <HomePage
                username={username}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                socketData={socketData}
              />
            ) : (
              <ChatRoom
                username={username}
                onLogout={handleLogout}
                initialNavigation={initialNavigation}
                onBackToHome={handleBackToHome}
                socketData={socketData}
              />
            )}
          </main>
          <Footer />
        </>
      )}
    </div>
  )
}

export default App
