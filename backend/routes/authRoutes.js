// ============================================================
// routes/authRoutes.js - Authentication Routes
// ============================================================

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', protect, authorize('hr'), register);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
