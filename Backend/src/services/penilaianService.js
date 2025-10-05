// src/services/penilaianService.js

// Import instance singleton prisma
const prisma = require('../config/prisma');

// --- Fungsi Perhitungan (sudah ada) ---
// (Kita biarkan fungsi-fungsi perhitungan yang lama di sini, bisa digunakan nanti di endpoint perhitungan akhir)
const hitungNilaiTahfidz = (ayatSetor, target, tajwid) => {
  const capaianPersen = Math.min(100, (ayatSetor / target) * 100);
  const nilaiTahfidz = 0.5 * capaianPersen + 0.5 * tajwid;
  return Math.round(nilaiTahfidz);
};

const hitungNilaiMapel = (formatif, sumatif) => {
  const nilaiMapel = 0.4 * formatif + 0.6 * sumatif;
  return Math.round(nilaiMapel);
};

const hitungNilaiAkhlak = (disiplin, adab, kebersihan, kerjasama) => {
  const avg = (disiplin + adab + kebersihan + kerjasama) / 4;
  const nilaiAkhlak = (avg / 4) * 100;
  return Math.round(nilaiAkhlak);
};

const hitungNilaiKehadiran = (kehadiranData) => {
  const total = kehadiranData.length;
  if (total === 0) return 0;

  const hadir = kehadiranData.filter(k => k.status === 'H').length; // Gunakan STATUS_KEHADIRAN dari constants jika sudah diimpor
  const sakit = kehadiranData.filter(k => k.status === 'S').length;
  const izin = kehadiranData.filter(k => k.status === 'I').length;
  const alpha = kehadiranData.filter(k => k.status === 'A').length;

  const persentaseHadir = (hadir / (hadir + sakit + izin + alpha)) * 100;
  return Math.round(persentaseHadir);
};

const hitungNilaiAkhir = (nilaiTahfidz, nilaiFiqh, nilaiBahasaArab, nilaiAkhlak, nilaiKehadiran, bobot) => {
  const b = {
    tahfidz: bobot?.tahfidz || 0.30,
    fiqh: bobot?.fiqh || 0.20,
    bahasaArab: bobot?.bahasaArab || 0.20,
    akhlak: bobot?.akhlak || 0.20,
    kehadiran: bobot?.kehadiran || 0.10,
  };

  const nilaiAkhir = (
    b.tahfidz * nilaiTahfidz +
    b.fiqh * nilaiFiqh +
    b.bahasaArab * nilaiBahasaArab +
    b.akhlak * nilaiAkhlak +
    b.kehadiran * nilaiKehadiran
  );
  return Math.round(nilaiAkhir);
};

const tentukanPredikat = (nilaiAkhir) => {
  if (nilaiAkhir >= 85) return 'A';
  if (nilaiAkhir >= 75) return 'B';
  if (nilaiAkhir >= 65) return 'C';
  return 'D';
};
// --- Akhir Fungsi Perhitungan ---

// --- Fungsi Input Penilaian ---
const createPenilaianTahfidz = async (data) => {
  // Validasi data bisa ditambahkan di sini atau di controller
  // Contoh validasi: ayatSetor <= target * 1.2 (toleransi 20%?)
  // Pastikan data.diinputOlehId adalah ID User (Ustadz) yang valid dan aktif
  return await prisma.penilaianTahfidz.create({
    data,
  });
};

const createPenilaianMapel = async (data) => {
  // Validasi data bisa ditambahkan di sini atau di controller
  // Pastikan data.diinputOlehId adalah ID User (Ustadz) yang valid dan aktif
  return await prisma.penilaianMapel.create({
    data,
  });
};

const createPenilaianAkhlak = async (data) => {
  // Validasi data bisa ditambahkan di sini atau di controller
  // Pastikan data.diinputOlehId adalah ID User (Ustadz) yang valid dan aktif
  return await prisma.penilaianAkhlak.create({
    data,
  });
};

const createKehadiran = async (data) => {
  // Validasi data bisa ditambahkan di sini atau di controller
  // Pastikan data.diinputOlehId adalah ID User (Ustadz) yang valid dan aktif
  return await prisma.kehadiran.create({
    data,
  });
};

// --- Fungsi Ambil Data Penilaian ---
// Fungsi untuk mengambil data penilaian santri (bisa digunakan untuk Rapor atau Input Ulang)
const getPenilaianTahfidzBySantri = async (santriId) => {
  return await prisma.penilaianTahfidz.findMany({
    where: { santriId },
    orderBy: { minggu: 'desc' }, // Urutkan dari yang terbaru
  });
};

const getPenilaianMapelBySantri = async (santriId) => {
  return await prisma.penilaianMapel.findMany({
    where: { santriId },
    orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
  });
};

const getPenilaianAkhlakBySantri = async (santriId) => {
  return await prisma.penilaianAkhlak.findMany({
    where: { santriId },
    orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
  });
};

const getKehadiranBySantri = async (santriId) => {
  return await prisma.kehadiran.findMany({
    where: { santriId },
    orderBy: { tanggal: 'desc' }, // Urutkan dari yang terbaru
  });
};

// Fungsi untuk mengambil data penilaian santri berdasarkan ID penilaian (bisa digunakan untuk detail atau edit)
const getPenilaianTahfidzById = async (id) => {
  return await prisma.penilaianTahfidz.findUnique({
    where: { id },
  });
};

const getPenilaianMapelById = async (id) => {
  return await prisma.penilaianMapel.findUnique({
    where: { id },
  });
};

const getPenilaianAkhlakById = async (id) => {
  return await prisma.penilaianAkhlak.findUnique({
    where: { id },
  });
};

