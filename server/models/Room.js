const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: true
  },
  members: [{
    type: String  // Store usernames or user IDs
  }],
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
roomSchema.index({ name: 1 });
roomSchema.index({ isPrivate: 1 });
roomSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Room', roomSchema);
