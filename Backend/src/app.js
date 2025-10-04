// src/app.js

require('dotenv').config();

const express = require('express');
// Comment out middleware lain untuk isolasi (kita bisa tambahkan lagi nanti)
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

const { PrismaClient } = require('@prisma/client');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const santriRoutes = require('./routes/santriRoutes'); // Sudah ditambahkan sebelumnya
const penilaianRoutes = require('./routes/penilaianRoutes'); // Sudah ditambahkan sebelumnya
// --- Tambahkan import untuk configRoutes ---
const configRoutes = require('./routes/configRoutes');

const app = express();
const prisma = new PrismaClient();

// Middleware dasar untuk parsing body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Optional: Middleware logging sederhana untuk debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Route root sederhana
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the e-Penilaian Santri API!', status: 'OK' });
});

// --- Hanya gunakan route auth untuk saat ini ---
app.use('/api/auth', authRoutes);

// --- Sudah ditambahkan sebelumnya ---
app.use('/api/santri', santriRoutes);
app.use('/api/penilaian', penilaianRoutes);

// --- Tambahkan route config di sini ---
app.use('/api/config', configRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("DEBUG: Global error handler hit for path:", req.path);
  console.error(err.stack);
  // Coba tangkap error spesifik yang menyebabkan req.user
  if (err.message && err.message.includes('user')) {
    console.error("DEBUG: Error seems related to 'user' property access.");
    // Kembalikan 500 untuk error internal yang tidak terduga
     res.status(500).json({ error: 'Internal server error related to user access.' });
  } else {
    // Kembalikan 500 untuk error lainnya juga
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, 'localhost', (err) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log(`Server is running on http://localhost:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { app, prisma };