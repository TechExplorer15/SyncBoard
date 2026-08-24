const logger = require('./logger');

/**
 * Emits a real-time event to all connected clients in a specific board room.
 * Safely ignores errors if Socket.io is not initialized (e.g., during tests).
 * 
 * @param {string} boardId - The ID of the board room to emit to
 * @param {string} eventName - The name of the event to emit
 * @param {any} payload - The data to send with the event
 */
function emitToBoard(boardId, eventName, payload) {
  try {
    const { getIO } = require('../socket');
    const io = getIO();
    io.to(`board:${boardId}`).emit(eventName, payload);
  } catch (error) {
    // Ignore in tests or if socket is not initialized
    if (process.env.NODE_ENV !== 'test') {
      logger.error('Failed to emit socket event', { eventName, error: error.message });
    }
  }
}

module.exports = { emitToBoard };
