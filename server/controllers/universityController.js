const University = require('../models/University')

const createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body)
    return res.status(201).json(university)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create university' })
  }
}

const getUniversities = async (_req, res) => {
  try {
    const list = await University.find()
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch universities' })
  }
}

const getUniversityById = async (req, res) => {
  try {
    const item = await University.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'University not found' })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch university' })
  }
}

const updateUniversity = async (req, res) => {
  try {
    const updated = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'University not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update university' })
  }
}

const deleteUniversity = async (req, res) => {
  try {
    const deleted = await University.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'University not found' })
    return res.json({ message: 'University deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete university' })
  }
}

module.exports = {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity
}


