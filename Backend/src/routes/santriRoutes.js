// src/routes/santriRoutes.js

const express = require('express');
// Import middleware authenticateToken dan authorizeRole
const { authenticateToken } = require('../middleware/auth'); // Sesuaikan path jika berbeda
const { authorizeRole } = require('../middleware/roleGuard'); // Middleware untuk role
const { ROLE } = require('../utils/constants'); // Impor enum role
const {
  getAllSantri,
  getSantriById,
  createSantri,
  updateSantri,
  deleteSantri,
} = require('../controllers/santriController');

const router = express.Router();

// --- Tambahkan middleware authenticateToken di sini ---
// Semua route di bawah ini di file ini akan memerlukan autentikasi
router.use(authenticateToken);

// Hanya Admin yang bisa CRUD Santri
router.route('/')
  .get(authorizeRole(ROLE.ADMIN), getAllSantri) // Admin lihat semua
  .post(authorizeRole(ROLE.ADMIN), createSantri); // Admin tambah

router.route('/:id')
  .get(getSantriById) // Bisa ditambahkan authorizeRole di sini jika hanya Admin/Wali terkait
  .put(authorizeRole(ROLE.ADMIN), updateSantri) // Admin ubah
  .delete(authorizeRole(ROLE.ADMIN), deleteSantri); // Admin hapus

module.exports = router;