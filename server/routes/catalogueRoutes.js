const express = require('express')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  createCatalogue,
  getCatalogues,
  getCatalogueById,
  updateCatalogue,
  deleteCatalogue
} = require('../controllers/catalogueController')

const router = express.Router()

router.get('/', getCatalogues)
router.get('/:id', getCatalogueById)

// Allow admins, university reps to create/update/delete catalogues; mentors view only
router.post('/', protect, createCatalogue)
router.put('/:id', protect, updateCatalogue) // Ensure proper controller function used
router.delete('/:id', protect, deleteCatalogue)

module.exports = router


