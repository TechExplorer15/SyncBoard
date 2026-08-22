/**
 * JWT authentication middleware.
 * Verifies the access token from the Authorization header
 * and attaches the decoded user info to req.user.
 */
const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Express middleware that requires a valid JWT access token.
 * Extracts from `Authorization: Bearer <token>` header.
 * On success, sets `req.user = { userId }`.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    logger.debug('Token verification failed', { error: err.message });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      error: 'Invalid access token',
      code: 'INVALID_TOKEN',
    });
  }
}

module.exports = authenticate;
