const Category = require('../models/Category')

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body)
    return res.status(201).json(category)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category' })
  }
}

const getCategories = async (_req, res) => {
  try {
    const list = await Category.find().populate('catalogue')
    return res.json(list)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories' })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const item = await Category.findById(req.params.id).populate('catalogue')
    if (!item) return res.status(404).json({ message: 'Category not found' })
    return res.json(item)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category' })
  }
}

const updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Category not found' })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category' })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Category not found' })
    return res.json({ message: 'Category deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category' })
  }
}

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
}


