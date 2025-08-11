const UniversityRepresentative = require('../models/UniversityRepresentative')
const User = require('../models/User')

// Create a university representative user
const createUniversityRepresentative = async (req, res) => {
  try {
    const { name, email, password, phone_number, university, max_requests } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'User already exists' })

    // Note: userController handles hashing; for simplicity rely on the same approach
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const rep = await UniversityRepresentative.create({
      name,
      email,
      password: hashedPassword,
      phone_number,
      role: 'university_representative',
      university,
      max_requests
    })

    const response = rep.toObject()
    delete response.password
    return res.status(201).json(response)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create university representative' })
  }
}

const getUniversityRepresentatives = async (_req, res) => {
  try {
    const list = await UniversityRepresentative.find().populate('university').select('-password')
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch university representatives' })
  }
}

const getUniversityRepresentativeById = async (req, res) => {
  try {
    const item = await UniversityRepresentative.findById(req.params.id).populate('university').select('-password')
    if (!item) return res.status(404).json({ message: 'University representative not found' })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch university representative' })
  }
}

const updateUniversityRepresentative = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.password) {
      const bcrypt = require('bcryptjs')
      updates.password = await bcrypt.hash(updates.password, 10)
    }

    const updated = await UniversityRepresentative.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')
    if (!updated) return res.status(404).json({ message: 'University representative not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update university representative' })
  }
}

const deleteUniversityRepresentative = async (req, res) => {
  try {
    const deleted = await UniversityRepresentative.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'University representative not found' })
    return res.json({ message: 'University representative deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete university representative' })
  }
}

module.exports = {
  createUniversityRepresentative,
  getUniversityRepresentatives,
  getUniversityRepresentativeById,
  updateUniversityRepresentative,
  deleteUniversityRepresentative
}


