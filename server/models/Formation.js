// models/Formation.js
import mongoose from 'mongoose'

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  objectives: String,
  prerequisites: String,
  course_languages: [String],
  support_languages: [String],
  technologies: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
})

export default mongoose.model('Formation', formationSchema)
