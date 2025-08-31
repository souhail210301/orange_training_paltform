// models/TrainingRequest.js
const mongoose = require('mongoose')

const weekRangeSchema = new mongoose.Schema({
  from: { type: Date, required: true },
  to: { type: Date, required: true }
}, { _id: false })

const trainingRequestSchema = new mongoose.Schema({
  request_type: { type: String, enum: ['NEW', 'MODIFICATION'], required: true },
  formation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation' },
  catalogue: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalogue' }, // when session requested from a catalogue
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' }, // optional for mentor-originated requests
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  comment: { type: String },
  requested_weeks: [weekRangeSchema], // up to two weeks proposed
  alternative_date: { type: Date } // optional single alternative date
}, { timestamps: true })

const TrainingRequest = mongoose.model('TrainingRequest', trainingRequestSchema)

module.exports = TrainingRequest
