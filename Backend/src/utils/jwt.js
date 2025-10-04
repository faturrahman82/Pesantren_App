// src/utils/jwt.js

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  console.log("DEBUG: JWT generateToken called for userId:", userId); // Log tambahan
  // Fungsi ini hanya menerima userId, tidak ada req.user
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

module.exports = { generateToken };