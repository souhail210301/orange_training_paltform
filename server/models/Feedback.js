// models/Feedback.js
import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
})

export default mongoose.model('Feedback', feedbackSchema)
