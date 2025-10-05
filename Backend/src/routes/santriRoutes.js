// src/routes/santriRoutes.js

const express = require('express');
const { authenticateToken } = require('../middleware/auth'); // Middleware untuk login
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

// Semua route di bawah ini memerlukan autentikasi
router.use(authenticateToken);

// Hanya Admin yang bisa CRUD Santri
router.route('/')
  .get(authorizeRole(ROLE.ADMIN, ROLE.USTADZ), getAllSantri) // Admin & Ustadz lihat semua
  .post(authorizeRole(ROLE.ADMIN), createSantri); // Admin tambah

// Admin, Ustadz, & Wali Santri bisa lihat detail santri
// Validasi akses Wali Santri dilakukan di controller getSantriById
router.route('/:id')
  .get(getSantriById) // Bisa diakses oleh semua role yang terotentikasi, validasi lanjutan di controller
  .put(authorizeRole(ROLE.ADMIN), updateSantri) // Admin ubah
  .delete(authorizeRole(ROLE.ADMIN), deleteSantri); // Admin hapus

module.exports = router;