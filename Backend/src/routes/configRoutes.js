// src/routes/configRoutes.js

const express = require('express');
// Import middleware authenticateToken dan authorizeRole
const { authenticateToken } = require('../middleware/auth'); // Sesuaikan path jika berbeda
const { authorizeRole } = require('../middleware/roleGuard'); // Middleware untuk role
const { ROLE } = require('../utils/constants'); // Impor enum role
const { getBobot, updateBobot } = require('../controllers/configController');

const router = express.Router();

// --- Tambahkan middleware authenticateToken di sini ---
// Semua route di bawah ini di file ini akan memerlukan autentikasi
router.use(authenticateToken);

// Hanya Admin yang bisa lihat dan ubah konfigurasi
router.route('/')
  .get(authorizeRole(ROLE.ADMIN), getBobot)
  .put(authorizeRole(ROLE.ADMIN), updateBobot);

module.exports = router;