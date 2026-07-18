// ============================================================
// server.js  –  Main entry point for our Express backend
// ============================================================
// What this file does:
//  1. Loads environment variables from .env
//  2. Creates an Express app
//  3. Connects to MongoDB
//  4. Registers all routes
//  5. Starts the server on a port

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load .env variables FIRST before anything else uses them
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────
// cors()  → lets our React app (port 3000) talk to this server (port 5000)
//           without the browser blocking the request
// express.json() → parses incoming JSON body so we can read req.body
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────
// Any request starting with /api/auth goes to authRoutes
// Any request starting with /api/expenses goes to expenseRoutes
const authRoutes    = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/auth',    authRoutes);
app.use('/api/expenses', expenseRoutes);

// ── MongoDB Connection ────────────────────────────────────
// mongoose.connect() returns a Promise, so we use .then/.catch
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Only start server AFTER DB connects successfully
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // stop the app if DB fails
  });
