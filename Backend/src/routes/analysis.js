// src/routes/analysis.js
const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

// Get AI-powered incident analysis
router.get('/incident/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the incident
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Check if Gemini service is available
    if (!geminiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI analysis service not available',
        message: 'Gemini API key not configured'
      });
    }

    // Generate AI analysis
    const analysis = await geminiService.analyzeIncident(incident);
    
    res.json({
      success: true,
      incident: incident,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to analyze incident:', error);
    res.status(500).json({ 
      error: 'Failed to analyze incident',
      message: error.message 
    });
  }
});

// Get AI-powered threat summary
router.get('/threat-summary', async (req, res) => {
  try {
    const { days = 7, limit = 50 } = req.query;
    
    // Get recent incidents from India
    const incidents = await Incident.findAll({
      limit: parseInt(limit),
      from_date: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000)
    });

    if (incidents.length === 0) {
      return res.json({
        success: true,
        message: 'No recent incidents found for analysis',
        summary: null
      });
    }

    // Check if Gemini service is available
    if (!geminiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI analysis service not available',
        message: 'Gemini API key not configured'
      });
    }

    // Generate threat summary
    const summary = await geminiService.generateThreatSummary(incidents);
    
    res.json({
      success: true,
      incidentCount: incidents.length,
      timeRange: `${days} days`,
      summary: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to generate threat summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate threat summary',
      message: error.message 
    });
  }
});

// Get AI-powered insights for dashboard
router.get('/insights', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent incidents and stats
    const [incidents, stats] = await Promise.all([
      Incident.findAll({ limit: parseInt(limit) }),
      Incident.getStats()
    ]);

    // Check if Gemini service is available
    if (!geminiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI analysis service not available',
        message: 'Gemini API key not configured'
      });
    }

    // Generate insights
    const insights = await geminiService.generateIncidentInsights({
      recentIncidents: incidents,
      statistics: stats,
      timeRange: 'Last 7 days'
    });
    
    res.json({
      success: true,
      insights: insights,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to generate insights:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message 
    });
  }
});

// Get AI service status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    available: geminiService.isAvailable(),
    service: 'Google Gemini AI',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
