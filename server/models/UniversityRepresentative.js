// models/UniversityRepresentative.js
import User from './User.js'
const mongoose = require('mongoose')

const universityRepSchema = new mongoose.Schema({
  max_requests: Number,
  university_name: String
})

const UniversityRep = User.discriminator('university_representative', universityRepSchema)

export default UniversityRep
