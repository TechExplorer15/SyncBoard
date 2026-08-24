/**
 * SyncBoard API server entry point.
 * Creates the HTTP server, connects to MongoDB and Redis,
 * and starts listening. Handles graceful shutdown.
 */
const http = require('http');
const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const { createRedisClients, disconnectRedis } = require('./config/redis');
const logger = require('./utils/logger');

// Validate environment variables (fail-fast)
const env = require('./config/env');

async function main() {
  // Connect to MongoDB
  await connectDB(env.MONGO_URI);

  // Initialize Redis clients (used by Socket.io adapter in Phase 4)
  createRedisClients(env.REDIS_URL);

  // Create Express app
  const app = createApp({ clientOrigin: env.CLIENT_ORIGIN });

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io
  const { initSocket } = require('./socket');
  initSocket(server);

  // Start listening
  const PORT = parseInt(env.PORT, 10);
  server.listen(PORT, () => {
    logger.info(`SyncBoard API server running`, {
      port: PORT,
      env: env.NODE_ENV,
    });
  });

  // --- Graceful shutdown ---
  async function shutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(() => {
      logger.info('HTTP server closed');
    });

    try {
      await disconnectRedis();
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('All connections closed. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: err.message });
      process.exit(1);
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
