const Catalogue = require('../models/Catalogue')
const Notification = require('../models/Notification')
const User = require('../models/User')

const createCatalogue = async (req, res) => {
  try {
    const {
      coverImage,
      title,
      trainers,
      objectives,
      program,
      prerequisites,
      language,
      level,
      type,
      technologies
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Role guard: only admin or university representative can create
    if (!req.user || !['admin','university_representative'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to create catalogue' });
    }

    const safeProgram = Array.isArray(program) ? program.map(day => ({
      description: day.description || '',
      sessions: Array.isArray(day.sessions) ? day.sessions.filter(s => s && (s.from || s.to || s.description)) : []
    })) : []

  let catalogue = await Catalogue.create({
      coverImage,
      title,
      trainers,
      created_by: req.user._id,
      objectives,
      program: safeProgram,
      prerequisites,
      language,
      level,
      type,
      technologies
    });
  catalogue = await catalogue.populate({ path: 'created_by', populate: { path: 'university' }, select: '-password' })
    // Auto-create a pending session entry referencing this catalogue so it appears in Sessions UI
    try {
      const Session = require('../models/Session');
      await Session.create({ catalogue: catalogue._id, status: 'PENDING', requested_by: req.user.role==='university_representative'? req.user._id: undefined });
    } catch (e) {
      // swallow any session creation failure to not block catalogue creation
      console.warn('Auto session create failed:', e.message);
    }
    // If a trainer was assigned and creator is university rep, send invite notification to that mentor
    if (req.user.role === 'university_representative' && trainers && trainers.length) {
      const mentorId = trainers[0];
      try {
        await Notification.create({
          type: 'MENTOR_INVITE',
            title: 'Invitation à animer une formation',
            body: `${req.user.name || 'Un représentant'} vous a proposé d'être formateur pour la formation "${title}". Acceptez pour confirmer votre participation.`,
            actor: req.user._id,
            catalogue: catalogue._id,
            inviteStatus: 'PENDING',
            recipient: mentorId
        });
      } catch (e) { /* ignore notification failure */ }
    }
    return res.status(201).json(catalogue);
  } catch (error) {
    console.error('Catalogue create error:', error)
    return res.status(500).json({ message: 'Failed to create catalogue', error: error.message });
  }
}

const getCatalogues = async (_req, res) => {
  try {
    const list = await Catalogue.find()
      .populate({ path: 'created_by', populate: { path: 'university' }, select: '-password' })
      .populate('trainers', '-password')
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch catalogues' })
  }
}

const getCatalogueById = async (req, res) => {
  try {
    const item = await Catalogue.findById(req.params.id)
      .populate({ path: 'created_by', populate: { path: 'university' }, select: '-password' })
      .populate('trainers', '-password')
    if (!item) return res.status(404).json({ message: 'Catalogue not found' })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch catalogue' })
  }
}

const updateCatalogue = async (req, res) => {
  try {
    if (!req.user || !['admin','university_representative'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update catalogue' });
    }
    // Load existing for comparison & ownership
    const existing = await Catalogue.findById(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Catalogue not found' })
    if (req.user.role === 'university_representative') {
      if (!existing.created_by || existing.created_by.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to modify this catalogue' })
      }
    }

    const prevTrainerIds = (existing.trainers || []).map(t => t.toString())
    const nextTrainerIds = (req.body.trainers || prevTrainerIds).map(t => t.toString())

  let updated = await Catalogue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Catalogue not found after update' })
  updated = await updated.populate({ path: 'created_by', populate: { path: 'university' }, select: '-password' })

    // For university rep: detect newly added first trainer and send invite if not already invited
    if (req.user.role === 'university_representative' && nextTrainerIds.length) {
      const newlyAdded = nextTrainerIds.find(id => !prevTrainerIds.includes(id))
      if (newlyAdded) {
        try {
          const existingInvite = await Notification.findOne({ type: 'MENTOR_INVITE', catalogue: updated._id, recipient: newlyAdded, inviteStatus: 'PENDING' })
          if (!existingInvite) {
            await Notification.create({
              type: 'MENTOR_INVITE',
              title: 'Invitation à animer une formation',
              body: `${req.user.name || 'Un représentant'} vous a proposé d'être formateur pour la formation "${updated.title}". Acceptez pour confirmer votre participation.`,
              actor: req.user._id,
              catalogue: updated._id,
              inviteStatus: 'PENDING',
              recipient: newlyAdded
            });
          }
        } catch (e) { /* ignore notification errors */ }
      }
    }
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update catalogue', error: error.message })
  }
}

const deleteCatalogue = async (req, res) => {
  try {
    if (req.user && req.user.role === 'university_representative') {
      const existing = await Catalogue.findById(req.params.id).select('created_by')
      if (!existing) return res.status(404).json({ message: 'Catalogue not found' })
      if (!existing.created_by) {
        return res.status(403).json({ message: 'Not authorized to delete this catalogue' })
      }
      if (existing.created_by.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this catalogue' })
      }
    }
    const deleted = await Catalogue.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Catalogue not found' })
    return res.json({ message: 'Catalogue deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete catalogue' })
  }
}

module.exports = {
  createCatalogue,
  getCatalogues,
  getCatalogueById,
  updateCatalogue,
  deleteCatalogue
}