const getKehadiranById = async (id) => {
  return await prisma.kehadiran.findUnique({
    where: { id },
  });
};


// --- Fungsi Ambil Rapor (sudah ada, bisa diperbaiki untuk menggunakan fungsi ambil data di atas jika diperlukan) ---
const getRaporSantri = async (santriId) => {
  // Ambil konfigurasi bobot terbaru (atau default)
  let bobotKonfigurasi = await prisma.bobotKonfigurasi.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
  if (!bobotKonfigurasi) {
    bobotKonfigurasi = { tahfidz: 0.30, fiqh: 0.20, bahasaArab: 0.20, akhlak: 0.20, kehadiran: 0.10 };
  }

  // Ambil data penilaian terbaru untuk santri menggunakan fungsi yang sudah ada
  const penilaianTahfidzAll = await getPenilaianTahfidzBySantri(santriId);
  const penilaianMapelAll = await getPenilaianMapelBySantri(santriId);
  const penilaianAkhlakAll = await getPenilaianAkhlakBySantri(santriId);
  const kehadiranData = await getKehadiranBySantri(santriId);

  // Ambil penilaian terbaru untuk perhitungan akhir
  // Ambil penilaian Tahfidz terbaru berdasarkan minggu
  const penilaianTahfidz = penilaianTahfidzAll.reduce((latest, current) => (current.minggu > latest.minggu ? current : latest), penilaianTahfidzAll[0] || null);
  // Ambil penilaian Fiqh terbaru
  const penilaianFiqh = penilaianMapelAll
    .filter(p => p.mapel === 'Fiqh') // Filter untuk mapel Fiqh
    .reduce((latest, current) => (current.createdAt > latest.createdAt ? current : latest), penilaianMapelAll.filter(p => p.mapel === 'Fiqh')[0] || null); // Ambil yang terbaru
  // Ambil penilaian Bahasa Arab terbaru
  const penilaianBahasaArab = penilaianMapelAll
    .filter(p => p.mapel === 'BahasaArab') // Filter untuk mapel Bahasa Arab
    .reduce((latest, current) => (current.createdAt > latest.createdAt ? current : latest), penilaianMapelAll.filter(p => p.mapel === 'BahasaArab')[0] || null); // Ambil yang terbaru
  // Ambil penilaian Akhlak terbaru
  const penilaianAkhlak = penilaianAkhlakAll.reduce((latest, current) => (current.createdAt > latest.createdAt ? current : latest), penilaianAkhlakAll[0] || null);

  // Hitung nilai masing-masing aspek menggunakan fungsi-fungsi perhitungan yang sudah ada
  let nilaiTahfidz = 0;
  if (penilaianTahfidz) {
    nilaiTahfidz = hitungNilaiTahfidz(penilaianTahfidz.ayatSetor, penilaianTahfidz.target, penilaianTahfidz.tajwid);
  }

  let nilaiFiqh = 0;
  if (penilaianFiqh) {
    nilaiFiqh = hitungNilaiMapel(penilaianFiqh.formatif, penilaianFiqh.sumatif);
  }

  let nilaiBahasaArab = 0;
  if (penilaianBahasaArab) {
    nilaiBahasaArab = hitungNilaiMapel(penilaianBahasaArab.formatif, penilaianBahasaArab.sumatif);
  }

  let nilaiAkhlak = 0;
  if (penilaianAkhlak) {
    nilaiAkhlak = hitungNilaiAkhlak(
      penilaianAkhlak.disiplin,
      penilaianAkhlak.adab,
      penilaianAkhlak.kebersihan,
      penilaianAkhlak.kerjasama
    );
  }

  const nilaiKehadiran = hitungNilaiKehadiran(kehadiranData);

  // Hitung nilai akhir dan predikat
  const nilaiAkhir = hitungNilaiAkhir(
    nilaiTahfidz,
    nilaiFiqh,
    nilaiBahasaArab,
    nilaiAkhlak,
    nilaiKehadiran,
    bobotKonfigurasi
  );
  const predikat = tentukanPredikat(nilaiAkhir);

  // Kembalikan objek rapor
  return {
    santriId,
    nilaiTahfidz,
    nilaiFiqh,
    nilaiBahasaArab,
    nilaiAkhlak,
    nilaiKehadiran,
    nilaiAkhir,
    predikat,
    bobot: bobotKonfigurasi,
    // Termasuk data mentah jika diperlukan untuk detail
    penilaianTahfidz, // Penilaian terbaru
    penilaianFiqh,    // Penilaian terbaru
    penilaianBahasaArab, // Penilaian terbaru
    penilaianAkhlak,  // Penilaian terbaru
    kehadiranData,    // Semua data kehadiran
    // Atau kembalikan semua data penilaian
    penilaianTahfidzAll,
    penilaianMapelAll,
    penilaianAkhlakAll,
  };
};

module.exports = {
  // Fungsi-fungsi perhitungan
  hitungNilaiTahfidz,
  hitungNilaiMapel,
  hitungNilaiAkhlak,
  hitungNilaiKehadiran,
  hitungNilaiAkhir,
  tentukanPredikat,
  // Fungsi-fungsi input
  createPenilaianTahfidz,
  createPenilaianMapel,
  createPenilaianAkhlak,
  createKehadiran,
  // Fungsi-fungsi ambil data
  getPenilaianTahfidzBySantri,
  getPenilaianMapelBySantri,
  getPenilaianAkhlakBySantri,
  getKehadiranBySantri,
   // Fungsi baru untuk ambil satu record
  getPenilaianTahfidzById,
  getPenilaianMapelById,
  getPenilaianAkhlakById,
  getKehadiranById,
  // Fungsi rapor
  getRaporSantri,
};
