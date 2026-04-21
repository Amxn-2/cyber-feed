// server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initDatabase } = require('./src/config/database');
const { initSocket } = require('./src/services/socketService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT;
const server = http.createServer(app);

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    logger.info('Database initialized successfully');

    // Initialize Socket.io
    initSocket(server, process.env.FRONTEND_URL);
    logger.info('Socket.io initialized');

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
