// src/config/prisma.js

const { PrismaClient } = require('@prisma/client');

// Gunakan singleton pattern untuk menghindari pembuatan instance ganda di dev mode
// Jika global.prismaClient tidak ada, buat baru
if (!global.prismaClient) {
  global.prismaClient = new PrismaClient();
}

// Simpan instance ke global agar tidak dibuat ulang di mode dev (nodemon restart)
const prisma = global.prismaClient;

module.exports = prisma;