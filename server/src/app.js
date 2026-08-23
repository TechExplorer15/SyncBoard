/**
 * Express application factory for SyncBoard.
 * Separated from the server (index.js) so the app can be tested
 * with Supertest without starting an HTTP listener.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const { RATE_LIMIT } = require('./utils/constants');
const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const boardRoutes = require('./routes/board.routes');
const listRoutes = require('./routes/list.routes');
const cardRoutes = require('./routes/card.routes');

/**
 * Creates and configures the Express application.
 * @param {object} options
 * @param {string} options.clientOrigin - Allowed CORS origin
 * @returns {import('express').Express}
 */
function createApp({ clientOrigin }) {
  const app = express();

  // --- Security ---
  app.use(helmet());
  app.use(cors({
    origin: clientOrigin,
    credentials: true,
  }));

  // --- Body parsing ---
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // --- Rate limiting on auth routes (disabled in test to avoid hitting limits) ---
  if (process.env.NODE_ENV !== 'test') {
    const authLimiter = rateLimit({
      windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
      max: RATE_LIMIT.AUTH_MAX_REQUESTS,
      message: { error: 'Too many requests, please try again later', code: 'RATE_LIMITED' },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api/auth', authLimiter);
  }

  // --- Health check ---
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'syncboard-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // --- Routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api', boardRoutes);
  app.use('/api', listRoutes);
  app.use('/api', cardRoutes);

  // --- 404 handler ---
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
  });

  // --- Global error handler (must be last) ---
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
