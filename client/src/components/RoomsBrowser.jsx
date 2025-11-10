import { useState } from 'react'
import './RoomsBrowser.css'

function RoomsBrowser({ isOpen, onClose, rooms, onJoinRoom, currentUsername }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'public', 'private'

  if (!isOpen) return null

  const filteredRooms = (rooms || []).filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'public' && !room.isPrivate) ||
      (filterType === 'private' && room.isPrivate)
    return matchesSearch && matchesFilter
  })

  console.log('RoomsBrowser - rooms:', rooms, 'filteredRooms:', filteredRooms)

  const handleJoinRoom = (room) => {
    onJoinRoom(room)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rooms-browser" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Browse Rooms</h2>
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="browser-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${filterType === 'public' ? 'active' : ''}`}
                onClick={() => setFilterType('public')}
              >
                Public
              </button>
              <button
                className={`filter-tab ${filterType === 'private' ? 'active' : ''}`}
                onClick={() => setFilterType('private')}
              >
                Private
              </button>
            </div>
          </div>

          <div className="rooms-list">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => {
                const isMember = room.members?.includes(currentUsername)
                const canJoin = !room.isPrivate || isMember

                return (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <div className="room-title-section">
                        <h3 className="room-name">{room.name}</h3>
                        <span className={`room-badge ${room.isPrivate ? 'private' : 'public'}`}>
                          {room.isPrivate ? '🔒 Private' : '🌐 Public'}
                        </span>
                      </div>
                      {canJoin && (
                        <button
                          className="join-button"
                          onClick={() => handleJoinRoom(room)}
                        >
                          {isMember ? 'Enter' : 'Join'}
                        </button>
                      )}
                    </div>

                    <div className="room-details">
                      <div className="room-info">
                        <span className="info-label">Created by:</span>
                        <span className="info-value">{room.createdBy}</span>
                      </div>
                      <div className="room-info">
                        <span className="info-label">Members:</span>
                        <span className="info-value">{room.members?.length || 0}</span>
                      </div>
                    </div>

                    {room.members && room.members.length > 0 && (
                      <div className="room-members">
                        <span className="members-label">Members:</span>
                        <div className="members-list">
                          {room.members.slice(0, 5).map((member, index) => (
                            <span key={index} className="member-tag">
                              {member}
                            </span>
                          ))}
                          {room.members.length > 5 && (
                            <span className="member-tag more">
                              +{room.members.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {room.isPrivate && !isMember && (
                      <div className="private-notice">
                        <span>🔒 Private room - Invitation required</span>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="no-rooms">
                <p>{searchTerm ? 'No rooms found matching your search' : 'No rooms available'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomsBrowser
