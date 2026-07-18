// ============================================================
// routes/authRoutes.js  –  Maps URLs to controller functions
// ============================================================
// Routes are like a phonebook: "when this URL is called, run this function"
// The actual LOGIC lives in the controller, not here.

const express = require('express');
const router  = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect }                 = require('../middleware/authMiddleware');

// Public routes (no token needed)
router.post('/register', register);
router.post('/login',    login);

// Protected route (token required)
// protect runs first. If valid → getMe runs. If invalid → 401 returned.
router.get('/me', protect, getMe);

module.exports = router;

// ROUTE SUMMARY:
//   POST /api/auth/register  → register()  [public]
//   POST /api/auth/login     → login()     [public]
//   GET  /api/auth/me        → getMe()     [protected, needs JWT]
