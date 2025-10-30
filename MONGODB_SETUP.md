# MongoDB Setup Guide

## Overview

The application now uses MongoDB to persist:
- **Users**: Username, online status, last seen
- **Rooms**: Public and private chat rooms
- **Messages**: All chat messages with reactions
- **Reactions**: User reactions to messages (one per user)

## Prerequisites

You need MongoDB installed on your system. Choose one option:

### Option 1: Install MongoDB Locally

#### On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### On macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### On Windows:
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

## Configuration

### 1. Update Environment Variables

Edit `server/.env`:

**For Local MongoDB:**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/realtime-chat
```

**For MongoDB Atlas:**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realtime-chat?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your actual values.

### 2. Start MongoDB (if using local)

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB if not running
sudo systemctl start mongodb

# Or on macOS
brew services start mongodb-community
```

### 3. Verify MongoDB Connection

```bash
# Connect to MongoDB shell
mongo
# or
mongosh

# Show databases
show dbs

# Use your database
use realtime-chat

# Show collections (after some data is created)
show collections
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required, 2-20 chars),
  socketId: String (nullable),
  isOnline: Boolean (default: false),
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Room Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-30 chars),
  isPrivate: Boolean (default: false),
  createdBy: String (username, required),
  members: [String] (usernames),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  roomId: String (required, indexed),
  sender: String (username, required),
  senderId: String (socket ID, required),
  message: String (required, max 500 chars),
  isPrivate: Boolean (default: false),
  reactions: Map<String, { emoji: String, users: [String] }>,
  userReactions: Map<String, String> (username -> emoji),
  createdAt: Date,
  updatedAt: Date
}
```

## Starting the Application

1. **Start MongoDB** (if using local):
   ```bash
   sudo systemctl start mongodb
   ```

2. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```

   You should see:
   ```
   MongoDB Connected: localhost
   Database indexes created successfully
   Server running on port 5000
   MongoDB connection established
   ```

3. **Start the client** (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

## Testing MongoDB Integration

### 1. Test User Creation
- Login with a username
- Check MongoDB:
  ```bash
  mongo realtime-chat
  db.users.find().pretty()
  ```

### 2. Test Room Creation
- Create a room in the app
- Check MongoDB:
  ```bash
  db.rooms.find().pretty()
  ```

### 3. Test Messages
- Send some messages
- Check MongoDB:
  ```bash
  db.messages.find().pretty()
  ```

### 4. Test Reactions
- Add reactions to messages
- Check message reactions:
  ```bash
  db.messages.findOne({ _id: ObjectId("your-message-id") })
  ```

## MongoDB Shell Commands

```bash
# Connect to database
mongo realtime-chat
# or
mongosh realtime-chat

# Count documents
db.users.countDocuments()
db.rooms.countDocuments()
db.messages.countDocuments()

# Find specific data
db.users.find({ username: "Alice" })
db.rooms.find({ isPrivate: false })
db.messages.find({ roomId: "global" }).limit(10)

# Update data
db.users.updateOne({ username: "Alice" }, { $set: { isOnline: false } })

# Delete data
db.messages.deleteMany({ createdAt: { $lt: new Date("2024-01-01") } })

# Drop collections (careful!)
db.messages.drop()

# View indexes
db.users.getIndexes()
db.rooms.getIndexes()
db.messages.getIndexes()
```

## API Endpoints

### Get Messages
```
GET /api/messages/:roomId?limit=50
```

Example:
```bash
curl http://localhost:5000/api/messages/global?limit=20
```

### Get Users
```
GET /api/users
```

Returns all online users.

### Get Rooms
```
GET /api/rooms
```

Returns all rooms sorted by creation date.

## Data Persistence Benefits

✅ **Messages Persist**: Chat history saved across server restarts
✅ **User History**: Track user registration and activity
✅ **Room Management**: Rooms persist and can be loaded
✅ **Reactions Saved**: All reactions stored permanently
✅ **Analytics Ready**: Query historical data for insights
✅ **Scalability**: Can handle thousands of messages efficiently

## Performance Tips

1. **Indexes**: Already created automatically for:
   - `users.username`
   - `users.socketId`
   - `rooms.name`
   - `messages.roomId` + `createdAt`

2. **Message Limits**: API endpoints limit results to 50 messages by default

3. **Lean Queries**: Use `.lean()` for read-only queries (faster)

4. **Aggregation**: For complex queries, use MongoDB aggregation pipeline

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
sudo systemctl start mongodb
```

### Authentication Failed (Atlas)
```
Error: MongoServerError: bad auth
```
**Solution**: Check your username/password in MONGODB_URI

### Database Not Found
```
Error: Database realtime-chat doesn't exist
```
**Solution**: MongoDB creates database automatically when first document is inserted. Just start using the app.

### Slow Queries
**Solution**: Ensure indexes are created
```bash
mongo realtime-chat
db.messages.createIndex({ roomId: 1, createdAt: -1 })
```

## Backup and Restore

### Backup
```bash
mongodump --db realtime-chat --out ./backup
```

### Restore
```bash
mongorestore --db realtime-chat ./backup/realtime-chat
```

## Migration from In-Memory to MongoDB

The application automatically:
1. Creates database on first run
2. Creates indexes for performance
3. Initializes "Global Chat" room if not exists
4. Saves all new messages/users/rooms to MongoDB

Old in-memory data is not migrated. Fresh start with database.

## Security Best Practices

1. **Never commit .env** with real credentials
2. **Use strong passwords** for MongoDB Atlas
3. **Whitelist specific IPs** in production (not 0.0.0.0/0)
4. **Enable authentication** for local MongoDB in production
5. **Use environment variables** for sensitive data

## Next Steps

- Set up MongoDB replication for high availability
- Implement data archiving for old messages
- Add full-text search on messages
- Create analytics dashboard with MongoDB aggregation
- Set up automated backups

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Tutorial](https://docs.atlas.mongodb.com/getting-started/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)
