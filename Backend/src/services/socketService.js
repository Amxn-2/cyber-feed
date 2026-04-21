const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io = null;

const initSocket = (server, frontendUrl) => {
  io = new Server(server, {
    cors: {
      origin: frontendUrl || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

const emitNewIncident = (incident) => {
  if (io) {
    io.emit('new_incident', incident);
    logger.info(`Emitted new_incident event: ${incident.title}`);
  }
};

const emitRiskUpdate = (data) => {
  if (io) {
    io.emit('risk_update', data);
    logger.info('Emitted risk_update event');
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNewIncident,
  emitRiskUpdate
};
