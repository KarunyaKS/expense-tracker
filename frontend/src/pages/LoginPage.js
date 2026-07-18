// ============================================================
// pages/LoginPage.js  –  Login form
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login }  = useAuth();

  // Controlled form state — each field in the form is tracked here
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Generic change handler — works for ALL form fields
  // Uses the input's "name" attribute to know which field to update
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // The ...formData (spread) keeps existing fields,
    // [e.target.name] dynamically sets the right key
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   // prevent browser from refreshing the page
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // If login succeeds, navigate to the dashboard
      navigate('/');
    } catch (err) {
      // The error message comes from our backend's res.json({ message: '...' })
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {/* Error message */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"          // ← this is what handleChange reads
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

// Simple inline styles — in a real project you'd use CSS files or styled-components
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { margin: '0 0 4px', fontSize: '24px', color: '#1a1a2e' },
  subtitle: { margin: '0 0 24px', color: '#666', fontSize: '14px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#333' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  error: { background: '#ffe0e0', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  switchText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 500 },
};

export default LoginPage;
