// src/services/santriService.js

// Ganti baris ini:
// const { prisma } = require('../app');

// Dengan ini:
const prisma = require('../config/prisma'); // Impor instance singleton

const getAllSantri = async () => {
  // Ambil semua santri, sertakan data user (wali santri) jika ada
  return await prisma.santri.findMany({
    include: {
      user: true, // Termasuk data user (wali santri) jika terkait
    },
  });
};

const getSantriById = async (id) => {
  // Ambil satu santri berdasarkan ID, sertakan data user (wali santri) jika ada
  return await prisma.santri.findUnique({
    where: { id },
    include: {
      user: true, // Termasuk data user (wali santri) jika terkait
    },
  });
};

const createSantri = async (data) => {
  console.log("DEBUG: SantriService createSantri called with ", data); // Tambahkan log ini jika belum
  try {
    const result = await prisma.santri.create({
      data,
    });
    console.log("DEBUG: Santri created successfully:", result.id); // Tambahkan log ini jika belum
    return result;
  } catch (error) {
    console.error("DEBUG: Error in SantriService createSantri:", error.message); // Tambahkan log ini jika belum
    console.error("DEBUG: Error stack:", error.stack); // Tambahkan log ini jika belum
    throw error; // Lemparkan kembali error agar bisa ditangkap di controller
  }
};

const updateSantri = async (id, data) => {
  // Update santri berdasarkan ID
  // Validasi bisa ditambahkan di sini atau di controller
  return await prisma.santri.update({
    where: { id },
    data,
  });
};

// Ubah fungsi deleteSantri juga agar menggunakan prisma singleton
const deleteSantri = async (id) => {
  // Hapus santri berdasarkan ID
  // Ini akan menghapus santri dan semua penilaian/kehadiran terkait karena relasi di skema
  // Hapus user terkait (jika ada) sebelum menghapus santri
  const santri = await prisma.santri.findUnique({
    where: { id },
    select: { user: true },
  });

  if (santri.user) {
    await prisma.user.delete({
      where: { id: santri.user.id },
    });
  }

  return await prisma.santri.delete({
    where: { id },
  });
};

module.exports = {
  getAllSantri,
  getSantriById,
  createSantri,
  updateSantri,
  deleteSantri,
};