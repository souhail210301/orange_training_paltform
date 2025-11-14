// services/chatbotService.js
const OpenAI = require('openai');
const Catalogue = require('../models/Catalogue');
const Formation = require('../models/Formation');

/**
 * Chatbot service for training assistance using OpenRouter
 * Helps students choose the right training and answers questions
 */

/**
 * Generate chatbot response based on user query
 * @param {string} userMessage - User's question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} Chatbot response
 */
const generateChatbotResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-api-key-here') {
      console.warn('OpenRouter API key not configured. Using rule-based responses.');
      return generateRuleBasedResponse(userMessage);
    }

    // Initialize OpenRouter client (uses OpenAI SDK)
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    // Fetch available catalogues/formations for context
    const catalogues = await Catalogue.find({})
      .populate('trainers', 'name')
      .limit(20)
      .lean();

    const formations = await Formation.find({})
      .limit(10)
      .lean();

    // Build context about available trainings
    const trainingContext = buildTrainingContext(catalogues, formations);

    // Build conversation messages
    const messages = [
      {
        role: "system",
        content: `Tu es un assistant virtuel intelligent pour Orange Digital Center (ODC), spécialisé dans l'orientation et le conseil en formations techniques.

**Ton rôle:**
- Aider les étudiants à choisir la formation la plus adaptée à leur profil
- Répondre aux questions sur le contenu des formations
- Expliquer les prérequis et le niveau requis
- Donner des conseils sur la progression pédagogique
- Informer sur les technologies enseignées
- Orienter vers les bonnes ressources

**Informations sur les formations disponibles:**
${trainingContext}

**Ton style de communication:**
- Amical et encourageant
- Clair et précis
- Professionnel mais accessible
- En français
- Utilise des emojis occasionnellement (📚, 💻, 🎯, ✨, 🚀)

**Consignes importantes:**
- Si la question ne concerne pas les formations, réponds poliment et recentre sur les formations
- Suggère toujours des formations concrètes disponibles
- Pose des questions de clarification si besoin
- Adapte tes recommandations au niveau de l'étudiant
- Mentionne les prérequis importants`
      }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    // Call OpenRouter API
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet", // You can change this to other models
      messages: messages,
      temperature: 0.8,
      max_tokens: 500,
      // OpenRouter specific headers can be added via defaultHeaders in OpenAI constructor if needed
    });

    const responseContent = completion.choices[0].message.content;

    // Extract mentioned formations for suggestions
    const suggestedFormations = extractFormationSuggestions(responseContent, catalogues);

    return {
      success: true,
      response: responseContent,
      suggestions: suggestedFormations,
      hasContext: true
    };

  } catch (error) {
    console.error('Error generating chatbot response:', error);
    
    // Log specific error type for debugging
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.warn('⚠️  OpenRouter API quota exceeded. Switching to rule-based fallback responses.');
    } else if (error.code === 'invalid_api_key') {
      console.warn('⚠️  Invalid OpenRouter API key. Using rule-based fallback responses.');
    } else {
      console.warn('⚠️  OpenRouter API error. Using rule-based fallback responses.');
    }
    
    // Fallback to rule-based responses
    return generateRuleBasedResponse(userMessage);
  }
};

/**
 * Build context string about available trainings
 */
const buildTrainingContext = (catalogues, formations) => {
  let context = "**Catalogues de formations disponibles:**\n\n";

  catalogues.slice(0, 10).forEach((cat, index) => {
    context += `${index + 1}. **${cat.title}**\n`;
    if (cat.level) context += `   - Niveau: ${cat.level}\n`;
    if (cat.type) context += `   - Type: ${cat.type}\n`;
    if (cat.technologies && cat.technologies.length > 0) {
      context += `   - Technologies: ${cat.technologies.join(', ')}\n`;
    }
    if (cat.prerequisites) context += `   - Prérequis: ${cat.prerequisites}\n`;
    if (cat.objectives) context += `   - Objectifs: ${cat.objectives}\n`;
    context += '\n';
  });

  if (formations && formations.length > 0) {
    context += "\n**Formations supplémentaires:**\n";
    formations.slice(0, 5).forEach(formation => {
      context += `- ${formation.title}\n`;
    });
  }

  return context;
};

/**
 * Extract formation suggestions from AI response
 */
