const mongoose = require('mongoose')
const Session = require('../models/Session')
const Participant = require('../models/Participant')

// Basic CRUD
const createSession = async (req, res) => {
  try {
    const { formation, teacher, scheduled_at, qr_code_data } = req.body
    const session = await Session.create({ formation, teacher, scheduled_at, qr_code_data })
    const populated = await session.populate(['formation', 'teacher'])
    return res.status(201).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create session' })
  }
}

const getSessions = async (_req, res) => {
  try {
    const sessions = await Session.find().populate('formation').populate('teacher')
    return res.json(sessions)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch sessions' })
  }
}

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('formation')
      .populate('teacher')
      .populate('participants')
    if (!session) return res.status(404).json({ message: 'Session not found' })
    return res.json(session)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch session' })
  }
}

const updateSession = async (req, res) => {
  try {
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('formation').populate('teacher').populate('participants')
    if (!updated) return res.status(404).json({ message: 'Session not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update session' })
  }
}

const deleteSession = async (req, res) => {
  try {
    const deleted = await Session.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Session not found' })
    return res.json({ message: 'Session deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete session' })
  }
}

// Management actions
const assignTeacher = async (req, res) => {
  try {
    const { teacher } = req.body
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      { teacher },
      { new: true, runValidators: true }
    ).populate('teacher').populate('formation')
    if (!updated) return res.status(404).json({ message: 'Session not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to assign teacher' })
  }
}

const scheduleDate = async (req, res) => {
  try {
    const { scheduled_at } = req.body
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      { scheduled_at },
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ message: 'Session not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to schedule session' })
  }
}

// Add participants by emails array
const addParticipants = async (req, res) => {
  try {
    const { emails } = req.body
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'emails must be a non-empty array' })
    }
    const sessionId = req.params.id
    const createdParticipants = await Participant.insertMany(
      emails.map(email => ({ email, session: sessionId }))
    )
    const participantIds = createdParticipants.map(p => p._id)
    const updated = await Session.findByIdAndUpdate(
      sessionId,
      { $addToSet: { participants: { $each: participantIds } } },
      { new: true }
    ).populate('participants')
    return res.status(201).json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add participants' })
  }
}

// Update a participant presence
const setParticipantPresence = async (req, res) => {
  try {
    const { participantId } = req.params
    const { presence } = req.body
    const participant = await Participant.findByIdAndUpdate(participantId, { presence }, { new: true })
    if (!participant) return res.status(404).json({ message: 'Participant not found' })
    return res.json(participant)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update presence' })
  }
}

module.exports = {
  // CRUD
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  // Management
  assignTeacher,
  scheduleDate,
  addParticipants,
  setParticipantPresence
}


