/**
 * Named constants used throughout the SyncBoard server.
 * Centralizes magic numbers and repeated string values.
 */

/** Role hierarchy — higher number = more permissions */
const ROLE_RANK = Object.freeze({
  viewer: 0,
  member: 1,
  admin: 2,
});

const ROLES = Object.freeze({
  VIEWER: 'viewer',
  MEMBER: 'member',
  ADMIN: 'admin',
});

/** JWT expiry durations */
const TOKEN_EXPIRY = Object.freeze({
  ACCESS: '15m',
  REFRESH: '7d',
});

/** Redis key prefixes */
const REDIS_KEYS = Object.freeze({
  PRESENCE_BOARD: 'presence:board:',
});

/** Presence TTL in seconds */
const PRESENCE_TTL_SECONDS = 30;

/** Heartbeat interval expected from clients (ms) */
const HEARTBEAT_INTERVAL_MS = 15000;

/** Rate limiting */
const RATE_LIMIT = Object.freeze({
  AUTH_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  AUTH_MAX_REQUESTS: 20,
});

/** Fractional index rebalance threshold */
const REBALANCE_KEY_LENGTH = 32;

module.exports = {
  ROLE_RANK,
  ROLES,
  TOKEN_EXPIRY,
  REDIS_KEYS,
  PRESENCE_TTL_SECONDS,
  HEARTBEAT_INTERVAL_MS,
  RATE_LIMIT,
  REBALANCE_KEY_LENGTH,
};
