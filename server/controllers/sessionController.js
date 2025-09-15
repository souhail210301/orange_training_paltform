const mongoose = require('mongoose')
const Session = require('../models/Session')
const Participant = require('../models/Participant')
const Catalogue = require('../models/Catalogue')

// Basic CRUD
const Formation = require('../models/Formation')

const createSession = async (req, res) => {
  try {
  const { formation, teacher, proposed_dates, scheduled_at, scheduled_end, start_date, end_date, qr_code_data } = req.body
    // University representative can request session with only formation + proposed dates
    if (!formation) return res.status(400).json({ message: 'formation is required' })

    const formationDoc = await Formation.findById(formation)
    if (!formationDoc) return res.status(404).json({ message: 'Formation not found' })

    let requested_by = undefined
    let status = 'PENDING'
    let proposed = []
    if (Array.isArray(proposed_dates)) {
      proposed = proposed_dates.slice(0,2).filter(r => r.from && r.to)
    }

    // If creator is university representative, auto-set requested_by and force PENDING status
    if (req.user && req.user.role === 'university_representative') {
      requested_by = req.user._id
      status = 'PENDING'
    }

    // Admin can optionally set teacher and schedule on creation
  const doc = { formation, teacher, proposed_dates: proposed, scheduled_at: start_date || scheduled_at, scheduled_end: end_date || scheduled_end, qr_code_data, requested_by, status }
    const session = await Session.create(doc)
    const populated = await session
      .populate('formation')
      .populate('teacher')
      .populate('requested_by')
      .populate({
        path: 'catalogue',
        populate: [
          { path: 'created_by', populate: { path: 'university' } },
          { path: 'trainers' }
        ]
      })
    return res.status(201).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create session' })
  }
}

const getSessions = async (_req, res) => {
  try {
    // One-time migration: ensure every catalogue has a backing session
    if (!global.__catalogueSessionsEnsured) {
      try {
        const catalogueIds = await Catalogue.find().distinct('_id')
        const existingSessionCatalogueIds = await Session.find({ catalogue: { $in: catalogueIds } }).distinct('catalogue')
        const missing = catalogueIds.filter(id => !existingSessionCatalogueIds.some(e => e.toString() === id.toString()))
        if (missing.length) {
          await Promise.all(missing.map(id => Session.create({ catalogue: id, status: 'PENDING' })))
        }
        global.__catalogueSessionsEnsured = true
      } catch (e) {
        // Don't block response if migration fails
        console.warn('Catalogue->Session migration skipped:', e.message)
      }
    }
    const sessions = await Session.find()
      .populate('formation')
      .populate('teacher')
  .populate('participants')
      .populate({ path: 'requested_by', populate: { path: 'university' } })
      .populate({
        path: 'catalogue',
        populate: [
          { path: 'created_by', populate: { path: 'university' } },
          { path: 'trainers' }
        ]
      })
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
      .populate('requested_by')
      .populate('participants')
      .populate({
        path: 'catalogue',
        populate: [
          { path: 'created_by', populate: { path: 'university' } },
          { path: 'trainers' }
        ]
      })
    if (!session) return res.status(404).json({ message: 'Session not found' })
    return res.json(session)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch session' })
  }
}

const updateSession = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.proposed_dates) {
      updates.proposed_dates = updates.proposed_dates.slice(0,2).filter(r => r.from && r.to)
    }
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
  ).populate('formation')
    .populate('teacher')
    .populate('participants')
    .populate('requested_by')
    .populate({
      path: 'catalogue',
      populate: [
        { path: 'created_by', populate: { path: 'university' } },
        { path: 'trainers' }
      ]
    })
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
  ).populate('teacher').populate('formation').populate('requested_by')
    .populate({
      path: 'catalogue',
      populate: [
        { path: 'created_by', populate: { path: 'university' } },
        { path: 'trainers' }
      ]
    })
    if (!updated) return res.status(404).json({ message: 'Session not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to assign teacher' })
  }
}

