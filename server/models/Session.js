// models/Session.js
const mongoose = require('mongoose')

const proposedDateSchema = new mongoose.Schema({
  from: { type: Date, required: true },
  to: { type: Date, required: true }
}, { _id: false })

const sessionSchema = new mongoose.Schema({
  // formation now optional: a session can originate from a catalogue before a concrete formation is created
  formation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation' },
  catalogue: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalogue' }, // optional direct link to a catalogue
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // university representative who requested the session
  proposed_dates: [proposedDateSchema], // proposed by university reps (max 2 suggested periods)
  scheduled_at: { type: Date }, // legacy internal field
  scheduled_end: { type: Date }, // legacy internal field
  status: { type: String, enum: ['PENDING','CONFIRMED','REJECTED','COMPLETED'], default: 'PENDING' },
  rejection_reason: { type: String },
  qr_code_data: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }]
  ,participants_confirmed: { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Virtuals to expose new naming convention expected by client
sessionSchema.virtual('start_date').get(function(){ return this.scheduled_at })
sessionSchema.virtual('end_date').get(function(){ return this.scheduled_end })

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session
