// src/routes/penilaianRoutes.js

const express = require('express');
// Import middleware authenticateToken dan authorizeRole
const { authenticateToken } = require('../middleware/auth'); // Sesuaikan path jika berbeda
const { authorizeRole } = require('../middleware/roleGuard'); // Middleware untuk role
const { ROLE } = require('../utils/constants'); // Impor enum role
const {
  getRaporSantri,
  createPenilaianTahfidz, // Contoh fungsi lain
  // Tambahkan fungsi lain seperti createPenilaianMapel, dll.
} = require('../controllers/penilaianController');

const router = express.Router();

// --- Tambahkan middleware authenticateToken di sini ---
// Semua route di bawah ini di file ini akan memerlukan autentikasi
router.use(authenticateToken);

// Endpoint untuk mendapatkan rapor (akan ditambahkan role guard nanti)
// Endpoint ini bisa diakses oleh Admin, Ustadz, atau Wali Santri terkait
// Untuk Wali Santri, kita perlu validasi tambahan di controller atau middleware roleGuard lanjutan
router.get('/rapor/:santriId', getRaporSantri);

// Endpoint untuk input penilaian (hanya Ustadz/Admin)
router.post('/tahfidz', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createPenilaianTahfidz);
// router.post('/mapel', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createPenilaianMapel);
// router.post('/akhlak', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createPenilaianAkhlak);
// router.post('/kehadiran', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createKehadiran);

module.exports = router;