// models/UniversityRepresentative.js
const User = require('./User')
const mongoose = require('mongoose')

const universityRepSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  max_requests: { type: Number, default: 3 }
}, { timestamps: true })

const UniversityRep = User.discriminator('university_representative', universityRepSchema)

module.exports = UniversityRep
