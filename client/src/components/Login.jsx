import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate input
    if (!username.trim()) {
      setError('Username is required')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Authentication failed')
        setLoading(false)
        return
      }

      // Authentication successful
      onLogin(data.user.username)
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Failed to connect to server')
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setPassword('')
  }

  return (
    <div className="login-container">
      <div className="login-card" role="main" aria-labelledby="login-title">
        <div className="login-header">
          <h1 id="login-title">Real-Time Chat</h1>
          <p aria-live="polite">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" aria-label={isLogin ? 'Login form' : 'Registration form'}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              autoFocus
              disabled={loading}
              aria-required="true"
              aria-invalid={error && !username ? 'true' : 'false'}
              aria-describedby={error && !username ? 'error-message' : undefined}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              disabled={loading}
              aria-required="true"
              aria-invalid={error && !password ? 'true' : 'false'}
              aria-describedby={error && !password ? 'error-message' : undefined}
            />
          </div>

          {error && (
            <span
              id="error-message"
              className="error-message"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </span>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="toggle-button"
              onClick={toggleMode}
              disabled={loading}
              aria-label={isLogin ? 'Switch to registration' : 'Switch to login'}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
