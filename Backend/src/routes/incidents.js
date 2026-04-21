// src/routes/incidents.js
const express = require('express');
const Incident = require('../models/Incident');
// Data collection now handled by Python microservice
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @openapi
 * /api/incidents:
 *   get:
 *     summary: Get all cyber security incidents
 *     description: Retrieve a list of incidents with optional filtering by severity, category, or source
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by severity (Critical, High, Medium, Low)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limit the number of results
 *     responses:
 *       200:
 *         description: A list of incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 */
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
