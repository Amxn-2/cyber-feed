// src/routes/collection.js
const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');

const router = express.Router();

// Python scraper service URL
const PYTHON_SCRAPER_URL = process.env.PYTHON_SCRAPER_URL || 'http://localhost:5000';

/**
 * Trigger data collection via Python microservice
 */
router.post('/trigger', async (req, res) => {
  try {
    const { sources, force_refresh } = req.body;
    
    logger.info('Triggering data collection via Python microservice', { sources, force_refresh });
    
    // Call Python scraper service
    const response = await axios.post(`${PYTHON_SCRAPER_URL}/scrape`, {
      sources: sources || ['cert-in', 'news', 'test'],
      force_refresh: force_refresh || false
    });
    
    res.json({
      success: true,
      message: 'Data collection triggered successfully',
      python_response: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to trigger data collection:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger data collection',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get collection status from Python microservice
 */
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SCRAPER_URL}/scrape/status`);
    
    res.json({
      success: true,
      status: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to get collection status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get collection status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get available scraping sources
 */
router.get('/sources', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SCRAPER_URL}/scrape/sources`);
    
    res.json({
      success: true,
      sources: response.data.sources,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to get scraping sources:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping sources',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
