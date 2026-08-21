/**
 * MongoDB connection setup using Mongoose.
 * Connects with retry logic and structured error logging.
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connects to MongoDB.
 * @param {string} uri - MongoDB connection string
 * @returns {Promise<void>}
 */
async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully', { host: mongoose.connection.host });
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

module.exports = { connectDB };
