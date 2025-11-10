import { useState, useEffect } from 'react'
import './UserSelectionModal.css'

function UserSelectionModal({ isOpen, onClose, users, currentUsername, onSelectUser }) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      console.log('UserSelectionModal opened - Total users:', users?.length, 'Current user:', currentUsername)
      console.log('All users:', users)
    }
  }, [isOpen, users, currentUsername])

  if (!isOpen) return null

  const filteredUsers = (users || []).filter(user =>
    user.username !== currentUsername &&
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  console.log('UserSelectionModal - users:', users, 'filteredUsers:', filteredUsers, 'currentUsername:', currentUsername)

  const handleSelectUser = (user) => {
    onSelectUser(user)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select User to Chat</h2>
          <div className="header-actions">
            <button
              onClick={() => window.location.reload()}
              className="refresh-button"
              title="Refresh page to update user list"
            >
              🔄 Refresh
            </button>
            <button onClick={onClose} className="close-button" aria-label="Close">
              ×
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Debug Info */}
          <div className="debug-info">
            <strong>Debug Info:</strong> Total users: {users?.length || 0} |
            Online: {users?.filter(u => u.isOnline).length || 0} |
            Your username: {currentUsername} |
            Available to chat: {filteredUsers.length}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="users-grid">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.username}
                  className="user-card"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className={`user-status ${user.isOnline ? 'online' : 'offline'}`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-users">
                <p>
                  {searchTerm
                    ? 'No users found matching your search'
                    : users.length === 0
                    ? 'Loading users...'
                    : users.length === 1
                    ? "You're the only one online. Open another browser or incognito window to test private chat!"
                    : 'No other users online'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSelectionModal
