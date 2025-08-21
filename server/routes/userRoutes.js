const express = require('express');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserByRole,
  deleteUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getEmailByResetToken,
  getUserStats
} = require('../controllers/userController');
// Public stats endpoint for dashboard

const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password-email/:token', getEmailByResetToken); // New route to get email by token
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getCurrentUser);
router.put('/change-password', protect, changePassword); // New route for changing password
router.put('/:id', protect, updateUser);
router.get('/stats', getUserStats);

// Admin-only routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/role/:role', protect, adminOnly, getUserByRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
