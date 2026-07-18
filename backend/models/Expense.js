// ============================================================
// models/Expense.js  –  Mongoose schema for an expense
// ============================================================
// NOTE: This is your EXISTING model. The only addition is the
//       `user` field — so each expense belongs to a specific user.
//       (We'll USE this field in the next feature: User-specific expenses)
//       For now, it's here so the model is complete.

const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },

    category: {
      type: String,
      default: 'Other',
    },

    date: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
      default: '',
    },

    // NEW FIELD — links each expense to its owner
    // We'll use this in the next feature session
    user: {
      type: mongoose.Schema.Types.ObjectId, // stores a MongoDB ID
      ref: 'User',                           // references the User model
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
