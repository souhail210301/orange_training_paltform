const express = require('express')
const { protect, allowRoles } = require('../middleware/authMiddleware')
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
// Create / modify only by admin or university representative
router.post('/', protect, allowRoles('admin','university_representative'), createCatalogue)
router.put('/:id', protect, allowRoles('admin','university_representative'), updateCatalogue)
router.delete('/:id', protect, allowRoles('admin','university_representative'), deleteCatalogue)

module.exports = router


