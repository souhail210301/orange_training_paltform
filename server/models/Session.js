// models/Session.js
import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  formation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation' },
  qr_code_data: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }]
})

export default mongoose.model('Session', sessionSchema)
