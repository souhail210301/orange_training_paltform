const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  createFormation,
  getFormations,
  getFormationById,
  updateFormation,
  deleteFormation
} = require('../controllers/formationController')

const router = express.Router()

router.get('/', getFormations)
router.get('/:id', getFormationById)

router.post('/', protect, adminOnly, createFormation)
router.put('/:id', protect, adminOnly, updateFormation)
router.delete('/:id', protect, adminOnly, deleteFormation)

module.exports = router


