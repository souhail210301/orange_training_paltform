// models/University.js
import mongoose from 'mongoose'

const universitySchema = new mongoose.Schema({
  id_university: { type: Number, unique: true },
  name: { type: String, required: true }
})

export default mongoose.model('University', universitySchema)
