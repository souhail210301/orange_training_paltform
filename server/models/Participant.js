const mongoose = require('mongoose')

const participantSchema = new mongoose.Schema({
	session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
	name: { type: String, trim: true },
	email: { type: String, required: true, trim: true, lowercase: true },
		countryCode: { type: String, trim: true, default: '+216' },
		phone: { type: String, trim: true },
		level: { type: String, trim: true },
	presence: { type: Boolean, default: false }
}, { timestamps: true })

participantSchema.index({ session: 1, email: 1 }, { unique: true })

module.exports = mongoose.model('Participant', participantSchema)

