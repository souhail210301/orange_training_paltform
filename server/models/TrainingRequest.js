// models/TrainingRequest.js
const mongoose = require('mongoose')

const trainingRequestSchema = new mongoose.Schema({
  request_type: { type: String, enum: ['NEW', 'MODIFICATION'], required: true },
  formation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation' },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  comment: { type: String }
}, { timestamps: true })

const TrainingRequest = mongoose.model('TrainingRequest', trainingRequestSchema)

module.exports = TrainingRequest
