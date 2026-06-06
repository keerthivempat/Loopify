// Purpose: Mongoose schema & model for storing chat sessions and messages
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'bot'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
