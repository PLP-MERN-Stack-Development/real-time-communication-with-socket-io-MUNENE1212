# Quick Start Guide

## 🚀 Get the App Running in 5 Minutes

### Step 1: Install MongoDB

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Or use MongoDB Atlas (Cloud):** [Sign up free](https://www.mongodb.com/cloud/atlas)

### Step 2: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3: Configure Environment

The `.env` files are already configured for local MongoDB:
- `server/.env` - MongoDB connection string
- `client/.env` - Socket.io connection URL

**If using MongoDB Atlas**, update `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realtime-chat
```

### Step 4: Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

Look for:
```
✓ MongoDB Connected: localhost
✓ Database indexes created successfully
✓ Server running on port 5000
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

Look for:
```
✓ Local: http://localhost:5173
```

### Step 5: Open and Test

1. Open `http://localhost:5173` in your browser
2. Enter a username
3. Start chatting!

## 🎨 What You Get

- **Dark Futuristic UI** with glassmorphism and neon effects
- **Real-time Chat** with Socket.io
- **MongoDB Persistence** - messages survive restarts
- **Public & Private Rooms** - create and join rooms
- **Smart Reactions** - one reaction per user per message
- **Typing Indicators** - see who's typing
- **Real-time Notifications** - toast, browser, and sound alerts
- **Responsive Design** - works on mobile and desktop

## 🔍 Verify MongoDB

```bash
# Check if MongoDB is running
mongo --eval "db.version()"

# View your data
mongo realtime-chat
> show collections
> db.users.find().pretty()
> db.messages.find().limit(5).pretty()
```

## ⚡ Quick Test Checklist

- [ ] Login with a username
- [ ] Send a message
- [ ] Create a public room
- [ ] Create a private room
- [ ] React to a message (try clicking twice)
- [ ] Start typing (see indicator)
- [ ] Open second browser window and test real-time sync
- [ ] Restart server and verify messages persist

## 🐛 Troubleshooting

### MongoDB not running
```bash
sudo systemctl status mongodb
sudo systemctl start mongodb
```

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies not found
```bash
# Reinstall
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

## 📚 Learn More

- [MongoDB Setup Guide](./MONGODB_SETUP.md) - Detailed MongoDB instructions
- [Room Features](./ROOM_FEATURES.md) - How rooms work
- [Dark Theme Guide](./DARK_THEME_COMPLETE.md) - UI styling details
- [Full README](./README.md) - Complete documentation

## 🎯 Next Steps

1. **Test all features** - rooms, reactions, notifications
2. **Customize** - change colors, add features
3. **Deploy** - use MongoDB Atlas + Vercel/Render
4. **Explore code** - learn Socket.io and MongoDB patterns

Happy coding! 🚀
