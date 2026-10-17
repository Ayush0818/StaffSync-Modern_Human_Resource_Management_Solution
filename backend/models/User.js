// ============================================================
// models/User.js - User Authentication Model
// ============================================================
// Core authentication identity for every person accessing StaffSync
// (HR administrators, Managers, Employees). Houses credentials,
// system role, account status, and reference to profile documents.
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Full legal/display name of the user
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  // Unique email address used as the primary login credential
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },

  // Encrypted password hash (hidden by default on queries with select: false)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never return password in queries by default for security
  },

  // Role-based Access Control (RBAC) identifier:
  // - employee: Can view personal attendance, submit leaves, see announcements
  // - manager: Can review team leaves, track team attendance, view staff
  // - hr: Full organizational administration, attendance/payroll management
  role: {
    type: String,
    enum: ['employee', 'manager', 'hr'],
    default: 'employee'
  },

  // Dynamic reference linking this user to their specific profile document
  // (Points to either Employee or Manager collection based on profileModel)
  profileRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'profileModel'
  },

  // Model name corresponding to profileRef ('Employee' or 'Manager')
  profileModel: {
    type: String,
    enum: ['Employee', 'Manager']
  },

  // Account activation switch (false disables login without deleting records)
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// ============================================================
// PRE-SAVE HOOK: Secure Password Hashing
// Hashes password with bcryptjs salt (12 rounds) if modified
// ============================================================
userSchema.pre('save', async function (next) {
  // Only hash if password was modified or freshly created
  if (!this.isModified('password')) return next();

  // Salt rounds = 12 provides high cryptographic security
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================================
// INSTANCE METHOD: matchPassword
// Compares an entered plain text password with the bcrypt hash in the DB
// ============================================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
