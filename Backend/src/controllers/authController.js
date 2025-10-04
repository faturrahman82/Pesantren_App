// src/controllers/authController.js

const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("DEBUG: Login controller called with email:", email); // Log tambahan

    // Validasi input sederhana
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    console.error("DEBUG: Login controller error:", error.message); // Log tambahan
    res.status(401).json({ error: error.message }); // 401 untuk login gagal
  }
};

const register = async (req, res) => {
  try {
    const { email, password, role, santriId } = req.body;

    console.log("DEBUG: Register controller called with email:", email, "role:", role); // Log tambahan

    // Validasi input sederhana
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const result = await authService.register(email, password, role, santriId);
    res.status(201).json(result); // 201 untuk created
  } catch (error) {
    console.error("DEBUG: Register controller error:", error.message); // Log tambahan
    res.status(400).json({ error: error.message }); // 400 untuk error umum (termasuk validasi)
  }
};

module.exports = {
  login,
  register,
};
// --- PASTIKAN TIDAK ADA KODE DI SINI YANG MENGAKSES req.user ---