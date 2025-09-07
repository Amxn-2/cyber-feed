// server.js
require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/database');
// Data collection now handled by Python microservice
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    logger.info('Database initialized successfully');

    // Data collection now handled by Python microservice
    logger.info('Data collection handled by Python microservice');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
