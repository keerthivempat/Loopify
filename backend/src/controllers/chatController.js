// Purpose: Chat endpoints using Gemini and persistent chat storage
const ChatMessage = require('../models/ChatMessage');
const { sendChatMessage } = require('../services/geminiService');

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const sessionId = req.user.id;

    let chatHistory = await ChatMessage.findOne({ sessionId });
    if (!chatHistory) chatHistory = new ChatMessage({ sessionId, messages: [] });

    chatHistory.messages.push({ role: 'user', content: message, timestamp: new Date() });

    const formattedHistory = chatHistory.messages.map((msg) => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }));
    const botMessage = await sendChatMessage(formattedHistory, message);

    chatHistory.messages.push({ role: 'bot', content: botMessage, timestamp: new Date() });
    chatHistory.lastUpdated = new Date();
    await chatHistory.save();

    res.json({ response: botMessage, timestamp: new Date() });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const sessionId = req.user.id;
    const chatHistory = await ChatMessage.findOne({ sessionId });
    if (!chatHistory) return res.json({ messages: [] });
    res.json({ messages: chatHistory.messages });
  } catch (err) {
    next(err);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    const sessionId = req.user.id;
    await ChatMessage.findOneAndDelete({ sessionId });
    res.json({ message: 'Chat history cleared successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat, getHistory, clearHistory };
