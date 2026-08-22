/**
 * Auth controller — thin HTTP handlers that delegate to auth.service.
 * Handles request/response concerns (cookies, status codes) only.
 */
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/** Cookie options for the refresh token (httpOnly, secure in prod) */
const REFRESH_COOKIE_NAME = 'refreshToken';

/**
 * Returns cookie options for the refresh token.
 * @returns {import('express').CookieOptions}
 */
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  };
}

/**
 * POST /api/auth/register
 */
async function registerHandler(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    res.status(201).json({
      user,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function loginHandler(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    res.json({
      user,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 */
async function refreshHandler(req, res, next) {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    const { accessToken, refreshToken } = await authService.refreshTokens(token);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logoutHandler(req, res, next) {
  try {
    await authService.logout(req.user.userId);

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
};
