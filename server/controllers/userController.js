const User = require('../models/User')
const UniversityRepresentative = require('../models/UniversityRepresentative')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, phone_number, role, university } = req.body

  try {
    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    // Special handling for university representatives
    if (role === 'university_representative') {
      if (!university) {
        return res.status(400).json({ message: 'university is required for role university_representative' })
      }
      await UniversityRepresentative.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        role,
        university
      })
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        role
      })
    }

    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    user.last_login = new Date()
    await user.save()

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Get current user (via token)
const getCurrentUser = async (req, res) => {
  res.json(req.user)
}

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Admin: Get users by role
const getUserByRole = async (req, res) => {
  try {
    const roleParam = String(req.params.role || '').trim()
    const allowedRoles = User.schema.path('role').enumValues
    if (!allowedRoles.includes(roleParam)) {
      return res.status(400).json({ message: 'Invalid role', allowedRoles })
    }

    const users = await User.find({ role: roleParam }).select('-password')
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserByRole,
  deleteUser
}
