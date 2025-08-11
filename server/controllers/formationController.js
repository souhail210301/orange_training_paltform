const Formation = require('../models/Formation')

const createFormation = async (req, res) => {
  try {
    const formation = await Formation.create(req.body)
    return res.status(201).json(formation)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create formation' })
  }
}

const getFormations = async (_req, res) => {
  try {
    const list = await Formation.find()
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch formations' })
  }
}

const getFormationById = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id)
    if (!formation) return res.status(404).json({ message: 'Formation not found' })
    return res.json(formation)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch formation' })
  }
}

const updateFormation = async (req, res) => {
  try {
    const updated = await Formation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Formation not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update formation' })
  }
}

const deleteFormation = async (req, res) => {
  try {
    const deleted = await Formation.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Formation not found' })
    return res.json({ message: 'Formation deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete formation' })
  }
}

module.exports = {
  createFormation,
  getFormations,
  getFormationById,
  updateFormation,
  deleteFormation
}


