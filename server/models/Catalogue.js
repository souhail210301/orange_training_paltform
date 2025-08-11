// models/Catalogue.js
const mongoose = require('mongoose')

const catalogueSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true })

const Catalogue = mongoose.model('Catalogue', catalogueSchema)

module.exports = Catalogue
