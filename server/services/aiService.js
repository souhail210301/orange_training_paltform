// services/aiService.js
const OpenAI = require('openai');

/**
 * Generate a detailed training plan using AI (Grok/xAI)
 * @param {Object} catalogueData - Catalogue information
 * @returns {Promise<Object>} Generated training plan
 */
const generateTrainingPlan = async (catalogueData) => {
  try {
    const { title, technologies, level, type, prerequisites, objectives } = catalogueData;

    // Check if API key is configured
    if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === 'your-api-key-here') {
      console.warn('Grok API key not configured. Using fallback plan generator.');
      return {
        success: false,
        error: 'Grok API key not configured',
        plan: generateFallbackPlan(catalogueData),
        catalogueInfo: {
          title,
          technologies,
          level,
          type
        }
      };
    }

    // Initialize Grok client (uses OpenAI SDK)
    const openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1'
    });

    const prompt = `Tu es un expert en conception de formations techniques professionnelles.

Génère un plan de formation détaillé et professionnel pour:

**Titre**: ${title}
**Technologies**: ${technologies ? technologies.join(', ') : 'Non spécifié'}
**Niveau**: ${level || 'Tous niveaux'}
**Type**: ${type || 'Formation technique'}
**Prérequis**: ${prerequisites || 'Aucun'}
**Objectifs**: ${objectives || 'À définir'}

Le plan doit contenir:

1. **Description de la formation** (2-3 paragraphes professionnels)
2. **Objectifs pédagogiques** (5-7 objectifs SMART mesurables)
3. **Public cible** (profil détaillé des apprenants)
4. **Prérequis détaillés** (connaissances et compétences nécessaires)
5. **Programme détaillé** avec:
   - Au moins 5 modules/chapitres
   - Chaque module doit avoir:
     * Titre du module
     * Durée estimée (en heures)
     * Objectifs spécifiques
     * Contenu détaillé (3-5 points)
     * Exercices pratiques suggérés
6. **Méthodes pédagogiques** (comment la formation sera dispensée)
7. **Modalités d'évaluation** (quiz, projets, examens)
8. **Ressources et outils** (logiciels, documentation nécessaire)
9. **Compétences acquises** (ce que les participants sauront faire après)
10. **Durée totale estimée** (en jours/heures)

Format la réponse en JSON avec cette structure exacte:
{
  "description": "string",
  "objectives": ["string"],
  "targetAudience": "string",
  "detailedPrerequisites": ["string"],
  "modules": [
    {
      "title": "string",
      "duration": "string",
      "objectives": ["string"],
      "content": ["string"],
      "practicalExercises": ["string"]
    }
  ],
  "teachingMethods": ["string"],
  "evaluationMethods": ["string"],
  "resources": ["string"],
  "skillsAcquired": ["string"],
  "totalDuration": "string"
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en conception pédagogique de formations techniques. Tu génères des plans de formation détaillés et professionnels en français."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const content = completion.choices[0].message.content;
    const trainingPlan = JSON.parse(content);

    return {
      success: true,
      plan: trainingPlan,
      catalogueInfo: {
        title,
        technologies,
        level,
        type
      }
    };

  } catch (error) {
    // Log specific error type for debugging
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.warn('⚠️  OpenAI quota exceeded. Using template-based plan generation.');
    } else if (error.code === 'invalid_api_key') {
      console.warn('⚠️  Invalid OpenAI API key. Using template-based plan generation.');
    } else {
      console.error('Error generating training plan with AI:', error.message || error);
    }
    
    // Fallback: return a basic template if AI fails
    return {
      success: false,
      error: error.message,
      plan: generateFallbackPlan(catalogueData),
      catalogueInfo: {
        title: catalogueData.title,
        technologies: catalogueData.technologies,
        level: catalogueData.level,
        type: catalogueData.type
      }
    };
  }
};

/**
 * Fallback plan generator (without AI)
 */
const generateFallbackPlan = (catalogueData) => {
  const { title, technologies, level, prerequisites, objectives } = catalogueData;
  
  return {
    description: `Formation professionnelle sur ${title}. Cette formation permet d'acquérir les compétences essentielles dans le domaine.`,
    objectives: [
      objectives || "Maîtriser les concepts fondamentaux",
      "Développer des compétences pratiques",
      "Être capable de réaliser des projets concrets"
    ],
    targetAudience: `Cette formation s'adresse aux professionnels de niveau ${level || 'tous niveaux'}.`,
    detailedPrerequisites: [prerequisites || "Aucun prérequis spécifique"],
    modules: [
      {
        title: "Introduction et concepts de base",
        duration: "4 heures",
        objectives: ["Comprendre les fondamentaux"],
        content: ["Présentation générale", "Concepts clés"],
        practicalExercises: ["Exercices d'introduction"]
      },
      {
        title: "Pratique et mise en œuvre",
        duration: "8 heures",
        objectives: ["Appliquer les connaissances"],
        content: ["Cas pratiques", "Projets guidés"],
        practicalExercises: ["Projet pratique"]
      }
    ],
    teachingMethods: ["Cours magistral", "Travaux pratiques", "Études de cas"],
    evaluationMethods: ["QCM", "Projet final"],
    resources: technologies || ["Documentation officielle"],
    skillsAcquired: ["Compétences techniques", "Autonomie"],
    totalDuration: "3 jours (24 heures)"
  };
};

module.exports = {
  generateTrainingPlan
};
