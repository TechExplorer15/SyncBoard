/**
 * Card service — business logic for card CRUD and fractional positioning.
 *
 * Uses the 'fractional-indexing' package for O(1) card reorder writes.
 * Each card has an 'order' field (a lexicographic string key).
 * Moving a card computes a new key between its new neighbors.
 * This avoids the classic fresher mistake of rewriting an array index
 * on every drag, which falls over under concurrent edits.
 */
const Card = require('../models/Card');
const List = require('../models/List');
const { generateKeyBetween, generateNKeysBetween } = require('fractional-indexing');
const { REBALANCE_KEY_LENGTH } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Creates a card at the end of a list.
 * @param {{ boardId: string, listId: string, title: string, description?: string }} data
 * @returns {Promise<object>}
 */
async function createCard({ boardId, listId, title, description = '' }) {
  // Verify the list belongs to this board
  const list = await List.findById(listId);
  if (!list || list.boardId.toString() !== boardId) {
    const error = new Error('List not found on this board');
    error.statusCode = 404;
    error.code = 'LIST_NOT_FOUND';
    throw error;
  }

  // Get the last card in the list to determine the new order key
  const lastCard = await Card.findOne({ listId })
    .sort({ order: -1 })
    .select('order');

  const order = generateKeyBetween(lastCard?.order || null, null);

  const card = await Card.create({ boardId, listId, title, description, order });
  logger.info('Card created', { cardId: card._id, listId, boardId });
  return card;
}

/**
 * Moves a card to a new position (possibly in a different list).
 * Computes a fractional index key between the new neighbors.
 *
 * @param {string} cardId
 * @param {{ targetListId: string, prevOrder: string | null, nextOrder: string | null }} moveData
 * @returns {Promise<object>}
 */
async function moveCard(cardId, { targetListId, prevOrder, nextOrder }) {
  const card = await Card.findById(cardId);
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Verify target list is on the same board
  const targetList = await List.findById(targetListId);
  if (!targetList || targetList.boardId.toString() !== card.boardId.toString()) {
    const error = new Error('Target list not found on this board');
    error.statusCode = 400;
    error.code = 'INVALID_TARGET_LIST';
    throw error;
  }

  const newOrder = generateKeyBetween(prevOrder, nextOrder);

  card.listId = targetListId;
  card.order = newOrder;
  await card.save();

  logger.info('Card moved', {
    cardId,
    targetListId,
    newOrder,
  });

  // Check if rebalancing is needed
  if (newOrder.length > REBALANCE_KEY_LENGTH) {
    // Fire-and-forget rebalance (don't block the response)
    rebalanceList(card.boardId.toString(), targetListId).catch((err) => {
      logger.error('Rebalance failed', { listId: targetListId, error: err.message });
    });
  }

  return card;
}

/**
 * Updates a card's title and/or description.
 * @param {string} cardId
 * @param {{ title?: string, description?: string }} data
 * @returns {Promise<object>}
 */
async function updateCard(cardId, data) {
  const card = await Card.findByIdAndUpdate(
    cardId,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return card;
}

/**
 * Deletes a card.
 * @param {string} cardId
 * @returns {Promise<void>}
 */
async function deleteCard(cardId) {
  const card = await Card.findByIdAndDelete(cardId);
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  logger.info('Card deleted', { cardId });
}

/**
 * Rebalances fractional index keys in a list.
 * Called when key lengths grow too long from repeated insertions.
 * Assigns fresh, evenly-spaced keys to all cards.
 * @param {string} boardId
 * @param {string} listId
 * @returns {Promise<void>}
 */
async function rebalanceList(boardId, listId) {
  const cards = await Card.find({ boardId, listId }).sort({ order: 1, _id: 1 });
  if (cards.length === 0) return;

  const newKeys = generateNKeysBetween(null, null, cards.length);
  const bulkOps = cards.map((card, i) => ({
    updateOne: {
      filter: { _id: card._id },
      update: { $set: { order: newKeys[i] } },
    },
  }));

  await Card.bulkWrite(bulkOps);
  logger.info('List rebalanced', { listId, cardCount: cards.length });
}

module.exports = { createCard, moveCard, updateCard, deleteCard, rebalanceList };
