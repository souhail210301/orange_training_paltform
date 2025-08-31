const Notification = require('../models/Notification')

const listMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ recipient: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actor', 'name')
      .populate({ path: 'trainingRequest', populate: [{ path: 'catalogue', select: 'title' }, { path: 'formation', select: 'title' }] })
    res.json(list)
  } catch (e) {
    res.status(500).json({ message: 'Failed to load notifications' })
  }
}

const markNotificationRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user?._id }, { read: true }, { new: true })
    if (!n) return res.status(404).json({ message: 'Notification not found' })
    res.json(n)
  } catch (e) {
    res.status(500).json({ message: 'Failed to update notification' })
  }
}

module.exports = { listMyNotifications, markNotificationRead }