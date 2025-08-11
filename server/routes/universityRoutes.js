const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity
} = require('../controllers/universityController')

const router = express.Router()

router.get('/', getUniversities)
router.get('/:id', getUniversityById)

router.post('/', protect, adminOnly, createUniversity)
router.put('/:id', protect, adminOnly, updateUniversity)
router.delete('/:id', protect, adminOnly, deleteUniversity)

module.exports = router


