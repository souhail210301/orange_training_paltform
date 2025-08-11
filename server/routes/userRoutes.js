const express = require('express');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserByRole,
  deleteUser
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);

// Admin-only routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/role/:role', protect, adminOnly, getUserByRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
