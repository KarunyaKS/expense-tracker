// ============================================================
// context/AuthContext.js  –  Global auth state management
// ============================================================
// WHAT IS REACT CONTEXT?
// Context lets you share data across the entire component tree
// WITHOUT passing props through every level ("prop drilling").
//
// Think of it like a global state store specifically for auth.
// Any component can read the user info or call login/logout
// without needing those props passed down from a parent.

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Step 1: Create the context object
// This is just an empty container right now
const AuthContext = createContext();

// Step 2: Create the Provider component
// This wraps our entire app and makes auth state available everywhere
export const AuthProvider = ({ children }) => {

  // user  = the logged-in user object { id, name, email }  OR  null
  // token = the JWT string  OR  null
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);  // true while we check localStorage

  // ── On App Load: Check localStorage ─────────────────────
  // When the app first loads, check if we have a saved token.
  // This keeps the user "logged in" across page refreshes.
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Set the token in axios headers so all future requests are authenticated
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }

    setLoading(false);  // we're done checking
  }, []);

  // ── Login ──────────────────────────────────────────────
  // Called from the LoginPage component after form submission
  const login = async (email, password) => {
    // POST to our backend login endpoint
    const response = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;

    // Save to state
    setToken(newToken);
    setUser(newUser);

    // Save to localStorage so data persists on page refresh
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Set default axios header for all future requests
    // This means we don't have to manually add the token to every API call
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // ── Register ───────────────────────────────────────────
  const register = async (name, email, password) => {
    const response = await axios.post('/api/auth/register', { name, email, password });
    const { token: newToken, user: newUser } = response.data;

    setToken(newToken);
    setUser(newUser);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // ── Logout ─────────────────────────────────────────────
  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Remove the axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Step 3: Provide the value to all children
  // Any component can now call useAuth() to access these values
  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 4: Custom hook for easy consumption
// Instead of: const { user } = useContext(AuthContext);
// We can write: const { user } = useAuth();
export const useAuth = () => {
  return useContext(AuthContext);
};
