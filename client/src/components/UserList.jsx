import './UserList.css'

function UserList({ users, onSelectUser, selectedUser }) {
  return (
    <nav className="user-list" aria-label="Online users">
      <div className="user-list-header">
        <h3 id="user-list-heading">Online Users</h3>
        <span className="user-count" aria-label={`${users.length} users online`}>
          {users.length}
        </span>
      </div>

      <div className="user-list-items" role="list" aria-labelledby="user-list-heading">
        {users.length === 0 ? (
          <div className="no-users" role="status" aria-live="polite">
            <p>No other users online</p>
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user.username}
              className={`user-item ${selectedUser?.username === user.username ? 'selected' : ''}`}
              onClick={() => onSelectUser(user)}
              role="listitem"
              aria-label={`Start private chat with ${user.username}`}
              aria-pressed={selectedUser?.username === user.username}
            >
              <div className="user-avatar" aria-hidden="true">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-status">
                  <span className="status-dot" aria-hidden="true"></span>
                  Online
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </nav>
  )
}

export default UserList
