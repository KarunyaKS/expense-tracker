// ============================================================
// components/PrivateRoute.js  –  Protects frontend pages
// ============================================================
// WHAT IS A PRIVATE ROUTE?
// Some pages (like the Expenses dashboard) should ONLY be
// accessible to logged-in users.
//
// PrivateRoute checks: "Is the user logged in?"
//   YES → render the protected page normally
//   NO  → redirect to /login automatically
//
// We wrap protected pages with this component in App.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While we're still checking localStorage, show nothing
  // (avoids a flash of the login page before auth is confirmed)
  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  // If user is not logged in, redirect to /login
  // The "replace" prop prevents the user from going "back" to reach this page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in — render the protected page
  return children;
};

export default PrivateRoute;
