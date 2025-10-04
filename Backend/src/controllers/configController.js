// src/controllers/configController.js

const configService = require('../services/configService');

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