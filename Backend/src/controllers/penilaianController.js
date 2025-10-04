// src/controllers/penilaianController.js

const penilaianService = require('../services/penilaianService');

const getRaporSantri = async (req, res) => {
  try {
    const { santriId } = req.params;
    // Validasi apakah santriId adalah milik user yang login (jika role Wali Santri)
    // Ini akan ditangani oleh middleware auth dan role guard nanti di route.

    const rapor = await penilaianService.getRaporSantri(santriId);
    if (!rapor) {
      // Ini seharusnya tidak terjadi jika santriId valid dan ditemukan,
      // kecuali jika tidak ada data penilaian sama sekali.
      // Tapi, kita tetap cek.
      return res.status(404).json({ error: 'Rapor data not found for this santri' });
    }
    res.status(200).json(rapor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Contoh endpoint untuk input penilaian (misalnya Tahfidz)
// Anda bisa buat endpoint serupa untuk Mapel, Akhlak, Kehadiran
const createPenilaianTahfidz = async (req, res) => {
  try {
    const data = req.body;
    // Validasi data input (santriId, minggu, surah, ayatSetor, target, tajwid)
    // Contoh validasi sederhana:
    if (!data.santriId || !data.minggu || !data.surah || typeof data.ayatSetor !== 'number' || typeof data.target !== 'number' || typeof data.tajwid !== 'number') {
      return res.status(400).json({ error: 'Invalid data provided for Tahfidz assessment' });
    }
    // Validasi rentang nilai (0-100 untuk tajwid, positif untuk ayat/target)
    if (data.tajwid < 0 || data.tajwid > 100 || data.ayatSetor < 0 || data.target <= 0) {
        return res.status(400).json({ error: 'Tajwid must be 0-100, ayatSetor >= 0, target > 0' });
    }

    // Tambahkan ID user yang login sebagai diinputOlehId
    data.diinputOlehId = req.user.id; // Dari middleware auth

    const newPenilaian = await prisma.penilaianTahfidz.create({
      data,
    });
    res.status(201).json(newPenilaian);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Endpoint lainnya (createPenilaianMapel, createPenilaianAkhlak, createKehadiran) akan dibuat serupa.

module.exports = {
  getRaporSantri,
  createPenilaianTahfidz, // dan fungsi lainnya
  // getRaporSantri adalah endpoint utama yang menggabungkan perhitungan
};