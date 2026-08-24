/**
 * List service — business logic for list (column) CRUD.
 */
const List = require('../models/List');
const Card = require('../models/Card');
const { generateKeyBetween } = require('fractional-indexing');
const logger = require('../utils/logger');

const { emitToBoard } = require('../utils/emitter');

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
  
  // NOTE: For newly created lists, initialize the cards array for the client
  const listData = list.toObject();
  listData.cards = [];
  
  emitToBoard(boardId, 'list_created', listData);
  return list;
}

/**
 * Deletes a list and all its cards.
 * @param {string} listId
 * @returns {Promise<void>}
 */
async function deleteList(listId) {
  const list = await List.findById(listId);
  if (!list) return;

  await Card.deleteMany({ listId });
  await List.findByIdAndDelete(listId);
  logger.info('List deleted', { listId });
  
  emitToBoard(list.boardId.toString(), 'list_deleted', { 
    listId, 
    boardId: list.boardId 
  });
}

module.exports = { createList, deleteList };
