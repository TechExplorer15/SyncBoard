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
  loadWorkspace({ fromCard: true, cardParam: 'id' }),
  requireRole('member'),
  updateCardHandler
);

// Move card (member+)
router.patch(
  '/cards/:id/move',
  loadWorkspace({ fromCard: true, cardParam: 'id' }),
  requireRole('member'),
  validate(moveCardSchema),
  moveCardHandler
);

// Delete card (member+)
router.delete(
  '/cards/:id',
  loadWorkspace({ fromCard: true, cardParam: 'id' }),
  requireRole('member'),
  deleteCardHandler
);

module.exports = router;
