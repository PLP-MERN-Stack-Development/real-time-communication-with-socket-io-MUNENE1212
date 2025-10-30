# Testing Instructions

## To test the application:

### Terminal 1 - Start Server
```bash
cd server
npm run dev
```

Expected output:
- Server running on port 5000
- Ready to accept Socket.io connections

### Terminal 2 - Start Client
```bash
cd client
npm run dev
```

Expected output:
- Vite dev server running on port 5173
- Local: http://localhost:5173

### Testing Features

1. **Login Flow**
   - Open http://localhost:5173 in browser
   - Enter username and click "Join Chat"
   - Should see chat interface with online users

2. **Real-time Messaging**
   - Open multiple browser windows
   - Send messages from different windows
   - Verify all windows receive messages instantly

3. **Private Messaging**
   - Click on a user in the online users list
   - Send a private message
   - Verify only that user receives it

4. **Typing Indicators**
   - Start typing in one window
   - Verify other windows show "X is typing..."

5. **Message Reactions**
   - Hover over a message
   - Click on an emoji reaction
   - Verify reaction count updates for all users

6. **Notifications**
   - Minimize/switch away from chat window
   - Send a message from another window
   - Verify toast notification and unread count appear

7. **User Status**
   - Close a browser window
   - Verify user disappears from online list
   - Verify "X left the chat" message appears

## Common Issues

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies not installed
```bash
# Reinstall server dependencies
cd server && rm -rf node_modules package-lock.json && npm install

# Reinstall client dependencies
cd client && rm -rf node_modules package-lock.json && npm install
```
