// models/Certificate.js
import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  issue_date: { type: Date, default: Date.now },
  verification_token: { type: String, unique: true }
})

export default mongoose.model('Certificate', certificateSchema)
