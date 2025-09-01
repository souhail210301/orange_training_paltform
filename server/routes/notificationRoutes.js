const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { listMyNotifications, markNotificationRead, respondMentorInvite } = require('../controllers/notificationController')
const router = express.Router()

router.get('/', protect, listMyNotifications)
router.patch('/:id/read', protect, markNotificationRead)
router.post('/:id/respond-invite', protect, respondMentorInvite)

module.exports = router