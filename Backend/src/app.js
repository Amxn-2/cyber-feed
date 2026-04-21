// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const incidentRoutes = require('./routes/incidents');
const statsRoutes = require('./routes/stats');
const analysisRoutes = require('./routes/analysis');
const collectionRoutes = require('./routes/collection');
const sectorRoutes = require('./routes/sectors');
const predictionRoutes = require('./routes/predictions');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CyberFeed API',
      version: '1.0.0',
      description: 'API for CyberFeed threat intelligence platform',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
      },
    ],
    components: {
      schemas: {
        Incident: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            severity: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
            source: { type: 'string' },
            published_date: { type: 'string', format: 'date-time' },
            entities: {
              type: 'object',
              properties: {
                organizations: { type: 'array', items: { type: 'string' } },
                threat_actors: { type: 'array', items: { type: 'string' } },
                technologies: { type: 'array', items: { type: 'string' } }
              }
            },
            mitre_techniques: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tactic: { type: 'string' },
                  technique: { type: 'string' },
                  technique_id: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/predictions', predictionRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'cyber-incident-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;
