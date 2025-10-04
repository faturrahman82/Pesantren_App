// src/config/database.js (Opsional, jika Anda menggunakannya)

const { PrismaClient } = require('@prisma/client'); // Import dari default

const prisma = new PrismaClient();

module.exports = prisma;