// src/controllers/penilaianController.js

const penilaianService = require('../services/penilaianService');
const { MAPEL_TYPE, STATUS_KEHADIRAN } = require('../utils/constants'); // Impor enum untuk validasi

// --- Fungsi-fungsi Controller untuk Input Penilaian ---

const createPenilaianTahfidz = async (req, res) => {
  try {
    const data = req.body;
    // Validasi input (contoh sederhana)
    if (!data.santriId || !data.minggu || !data.surah || typeof data.ayatSetor !== 'number' || typeof data.target !== 'number' || typeof data.tajwid !== 'number') {
      return res.status(400).json({ error: 'Invalid data provided for Tahfidz assessment' });
    }
    if (data.tajwid < 0 || data.tajwid > 100 || data.ayatSetor < 0 || data.target <= 0) {
        return res.status(400).json({ error: 'Tajwid must be 0-100, ayatSetor >= 0, target > 0' });
    }

    // Tambahkan ID user yang login sebagai diinputOlehId
    data.diinputOlehId = req.user.id; // Dari middleware auth

    const newPenilaian = await penilaianService.createPenilaianTahfidz(data);
    res.status(201).json(newPenilaian);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createPenilaianMapel = async (req, res) => {
  try {
    const data = req.body;
    // Validasi input (contoh sederhana)
    if (!data.santriId || !data.mapel || typeof data.formatif !== 'number' || typeof data.sumatif !== 'number') {
      return res.status(400).json({ error: 'Invalid data provided for Mapel assessment' });
    }
    if (data.formatif < 0 || data.formatif > 100 || data.sumatif < 0 || data.sumatif > 100) {
        return res.status(400).json({ error: 'Formatif and Sumatif must be 0-100' });
    }
    // Validasi mapel type
    if (!Object.values(MAPEL_TYPE).includes(data.mapel)) {
        return res.status(400).json({ error: 'Mapel must be Fiqh or BahasaArab' });
    }

    // Tambahkan ID user yang login sebagai diinputOlehId
    data.diinputOlehId = req.user.id; // Dari middleware auth

    const newPenilaian = await penilaianService.createPenilaianMapel(data);
    res.status(201).json(newPenilaian);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createPenilaianAkhlak = async (req, res) => {
  try {
    const data = req.body;
    // Validasi input (contoh sederhana)
    if (!data.santriId || typeof data.disiplin !== 'number' || typeof data.adab !== 'number' || typeof data.kebersihan !== 'number' || typeof data.kerjasama !== 'number') {
      return res.status(400).json({ error: 'Invalid data provided for Akhlak assessment' });
    }
    if (data.disiplin < 1 || data.disiplin > 4 || data.adab < 1 || data.adab > 4 || data.kebersihan < 1 || data.kebersihan > 4 || data.kerjasama < 1 || data.kerjasama > 4) {
        return res.status(400).json({ error: 'Akhlak indicators must be 1-4' });
    }

    // Tambahkan ID user yang login sebagai diinputOlehId
    data.diinputOlehId = req.user.id; // Dari middleware auth

    const newPenilaian = await penilaianService.createPenilaianAkhlak(data);
    res.status(201).json(newPenilaian);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createKehadiran = async (req, res) => {
  try {
    const data = req.body;
    // Validasi input (contoh sederhana)
    if (!data.santriId || !data.tanggal || !data.status) {
      return res.status(400).json({ error: 'Invalid data provided for Kehadiran' });
    }
    // Validasi status kehadiran
    if (!Object.values(STATUS_KEHADIRAN).includes(data.status)) {
        return res.status(400).json({ error: 'Status must be H, S, I, or A' });
    }

    // Tambahkan ID user yang login sebagai diinputOlehId
    data.diinputOlehId = req.user.id; // Dari middleware auth

    const newKehadiran = await penilaianService.createKehadiran(data);
    res.status(201).json(newKehadiran);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller untuk mengambil rapor (sudah kita buat sebelumnya di service)
// src/controllers/penilaianController.js

const getRaporSantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    const user = req.user; // Dari middleware authenticateToken (sudah pasti login)

    console.log("DEBUG: User role:", user.role, "User santriId:", user.santriId, "Requested santriId:", santriId); // Debug log

    // --- Validasi Akses Wali Santri ---
    if (user.role === 'WaliSantri' && user.santriId !== santriId) {
      console.log("DEBUG: Access denied for WaliSantri - santriId mismatch"); // Debug log
      return res.status(403).json({ error: 'Forbidden: You can only access your own child\'s report' });
    }
    // --- Akhir Validasi Akses Wali Santri ---

    // Jika bukan Wali Santri, atau adalah Wali Santri dan ID cocok, lanjutkan
    // Panggil service untuk menghitung rapor
    const rapor = await penilaianService.getRaporSantri(santriId);

    // Jika service mengembalikan null atau undefined (karena santriId tidak ditemukan di DB)
    // Kita tetap perlu menangani ini, tapi setelah validasi akses
    if (!rapor) {
      // Ini seharusnya jarang terjadi jika santriId valid, karena getRaporSantri di service
      // sekarang menghitung berdasarkan data yang diambil, dan jika tidak ada data, nilai default 0 digunakan.
      // Tapi jika santriId *sangat* tidak valid (tidak ada di tabel Santri), Prisma mungkin tidak error,
      // melainkan hanya mengembalikan array kosong di semua fungsi get...BySantri.
      // Kita bisa mengecek apakah santri itu sendiri ada:
      const { prisma } = require('../config/prisma'); // Import singleton
      const existingSantri = await prisma.santri.findUnique({
        where: { id: santriId }
      });

      if (!existingSantri) {
          return res.status(404).json({ error: 'Santri not found' });
      }

      // Jika santri ada, tapi tidak ada data penilaian, maka rapor tetap dihitung (dengan nilai 0)
      // dan fungsi getRaporSantri seharusnya mengembalikan objek dengan nilai 0.
      // Jika rapor null di sini, mungkin ada bug lain di service.
    }

    console.log("DEBUG: Rapor calculated successfully for santriId:", santriId); // Debug log
    res.status(200).json(rapor); // Kembalikan rapor (bisa berisi nilai 0 jika tidak ada data penilaian)
  } catch (error) {
    console.error("DEBUG: Error in getRaporSantri controller:", error.message); // Debug log
    res.status(500).json({ error: error.message });
  }
};

// --- Fungsi-fungsi Controller untuk Ambil Satu atau Banyak Penilaian ---
const getPenilaianTahfidzById = async (req, res) => {
  try {
    const { id } = req.params;
    // (Opsional) Validasi apakah user yang login adalah yang menginput atau Admin
    const penilaian = await penilaianService.getPenilaianTahfidzById(id);
    if (!penilaian) {
      return res.status(404).json({ error: 'Penilaian Tahfidz not found' });
    }
    res.status(200).json(penilaian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPenilaianTahfidzBySantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    const user = req.user; // Dari middleware authenticateToken

    // Jika user adalah Wali Santri, pastikan dia hanya mengakses data anaknya sendiri
    if (user.role === 'WaliSantri' && user.santriId !== santriId) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own child\'s data' });
    }

    const penilaianList = await penilaianService.getPenilaianTahfidzBySantri(santriId);
    res.status(200).json(penilaianList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ulangi pola untuk Mapel, Akhlak, Kehadiran
const getPenilaianMapelById = async (req, res) => {
  try {
    const { id } = req.params;
    const penilaian = await penilaianService.getPenilaianMapelById(id);
    if (!penilaian) {
      return res.status(404).json({ error: 'Penilaian Mapel not found' });
    }
    res.status(200).json(penilaian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPenilaianMapelBySantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    const penilaianList = await penilaianService.getPenilaianMapelBySantri(santriId);
    res.status(200).json(penilaianList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPenilaianAkhlakById = async (req, res) => {
  try {
    const { id } = req.params;
    const penilaian = await penilaianService.getPenilaianAkhlakById(id);
    if (!penilaian) {
      return res.status(404).json({ error: 'Penilaian Akhlak not found' });
    }
    res.status(200).json(penilaian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPenilaianAkhlakBySantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    const penilaianList = await penilaianService.getPenilaianAkhlakBySantri(santriId);
    res.status(200).json(penilaianList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getKehadiranById = async (req, res) => {
  try {
    const { id } = req.params;
    const kehadiran = await penilaianService.getKehadiranById(id);
    if (!kehadiran) {
      return res.status(404).json({ error: 'Kehadiran record not found' });
    }
    res.status(200).json(kehadiran);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getKehadiranBySantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    const kehadiranList = await penilaianService.getKehadiranBySantri(santriId);
    res.status(200).json(kehadiranList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// --- Dokumentasi Swagger (sudah Anda miliki) ---
/**
 * @swagger
 * tags:
 *   name: Penilaian
 *   description: Penilaian Santri Management (Tahfidz, Mapel, Akhlak, Kehadiran)
 */

/**
 * @swagger
 * /api/penilaian/tahfidz:
 *   post:
 *     summary: Create a new Tahfidz assessment (Ustadz/Admin only)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               santriId:
 *                 type: string
 *                 example: cmgccnsc10001tj3wuk3bpjwv
 *               minggu:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-10-27T00:00:00.000Z"
 *               surah:
 *                 type: string
 *                 example: "Al-Fatihah"
 *               ayatSetor:
 *                 type: integer
 *                 example: 7
 *               target:
 *                 type: integer
 *                 example: 5
 *               tajwid:
 *                 type: integer
 *                 example: 85
 *     responses:
 *       201:
 *         description: Tahfidz assessment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PenilaianTahfidz'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Ustadz/Admin)
 */

/**
 * @swagger
 * /api/penilaian/mapel:
 *   post:
 *     summary: Create a new Fiqh/Bahasa Arab assessment (Ustadz/Admin only)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               santriId:
 *                 type: string
 *                 example: cmgccnsc10001tj3wuk3bpjwv
 *               mapel:
 *                 type: string
 *                 enum: [Fiqh, BahasaArab]
 *                 example: Fiqh
 *               formatif:
 *                 type: integer
 *                 example: 80
 *               sumatif:
 *                 type: integer
 *                 example: 90
 *     responses:
 *       201:
 *         description: Mapel assessment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PenilaianMapel'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Ustadz/Admin)
 */

/**
 * @swagger
 * /api/penilaian/akhlak:
 *   post:
 *     summary: Create a new Akhlak assessment (Ustadz/Admin only)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               santriId:
 *                 type: string
 *                 example: cmgccnsc10001tj3wuk3bpjwv
 *               disiplin:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 4
 *               adab:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 4
 *               kebersihan:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 3
 *               kerjasama:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 4
 *               catatan:
 *                 type: string
 *                 example: "Sangat aktif dan disiplin."
 *     responses:
 *       201:
 *         description: Akhlak assessment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PenilaianAkhlak'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Ustadz/Admin)
 */

/**
 * @swagger
 * /api/penilaian/kehadiran:
 *   post:
 *     summary: Create a new Kehadiran record (Ustadz/Admin only)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               santriId:
 *                 type: string
 *                 example: cmgccnsc10001tj3wuk3bpjwv
 *               tanggal:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-10-27T00:00:00.000Z"
 *               status:
 *                 type: string
 *                 enum: [H, S, I, A]
 *                 example: H
 *     responses:
 *       201:
 *         description: Kehadiran record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Kehadiran'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Ustadz/Admin)
 */

/**
 * @swagger
 * /api/penilaian/rapor/{santriId}:
 *   get:
 *     summary: Get rapor for a specific santri (Admin, Ustadz, Wali Santri)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: santriId
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: Rapor data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rapor'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Wali Santri accessing other santri)
 *       404:
 *         description: Rapor data not found
 */


// --- Export Fungsi-fungsi ---
module.exports = {
  createPenilaianTahfidz,
  createPenilaianMapel,
  createPenilaianAkhlak,
  createKehadiran,
  getRaporSantri, // Gunakan controller ini di routes
};

// Definisikan skema untuk digunakan di komentar Swagger
// components:
/**
 * @swagger
 * components:
 *   schemas:
 *     PenilaianTahfidz:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         santriId:
 *           type: string
 *         minggu:
 *           type: string
 *           format: date-time
 *         surah:
 *           type: string
 *         ayatSetor:
 *           type: integer
 *         target:
 *           type: integer
 *         tajwid:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         diinputOlehId:
 *           type: string
 *     PenilaianMapel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         santriId:
 *           type: string
 *         mapel:
 *           type: string
 *         formatif:
 *           type: integer
 *         sumatif:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         diinputOlehId:
 *           type: string
 *     PenilaianAkhlak:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         santriId:
 *           type: string
 *         disiplin:
 *           type: integer
 *         adab:
 *           type: integer
 *         kebersihan:
 *           type: integer
 *         kerjasama:
 *           type: integer
 *         catatan:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         diinputOlehId:
 *           type: string
 *     Kehadiran:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         santriId:
 *           type: string
 *         tanggal:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         diinputOlehId:
 *           type: string
 *     Rapor:
 *       type: object
 *       properties:
 *         santriId:
 *           type: string
 *         nilaiTahfidz:
 *           type: integer
 *         nilaiFiqh:
 *           type: integer
 *         nilaiBahasaArab:
 *           type: integer
 *         nilaiAkhlak:
 *           type: integer
 *         nilaiKehadiran:
 *           type: integer
 *         nilaiAkhir:
 *           type: integer
 *         predikat:
 *           type: string
 *         bobot:
 *           type: object
 *           properties:
 *             tahfidz:
 *               type: number
 *             fiqh:
 *               type: number
 *             bahasaArab:
 *               type: number
 *             akhlak:
 *               type: number
 *             kehadiran:
 *               type: number
 *         penilaianTahfidz:
 *           type: object
 *           # ... (properti lainnya jika diperlukan)
 *         # ... (penilaian lainnya)
 */
// --- Dokumentasi Swagger untuk fungsi-fungsi GET baru ---
/**
 * @swagger
 * /api/penilaian/tahfidz/{id}:
 *   get:
 *     summary: Get a specific Tahfidz assessment by ID (Admin/Ustadz)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Penilaian Tahfidz ID
 *     responses:
 *       200:
 *         description: Tahfidz assessment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PenilaianTahfidz'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin/Ustadz - tergantung validasi tambahan)
 *       404:
 *         description: Penilaian Tahfidz not found
 */

/**
 * @swagger
 * /api/penilaian/tahfidz/santri/{santriId}:
 *   get:
 *     summary: Get all Tahfidz assessments for a specific santri (Admin, Ustadz, Wali Santri)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: santriId
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: List of Tahfidz assessments for the santri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PenilaianTahfidz'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Wali Santri accessing other santri - tergantung validasi tambahan)
 *       404:
 *         description: Santri not found or no Tahfidz assessments found
 */

/**
 * @swagger
 * /api/penilaian/mapel/{id}:
 *   get:
 *     summary: Get a specific Fiqh/Bahasa Arab assessment by ID (Admin/Ustadz)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Penilaian Mapel ID
 *     responses:
 *       200:
 *         description: Mapel assessment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PenilaianMapel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin/Ustadz - tergantung validasi tambahan)
 *       404:
 *         description: Penilaian Mapel not found
 */

/**
 * @swagger
 * /api/penilaian/mapel/santri/{santriId}:
 *   get:
 *     summary: Get all Fiqh/Bahasa Arab assessments for a specific santri (Admin, Ustadz, Wali Santri)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: santriId
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: List of Mapel assessments for the santri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PenilaianMapel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Wali Santri accessing other santri - tergantung validasi tambahan)
 *       404:
 *         description: Santri not found or no Mapel assessments found
 */

/**
 * @swagger
 * /api/penilaian/akhlak/{id}:
 *   get:
 *     summary: Get a specific Akhlak assessment by ID (Admin/Ustadz)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Penilaian Akhlak ID
 *     responses:
 *       200:
 *         description: Akhlak assessment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PenilaianAkhlak'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin/Ustadz - tergantung validasi tambahan)
 *       404:
 *         description: Penilaian Akhlak not found
 */

/**
 * @swagger
 * /api/penilaian/akhlak/santri/{santriId}:
 *   get:
 *     summary: Get all Akhlak assessments for a specific santri (Admin, Ustadz, Wali Santri)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: santriId
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: List of Akhlak assessments for the santri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PenilaianAkhlak'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Wali Santri accessing other santri - tergantung validasi tambahan)
 *       404:
 *         description: Santri not found or no Akhlak assessments found
 */

/**
 * @swagger
 * /api/penilaian/kehadiran/{id}:
 *   get:
 *     summary: Get a specific Kehadiran record by ID (Admin/Ustadz)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kehadiran record ID
 *     responses:
 *       200:
 *         description: Kehadiran record details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Kehadiran'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin/Ustadz - tergantung validasi tambahan)
 *       404:
 *         description: Kehadiran record not found
 */

/**
 * @swagger
 * /api/penilaian/kehadiran/santri/{santriId}:
 *   get:
 *     summary: Get all Kehadiran records for a specific santri (Admin, Ustadz, Wali Santri)
 *     tags: [Penilaian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: santriId
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: List of Kehadiran records for the santri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Kehadiran'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Wali Santri accessing other santri - tergantung validasi tambahan)
 *       404:
 *         description: Santri not found or no Kehadiran records found
 */


// --- Export Fungsi-fungsi ---
module.exports = {
  createPenilaianTahfidz,
  createPenilaianMapel,
  createPenilaianAkhlak,
  createKehadiran,
  getRaporSantri, // Sudah ada
  // Fungsi baru untuk Read
  getPenilaianTahfidzById,
  getPenilaianTahfidzBySantri,
  getPenilaianMapelById,
  getPenilaianMapelBySantri,
  getPenilaianAkhlakById,
  getPenilaianAkhlakBySantri,
  getKehadiranById,
  getKehadiranBySantri,
};