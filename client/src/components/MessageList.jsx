import { useEffect, useRef, useState } from 'react'
import { socket } from '../socket/socket'
import './MessageList.css'

function MessageList({ messages, currentUsername, selectedUser, currentRoom, onSelectUser }) {
  const messagesEndRef = useRef(null)
  const [messageReactions, setMessageReactions] = useState({})
  const [userReactions, setUserReactions] = useState({})
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Generate consistent color for each user
  const getUserColor = (username) => {
    const colors = [
      '#8b5cf6', // purple
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ]
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const handleUsernameClick = (sender, senderId) => {
    if (sender !== currentUsername && onSelectUser) {
      onSelectUser({ username: sender, id: senderId })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for reaction updates
  useEffect(() => {
    const handleReactionUpdate = ({ messageId, reactions, userReactions: updatedUserReactions }) => {
      setMessageReactions(prev => ({
        ...prev,
        [messageId]: reactions
      }))
      if (updatedUserReactions) {
        setUserReactions(prev => ({
          ...prev,
          [messageId]: updatedUserReactions
        }))
      }
    }

    socket.on('reaction_update', handleReactionUpdate)

    return () => {
      socket.off('reaction_update', handleReactionUpdate)
    }
  }, [])

  const handleReaction = (messageId, emoji) => {
    const roomId = currentRoom?.id || 'global'
    socket.emit('add_reaction', { messageId, emoji, roomId })
  }

  // Get user's current reaction for a message
  const getUserReaction = (messageId) => {
    return userReactions[messageId]?.[currentUsername]
  }

  const loadMoreMessages = () => {
    setIsLoadingMore(true)
    // Simulate loading older messages
    setTimeout(() => {
      setPage(prev => prev + 1)
      setIsLoadingMore(false)
    }, 500)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMessages = selectedUser
    ? messages.filter(msg => {
        if (!msg.isPrivate) return false;

        // Show messages where:
        // 1. Current user is the sender and selected user is the recipient
        // 2. Selected user is the sender and current user is the recipient
        const isFromCurrentToSelected =
          msg.sender === currentUsername &&
          (msg.recipientUsername === selectedUser.username || msg.recipientId === selectedUser.id);

        const isFromSelectedToCurrent =
          (msg.sender === selectedUser.username || msg.senderId === selectedUser.id);

        return isFromCurrentToSelected || isFromSelectedToCurrent;
      })
    : messages.filter(msg => !msg.isPrivate)

  const reactions = ['👍', '❤️', '😂', '😮', '🎉', '🔥']

  return (
    <div className="message-list">
      {page > 1 && (
        <button
          onClick={loadMoreMessages}
          className="load-more-button"
          disabled={isLoadingMore}
        >
          {isLoadingMore ? 'Loading...' : 'Load older messages'}
        </button>
      )}

      {filteredMessages.map((msg) => {
        const isOwnMessage = msg.sender === currentUsername
        const msgReactions = messageReactions[msg.id] || {}

        return (
          <div
            key={msg.id}
            className={`message ${isOwnMessage ? 'own-message' : 'other-message'} ${
              msg.system ? 'system-message' : ''
            }`}
          >
            {msg.system ? (
              <div className="system-message-content">
                <span>{msg.message}</span>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <span
                    className={`message-sender ${msg.sender !== currentUsername ? 'clickable' : ''}`}
                    style={{ color: getUserColor(msg.sender) }}
                    onClick={() => handleUsernameClick(msg.sender, msg.senderId)}
                    title={msg.sender !== currentUsername ? `Click to send private message to ${msg.sender}` : ''}
                  >
                    {msg.sender}
                  </span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">
                  <div
                    className="message-bubble"
                    style={{ borderLeftColor: getUserColor(msg.sender) }}
                  >
                    <p>{msg.message}</p>
                  </div>

                  {msg.isPrivate && (
                    <span className="private-badge">Private</span>
                  )}
                </div>

                <div className="message-reactions">
                  <div className="reaction-picker">
                    {reactions.map(emoji => {
                      const userReacted = getUserReaction(msg.id) === emoji
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`reaction-button ${userReacted ? 'selected' : ''}`}
                          title={userReacted ? 'Remove reaction' : `React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      )
                    })}
                  </div>

                  {Object.keys(msgReactions).length > 0 && (
                    <div className="active-reactions">
                      {Object.entries(msgReactions).map(([emoji, data]) => (
                        <span
                          key={emoji}
                          className={`reaction-count ${getUserReaction(msg.id) === emoji ? 'user-reacted' : ''}`}
                          title={data.users?.join(', ')}
                        >
                          {emoji} {data.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
