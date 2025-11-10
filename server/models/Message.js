const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  users: [{
    type: String  // Username
  }]
}, { _id: false });

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  recipientUsername: {
    type: String,  // For private messages - who should receive it
    default: null
  },
  delivered: {
    type: Boolean,
    default: false  // Set to true when recipient comes online and message is delivered
  },
  read: {
    type: Boolean,
    default: false  // Set to true when recipient reads the message
  },
  reactions: {
    type: Map,
    of: reactionSchema,
    default: {}
  },
  userReactions: {
    type: Map,
    of: String,  // username -> emoji
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isPrivate: 1 });

module.exports = mongoose.model('Message', messageSchema);
