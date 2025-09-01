const Notification = require('../models/Notification')
const Catalogue = require('../models/Catalogue')

const listMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ recipient: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actor', 'name')
  .populate({ path: 'trainingRequest', select: 'status catalogue formation', populate: [{ path: 'catalogue', select: 'title' }, { path: 'formation', select: 'title' }] })
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

// Mentor accepts / declines invitation
const respondMentorInvite = async (req, res) => {
  try {
    const { decision } = req.body; // ACCEPTED or DECLINED
    if (!['ACCEPTED','DECLINED'].includes(decision)) return res.status(400).json({ message: 'Invalid decision' });
    const notif = await Notification.findOne({ _id: req.params.id, recipient: req.user?._id, type: 'MENTOR_INVITE' });
    if (!notif) return res.status(404).json({ message: 'Invitation not found' });
    if (notif.inviteStatus && notif.inviteStatus !== 'PENDING') return res.status(400).json({ message: 'Invitation already traitée' });
    notif.inviteStatus = decision === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED';
    notif.type = 'MENTOR_INVITE_RESPONSE'; // convert for display grouping
    await notif.save();
    // If accepted, add mentor to catalogue trainers
    if (decision === 'ACCEPTED' && notif.catalogue) {
      await Catalogue.findByIdAndUpdate(notif.catalogue, { $addToSet: { trainers: req.user._id } });
    }
    return res.json(notif);
  } catch (e) {
    res.status(500).json({ message: 'Failed to respond to invitation' })
  }
}

module.exports = { listMyNotifications, markNotificationRead, respondMentorInvite }