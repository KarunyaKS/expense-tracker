// ============================================================
// middleware/authMiddleware.js  –  JWT verification middleware
// ============================================================
// WHAT IS MIDDLEWARE?
// Middleware is a function that runs BETWEEN the request arriving
// and the controller handling it.
//
// Flow:  Request → [authMiddleware] → Controller → Response
//
// If the token is valid, we attach user info to req.user and call next()
// If the token is invalid/missing, we stop the request immediately with 401

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Step 1: Check if the Authorization header exists and starts with "Bearer"
  // The header looks like: "Authorization: Bearer eyJhbGci..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Step 2: Extract just the token part (remove the "Bearer " prefix)
      // "Bearer eyJhbGci..." → split by space → ["Bearer", "eyJhbGci..."] → [1]
      token = req.headers.authorization.split(' ')[1];

      // Step 3: Verify the token using our secret key
      // jwt.verify() does two things:
      //   a) Checks the signature (was this token made with our secret?)
      //   b) Checks the expiry (is this token still valid?)
      // It THROWS an error if verification fails
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // decoded = { id: "64abc...", iat: 1234567890, exp: 1234599999 }
      //   iat = "issued at" timestamp
      //   exp = "expiry" timestamp

      // Step 4: Fetch the user from DB using the id stored in the token
      // We use .select('-password') to exclude the password from the result
      req.user = await User.findById(decoded.id).select('-password');

      // Step 5: Pass control to the next function (the controller)
      next();
    } catch (error) {
      // Token was tampered with, expired, or invalid
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token found in headers at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
