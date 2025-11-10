import { useState, useEffect, useRef } from 'react'
import './CreateRoomModal.css'

function CreateRoomModal({ onClose, onCreate }) {
  const [roomName, setRoomName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)

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
        'button, input, textarea, select, a[href]'
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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (roomName.trim().length < 2) {
      setError('Room name must be at least 2 characters long')
      return
    }

    if (roomName.trim().length > 30) {
      setError('Room name must be less than 30 characters')
      return
    }

    onCreate({ name: roomName.trim(), isPrivate })
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-room-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="create-room-title">Create New Room</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="modal-close"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" aria-label="Create room form">
          <div className="form-group">
            <label htmlFor="roomName">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              autoFocus
              maxLength={30}
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'room-name-error' : 'room-name-help'}
            />
            {error && (
              <span id="room-name-error" className="error-text" role="alert">
                {error}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="private-room"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                aria-describedby="room-privacy-help"
              />
              <span>Private Room</span>
            </label>
            <p id="room-privacy-help" className="help-text">
              {isPrivate
                ? 'Only invited members can join this room'
                : 'Anyone can join this room'}
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-create" aria-label="Create new room">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoomModal
