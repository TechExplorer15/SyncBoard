/**
 * Board controller — thin HTTP handlers for board operations.
 */
const boardService = require('../services/board.service');

/** POST /api/workspaces/:workspaceId/boards */
async function createBoardHandler(req, res, next) {
  try {
    const board = await boardService.createBoard(
      req.params.workspaceId,
      req.body.title
    );
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
}

/** GET /api/workspaces/:workspaceId/boards */
async function getBoardsHandler(req, res, next) {
  try {
    const boards = await boardService.getWorkspaceBoards(req.params.workspaceId);
    res.json(boards);
  } catch (err) {
    next(err);
  }
}

/** GET /api/boards/:id */
async function getBoardHandler(req, res, next) {
  try {
    const board = await boardService.getBoardWithData(req.params.id);
    res.json(board);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/boards/:id */
async function deleteBoardHandler(req, res, next) {
  try {
    await boardService.deleteBoard(req.params.id);
    res.json({ message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBoardHandler,
  getBoardsHandler,
  getBoardHandler,
  deleteBoardHandler,
};
