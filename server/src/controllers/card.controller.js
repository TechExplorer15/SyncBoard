/**
 * Card controller — thin HTTP handlers for card operations.
 */
const cardService = require('../services/card.service');

/** POST /api/boards/:boardId/lists/:listId/cards */
async function createCardHandler(req, res, next) {
  try {
    const boardId = req.board?._id?.toString() || req.params.boardId;
    const { listId } = req.params;
    const card = await cardService.createCard({
      boardId,
      listId,
      title: req.body.title,
      description: req.body.description,
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/cards/:id */
async function updateCardHandler(req, res, next) {
  try {
    const card = await cardService.updateCard(req.params.id, req.body);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/cards/:id/move */
async function moveCardHandler(req, res, next) {
  try {
    const card = await cardService.moveCard(req.params.id, req.body);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/cards/:id */
async function deleteCardHandler(req, res, next) {
  try {
    await cardService.deleteCard(req.params.id);
    res.json({ message: 'Card deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCardHandler,
  updateCardHandler,
  moveCardHandler,
  deleteCardHandler,
};
