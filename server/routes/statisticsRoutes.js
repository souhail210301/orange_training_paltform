// routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const { getStatistics, getFilterOptions } = require('../controllers/statisticsController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/statistics
// @desc    Get comprehensive statistics for Chiffres Clés page
// @access  Private
router.get('/', protect, getStatistics);

// @route   GET /api/statistics/filters
// @desc    Get filter options (teachers, universities, sessions)
// @access  Private
router.get('/filters', protect, getFilterOptions);

module.exports = router;
