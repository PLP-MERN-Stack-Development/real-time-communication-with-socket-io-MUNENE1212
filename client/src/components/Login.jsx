import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters long')
      return
    }

    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters')
      return
    }

    setError('')
    onLogin(username.trim())
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Real-Time Chat</h1>
          <p>Connect with others instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Enter your username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username..."
              autoFocus
              maxLength={20}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="login-button">
            Join Chat
          </button>
        </form>

        <div className="login-footer">
          <p>No account needed - just pick a name and start chatting!</p>
        </div>
      </div>
    </div>
  )
}

export default Login
