// src/services/configService.js

const { prisma } = require('../app');

const getBobot = async () => {
  // Ambil konfigurasi bobot terbaru
  const config = await prisma.bobotKonfigurasi.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  if (config) {
    return {
      tahfidz: config.tahfidz,
      fiqh: config.fiqh,
      bahasaArab: config.bahasaArab,
      akhlak: config.akhlak,
      kehadiran: config.kehadiran,
    };
  } else {
    // Jika tidak ada di database, kembalikan default
    return {
      tahfidz: 0.30,
      fiqh: 0.20,
      bahasaArab: 0.20,
      akhlak: 0.20,
      kehadiran: 0.10,
    };
  }
};

const updateBobot = async (data) => {
  const { tahfidz, fiqh, bahasaArab, akhlak, kehadiran } = data;
  // Validasi sederhana (opsional, bisa juga dilakukan di controller)
  if (typeof tahfidz !== 'number' || typeof fiqh !== 'number' || typeof bahasaArab !== 'number' || typeof akhlak !== 'number' || typeof kehadiran !== 'number') {
    throw new Error('Bobot harus berupa angka');
  }
  if (Math.abs((tahfidz + fiqh + bahasaArab + akhlak + kehadiran) - 1.0) > 0.001) { // Toleransi kecil untuk floating point
    throw new Error('Total bobot harus 1.0 (100%)');
  }

  // Update atau buat record konfigurasi baru
  let updatedConfig;
  try {
    // Coba update dulu
    updatedConfig = await prisma.bobotKonfigurasi.update({
      where: { id: 'latest' }, // Misalnya selalu update record dengan id 'latest'
      data: { tahfidz, fiqh, bahasaArab, akhlak, kehadiran },
    });
  } catch (updateError) {
    if (updateError.code === 'P2025') { // Record not found error code
      // Jika tidak ditemukan, buat baru
      updatedConfig = await prisma.bobotKonfigurasi.create({
        data: { tahfidz, fiqh, bahasaArab, akhlak, kehadiran },
      });
    } else {
      throw updateError; // Jika error lain, lempar
    }
  }

  return updatedConfig;
};


module.exports = {
  getBobot,
  updateBobot,
};