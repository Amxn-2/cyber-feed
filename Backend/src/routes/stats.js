// src/routes/stats.js
const express = require('express');
const Incident = require('../models/Incident');

const router = express.Router();

// GET /api/stats - Get statistics
router.get('/', async (req, res, next) => {
  try {
    const stats = await Incident.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
