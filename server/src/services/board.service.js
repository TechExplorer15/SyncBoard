/**
 * Board service — business logic for board CRUD.
 */
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const logger = require('../utils/logger');

/**
 * Creates a new board in a workspace.
 * @param {string} workspaceId
 * @param {string} title
 * @returns {Promise<object>}
 */
async function createBoard(workspaceId, title) {
  const board = await Board.create({ workspaceId, title });
  logger.info('Board created', { boardId: board._id, workspaceId });
  return board;
}

/**
 * Returns all boards for a workspace.
 * @param {string} workspaceId
 * @returns {Promise<object[]>}
 */
async function getWorkspaceBoards(workspaceId) {
  return Board.find({ workspaceId }).sort({ createdAt: -1 });
}

/**
 * Returns a board with all its lists and cards, properly ordered.
 * This is the main data load for the board view.
 * @param {string} boardId
 * @returns {Promise<object>}
 */
async function getBoardWithData(boardId) {
  const board = await Board.findById(boardId);
  if (!board) {
    const error = new Error('Board not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const lists = await List.find({ boardId }).sort({ order: 1 }).lean();
  const cards = await Card.find({ boardId }).sort({ order: 1, _id: 1 }).lean();

  // Group cards by listId for efficient lookup
  const cardsByList = {};
  for (const card of cards) {
    const key = card.listId.toString();
    if (!cardsByList[key]) cardsByList[key] = [];
    cardsByList[key].push(card);
  }

  // Attach cards to their lists
  const listsWithCards = lists.map((list) => ({
    ...list,
    cards: cardsByList[list._id.toString()] || [],
  }));

  return {
    ...board.toObject(),
    lists: listsWithCards,
  };
}

/**
 * Deletes a board and all its lists and cards.
 * @param {string} boardId
 * @returns {Promise<void>}
 */
async function deleteBoard(boardId) {
  await Card.deleteMany({ boardId });
  await List.deleteMany({ boardId });
  await Board.findByIdAndDelete(boardId);
  logger.info('Board deleted', { boardId });
}

module.exports = { createBoard, getWorkspaceBoards, getBoardWithData, deleteBoard };
