// ============================================================
// pages/RegisterPage.js  –  Registration form
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation — check before sending to the server
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      // On success, go to the dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account 🚀</h2>
        <p style={styles.subtitle}>Start tracking your expenses today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="John Doe" style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@example.com" style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="At least 6 characters" style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} placeholder="Repeat your password" style={styles.input} required />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
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

export default RegisterPage;
