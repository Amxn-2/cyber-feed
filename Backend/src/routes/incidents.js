// src/routes/incidents.js
const express = require('express');
const Incident = require('../models/Incident');
// Data collection now handled by Python microservice
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/incidents - Get all incidents with filters
router.get('/', async (req, res, next) => {
  try {
    const incidents = await Incident.findAll(req.query);
    res.json({
      success: true,
      data: incidents,
      count: incidents.length
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/incidents/collect - Manual data collection (redirected to Python microservice)
router.post('/collect', async (req, res, next) => {
  try {
    logger.info('Manual data collection triggered - redirecting to Python microservice');
    res.json({
      success: true,
      message: 'Data collection now handled by Python microservice. Use /api/collection/trigger endpoint.',
      redirect: '/api/collection/trigger'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