const scheduleDate = async (req, res) => {
  try {
    const { start_date, end_date, scheduled_at, scheduled_end } = req.body
    const payload = {
      scheduled_at: start_date || scheduled_at,
      scheduled_end: end_date || scheduled_end
    }
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
  ).populate('formation')
    .populate('teacher')
    .populate('requested_by')
    .populate('participants')
    .populate({
      path: 'catalogue',
      populate: [
        { path: 'created_by', populate: { path: 'university' } },
        { path: 'trainers' }
      ]
    })
    if (!updated) return res.status(404).json({ message: 'Session not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to schedule session' })
  }
}

// Approve / Reject / Complete session
const setStatus = async (req, res) => {
  try {
  const { status, rejection_reason } = req.body // CONFIRMED | REJECTED | COMPLETED
    if (!['CONFIRMED','REJECTED','COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const patch = { status }
    if(status==='REJECTED' && rejection_reason){
      patch.rejection_reason = rejection_reason
    }
    if (status === 'COMPLETED') {
      patch.completed_at = new Date()
    }
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      patch,
      { new: true, runValidators: true }
  ).populate('formation')
    .populate('teacher')
    .populate('participants')
    .populate('requested_by')
    .populate({
      path: 'catalogue',
      populate: [
        { path: 'created_by', populate: { path: 'university' } },
        { path: 'trainers' }
      ]
    })
    if (!updated) return res.status(404).json({ message: 'Session not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update status' })
  }
}

// Add participants: supports { emails:[...] } OR { participants:[ {name,email,phone} ] }
const addParticipants = async (req, res) => {
  try {
    const sessionId = req.params.id
    let docs = []
    if (Array.isArray(req.body.emails)) {
      docs = req.body.emails.filter(Boolean).map(email => ({ email: String(email).trim().toLowerCase(), session: sessionId }))
    } else if (Array.isArray(req.body.participants)) {
      docs = req.body.participants.filter(p=>p && p.email).map(p => ({
        session: sessionId,
        email: String(p.email).trim().toLowerCase(),
        name: p.name || undefined,
        phone: p.phone || undefined,
        countryCode: p.countryCode || '+216',
        level: p.level || undefined
      }))
    }
    if (!docs.length) return res.status(400).json({ message: 'Provide emails[] or participants[]' })
    // Use ordered:false so duplicates skip silently
    const created = await Participant.insertMany(docs, { ordered: false }).catch(e=>{
      // Mongo bulk write duplicate errors -> some inserted
      if (e.insertedDocs) return e.insertedDocs
      throw e
    })
    const ids = (created.insertedIds ? Object.values(created.insertedIds) : created.map(d=>d._id))
    const updated = await Session.findByIdAndUpdate(
      sessionId,
      { $addToSet: { participants: { $each: ids } } },
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

// Update a participant (name, email, phone, level)
const updateParticipant = async (req, res) => {
  try {
    const { participantId } = req.params
    const allowed = ['name','email','phone','countryCode','level']
    const patch = {}
    allowed.forEach(k=> { if(req.body[k]!==undefined) patch[k]=req.body[k] })
    const doc = await Participant.findByIdAndUpdate(participantId, patch, { new: true, runValidators: true })
    if(!doc) return res.status(404).json({ message:'Participant not found' })
    return res.json(doc)
  } catch(e){ return res.status(500).json({ message:'Failed to update participant' }) }
}

// Confirm participants list (locks edits)
const confirmParticipants = async (req,res) => {
  try {
    const { id } = req.params
    const session = await Session.findByIdAndUpdate(id, { participants_confirmed: true }, { new:true })
    if(!session) return res.status(404).json({ message:'Session not found' })
    return res.json({ participants_confirmed: session.participants_confirmed })
  } catch(e){ return res.status(500).json({ message:'Failed to confirm participants' }) }
}

// Remove a participant from a session
const removeParticipant = async (req,res) => {
  try {
    const { id, participantId } = req.params
    // Remove participant document
    const doc = await Participant.findByIdAndDelete(participantId)
    if(!doc) return res.status(404).json({ message:'Participant not found' })
    // Pull from session participants array
    await Session.findByIdAndUpdate(id, { $pull: { participants: participantId } })
    return res.json({ _id: participantId, removed: true })
  } catch(e){ return res.status(500).json({ message:'Failed to delete participant' }) }
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

module.exports.setStatus = setStatus
module.exports.updateParticipant = updateParticipant
module.exports.confirmParticipants = confirmParticipants
module.exports.removeParticipant = removeParticipant


