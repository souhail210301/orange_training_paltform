// models/Catalogue.js
import mongoose from 'mongoose'

const catalogueSchema = new mongoose.Schema({
  name: String
})

export default mongoose.model('Catalogue', catalogueSchema)
