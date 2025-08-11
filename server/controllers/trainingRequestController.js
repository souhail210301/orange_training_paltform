const TrainingRequest = require('../models/TrainingRequest')

// University representative creates a training request
const createTrainingRequest = async (req, res) => {
  try {
    const { request_type, formation, university, comment } = req.body
    const requested_by = req.user?._id
    const payload = { request_type, formation, university, requested_by, comment }
    const tr = await TrainingRequest.create(payload)
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


