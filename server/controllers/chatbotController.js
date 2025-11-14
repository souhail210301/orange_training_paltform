// controllers/chatbotController.js
const { generateChatbotResponse, getQuickResponses } = require('../services/chatbotService');

/**
 * Chat with the training assistant
 */
const chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log('Chatbot query:', message);

    // Generate response
    const result = await generateChatbotResponse(
      message.trim(),
      conversationHistory || []
    );

    return res.json({
      success: true,
      response: result.response,
      suggestions: result.suggestions || [],
      hasContext: result.hasContext || false,
      fallback: result.fallback || false
    });

  } catch (error) {
    console.error('Error in chat:', error);
    return res.status(500).json({ 
      message: 'Failed to generate response',
      error: error.message 
    });
  }
};

/**
 * Get quick response options
 */
const getQuickOptions = async (req, res) => {
  try {
    const options = getQuickResponses();
    
    return res.json({
      success: true,
      options
    });

  } catch (error) {
    console.error('Error getting quick options:', error);
    return res.status(500).json({ 
      message: 'Failed to get options',
      error: error.message 
    });
  }
};

/**
 * Get greeting message
 */
const getGreeting = async (req, res) => {
  try {
    const greeting = {
      message: "👋 Bonjour ! Je suis votre assistant virtuel ODC.\n\nJe peux vous aider à trouver la formation idéale pour vous. Posez-moi vos questions sur :\n\n• Les formations disponibles 📚\n• Le contenu et les objectifs 🎯\n• Les prérequis nécessaires ✅\n• Votre parcours d'apprentissage 🚀\n\nComment puis-je vous aider aujourd'hui ?",
      quickOptions: getQuickResponses()
    };

    return res.json({
      success: true,
      ...greeting
    });

  } catch (error) {
    console.error('Error getting greeting:', error);
    return res.status(500).json({ 
      message: 'Failed to get greeting',
      error: error.message 
    });
  }
};

module.exports = {
  chat,
  getQuickOptions,
  getGreeting
};
