import { useEffect } from 'react'
import './NotificationManager.css'

function NotificationManager({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="notification-toast">
      <div className="notification-header">
        <span className="notification-title">New Message</span>
        <button onClick={onClose} className="notification-close">
          ×
        </button>
      </div>
      <div className="notification-body">
        <strong>{message.sender}</strong>
        <p>{message.message}</p>
      </div>
    </div>
  )
}

export default NotificationManager
