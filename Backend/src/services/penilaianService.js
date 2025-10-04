// src/services/penilaianService.js

const { prisma } = require('../app');
const { MAPEL_TYPE, STATUS_KEHADIRAN } = require('../utils/constants');

// --- Fungsi-fungsi Perhitungan ---
const hitungNilaiTahfidz = (ayatSetor, target, tajwid) => {
  // Komponen capaian: min(100, (setor/target) * 100)
  const capaianPersen = Math.min(100, (ayatSetor / target) * 100);
  // Gabungan: 50% capaian + 50% tajwid
  const nilaiTahfidz = 0.5 * capaianPersen + 0.5 * tajwid;
  return Math.round(nilaiTahfidz);
};

const hitungNilaiMapel = (formatif, sumatif) => {
  // Gabungan: 40% formatif + 60% sumatif
  const nilaiMapel = 0.4 * formatif + 0.6 * sumatif;
  return Math.round(nilaiMapel);
};

const hitungNilaiAkhlak = (disiplin, adab, kebersihan, kerjasama) => {
  // Rata-rata indikator (1-4)
  const avg = (disiplin + adab + kebersihan + kerjasama) / 4;
  // Konversi ke skala 0-100
  const nilaiAkhlak = (avg / 4) * 100;
  return Math.round(nilaiAkhlak);
};

const hitungNilaiKehadiran = (kehadiranData) => {
  // kehadiranData adalah array dari record kehadiran
  const total = kehadiranData.length;
  if (total === 0) return 0; // Jika tidak ada data, nilai kehadiran 0

  const hadir = kehadiranData.filter(k => k.status === STATUS_KEHADIRAN.HADIR).length;
  const sakit = kehadiranData.filter(k => k.status === STATUS_KEHADIRAN.SAKIT).length;
  const izin = kehadiranData.filter(k => k.status === STATUS_KEHADIRAN.IZIN).length;
  const alpha = kehadiranData.filter(k => k.status === STATUS_KEHADIRAN.ALPHA).length;

  const persentaseHadir = (hadir / (hadir + sakit + izin + alpha)) * 100;
  return Math.round(persentaseHadir);
};

const hitungNilaiAkhir = (nilaiTahfidz, nilaiFiqh, nilaiBahasaArab, nilaiAkhlak, nilaiKehadiran, bobot) => {
  // Gunakan bobot yang diberikan, atau default jika tidak ada
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

// --- Fungsi Utama untuk Mengambil dan Menghitung Rapor ---
const getRaporSantri = async (santriId) => {
  // Ambil konfigurasi bobot terbaru (atau default)
  let bobotKonfigurasi = await prisma.bobotKonfigurasi.findFirst({
    orderBy: { updatedAt: 'desc' }, // Ambil yang terbaru
  });
  if (!bobotKonfigurasi) {
    // Jika tidak ada konfigurasi di DB, gunakan default
    bobotKonfigurasi = { tahfidz: 0.30, fiqh: 0.20, bahasaArab: 0.20, akhlak: 0.20, kehadiran: 0.10 };
  }

  // Ambil data penilaian terbaru untuk santri
  const penilaianTahfidz = await prisma.penilaianTahfidz.findFirst({
    where: { santriId },
    orderBy: { minggu: 'desc' }, // Ambil yang terbaru
  });

  const penilaianFiqh = await prisma.penilaianMapel.findFirst({
    where: { santriId, mapel: MAPEL_TYPE.FIQH },
    orderBy: { createdAt: 'desc' },
  });

  const penilaianBahasaArab = await prisma.penilaianMapel.findFirst({
    where: { santriId, mapel: MAPEL_TYPE.BAHASA_ARAB },
    orderBy: { createdAt: 'desc' },
  });

  const penilaianAkhlak = await prisma.penilaianAkhlak.findFirst({
    where: { santriId },
    orderBy: { createdAt: 'desc' },
  });

  const kehadiranData = await prisma.kehadiran.findMany({
    where: { santriId },
  });

  // Hitung nilai masing-masing aspek
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
    penilaianTahfidz,
    penilaianFiqh,
    penilaianBahasaArab,
    penilaianAkhlak,
    kehadiranData,
  };
};

module.exports = {
  getRaporSantri,
  // Fungsi-fungsi perhitungan bisa diekspor jika digunakan di tempat lain
  hitungNilaiTahfidz,
  hitungNilaiMapel,
  hitungNilaiAkhlak,
  hitungNilaiKehadiran,
  hitungNilaiAkhir,
  tentukanPredikat,
};