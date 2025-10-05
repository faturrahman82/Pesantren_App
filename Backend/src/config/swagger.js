// src/config/swagger.js

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'e-Penilaian Santri API',
      version: '1.0.0',
      description: 'API untuk aplikasi e-Penilaian Santri',
    },
    // Server tempat API dihost
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`, // Gunakan port dari env atau default 3000
        description: 'Development server',
      },
      // Tambahkan server production nanti jika di-deploy
      // {
      //   url: 'https://api.yourapp.com',
      //   description: 'Production server',
      // },
    ],
  },
  // Lokasi file yang berisi komentar dokumentasi
  // Kita akan tambahkan komentar di controller dan routes
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Sesuaikan path jika struktur folder berbeda
};

const specs = swaggerJsdoc(options);

module.exports = specs;