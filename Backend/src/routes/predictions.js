const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const SectorRisk = require('../models/SectorRisk');
const logger = require('../utils/logger');

// GET /api/predictions/trend - Predict incident volume for next 7 days
router.get('/trend', async (req, res, next) => {
  try {
    // Get daily counts for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const stats = await Incident.getDailyStats(30);
    
    if (stats.length < 5) {
      return res.json({
        success: true,
        data: [],
        message: 'Not enough historical data for prediction'
      });
    }

    // Simple Linear Regression for prediction
    const x = stats.map((_, i) => i);
    const y = stats.map(s => s.count);
    
    const { slope, intercept } = linearRegression(x, y);

    // Predict next 7 days
    const predictions = [];
    const lastDate = new Date(stats[stats.length - 1].date);
    
    for (let i = 1; i <= 7; i++) {
      const predDate = new Date(lastDate);
      predDate.setDate(predDate.getDate() + i);
      
      const predictedCount = Math.max(0, Math.round(slope * (stats.length + i - 1) + intercept));
      
      predictions.append({
        date: predDate.toISOString().split('T')[0],
        predictedCount,
        confidence: 0.7 // Placeholder confidence score
      });
    }

    res.json({
      success: true,
      data: predictions,
      model: 'Linear Regression',
      trend: slope > 0 ? 'increasing' : 'decreasing'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/predictions/sector-risk - Predict risk levels for sectors
router.get('/sector-risk', async (req, res, next) => {
  try {
    const sectors = [
      'Banking & Finance',
      'Healthcare',
      'Government',
      'Technology',
      'Critical Infrastructure',
      'E-commerce'
    ];

    const predictions = await Promise.all(sectors.map(async (sector) => {
      const history = await SectorRisk.find({ sector })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      if (history.length < 3) {
        return { sector, predictedScore: 10, trend: 'stable' };
      }

      const scores = history.map(h => h.score).reverse();
      const lastScore = scores[scores.length - 1];
      const avgChange = (scores[scores.length - 1] - scores[0]) / (scores.length - 1);
      
      return {
        sector,
        predictedScore: Math.min(100, Math.max(0, Math.round(lastScore + avgChange))),
        trend: avgChange > 1 ? 'up' : (avgChange < -1 ? 'down' : 'stable')
      };
    }));

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    next(error);
  }
});

// Helper for linear regression
function linearRegression(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

module.exports = router;
