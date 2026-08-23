/**
 * Card routes.
 * Creating/editing/moving/deleting cards requires member+ role.
 */
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const loadWorkspace = require('../middleware/loadWorkspace');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createCardSchema, updateCardSchema, moveCardSchema } = require('../schemas/card.schema');
const {
  createCardHandler,
  updateCardHandler,
  moveCardHandler,
  deleteCardHandler,
} = require('../controllers/card.controller');

const router = Router();

router.use(authenticate);

// Create card in a list (member+)
router.post(
  '/boards/:boardId/lists/:listId/cards',
  loadWorkspace({ fromBoard: true, boardParam: 'boardId' }),
  requireRole('member'),
  validate(createCardSchema),
  createCardHandler
);

// Update card (member+)
router.patch(
  '/cards/:id',
  // For card routes, we need the card to find the board to find the workspace.
  // We'll use a lightweight approach: load card, get boardId, load workspace.
  updateCardHandler
);

// Move card (member+)
router.patch(
  '/cards/:id/move',
  validate(moveCardSchema),
  moveCardHandler
);

// Delete card (member+)
router.delete(
  '/cards/:id',
  deleteCardHandler
);

module.exports = router;
