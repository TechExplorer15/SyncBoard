/**
 * Redis client configuration for SyncBoard.
 * Creates a pub/sub client pair for the Socket.io Redis adapter.
 * 
 * Architecture note: The adapter requires TWO separate connections:
 * - pubClient: publishes broadcast events
 * - subClient: dedicated to Redis SUBSCRIBE mode (cannot run other commands)
 * We use .duplicate() to clone configuration cleanly.
 */
const Redis = require('ioredis');
const logger = require('../utils/logger');

/** @type {import('ioredis').Redis | null} */
let pubClient = null;
/** @type {import('ioredis').Redis | null} */
let subClient = null;

/**
 * Initializes Redis pub/sub client pair.
 * @param {string} redisUrl - Redis connection URL
 * @returns {{ pubClient: import('ioredis').Redis, subClient: import('ioredis').Redis }}
 */
function createRedisClients(redisUrl) {
  pubClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,  // Recommended for resilient pub/sub reconnects
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      logger.warn('Redis reconnecting...', { attempt: times, delayMs: delay });
      return delay;
    },
  });

  subClient = pubClient.duplicate();

  // CRITICAL: Unhandled Redis errors crash Node.js processes
  pubClient.on('error', (err) => {
    logger.error('Redis pub client error', { error: err.message });
  });

  subClient.on('error', (err) => {
    logger.error('Redis sub client error', { error: err.message });
  });

  pubClient.on('connect', () => {
    logger.info('Redis pub client connected');
  });

  subClient.on('connect', () => {
    logger.info('Redis sub client connected');
  });

  return { pubClient, subClient };
}

/**
 * Returns the current pub client instance.
 * @returns {import('ioredis').Redis}
 */
function getPubClient() {
  if (!pubClient) throw new Error('Redis not initialized. Call createRedisClients first.');
  return pubClient;
}

/**
 * Gracefully disconnects both Redis clients.
 * @returns {Promise<void>}
 */
async function disconnectRedis() {
  const promises = [];
  if (pubClient) promises.push(pubClient.quit());
  if (subClient) promises.push(subClient.quit());
  await Promise.all(promises);
  logger.info('Redis clients disconnected');
}

module.exports = { createRedisClients, getPubClient, disconnectRedis };
