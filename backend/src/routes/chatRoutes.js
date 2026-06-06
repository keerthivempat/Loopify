// Purpose: Chat route definitions
const express = require('express');
const router = express.Router();
const { chat, getHistory, clearHistory } = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, chat);
router.get('/history', verifyToken, getHistory);
router.delete('/history', verifyToken, clearHistory);

module.exports = router;
