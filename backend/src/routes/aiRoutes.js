// Purpose: AI assistant route — POST /api/ai/chat
const express = require('express');
const router = express.Router();
const { aiChat } = require('../controllers/aiController');

// No auth required — widget works on landing page too
router.post('/chat', aiChat);

module.exports = router;
