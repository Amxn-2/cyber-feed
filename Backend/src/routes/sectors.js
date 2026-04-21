const express = require('express');
const router = express.Router();
const SectorRisk = require('../models/SectorRisk');
const logger = require('../utils/logger');
const riskScoringService = require('../services/riskScoringService');

// GET /api/sectors/risk - Get current risk scores for all sectors
router.get('/risk', async (req, res, next) => {
  try {
    const sectors = [
      'Banking & Finance',
      'Healthcare',
      'Government',
      'Technology',
      'Critical Infrastructure',
      'E-commerce'
    ];

    const currentRisks = await Promise.all(
      sectors.map(async (sector) => {
        const latest = await SectorRisk.findOne({ sector }).sort({ date: -1 }).lean();
        return latest || { sector, score: 10, incident_count: 0, date: new Date() };
      })
    );

    res.json({
      success: true,
      data: currentRisks
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/sectors/risk/history - Get historical risk scores for trend charts
router.get('/risk/history', async (req, res, next) => {
  try {
    const { days = 30, sector } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      date: { $gte: startDate }
    };

    if (sector) {
      query.sector = sector;
    }

    const history = await SectorRisk.find(query)
      .sort({ date: 1 })
      .lean();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sectors/recalculate - Trigger manual risk score recalculation
router.post('/recalculate', async (req, res, next) => {
  try {
    await riskScoringService.calculateDailyScores();
    res.json({
      success: true,
      message: 'Risk scores recalculated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
