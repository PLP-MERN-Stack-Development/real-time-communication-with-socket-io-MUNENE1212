import './RoomList.css'

function RoomList({ rooms, currentRoom, onSelectRoom, onCreateRoom }) {
  const publicRooms = rooms.filter(room => !room.isPrivate)
  const privateRooms = rooms.filter(room => room.isPrivate)

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Rooms</h3>
        <button onClick={onCreateRoom} className="create-room-btn" title="Create Room">
          +
        </button>
      </div>

      <div className="room-sections">
        <div className="room-section">
          <h4>Public Rooms</h4>
          <div className="room-items">
            {publicRooms.map((room) => (
              <div
                key={room.id}
                className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="room-icon">
                  #
                </div>
                <div className="room-info">
                  <span className="room-name">{room.name}</span>
                  <span className="room-members">
                    {room.members?.length || 0} members
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {privateRooms.length > 0 && (
          <div className="room-section">
            <h4>Private Rooms</h4>
            <div className="room-items">
              {privateRooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                  onClick={() => onSelectRoom(room)}
                >
                  <div className="room-icon private">
                    🔒
                  </div>
                  <div className="room-info">
                    <span className="room-name">{room.name}</span>
                    <span className="room-members">
                      {room.members?.length || 0} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomList
