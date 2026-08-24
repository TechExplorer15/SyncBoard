/**
 * Socket.io server initialization and event handling.
 */
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getPubClient, createRedisClients } = require('./config/redis');
const { verifyAccessToken } = require('./utils/jwt');
const logger = require('./utils/logger');
const env = require('./config/env');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Since createRedisClients returns both, we can just grab pubClient.
  // Wait, the redis.js exports createRedisClients, which is already called in index.js.
  // BUT the socket adapter needs both pub and sub.
  // Let's modify redis.js if it doesn't return subClient, or we can use duplicate here.
  // The redis.js exports getPubClient(). We can duplicate it for subClient here if needed.
  const pubClient = getPubClient();
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.user = { userId: decoded.userId };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    const userId = socket.data.user.userId;
    logger.info('Socket connected', { socketId: socket.id, userId });

    const { recordHeartbeat, removeUser } = require('./services/presence.service');

    socket.on('join_board', async (boardId) => {
      socket.join(`board:${boardId}`);
      logger.debug('Socket joined board room', { socketId: socket.id, userId, boardId });
      await recordHeartbeat(boardId, userId);
    });

    socket.on('heartbeat', async (boardId) => {
      await recordHeartbeat(boardId, userId);
    });

    socket.on('leave_board', async (boardId) => {
      socket.leave(`board:${boardId}`);
      logger.debug('Socket left board room', { socketId: socket.id, userId, boardId });
      await removeUser(boardId, userId);
    });

    socket.on('disconnecting', async () => {
      // socket.rooms contains the rooms the socket is currently in
      for (const room of socket.rooms) {
        if (room.startsWith('board:')) {
          const boardId = room.split(':')[1];
          await removeUser(boardId, userId);
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id, userId });
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIO };
