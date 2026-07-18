// ============================================================
// models/User.js  –  Mongoose schema for a user
// ============================================================
// This defines what a "user" document looks like in MongoDB.
// It also hashes the password automatically before saving.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,        // removes extra spaces like "  John  " → "John"
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,      // no two users can have the same email
      lowercase: true,   // always store as lowercase
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      // select: false means this field WON'T be included when we query users
      // e.g. User.find() will NOT return the password field by default
      select: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// ── Pre-save Hook ─────────────────────────────────────────
// This function runs automatically BEFORE every .save() call
// It hashes the password so we NEVER store plain-text passwords
//
// Why check isModified('password')?
// If a user updates their name, we don't want to re-hash the already-hashed password!
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // skip hashing if password hasn't changed
  }
  // bcrypt.genSalt(10) → creates a "salt" (random string) with 10 rounds of complexity
  // More rounds = more secure but slower. 10 is a good balance.
  const salt = await bcrypt.genSalt(10);
  // bcrypt.hash() combines the plain password + salt → hashed password
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method ───────────────────────────────────────
// We attach a custom method to every user document.
// Usage: const isMatch = await user.matchPassword('plainTextPassword')
// bcrypt.compare() hashes the input and compares with the stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
// ↑ Creates a collection called "users" in MongoDB (Mongoose lowercases + pluralizes)
