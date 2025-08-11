// models/University.js
const mongoose = require('mongoose')

const universitySchema = new mongoose.Schema({
  id_university: { type: Number, unique: true },
  name: { type: String, required: true }
}, { timestamps: true })

const University = mongoose.model('University', universitySchema)

module.exports = University
