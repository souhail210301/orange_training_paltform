// models/User.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: { type: mongoose.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone_number: { type: String },
  role: {
    type: String,
    enum: ['admin', 'odc_mentor', 'prestataire', 'university_representative'],
    required: true
  },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date }
}, { discriminatorKey: 'role', timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User
