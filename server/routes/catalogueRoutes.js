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

router.post('/', createCatalogue)
router.put('/:id', updateCatalogue)
router.delete('/:id', deleteCatalogue)

module.exports = router


