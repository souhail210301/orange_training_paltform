const Catalogue = require('../models/Catalogue')

const createCatalogue = async (req, res) => {
  try {
    const {
      coverImage,
      title,
      trainers,
      objectives,
      program,
      prerequisites,
      language,
      level,
      type,
      technologies
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const catalogue = await Catalogue.create({
      coverImage,
      title,
      trainers,
      objectives,
      program,
      prerequisites,
      language,
      level,
      type,
      technologies
    });
    return res.status(201).json(catalogue);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create catalogue', error: error.message });
  }
}

const getCatalogues = async (_req, res) => {
  try {
    const list = await Catalogue.find()
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch catalogues' })
  }
}

const getCatalogueById = async (req, res) => {
  try {
    const item = await Catalogue.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Catalogue not found' })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch catalogue' })
  }
}

const updateCatalogue = async (req, res) => {
  try {
    const updated = await Catalogue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Catalogue not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update catalogue' })
  }
}

const deleteCatalogue = async (req, res) => {
  try {
    const deleted = await Catalogue.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Catalogue not found' })
    return res.json({ message: 'Catalogue deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete catalogue' })
  }
}

module.exports = {
  createCatalogue,
  getCatalogues,
  getCatalogueById,
  updateCatalogue,
  deleteCatalogue
}


