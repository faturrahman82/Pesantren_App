// src/controllers/configController.js

const configService = require('../services/configService');

/**
 * @swagger
 * tags:
 *   name: Config
 *   description: Configuration Management (e.g., Penilaian Bobot)
 */

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Get current penilaian bobot configuration (Admin only)
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current bobot configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tahfidz:
 *                   type: number
 *                   example: 0.3
 *                 fiqh:
 *                   type: number
 *                   example: 0.2
 *                 bahasaArab:
 *                   type: number
 *                   example: 0.2
 *                 akhlak:
 *                   type: number
 *                   example: 0.2
 *                 kehadiran:
 *                   type: number
 *                   example: 0.1
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin)
 */

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Update penilaian bobot configuration (Admin only)
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tahfidz:
 *                 type: number
 *                 example: 0.35
 *               fiqh:
 *                 type: number
 *                 example: 0.15
 *               bahasaArab:
 *                 type: number
 *                 example: 0.2
 *               akhlak:
 *                 type: number
 *                 example: 0.2
 *               kehadiran:
 *                 type: number
 *                 example: 0.1
 *     responses:
 *       200:
 *         description: Bobot configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 tahfidz:
 *                   type: number
 *                 fiqh:
 *                   type: number
 *                 bahasaArab:
 *                   type: number
 *                 akhlak:
 *                   type: number
 *                 kehadiran:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (invalid input or total != 1.0)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin)
 */

const getBobot = async (req, res) => {
  try {
    const bobot = await configService.getBobot();
    res.status(200).json(bobot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBobot = async (req, res) => {
  try {
    const data = req.body;
    const updatedConfig = await configService.updateBobot(data);
    res.status(200).json(updatedConfig);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getBobot,
  updateBobot,
};