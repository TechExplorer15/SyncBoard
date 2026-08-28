/**
 * Middleware that loads a workspace and attaches the requesting user's
 * membership to the request object.
 *
 * Expects req.user.userId (set by authenticate middleware) and
 * req.params to contain a workspace ID via one of:
 * - req.params.workspaceId (direct workspace routes)
 * - req.params.id (when :id is the workspace)
 *
 * Sets req.workspace and req.workspaceMembership on success.
 */
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const logger = require('../utils/logger');

/**
 * Creates middleware that loads workspace context.
 * @param {object} [options]
 * @param {string} [options.idParam='workspaceId'] - The req.params key for workspace ID
 * @param {boolean} [options.fromBoard=false] - If true, derive workspace from a board ID param
 * @param {string} [options.boardParam='boardId'] - The req.params key for board ID (when fromBoard=true)
 * @returns {import('express').RequestHandler}
 */
function loadWorkspace(options = {}) {
  const {
    idParam = 'workspaceId',
    fromBoard = false,
    boardParam = 'boardId',
    fromCard = false,
    cardParam = 'cardId',
  } = options;

  return async (req, res, next) => {
    try {
      let workspaceId;

      if (fromCard) {
        // Derive workspace from card -> board -> workspace
        const cardId = req.params[cardParam] || req.params.id;
        const Card = require('../models/Card');
        const card = await Card.findById(cardId);
        if (!card) {
          return res.status(404).json({ error: 'Card not found', code: 'NOT_FOUND' });
        }
        
        const board = await Board.findById(card.boardId);
        if (!board) {
          return res.status(404).json({ error: 'Board not found', code: 'NOT_FOUND' });
        }
        workspaceId = board.workspaceId;
        req.card = card;
        req.board = board;
      } else if (fromBoard) {
        // Derive workspace from board
        const boardId = req.params[boardParam] || req.params.id;
        const board = await Board.findById(boardId);
        if (!board) {
          return res.status(404).json({ error: 'Board not found', code: 'NOT_FOUND' });
        }
        workspaceId = board.workspaceId;
        req.board = board;
      } else {
        workspaceId = req.params[idParam] || req.params.id;
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found', code: 'NOT_FOUND' });
      }

      // Find the user's membership
      const membership = workspace.members.find(
        (m) => m.userId.toString() === req.user.userId
      );

      if (!membership) {
        return res.status(403).json({
          error: 'You are not a member of this workspace',
          code: 'NOT_MEMBER',
        });
      }

      req.workspace = workspace;
      req.workspaceMembership = {
        userId: membership.userId,
        role: membership.role,
      };

      next();
    } catch (err) {
      // Handle invalid ObjectId format
      if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format', code: 'INVALID_ID' });
      }
      next(err);
    }
  };
}

module.exports = loadWorkspace;
