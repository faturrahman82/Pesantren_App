// src/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Ganti baris ini:
// const { PrismaClient } = require('@prisma/client');

// Impor instance singleton
// const { prisma } = require('../app'); // <-- Hapus atau komentari baris ini
const prisma = require('./config/prisma'); // <-- Tambahkan baris ini

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const santriRoutes = require('./routes/santriRoutes');
const penilaianRoutes = require('./routes/penilaianRoutes');
const configRoutes = require('./routes/configRoutes');


const app = express();
// Gunakan instance singleton di sini juga
// const prisma = new PrismaClient(); // Hapus baris ini

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route root sederhana
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the e-Penilaian Santri API!', status: 'OK' });
});

// --- Tambahkan middleware Swagger UI ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/santri', santriRoutes);
app.use('/api/penilaian', penilaianRoutes);
app.use('/api/config', configRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("DEBUG: Global error handler hit for path:", req.path);
  console.error("DEBUG: Error message:", err.message);
  console.error("DEBUG: Error stack:", err.stack);
  if (err.message && (err.message.includes('user') || err.message.includes('santri'))) {
    console.error("DEBUG: Error seems related to 'user' or 'santri' property access.");
    res.status(500).json({ error: 'Internal server error related to user/santri access.' });
  } else {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, 'localhost', (err) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  // Gunakan instance singleton
  await prisma.$disconnect();
  process.exit(0);
});

// Ekspor app saja, prisma menggunakan singleton
module.exports = { app /*, prisma */ }; // Jangan ekspor prisma dari sini lagi