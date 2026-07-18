// ============================================================
// controllers/authController.js  –  Register & Login logic
// ============================================================
// Controllers handle the BUSINESS LOGIC.
// They receive (req, res), do the work, and send back a response.

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate JWT ──────────────────────────────────
// We pull this out into a separate function to avoid repeating it
// in both register and login.
//
// jwt.sign(payload, secret, options) creates a signed token.
//   payload = data we want to store IN the token (just the user's id here)
//   secret  = our private key (from .env), used to sign the token
//   expiresIn = how long the token is valid ("30d" = 30 days)
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },               // payload
    process.env.JWT_SECRET,       // secret key
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ── Register ──────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Basic validation — make sure all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // 2. Check if email is already taken
    //    User.findOne() queries MongoDB for ONE document matching the filter
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 3. Create the user in the database
    //    The pre-save hook in User.js will automatically hash the password
    const user = await User.create({ name, email, password });

    // 4. Generate a JWT for the newly created user
    const token = generateToken(user._id);

    // 5. Send back the token + user info (NOT the password)
    res.status(201).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── Login ─────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Find user by email
    //    We use .select('+password') because we set select:false on the password
    //    field in the schema. We need it here to compare passwords.
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
      // NOTE: We say "Invalid credentials" not "Email not found"
      //       This is a security best practice — don't reveal which field is wrong
    }

    // 3. Compare the entered password with the hashed password in DB
    //    user.matchPassword() is our custom method defined in User.js
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Generate a token for the logged-in user
    const token = generateToken(user._id);

    // 5. Send back the token + user info
    res.status(200).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── Get Current User (Me) ─────────────────────────────────
// GET /api/auth/me
// This is a PROTECTED route — requires a valid JWT
// The protect middleware sets req.user before this runs
const getMe = async (req, res) => {
  // req.user is set by our authMiddleware
  res.status(200).json({
    user: {
      id:    req.user._id,
      name:  req.user.name,
      email: req.user.email,
    },
  });
};

module.exports = { register, login, getMe };
