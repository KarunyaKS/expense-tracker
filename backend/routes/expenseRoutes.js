// ============================================================
// routes/expenseRoutes.js  –  All expense routes are PROTECTED
// ============================================================
// Every expense route requires a valid JWT.
// The protect middleware verifies the token before any controller runs.

const express = require('express');
const router  = express.Router();

const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');

// All routes below are protected — user must be logged in
router.get('/',       protect, getExpenses);
router.post('/',      protect, addExpense);
router.put('/:id',   protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
