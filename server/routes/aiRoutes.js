// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generatePlan, generatePlanPDF, generateCataloguePlanPDF } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Generate AI training plan (JSON)
router.post('/generate-plan', protect, generatePlan);

// Generate AI training plan (PDF)
router.post('/generate-plan-pdf', protect, generatePlanPDF);

// Generate PDF for existing catalogue
router.get('/catalogue/:id/plan-pdf', protect, generateCataloguePlanPDF);

module.exports = router;
