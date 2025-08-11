// models/TrainingRequest.js
import mongoose from 'mongoose'

const trainingRequestSchema = new mongoose.Schema({
  request_type: { type: String, enum: ['NEW', 'MODIFICATION'], required: true },
  formation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation' },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
})

export default mongoose.model('TrainingRequest', trainingRequestSchema)
