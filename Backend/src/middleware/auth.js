// src/middleware/auth.js

const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  console.log("DEBUG: authenticateToken middleware started for path:", req.path, "and method:", req.method);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log("DEBUG: Authorization header found:", !!authHeader, "Token found:", !!token);

  if (!token) {
    console.log("DEBUG: No token found, returning 401");
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    console.log("DEBUG: Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG: Token verified, decoded user ID:", decoded.userId);

    // --- Perubahan penting di sini ---
    // Ganti baris ini:
    // const { prisma } = require('../app');
    // Dengan impor dari singleton:
    const prisma = require('../config/prisma'); // Impor instance singleton

    // Cari user berdasarkan ID dari token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true } // Jangan kirim password
    });

    console.log("DEBUG: User lookup result:", !!user);

    if (!user) {
      console.log("DEBUG: User not found in DB, returning 401");
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log("DEBUG: Setting req.user and calling next()");
    req.user = user; // Tambahkan user ke req object
    next(); // Panggil next() untuk melanjutkan ke controller
  } catch (error) {
    console.error('Token verification error:', error);
    console.log("DEBUG: Token verification failed, returning 403");
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };