// models/Category.js
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  catalogue: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalogue', required: true }
}, { timestamps: true })

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
