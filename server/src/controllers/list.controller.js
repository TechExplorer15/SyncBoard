/**
 * List controller — thin HTTP handlers for list operations.
 */
const listService = require('../services/list.service');

/** POST /api/boards/:boardId/lists */
async function createListHandler(req, res, next) {
  try {
    const boardId = req.board?._id || req.params.boardId;
    const list = await listService.createList(boardId.toString(), req.body.title);
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/lists/:id */
async function deleteListHandler(req, res, next) {
  try {
    await listService.deleteList(req.params.id);
    res.json({ message: 'List deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createListHandler, deleteListHandler };
