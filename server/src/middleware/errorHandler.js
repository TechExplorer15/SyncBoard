/**
 * Global error handling middleware.
 * Ensures all API errors return a consistent shape: { error: string, code?: string }
 * Never leaks stack traces in production.
 */
const logger = require('../utils/logger');

/**
 * Express error-handling middleware.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  // Log with context for debugging
  logger.error('Unhandled error', {
    method: req.method,
    path: req.path,
    userId: req.user?.userId || 'anonymous',
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE',
    });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Invalid request data',
      code: 'VALIDATION_ERROR',
    });
  }

  // Default: internal server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
  });
}

module.exports = errorHandler;
