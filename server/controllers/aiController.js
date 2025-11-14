// controllers/aiController.js
const { generateTrainingPlan } = require('../services/aiService');
const { generateTrainingPlanPDF } = require('../services/pdfService');
const Catalogue = require('../models/Catalogue');

/**
 * Generate AI training plan for a catalogue
 */
const generatePlan = async (req, res) => {
  try {
    const { title, technologies, level, type, prerequisites, objectives } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    console.log('Generating AI training plan for:', title);

    // Generate plan with AI
    const result = await generateTrainingPlan({
      title,
      technologies,
      level,
      type,
      prerequisites,
      objectives
    });

    if (!result.success) {
      console.warn('AI generation failed, using fallback:', result.error);
    }

    return res.json({
      success: result.success,
      plan: result.plan,
      message: result.success 
        ? 'Plan de formation généré avec succès' 
        : 'Plan de formation généré (mode de secours)'
    });

  } catch (error) {
    console.error('Error in generatePlan:', error);
    return res.status(500).json({ 
      message: 'Failed to generate training plan',
      error: error.message 
    });
  }
};

/**
 * Generate PDF training plan for a catalogue
 */
const generatePlanPDF = async (req, res) => {
  try {
    const { title, technologies, level, type, prerequisites, objectives } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    console.log('Generating AI training plan PDF for:', title);

    // Generate plan with AI
    const result = await generateTrainingPlan({
      title,
      technologies,
      level,
      type,
      prerequisites,
      objectives
    });

    // Generate PDF
    const pdfBuffer = await generateTrainingPlanPDF(result.plan, result.catalogueInfo);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=plan-formation-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('Error in generatePlanPDF:', error);
    return res.status(500).json({ 
      message: 'Failed to generate PDF',
      error: error.message 
    });
  }
};

/**
 * Generate PDF for existing catalogue
 */
const generateCataloguePlanPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const catalogue = await Catalogue.findById(id);
    if (!catalogue) {
      return res.status(404).json({ message: 'Catalogue not found' });
    }

    console.log('Generating AI training plan PDF for catalogue:', catalogue.title);

    // Generate plan with AI
    const result = await generateTrainingPlan({
      title: catalogue.title,
      technologies: catalogue.technologies,
      level: catalogue.level,
      type: catalogue.type,
      prerequisites: catalogue.prerequisites,
      objectives: catalogue.objectives
    });

    // Generate PDF
    const pdfBuffer = await generateTrainingPlanPDF(result.plan, result.catalogueInfo);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=plan-formation-${catalogue.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('Error in generateCataloguePlanPDF:', error);
    return res.status(500).json({ 
      message: 'Failed to generate PDF for catalogue',
      error: error.message 
    });
  }
};

module.exports = {
  generatePlan,
  generatePlanPDF,
  generateCataloguePlanPDF
};
