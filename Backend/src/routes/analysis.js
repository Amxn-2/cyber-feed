// src/routes/analysis.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Incident = require('../models/Incident');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

// Rate limiting for AI analysis endpoints
const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 AI analysis requests per windowMs
  message: {
    error: 'Too many AI analysis requests',
    message: 'Please wait before requesting another AI analysis'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Get AI-powered incident analysis
router.get('/incident/:id', aiAnalysisLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid incident ID',
        message: 'Incident ID must be a valid string'
      });
    }
    
    // Find the incident
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ 
        error: 'Incident not found',
        message: `No incident found with ID: ${id}`
      });
    }

    // Check if Gemini service is available
    if (!geminiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI analysis service not available',
        message: 'Gemini API key not configured or service unavailable'
      });
    }

    // Generate AI analysis
    const analysis = await geminiService.analyzeIncident(incident);
    
    res.json({
      success: true,
      incident: {
        _id: incident._id,
        title: incident.title,
        source: incident.source,
        category: incident.category,
        severity: incident.severity,
        published_date: incident.published_date
      },
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to analyze incident:', error);
    
    // Handle specific error types
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'AI service quota exceeded',
        message: 'Please try again later'
      });
    } else if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'AI analysis timeout',
        message: 'The analysis request timed out. Please try again.'
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to analyze incident',
        message: error.message 
      });
    }
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
  try {
    const serviceInfo = geminiService.getServiceInfo();
    
    res.json({
      success: true,
      available: serviceInfo.available,
      service: 'Google Gemini AI',
      model: serviceInfo.model,
      cache: {
        size: serviceInfo.cacheSize,
        timeout: serviceInfo.configuration.cacheTimeout
      },
      configuration: {
        maxRetries: serviceInfo.configuration.maxRetries,
        timeout: serviceInfo.configuration.timeout,
        rateLimitDelay: serviceInfo.configuration.rateLimitDelay
      },
      lastRequestTime: serviceInfo.lastRequestTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get AI service status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service status',
      message: error.message
    });
  }
});

module.exports = router;
