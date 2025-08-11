// models/Formation.js
const mongoose = require('mongoose')

const formationSchema = new mongoose.Schema({
  code: { type: String },
  title: { type: String, required: true },
  syllabus_url: { type: String },
  objectives: { type: String },
  prerequisites: { type: String },
  course_languages: [{ type: String }],
  support_languages: [{ type: String }],
  technologies: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true })

const Formation = mongoose.model('Formation', formationSchema)

module.exports = Formation
