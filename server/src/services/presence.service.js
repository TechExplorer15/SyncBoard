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
async function recordHeartbeat(boardId, userId, isJoin = false) {
  try {
    const redis = getPubClient();
    const key = `${REDIS_KEYS.PRESENCE_BOARD}${boardId}`;
    const now = Date.now();
    
    // Add or update the user's heartbeat timestamp (1 Redis command)
    await redis.zadd(key, now, userId);
    
    if (isJoin) {
      // Safety net: expire the whole set after 24h to prevent memory leaks if server crashes
      // (We don't need to do this on every heartbeat!)
      await redis.expire(key, 86400);

      // Only prune and broadcast to the room when someone explicitly joins.
      // Routine heartbeats simply keep the timestamp fresh without blasting Redis/WebSockets.
      await broadcastPresence(boardId);
    }
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
