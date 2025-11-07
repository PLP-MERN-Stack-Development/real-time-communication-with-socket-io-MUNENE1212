import { useState } from 'react'
import './InviteModal.css'

function InviteModal({ isOpen, onClose, room, users, onInvite, currentUsername }) {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  const availableUsers = users.filter(user =>
    user.username !== currentUsername &&
    !room?.members?.includes(user.username)
  )

  const filteredUsers = searchTerm
    ? availableUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableUsers

  console.log('InviteModal Debug:', {
    searchTerm,
    usersCount: users.length,
    availableCount: availableUsers.length,
    filteredCount: filteredUsers.length
  })

  const handleToggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleInvite = () => {
    selectedUsers.forEach(userId => {
      onInvite(room.id, userId)
    })
    setSelectedUsers([])
    setSearchTerm('')
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="invite-modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite to {room?.name}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          <div className="search-box">
            <label htmlFor="user-search" className="search-label">
              Search users ({availableUsers.length} available)
            </label>
            <input
              id="user-search"
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => {
                console.log('Search input changed:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              onKeyDown={(e) => {
                console.log('Key pressed:', e.key);
              }}
              autoFocus
              autoComplete="off"
            />
            {searchTerm && (
              <div className="search-info">
                Showing {filteredUsers.length} of {availableUsers.length} users
              </div>
            )}
          </div>

          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <p className="no-users">No users available to invite</p>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => handleToggleUser(user.id)}
                >
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-status">Online</span>
                  </div>
                  <div className="user-checkbox">
                    {selectedUsers.includes(user.id) && '✓'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button
            onClick={handleInvite}
            className="invite-button"
            disabled={selectedUsers.length === 0}
          >
            Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
