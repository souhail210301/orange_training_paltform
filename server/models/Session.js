// models/Session.js
const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  formation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduled_at: { type: Date },
  qr_code_data: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }]
}, { timestamps: true })

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session
