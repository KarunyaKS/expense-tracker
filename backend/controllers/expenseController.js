// ============================================================
// controllers/expenseController.js  –  CRUD for expenses
// ============================================================
// KEY CHANGE from JWT session:
//   Every query now filters by { user: req.user._id }
//   This means each user ONLY sees their OWN expenses.
//   req.user is set by the protect middleware from the JWT.

const Expense = require('../models/Expense');

// GET /api/expenses  →  fetch only THIS user's expenses
const getExpenses = async (req, res) => {
  try {
    // CHANGED: added { user: req.user._id } filter
    // Expense.find() without a filter returns ALL expenses from all users
    // With the filter, MongoDB only returns documents where user field matches
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// POST /api/expenses  →  create a new expense for THIS user
const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: 'Title and amount are required' });
    }

    const expense = await Expense.create({
      title,
      amount,
      category: category || 'Other',
      date: date || Date.now(),
      description: description || '',
      user: req.user._id,   // links this expense to the logged-in user
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding expense' });
  }
};

// PUT /api/expenses/:id  →  update, but ONLY if it belongs to this user
const updateExpense = async (req, res) => {
  try {
    // First find the expense and check ownership
    // findByIdAndUpdate without ownership check is a security hole —
    // a user could edit another user's expense by guessing the ID
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,   // ownership check
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }

    // Now update it
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

// DELETE /api/expenses/:id  →  delete, but ONLY if it belongs to this user
const deleteExpense = async (req, res) => {
  try {
    // findOneAndDelete with ownership check — same security reason as above
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,   // ownership check
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }

    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
