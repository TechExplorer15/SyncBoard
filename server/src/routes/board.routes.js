/**
 * Board routes.
 * Creating boards requires member+ role in the workspace.
 * Viewing a board requires viewer+ role.
 */
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const loadWorkspace = require('../middleware/loadWorkspace');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createBoardSchema } = require('../schemas/board.schema');
const {
  createBoardHandler,
  getBoardsHandler,
  getBoardHandler,
  deleteBoardHandler,
} = require('../controllers/board.controller');

const router = Router();

router.use(authenticate);

// Board CRUD within a workspace
router.post(
  '/workspaces/:workspaceId/boards',
  loadWorkspace({ idParam: 'workspaceId' }),
  requireRole('member'),
  validate(createBoardSchema),
  createBoardHandler
);

router.get(
  '/workspaces/:workspaceId/boards',
  loadWorkspace({ idParam: 'workspaceId' }),
  requireRole('viewer'),
  getBoardsHandler
);

// Board by ID (derives workspace from board)
router.get(
  '/boards/:id',
  loadWorkspace({ fromBoard: true, boardParam: 'id' }),
  requireRole('viewer'),
  getBoardHandler
);

router.delete(
  '/boards/:id',
  loadWorkspace({ fromBoard: true, boardParam: 'id' }),
  requireRole('admin'),
  deleteBoardHandler
);

module.exports = router;
