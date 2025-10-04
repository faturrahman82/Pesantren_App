// src/services/santriService.js

const { prisma } = require('../app');

const getAllSantri = async () => {
  return await prisma.santri.findMany({
    include: {
      user: true, // Sertakan data user (wali santri) jika ada
    },
  });
};

const getSantriById = async (id) => {
  return await prisma.santri.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

const createSantri = async (data) => {
  return await prisma.santri.create({
    data,
  });
};

const updateSantri = async (id, data) => {
  return await prisma.santri.update({
    where: { id },
    data,
  });
};

const deleteSantri = async (id) => {
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