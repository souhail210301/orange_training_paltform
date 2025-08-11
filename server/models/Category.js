// models/Category.js
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: String,
  catalogue: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalogue' }
})

export default mongoose.model('Category', categorySchema)
