// src/services/configService.js

// Impor instance Prisma Client singleton secara langsung
const prisma = require("../config/prisma");

const getBobot = async () => {
  console.log("DEBUG: ConfigService getBobot called"); // Log tambahan untuk debugging
  try {
    // Ambil konfigurasi bobot terbaru berdasarkan updatedAt
    const config = await prisma.bobotKonfigurasi.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    console.log("DEBUG: Config found in DB:", !!config); // Log apakah config ditemukan di DB

    if (config) {
      // Jika ditemukan di database, kembalikan nilainya
      return {
        tahfidz: config.tahfidz,
        fiqh: config.fiqh,
        bahasaArab: config.bahasaArab,
        akhlak: config.akhlak,
        kehadiran: config.kehadiran,
      };
    } else {
      // Jika tidak ada di database, kembalikan default
      console.log("DEBUG: No config found in DB, returning defaults"); // Log jika menggunakan default
      return {
        tahfidz: 0.3,
        fiqh: 0.2,
        bahasaArab: 0.2,
        akhlak: 0.2,
        kehadiran: 0.1,
      };
    }
  } catch (error) {
    console.error("DEBUG: Error in ConfigService getBobot:", error.message); // Log error
    console.error(error.stack); // Log stack trace
    // Lempar error agar bisa ditangani di controller
    throw error;
  }
};

const updateBobot = async (data) => {
  console.log("DEBUG: ConfigService updateBobot called with ", data); // Log tambahan
  const { tahfidz, fiqh, bahasaArab, akhlak, kehadiran } = data;

  // Validasi sederhana (opsional, bisa juga di controller)
  if (
    typeof tahfidz !== "number" ||
    typeof fiqh !== "number" ||
    typeof bahasaArab !== "number" ||
    typeof akhlak !== "number" ||
    typeof kehadiran !== "number"
  ) {
    throw new Error("Bobot harus berupa angka");
  }
  if (
    Math.abs(tahfidz + fiqh + bahasaArab + akhlak + kehadiran - 1.0) > 0.001
  ) {
    // Toleransi kecil untuk floating point
    throw new Error("Total bobot harus 1.0 (100%)");
  }

  let updatedConfig;
  try {
    // Ambil konfigurasi terbaru berdasarkan updatedAt untuk di-update
    const latestConfig = await prisma.bobotKonfigurasi.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    console.log("DEBUG: Latest config found for update:", !!latestConfig); // Log

    if (latestConfig) {
      // Jika ada, update record tersebut
      updatedConfig = await prisma.bobotKonfigurasi.update({
        where: { id: latestConfig.id },
        data: { tahfidz, fiqh, bahasaArab, akhlak, kehadiran },
      });
      console.log("DEBUG: Existing config updated with ID:", latestConfig.id); // Log
    } else {
      // Jika tidak ada sama sekali, buat record baru
      updatedConfig = await prisma.bobotKonfigurasi.create({
        data: { tahfidz, fiqh, bahasaArab, akhlak, kehadiran },
      });
      console.log("DEBUG: New config created"); // Log
    }
  } catch (updateError) {
    console.error(
      "DEBUG: Error in ConfigService updateBobot:",
      updateError.message
    ); // Log error
    console.error(updateError.stack); // Log stack trace
    // Lempar error agar bisa ditangani di controller
    throw updateError;
  }

  return updatedConfig;
};

module.exports = {
  getBobot,
  updateBobot,
};
