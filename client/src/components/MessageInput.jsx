import { useState, useRef, useEffect } from 'react'
import './MessageInput.css'

function MessageInput({ onSendMessage, onTyping, typingUsers }) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  const handleChange = (e) => {
    const value = e.target.value
    setMessage(value)

    // Handle typing indicator
    if (value && !isTyping) {
      setIsTyping(true)
      onTyping(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTyping(false)
    }, 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      setIsTyping(false)
      onTyping(false)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="message-input-container">
      {typingUsers.length > 0 && (
        <div className="typing-indicator" role="status" aria-live="polite" aria-atomic="true">
          <span className="typing-text">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing`
              : `${typingUsers.length} people are typing`}
          </span>
          <span className="typing-dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form" aria-label="Message input form">
        <label htmlFor="message-input" className="visually-hidden">
          Type your message
        </label>
        <input
          type="text"
          id="message-input"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
          maxLength={500}
          aria-label="Message text"
          aria-describedby="message-hint"
        />
        <span id="message-hint" className="visually-hidden">
          Press Enter to send, or Shift+Enter for a new line. Maximum 500 characters.
        </span>
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default MessageInput
