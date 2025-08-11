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

router.post('/', protect, adminOnly, createCatalogue)
router.put('/:id', protect, adminOnly, updateCatalogue)
router.delete('/:id', protect, adminOnly, deleteCatalogue)

module.exports = router


