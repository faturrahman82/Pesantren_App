// src/controllers/santriController.js

const santriService = require('../services/santriService');

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
    // Validasi input bisa ditambahkan di sini atau di service
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