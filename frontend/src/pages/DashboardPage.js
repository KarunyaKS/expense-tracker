// ============================================================
// pages/DashboardPage.js  –  Full CRUD dashboard
// ============================================================
// This page handles everything:
//   1. Fetch and display all expenses for the logged-in user
//   2. Add a new expense (form at the top)
//   3. Edit an existing expense (inline modal)
//   4. Delete an expense
//
// STATE MAP:
//   expenses      = array of expense objects from the DB
//   formData      = controlled inputs for the add/edit form
//   editingId     = the _id of the expense being edited (null = add mode)
//   showForm      = boolean, toggles the add form visibility
//   loading/error = UI feedback

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

// Categories list — reused in the form dropdown
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Other'];

// Empty form template — used to reset the form
const EMPTY_FORM = { title: '', amount: '', category: 'Other', date: '', description: '' };

const DashboardPage = () => {
  const [expenses,   setExpenses]   = useState([]);
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [editingId,  setEditingId]  = useState(null);   // null = we are ADDING
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [formError,  setFormError]  = useState('');

  // ── Fetch expenses on mount ─────────────────────────────
  // useEffect with [] runs once when the component first renders
  // axios already has the Authorization header set from AuthContext login
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError('Failed to load expenses. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle form input changes ───────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Add OR Edit submit ──────────────────────────────────
  // We use the same form for both add and edit.
  // editingId tells us which mode we're in.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.amount) {
      return setFormError('Title and amount are required.');
    }

    try {
      if (editingId) {
        // EDIT MODE: PUT request with the expense id in the URL
        // Flow: axios.put → /api/expenses/:id → protect middleware → updateExpense controller
        const res = await axios.put(`/api/expenses/${editingId}`, formData);

        // Update the expense in our local state without re-fetching from DB
        // map() returns a new array — replaces the old object with the updated one
        setExpenses(expenses.map(exp => exp._id === editingId ? res.data : exp));
      } else {
        // ADD MODE: POST request
        // Flow: axios.post → /api/expenses → protect middleware → addExpense controller
        const res = await axios.post('/api/expenses', formData);

        // Prepend new expense to top of the list (matches sort: -1 on backend)
        setExpenses([res.data, ...expenses]);
      }

      // Reset form after success
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  // ── Delete ──────────────────────────────────────────────
  // Flow: axios.delete → /api/expenses/:id → protect → deleteExpense controller
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      // Remove from local state — filter returns everything EXCEPT the deleted one
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      alert('Failed to delete expense.');
    }
  };

  // ── Start editing ───────────────────────────────────────
  // Populate the form with the existing expense data
  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setFormData({
      title:       expense.title,
      amount:      expense.amount,
      category:    expense.category,
      // Format date to YYYY-MM-DD for the <input type="date"> field
      date:        expense.date ? expense.date.substring(0, 10) : '',
      description: expense.description || '',
    });
    setShowForm(true);
    // Scroll to top so user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  // ── Derived values ──────────────────────────────────────
  // Calculate total from the expenses array — no extra API call needed
  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Format date for display in the expense card
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // Category colors for the badge
  const categoryColor = {
    Food: '#ff6b6b', Transport: '#4ecdc4', Shopping: '#45b7d1',
    Entertainment: '#f9ca24', Health: '#6c5ce7', Bills: '#fd79a8',
    Education: '#00b894', Other: '#b2bec3'
  };

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* ── Summary Card ── */}
        <div style={s.summaryRow}>
          <div style={s.summaryCard}>
            <div style={s.summaryLabel}>Total Spent</div>
            <div style={s.summaryAmount}>₹{total.toFixed(2)}</div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryLabel}>Expenses</div>
            <div style={s.summaryAmount}>{expenses.length}</div>
          </div>
          <button
            style={s.addBtn}
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm && !editingId ? '✕ Cancel' : '+ Add Expense'}
          </button>
        </div>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={s.formCard}>
            <h3 style={s.formTitle}>{editingId ? '✏️ Edit Expense' : '➕ New Expense'}</h3>
            {formError && <div style={s.formError}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>
                {/* Title */}
                <div style={s.field}>
                  <label style={s.label}>Title *</label>
                  <input
                    style={s.input} name="title" value={formData.title}
                    onChange={handleChange} placeholder="e.g. Lunch at canteen" required
                  />
                </div>

                {/* Amount */}
                <div style={s.field}>
                  <label style={s.label}>Amount (₹) *</label>
                  <input
                    style={s.input} name="amount" type="number" value={formData.amount}
                    onChange={handleChange} placeholder="e.g. 150" min="0" required
                  />
                </div>

                {/* Category */}
                <div style={s.field}>
                  <label style={s.label}>Category</label>
                  <select style={s.input} name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Date */}
                <div style={s.field}>
                  <label style={s.label}>Date</label>
                  <input
                    style={s.input} name="date" type="date" value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Description — full width */}
              <div style={{ ...s.field, marginTop: 4 }}>
                <label style={s.label}>Description (optional)</label>
                <input
                  style={s.input} name="description" value={formData.description}
                  onChange={handleChange} placeholder="Any notes..."
                />
              </div>

              <div style={s.formActions}>
                <button type="submit" style={s.submitBtn}>
                  {editingId ? 'Update Expense' : 'Save Expense'}
                </button>
                <button type="button" style={s.cancelBtn} onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Expense List ── */}
        <h2 style={s.sectionTitle}>Your Expenses</h2>

        {loading && <p style={{ color: '#888' }}>Loading...</p>}
        {error   && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && expenses.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
            <p style={{ fontWeight: 500 }}>No expenses yet!</p>
            <p style={{ color: '#888', fontSize: 14 }}>Click "Add Expense" to get started.</p>
          </div>
        )}

        <div style={s.list}>
          {expenses.map((exp) => (
            <div key={exp._id} style={s.card}>
              {/* Left side: category dot + title + date */}
              <div style={s.cardLeft}>
                <div
                  style={{
                    ...s.dot,
                    background: categoryColor[exp.category] || '#b2bec3'
                  }}
                />
                <div>
                  <div style={s.expTitle}>{exp.title}</div>
                  <div style={s.expMeta}>
                    <span style={{
                      ...s.catBadge,
                      background: (categoryColor[exp.category] || '#b2bec3') + '22',
                      color: categoryColor[exp.category] || '#888'
                    }}>
                      {exp.category}
                    </span>
                    {exp.date && (
                      <span style={s.dateText}>{formatDate(exp.date)}</span>
                    )}
                  </div>
                  {exp.description && (
                    <div style={s.descText}>{exp.description}</div>
                  )}
                </div>
              </div>

              {/* Right side: amount + action buttons */}
              <div style={s.cardRight}>
                <div style={s.amount}>₹{Number(exp.amount).toFixed(2)}</div>
                <div style={s.actions}>
                  <button style={s.editBtn} onClick={() => handleEdit(exp)}>Edit</button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(exp._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

// ── Styles ──────────────────────────────────────────────────
const s = {
  page:          { maxWidth: 860, margin: '32px auto', padding: '0 20px' },
  summaryRow:    { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' },
  summaryCard:   { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '16px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  summaryLabel:  { fontSize: 12, color: '#888', marginBottom: 4 },
  summaryAmount: { fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  addBtn:        { marginLeft: 'auto', padding: '12px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500 },

  formCard:   { background: '#fff', border: '1px solid #e0e0ff', borderRadius: 14, padding: 28, marginBottom: 28, boxShadow: '0 2px 12px rgba(108,99,255,0.08)' },
  formTitle:  { fontSize: 17, fontWeight: 600, marginBottom: 16, color: '#1a1a2e' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field:      { display: 'flex', flexDirection: 'column' },
  label:      { fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 5 },
  input:      { padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fafafa' },
  formActions: { display: 'flex', gap: 12, marginTop: 20 },
  submitBtn:  { padding: '10px 24px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  cancelBtn:  { padding: '10px 20px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  formError:  { background: '#ffe0e0', color: '#c0392b', padding: '9px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 },

  sectionTitle: { fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 },
  empty:       { textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: 14, border: '1px dashed #ddd' },

  list:    { display: 'flex', flexDirection: 'column', gap: 12 },
  card:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' },
  cardLeft:  { display: 'flex', alignItems: 'flex-start', gap: 14 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  dot:       { width: 12, height: 12, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  expTitle:  { fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 5 },
  expMeta:   { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  catBadge:  { fontSize: 11, padding: '2px 9px', borderRadius: 10, fontWeight: 500 },
  dateText:  { fontSize: 12, color: '#aaa' },
  descText:  { fontSize: 12, color: '#999', marginTop: 4 },
  amount:    { fontSize: 18, fontWeight: 700, color: '#e74c3c' },
  actions:   { display: 'flex', gap: 8 },
  editBtn:   { padding: '5px 14px', background: '#f0f0ff', color: '#6c63ff', border: '1px solid #d0c8ff', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  deleteBtn: { padding: '5px 14px', background: '#fff0f0', color: '#e74c3c', border: '1px solid #ffc8c8', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};

export default DashboardPage;
