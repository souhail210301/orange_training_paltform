// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { chat, getQuickOptions, getGreeting } = require('../controllers/chatbotController');

// Public routes - no authentication required for chatbot

// POST /api/chatbot/chat - Send message to chatbot
router.post('/chat', chat);

// GET /api/chatbot/quick-options - Get quick response buttons
router.get('/quick-options', getQuickOptions);

// GET /api/chatbot/greeting - Get welcome message
router.get('/greeting', getGreeting);

module.exports = router;
