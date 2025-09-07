// src/config/database.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class Database {
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber-incidents';
      
      await mongoose.connect(mongoUri);
      
      logger.info('Connected to MongoDB successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });
      
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

const database = new Database();

async function initDatabase() {
  await database.connect();
}

module.exports = { initDatabase, database };
