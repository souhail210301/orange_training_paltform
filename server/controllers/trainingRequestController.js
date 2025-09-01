const TrainingRequest = require('../models/TrainingRequest')
const Notification = require('../models/Notification')
const User = require('../models/User')
const Catalogue = require('../models/Catalogue')
const Formation = require('../models/Formation')

// University representative creates a training request
const createTrainingRequest = async (req, res) => {
  try {
    const { request_type, formation, catalogue, university, comment, requested_weeks, alternative_date } = req.body
    const requested_by = req.user?._id

    if (!request_type) return res.status(400).json({ message: 'request_type requis' })
    if (!formation && !catalogue) return res.status(400).json({ message: 'formation ou catalogue requis' })

    // Basic validation of weeks (max 2, from <= to)
    let weeks = []
    if (requested_weeks && Array.isArray(requested_weeks)) {
      weeks = requested_weeks.slice(0, 2).filter(w => w?.from && w?.to).map(w => ({ from: w.from, to: w.to }))
    }

    const payload = { request_type, formation, catalogue, university, requested_by, comment, requested_weeks: weeks }
    if (alternative_date) payload.alternative_date = alternative_date

    const tr = await TrainingRequest.create(payload)
    // Gather context for richer notification
    const actorUser = await User.findById(requested_by).select('name')
    let itemTitle = ''
    if (tr.catalogue) {
      const cat = await Catalogue.findById(tr.catalogue).select('title')
      itemTitle = cat?.title || ''
    } else if (tr.formation) {
      const form = await Formation.findById(tr.formation).select('title')
      itemTitle = form?.title || ''
    }
    const admins = await User.find({ role: 'admin' }).select('_id')
    const notifs = admins.map(a => ({
      type: 'TRAINING_REQUEST',
      title: `${actorUser?.name || 'Un formateur'} a demandé une formation`,
      body: `${actorUser?.name || 'Un formateur'} a demandé une formation${itemTitle ? ` de ${itemTitle}` : ''}.`,
      actor: requested_by,
      trainingRequest: tr._id,
      recipient: a._id
    }))
    if (notifs.length) await Notification.insertMany(notifs)
    return res.status(201).json(tr)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create training request' })
  }
}

// Admin reviews requests
const listTrainingRequests = async (_req, res) => {
  try {
    const list = await TrainingRequest.find()
      .populate('formation')
      .populate('university')
      .populate('requested_by', '-password')
      .populate('approved_by', '-password')
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch training requests' })
  }
}

const updateTrainingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body // APPROVED | REJECTED
    const updated = await TrainingRequest.findByIdAndUpdate(
      req.params.id,
      { status, approved_by: req.user?._id },
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ message: 'Training request not found' })
    // If approved and linked to a catalogue, add mentor as trainer
    if (status === 'APPROVED' && updated.catalogue && updated.requested_by) {
      try {
        const Catalogue = require('../models/Catalogue')
        await Catalogue.findByIdAndUpdate(
          updated.catalogue,
          { $addToSet: { trainers: updated.requested_by } },
          { new: true }
        )
      } catch (e) {
        // Log silently; do not fail entire request
        console.error('Failed adding mentor to catalogue trainers', e.message)
      }
    }
    // Notify requester
    if (updated.requested_by) {
      await Notification.create({
        type: 'TRAINING_REQUEST_STATUS',
        title: `Demande ${status === 'APPROVED' ? 'approuvée' : 'rejetée'}`,
        body: `Votre demande de session a été ${status === 'APPROVED' ? 'approuvée' : 'rejetée'}.`,
        actor: req.user?._id,
        trainingRequest: updated._id,
        recipient: updated.requested_by
      })
    }
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update training request' })
  }
}

module.exports = {
  createTrainingRequest,
  listTrainingRequests,
  updateTrainingRequestStatus
}


