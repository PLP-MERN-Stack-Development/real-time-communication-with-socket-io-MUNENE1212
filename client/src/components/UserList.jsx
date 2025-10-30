import './UserList.css'

function UserList({ users, onSelectUser, selectedUser }) {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online Users</h3>
        <span className="user-count">{users.length}</span>
      </div>

      <div className="user-list-items">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No other users online</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserList
