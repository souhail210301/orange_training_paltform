const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  createTrainingRequest,
  listTrainingRequests,
  updateTrainingRequestStatus
} = require('../controllers/trainingRequestController')

const router = express.Router()

// University representatives submit requests
router.post('/', protect, createTrainingRequest)

// Admin views and acts on requests
router.get('/', protect, adminOnly, listTrainingRequests)
router.patch('/:id/status', protect, adminOnly, updateTrainingRequestStatus)

module.exports = router


