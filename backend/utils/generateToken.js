// ============================================================
// utils/generateToken.js - JWT Token Generator
// ============================================================
// Generates a JSON Web Token signed with secret and expiration.
// Used for authenticating API requests.
// ============================================================

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token containing the user's ID
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

module.exports = generateToken;
