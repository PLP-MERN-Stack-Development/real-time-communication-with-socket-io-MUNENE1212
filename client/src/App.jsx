import { useState, useEffect } from 'react'
import Login from './components/Login'
import ChatRoom from './components/ChatRoom'
import { useSocket } from './socket/socket'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { isConnected, connect, disconnect } = useSocket()

  useEffect(() => {
    // Check if user was previously logged in
    const savedUsername = localStorage.getItem('chatUsername')
    if (savedUsername) {
      setUsername(savedUsername)
      setIsLoggedIn(true)
      connect(savedUsername)
    }

    // Cleanup on unmount
    return () => {
      if (isConnected) {
        disconnect()
      }
    }
  }, [])

  const handleLogin = (name) => {
    setUsername(name)
    setIsLoggedIn(true)
    localStorage.setItem('chatUsername', name)
    connect(name)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    localStorage.removeItem('chatUsername')
    disconnect()
  }

  return (
    <div className="app">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
