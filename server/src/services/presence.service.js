/**
 * Presence service — manages real-time board viewers using Redis Sorted Sets.
 */
const { getPubClient } = require('../config/redis');
const User = require('../models/User');
const { REDIS_KEYS, PRESENCE_TTL_SECONDS } = require('../utils/constants');
const { emitToBoard } = require('../utils/emitter');
const logger = require('../utils/logger');

/**
 * Records a heartbeat for a user on a board.
 * Uses a Redis Sorted Set where score = timestamp.
 */
async function recordHeartbeat(boardId, userId) {
  try {
    const redis = getPubClient();
    const key = `${REDIS_KEYS.PRESENCE_BOARD}${boardId}`;
    const now = Date.now();
    
    // Add or update the user's heartbeat timestamp
    await redis.zadd(key, now, userId);
    
    // Expire the whole set after TTL just in case it gets abandoned
    await redis.expire(key, PRESENCE_TTL_SECONDS);

    // After updating heartbeat, optionally broadcast.
    // For efficiency, we shouldn't broadcast on every single heartbeat if it's just a refresh,
    // but we can broadcast if it's a new join, or we can just broadcast and let the client deduplicate.
    // Let's broadcast the fresh list of users.
    await broadcastPresence(boardId);
  } catch (error) {
    logger.error('Failed to record heartbeat', { error: error.message, boardId, userId });
  }
}

/**
 * Removes a user explicitly (on disconnect/leave).
 */
async function removeUser(boardId, userId) {
  try {
    const redis = getPubClient();
    const key = `${REDIS_KEYS.PRESENCE_BOARD}${boardId}`;
    await redis.zrem(key, userId);
    await broadcastPresence(boardId);
  } catch (error) {
    logger.error('Failed to remove user from presence', { error: error.message, boardId, userId });
  }
}

/**
 * Cleans up expired heartbeats and broadcasts the active users.
 */
async function broadcastPresence(boardId) {
  try {
    const redis = getPubClient();
    const key = `${REDIS_KEYS.PRESENCE_BOARD}${boardId}`;
    const cutoff = Date.now() - (PRESENCE_TTL_SECONDS * 1000);

    // 1. Remove expired
    await redis.zremrangebyscore(key, '-inf', cutoff);

    // 2. Get active user IDs
    const activeUserIds = await redis.zrange(key, 0, -1);

    if (activeUserIds.length === 0) {
      emitToBoard(boardId, 'presence_updated', []);
      return;
    }

    // 3. Fetch user details (name, email) from Mongo
    // In a massive app, we'd cache this in Redis. For SyncBoard, Mongo is fine.
    const users = await User.find({ _id: { $in: activeUserIds } })
      .select('name email')
      .lean();

    const activeUsers = users.map(u => ({
      userId: u._id.toString(),
      name: u.name,
      email: u.email
    }));

    // 4. Emit to room
    emitToBoard(boardId, 'presence_updated', activeUsers);
  } catch (error) {
    logger.error('Failed to broadcast presence', { error: error.message, boardId });
  }
}

module.exports = { recordHeartbeat, removeUser, broadcastPresence };
