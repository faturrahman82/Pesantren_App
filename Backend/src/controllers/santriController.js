// src/controllers/santriController.js

const santriService = require('../services/santriService');

/**
 * @swagger
 * tags:
 *   name: Santri
 *   description: Santri Management
 */

/**
 * @swagger
 * /api/santri:
 *   get:
 *     summary: Get all santri (Admin & Ustadz only)
 *     tags: [Santri]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all santri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Santri'
 *       401:
 *         description: Unauthorized (no token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 */

/**
 * @swagger
 * /api/santri:
 *   post:
 *     summary: Create a new santri (Admin only)
 *     tags: [Santri]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SantriInput'
 *     responses:
 *       201:
 *         description: Santri created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Santri'
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin)
 */

/**
 * @swagger
 * /api/santri/{id}:
 *   get:
 *     summary: Get a santri by ID (Admin, Ustadz, WaliSantri)
 *     tags: [Santri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: Santri details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Santri'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (WaliSantri accessing other santri)
 *       404:
 *         description: Santri not found
 */

/**
 * @swagger
 * /api/santri/{id}:
 *   put:
 *     summary: Update a santri by ID (Admin only)
 *     tags: [Santri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SantriInput'
 *     responses:
 *       200:
 *         description: Santri updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Santri'
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin)
 *       404:
 *         description: Santri not found
 */

/**
 * @swagger
 * /api/santri/{id}:
 *   delete:
 *     summary: Delete a santri by ID (Admin only)
 *     tags: [Santri]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Santri ID
 *     responses:
 *       200:
 *         description: Santri deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not Admin)
 *       404:
 *         description: Santri not found
 */


const getAllSantri = async (req, res) => {
  try {
    const santri = await santriService.getAllSantri();
    res.status(200).json(santri);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSantriById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'WaliSantri' && req.user.santriId !== id) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own child\'s data' });
    }

    const santri = await santriService.getSantriById(id);
    if (!santri) {
      return res.status(404).json({ error: 'Santri not found' });
    }
    res.status(200).json(santri);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSantri = async (req, res) => {
  try {
    const data = req.body;
    if (!data.nis || !data.nama) {
      return res.status(400).json({ error: 'NIS and nama are required' });
    }

    const newSantri = await santriService.createSantri(data);
    res.status(201).json(newSantri);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateSantri = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.nis === '') {
      return res.status(400).json({ error: 'NIS cannot be empty' });
    }

    const updatedSantri = await santriService.updateSantri(id, data);
    if (!updatedSantri) {
      return res.status(404).json({ error: 'Santri not found' });
    }
    res.status(200).json(updatedSantri);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSantri = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSantri = await santriService.deleteSantri(id);
    if (!deletedSantri) {
      return res.status(404).json({ error: 'Santri not found' });
    }
    res.status(200).json({ message: 'Santri deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  getAllSantri,
  getSantriById,
  createSantri,
  updateSantri,
  deleteSantri,
};

// Definisikan skema untuk digunakan di komentar Swagger
// components:
/**
 * @swagger
 * components:
 *   schemas:
 *     Santri:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the santri
 *         nis:
 *           type: string
 *           description: Nomor Induk Santri
 *         nama:
 *           type: string
 *           description: Full name of the santri
 *         kamar:
 *           type: string
 *           description: Room number in the dormitory
 *         angkatan:
 *           type: integer
 *           description: Batch/year of entry
 *         user:
 *           type: object
 *           description: Associated Wali Santri user (if any)
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *     SantriInput:
 *       type: object
 *       properties:
 *         nis:
 *           type: string
 *           example: "2025-004"
 *         nama:
 *           type: string
 *           example: "David Eka"
 *         kamar:
 *           type: string
 *           example: "D1"
 *         angkatan:
 *           type: integer
 *           example: 2025
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */