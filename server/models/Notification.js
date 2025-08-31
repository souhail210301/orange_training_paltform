const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['TRAINING_REQUEST','TRAINING_REQUEST_STATUS'], required: true },
  title: { type: String, required: true },
  body: { type: String },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // user who triggered
  trainingRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingRequest' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)