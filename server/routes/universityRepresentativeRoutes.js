const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  createUniversityRepresentative,
  getUniversityRepresentatives,
  getUniversityRepresentativeById,
  updateUniversityRepresentative,
  deleteUniversityRepresentative
} = require('../controllers/universityRepresentativeController')

const router = express.Router()

router.get('/', protect, adminOnly, getUniversityRepresentatives)
router.get('/:id', protect, adminOnly, getUniversityRepresentativeById)

// Admin creates representative accounts
router.post('/', protect, adminOnly, createUniversityRepresentative)
router.put('/:id', protect, adminOnly, updateUniversityRepresentative)
router.delete('/:id', protect, adminOnly, deleteUniversityRepresentative)

module.exports = router


