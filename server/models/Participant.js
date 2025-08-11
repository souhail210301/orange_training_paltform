// models/Participant.js
const mongoose = require('mongoose')

const participantSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String },
  presence: { type: Boolean, default: false },
  specialite: { type: String },
  num_de_tel: { type: String },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' }
}, { timestamps: true })

const Participant = mongoose.model('Participant', participantSchema)

module.exports = Participant
