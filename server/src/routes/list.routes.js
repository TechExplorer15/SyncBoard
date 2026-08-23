/**
 * List routes.
 * Creating lists requires member+ role.
 */
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const loadWorkspace = require('../middleware/loadWorkspace');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createListSchema } = require('../schemas/list.schema');
const { createListHandler, deleteListHandler } = require('../controllers/list.controller');

const router = Router();

router.use(authenticate);

// Create list on a board (member+)
router.post(
  '/boards/:boardId/lists',
  loadWorkspace({ fromBoard: true, boardParam: 'boardId' }),
  requireRole('member'),
  validate(createListSchema),
  createListHandler
);

// Delete list (admin only)
router.delete(
  '/lists/:id',
  // Note: we'd need to load workspace from the list's board for proper RBAC.
  // For now, simplified: admin check happens at board level in Phase 4.
  deleteListHandler
);

module.exports = router;
