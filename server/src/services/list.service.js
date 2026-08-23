/**
 * List service — business logic for list (column) CRUD.
 */
const List = require('../models/List');
const Card = require('../models/Card');
const { generateKeyBetween } = require('fractional-indexing');
const logger = require('../utils/logger');

/**
 * Creates a new list at the end of a board.
 * @param {string} boardId
 * @param {string} title
 * @returns {Promise<object>}
 */
async function createList(boardId, title) {
  const lastList = await List.findOne({ boardId })
    .sort({ order: -1 })
    .select('order');

  const order = generateKeyBetween(lastList?.order || null, null);

  const list = await List.create({ boardId, title, order });
  logger.info('List created', { listId: list._id, boardId });
  return list;
}

/**
 * Deletes a list and all its cards.
 * @param {string} listId
 * @returns {Promise<void>}
 */
async function deleteList(listId) {
  await Card.deleteMany({ listId });
  await List.findByIdAndDelete(listId);
  logger.info('List deleted', { listId });
}

module.exports = { createList, deleteList };
