const express = require('express')
const { protect, adminOnly, allowRoles } = require('../middleware/authMiddleware')
const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  assignTeacher,
  scheduleDate,
  addParticipants,
  setParticipantPresence,
  updateParticipant,
  confirmParticipants,
  removeParticipant,
  setStatus
} = require('../controllers/sessionController')

const router = express.Router()

// General reads
router.get('/', getSessions)
router.get('/:id', getSessionById)

// Create: admin OR university representative (protected)
router.post('/', protect, createSession)
router.put('/:id', protect, adminOnly, updateSession)
router.delete('/:id', protect, adminOnly, deleteSession)

// Management
router.patch('/:id/assign-teacher', protect, adminOnly, assignTeacher)
router.patch('/:id/schedule', protect, adminOnly, scheduleDate)
// Only university representatives can add participants
router.post('/:id/participants', protect, allowRoles('university_representative'), addParticipants)
// Presence management: only odc_mentor can manage presence
router.patch('/:id/participants/:participantId/presence', protect, allowRoles('odc_mentor'), setParticipantPresence)
router.patch('/:id/participants/:participantId', protect, adminOnly, updateParticipant)
router.delete('/:id/participants/:participantId', protect, adminOnly, removeParticipant)
router.post('/:id/participants/confirm', protect, adminOnly, confirmParticipants)
router.patch('/:id/status', protect, adminOnly, setStatus)

module.exports = router


