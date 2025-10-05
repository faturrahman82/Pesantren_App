// src/routes/penilaianRoutes.js

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleGuard');
const { ROLE } = require('../utils/constants');
const {
  createPenilaianTahfidz,
  createPenilaianMapel,
  createPenilaianAkhlak,
  createKehadiran,
  getRaporSantri,
  getPenilaianTahfidzById,
  getPenilaianTahfidzBySantri,
  getPenilaianMapelById,
  getPenilaianMapelBySantri,
  getPenilaianAkhlakById,
  getPenilaianAkhlakBySantri,
  getKehadiranById,
  getKehadiranBySantri,
} = require('../controllers/penilaianController');

const router = express.Router();

// Semua route di bawah ini memerlukan autentikasi
router.use(authenticateToken);

// Endpoint untuk input penilaian (hanya Ustadz/Admin)
router.post('/tahfidz', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createPenilaianTahfidz);
router.post('/mapel', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createPenilaianMapel);
router.post('/akhlak', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createPenilaianAkhlak);
router.post('/kehadiran', authorizeRole(ROLE.USTADZ, ROLE.ADMIN), createKehadiran);

// Endpoint untuk mendapatkan rapor (bisa diakses oleh Admin, Ustadz, atau Wali Santri terkait)
// Validasi akses Wali Santri terhadap santriId bisa ditambahkan di controller getRaporSantri
router.get('/tahfidz/:id', getPenilaianTahfidzById); // Contoh: hanya Admin/Ustadz bisa edit, jadi akses detail mungkin perlu role guard
router.get('/tahfidz/santri/:santriId', getPenilaianTahfidzBySantri); // Lihat semua penilaian tahfidz untuk satu santri

router.get('/mapel/:id', getPenilaianMapelById);
router.get('/mapel/santri/:santriId', getPenilaianMapelBySantri);

router.get('/akhlak/:id', getPenilaianAkhlakById);
router.get('/akhlak/santri/:santriId', getPenilaianAkhlakBySantri);

router.get('/kehadiran/:id', getKehadiranById);
router.get('/kehadiran/santri/:santriId', getKehadiranBySantri);

// Endpoint untuk mendapatkan rapor (bisa diakses oleh Admin, Ustadz, atau Wali Santri terkait)
router.get('/rapor/:santriId', getRaporSantri); // Middleware authorizeRole bisa ditambahkan jika perlu, tapi validasi spesifik Wali terhadap santriId lebih tepat di controller

module.exports = router;