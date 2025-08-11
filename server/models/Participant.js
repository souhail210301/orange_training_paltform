// models/Participant.js
import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String },
  presence: { type: Boolean, default: false },
  specialite: String,
  num_de_tel: String,
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' }
})

export default mongoose.model('Participant', participantSchema)
