/**
 * Auth service — business logic for registration, login, token refresh, and logout.
 * Separated from controllers to keep route handlers thin and testable.
 */
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Registers a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
async function register({ name, email, password }) {
  // Check for existing user
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  // Create user (password is hashed by the pre-save hook)
  const user = await User.create({
    name,
    email,
    passwordHash: password,
  });

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString(), user.refreshTokenVersion);

  logger.info('User registered', { userId: user._id, email });

  return { user, accessToken, refreshToken };
}

/**
 * Authenticates a user with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString(), user.refreshTokenVersion);

  logger.info('User logged in', { userId: user._id });

  return { user, accessToken, refreshToken };
}

/**
 * Refreshes the access/refresh token pair.
 * Validates the refresh token and checks that its tokenVersion
 * matches the user's current refreshTokenVersion.
 * @param {string} refreshTokenStr - The existing refresh token
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
async function refreshTokens(refreshTokenStr) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenStr);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    error.code = err.name === 'TokenExpiredError' ? 'REFRESH_TOKEN_EXPIRED' : 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // Check token version — if user logged out or changed password,
  // this version was bumped, invalidating all old refresh tokens
  if (decoded.tokenVersion !== user.refreshTokenVersion) {
    logger.warn('Refresh token version mismatch (possible revoked token)', {
      userId: user._id,
      tokenVersion: decoded.tokenVersion,
      currentVersion: user.refreshTokenVersion,
    });
    const error = new Error('Refresh token has been revoked');
    error.statusCode = 401;
    error.code = 'TOKEN_REVOKED';
    throw error;
  }

  const accessToken = signAccessToken(user._id.toString());
  const newRefreshToken = signRefreshToken(user._id.toString(), user.refreshTokenVersion);

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Logs out a user by bumping their refreshTokenVersion.
 * This invalidates ALL existing refresh tokens immediately
 * without needing a token blacklist.
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
  logger.info('User logged out (refresh token version bumped)', { userId });
}

module.exports = { register, login, refreshTokens, logout };
