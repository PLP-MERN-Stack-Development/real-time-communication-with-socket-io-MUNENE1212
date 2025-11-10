import { useState, useEffect, useRef } from 'react'
import './InviteModal.css'

function InviteModal({ isOpen, onClose, room, users, onInvite, currentUsername }) {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const modalRef = useRef(null)

  if (!isOpen) return null

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Focus trap
  useEffect(() => {
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not(:disabled), input, textarea, select, a[href]'
      )
      const firstElement = focusableElements?.[0]
      const lastElement = focusableElements?.[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [])

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
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div
        className="invite-modal glass"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="invite-modal-title">Invite to {room?.name}</h2>
          <button onClick={onClose} className="close-button" aria-label="Close dialog">
            &times;
          </button>
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
              aria-describedby="search-results-info"
            />
            {searchTerm && (
              <div id="search-results-info" className="search-info" role="status" aria-live="polite">
                Showing {filteredUsers.length} of {availableUsers.length} users
              </div>
            )}
          </div>

          <div className="user-list" role="list" aria-label="Available users to invite">
            {filteredUsers.length === 0 ? (
              <p className="no-users" role="status">No users available to invite</p>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  role="listitem"
                  className={`user-item ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => handleToggleUser(user.id)}
                  aria-pressed={selectedUsers.includes(user.id)}
                  aria-label={`${selectedUsers.includes(user.id) ? 'Deselect' : 'Select'} ${user.username} for invitation`}
                >
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    <span className="user-status">Online</span>
                  </div>
                  <div className="user-checkbox" aria-hidden="true">
                    {selectedUsers.includes(user.id) && '✓'}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button
            onClick={handleInvite}
            className="invite-button"
            disabled={selectedUsers.length === 0}
            aria-label={`Invite ${selectedUsers.length} ${selectedUsers.length === 1 ? 'user' : 'users'}`}
          >
            Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
