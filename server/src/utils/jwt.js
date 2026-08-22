/**
 * JWT token utilities for SyncBoard.
 * Handles signing and verification for both access and refresh tokens.
 *
 * Design: Two separate secrets for access and refresh tokens.
 * Refresh tokens include a `tokenVersion` claim that must match the
 * user's current refreshTokenVersion — this enables stateless revocation.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { TOKEN_EXPIRY } = require('./constants');

/**
 * Signs a short-lived access token (15 minutes).
 * @param {string} userId
 * @returns {string} Signed JWT
 */
function signAccessToken(userId) {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS,
  });
}

/**
 * Signs a longer-lived refresh token (7 days).
 * Includes tokenVersion for stateless revocation.
 * @param {string} userId
 * @param {number} tokenVersion - Must match user.refreshTokenVersion to be valid
 * @returns {string} Signed JWT
 */
function signRefreshToken(userId, tokenVersion) {
  return jwt.sign({ userId, tokenVersion }, env.JWT_REFRESH_SECRET, {
    expiresIn: TOKEN_EXPIRY.REFRESH,
  });
}

/**
 * Verifies an access token.
 * @param {string} token
 * @returns {{ userId: string }} Decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verifies a refresh token.
 * @param {string} token
 * @returns {{ userId: string, tokenVersion: number }} Decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
