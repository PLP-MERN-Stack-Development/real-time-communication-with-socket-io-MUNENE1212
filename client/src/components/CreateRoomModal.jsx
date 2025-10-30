import { useState } from 'react'
import './CreateRoomModal.css'

function CreateRoomModal({ onClose, onCreate }) {
  const [roomName, setRoomName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState('')

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Room</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
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
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span>Private Room</span>
            </label>
            <p className="help-text">
              {isPrivate
                ? 'Only invited members can join this room'
                : 'Anyone can join this room'}
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-create">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoomModal
