const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  assignTeacher,
  scheduleDate,
  addParticipants,
  setParticipantPresence
} = require('../controllers/sessionController')

const router = express.Router()

// General reads
router.get('/', getSessions)
router.get('/:id', getSessionById)

// CRUD (admin)
router.post('/', protect, adminOnly, createSession)
router.put('/:id', protect, adminOnly, updateSession)
router.delete('/:id', protect, adminOnly, deleteSession)

// Management
router.patch('/:id/assign-teacher', protect, adminOnly, assignTeacher)
router.patch('/:id/schedule', protect, adminOnly, scheduleDate)
router.post('/:id/participants', protect, adminOnly, addParticipants)
router.patch('/:id/participants/:participantId/presence', protect, setParticipantPresence)

module.exports = router