const extractFormationSuggestions = (responseText, catalogues) => {
  const suggestions = [];
  
  catalogues.forEach(cat => {
    if (responseText.toLowerCase().includes(cat.title.toLowerCase())) {
      suggestions.push({
        id: cat._id,
        title: cat.title,
        level: cat.level,
        type: cat.type,
        technologies: cat.technologies
      });
    }
  });

  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

/**
 * Rule-based fallback response (when AI is not available)
 */
const generateRuleBasedResponse = async (userMessage) => {
  const messageLower = userMessage.toLowerCase();
  
  // Fetch some catalogues for suggestions
  const catalogues = await Catalogue.find({})
    .populate('trainers', 'name')
    .limit(10)
    .lean();

  let response = "";
  let suggestions = [];

  // Check for common keywords and respond accordingly
  if (messageLower.includes('web') || messageLower.includes('site')) {
    response = "🌐 Je vois que vous vous intéressez au développement web ! Nous proposons plusieurs formations dans ce domaine.\n\n";
    const webCats = catalogues.filter(c => 
      c.type === 'Web' || 
      (c.technologies && c.technologies.some(t => t.toLowerCase().includes('web')))
    );
    
    if (webCats.length > 0) {
      response += "Voici nos formations web disponibles :\n";
      webCats.forEach(cat => {
        response += `\n📚 **${cat.title}**\n`;
        if (cat.level) response += `Niveau : ${cat.level}\n`;
        suggestions.push({
          id: cat._id,
          title: cat.title,
          level: cat.level,
          type: cat.type
        });
      });
    }
  } 
  else if (messageLower.includes('mobile') || messageLower.includes('application')) {
    response = "📱 Vous cherchez à développer des applications mobiles ? Excellente idée !\n\n";
    const mobileCats = catalogues.filter(c => 
      c.type === 'Mobile' || 
      (c.technologies && c.technologies.some(t => 
        t.toLowerCase().includes('mobile') || 
        t.toLowerCase().includes('android') || 
        t.toLowerCase().includes('ios')
      ))
    );
    
    if (mobileCats.length > 0) {
      response += "Voici nos formations mobiles :\n";
      mobileCats.forEach(cat => {
        response += `\n📚 **${cat.title}**\n`;
        if (cat.level) response += `Niveau : ${cat.level}\n`;
        suggestions.push({
          id: cat._id,
          title: cat.title,
          level: cat.level,
          type: cat.type
        });
      });
    }
  }
  else if (messageLower.includes('ia') || messageLower.includes('intelligence artificielle') || messageLower.includes('machine learning')) {
    response = "🤖 L'Intelligence Artificielle est un domaine passionnant !\n\n";
    const aiCats = catalogues.filter(c => 
      c.type === 'Intelligence Artificielle' || 
      (c.technologies && c.technologies.some(t => 
        t.toLowerCase().includes('ai') || 
        t.toLowerCase().includes('machine learning') ||
        t.toLowerCase().includes('deep learning')
      ))
    );
    
    if (aiCats.length > 0) {
      response += "Nos formations en IA :\n";
      aiCats.forEach(cat => {
        response += `\n📚 **${cat.title}**\n`;
        if (cat.level) response += `Niveau : ${cat.level}\n`;
        suggestions.push({
          id: cat._id,
          title: cat.title,
          level: cat.level,
          type: cat.type
        });
      });
    }
  }
  else if (messageLower.includes('débutant') || messageLower.includes('commencer') || messageLower.includes('débuter')) {
    response = "✨ Bienvenue ! C'est génial de vouloir commencer à apprendre !\n\n";
    const beginnerCats = catalogues.filter(c => 
      c.level && (c.level.includes('Basique') || c.level.includes('Débutant'))
    );
    
    if (beginnerCats.length > 0) {
      response += "Je vous recommande ces formations pour débutants :\n";
      beginnerCats.forEach(cat => {
        response += `\n📚 **${cat.title}**\n`;
        if (cat.prerequisites) response += `Prérequis : ${cat.prerequisites}\n`;
        suggestions.push({
          id: cat._id,
          title: cat.title,
          level: cat.level,
          type: cat.type
        });
      });
    }
  }
  else if (messageLower.includes('prérequis') || messageLower.includes('prerequis')) {
    response = "📋 Les prérequis varient selon la formation. Voici quelques exemples :\n\n";
    catalogues.slice(0, 5).forEach(cat => {
      response += `**${cat.title}**\n`;
      response += `Prérequis : ${cat.prerequisites || 'Aucun prérequis spécifique'}\n\n`;
    });
    response += "Quelle formation vous intéresse particulièrement ?";
  }
  else {
    // General welcome message
    response = "👋 Bonjour ! Je suis votre assistant virtuel ODC. Je peux vous aider à :\n\n";
    response += "• Choisir la formation adaptée à votre niveau 🎯\n";
    response += "• Découvrir le contenu des formations 📚\n";
    response += "• Comprendre les prérequis nécessaires ✅\n";
    response += "• Obtenir des conseils d'orientation 💡\n\n";
    response += "Nos domaines de formation :\n";
    
    const types = [...new Set(catalogues.map(c => c.type).filter(Boolean))];
    types.forEach(type => {
      response += `• ${type}\n`;
    });
    
    response += "\nQuelle est votre question ?";
    
    suggestions = catalogues.slice(0, 3).map(cat => ({
      id: cat._id,
      title: cat.title,
      level: cat.level,
      type: cat.type
    }));
  }

  return {
    success: false,
    response: response,
    suggestions: suggestions,
    hasContext: false,
    fallback: true
  };
};

/**
 * Get quick responses for common questions
 */
const getQuickResponses = () => {
  return [
    {
      id: 'web',
      question: "Formations en développement web",
      icon: "🌐"
    },
    {
      id: 'mobile',
      question: "Applications mobiles",
      icon: "📱"
    },
    {
      id: 'ai',
      question: "Intelligence Artificielle",
      icon: "🤖"
    },
    {
      id: 'beginner',
      question: "Je suis débutant, par où commencer ?",
      icon: "✨"
    },
    {
      id: 'prerequisites',
      question: "Quels sont les prérequis ?",
      icon: "📋"
    },
    {
      id: 'duration',
      question: "Quelle est la durée des formations ?",
      icon: "⏱️"
    }
  ];
};

module.exports = {
  generateChatbotResponse,
  getQuickResponses
};