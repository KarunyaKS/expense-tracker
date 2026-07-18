// ============================================================
// components/Navbar.js  –  Top navigation bar
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // clears auth state and localStorage
    navigate('/login'); // redirect to login page
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>💰 Expense Tracker</div>

      {user && (
        <div style={styles.right}>
          <span style={styles.greeting}>Hi, {user.name} 👋</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: '#6c63ff', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  brand: { fontSize: '18px', fontWeight: 700 },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  greeting: { fontSize: '14px' },
  logoutBtn: { padding: '6px 14px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
};

export default Navbar;
