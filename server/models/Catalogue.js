// models/Catalogue.js
const mongoose = require('mongoose')


const sessionSchema = new mongoose.Schema({
  from: { type: String }, // e.g. '09:00'
  to: { type: String },   // e.g. '12:00'
  description: { type: String }
}, { _id: false });

const daySchema = new mongoose.Schema({
  description: { type: String },
  sessions: [sessionSchema]
}, { _id: false });

const catalogueSchema = new mongoose.Schema({
  coverImage: { type: String }, // URL or base64
  title: { type: String, required: true },
  trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  objectives: { type: String },
  program: [daySchema],
  prerequisites: { type: String },
  language: { type: String },
  level: { type: String },
  type: { type: String },
  technologies: [{ type: String }]
}, { timestamps: true });

const Catalogue = mongoose.model('Catalogue', catalogueSchema)

module.exports = Catalogue
