/**
 * Workspace controller — thin HTTP handlers for workspace operations.
 */
const workspaceService = require('../services/workspace.service');

/** POST /api/workspaces */
async function createWorkspaceHandler(req, res, next) {
  try {
    const workspace = await workspaceService.createWorkspace(
      req.body.name,
      req.user.userId
    );
    res.status(201).json(workspace);
  } catch (err) {
    next(err);
  }
}

/** GET /api/workspaces */
async function getWorkspacesHandler(req, res, next) {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user.userId);
    res.json(workspaces);
  } catch (err) {
    next(err);
  }
}

/** POST /api/workspaces/:workspaceId/members */
async function inviteMemberHandler(req, res, next) {
  try {
    const workspace = await workspaceService.inviteMember(
      req.params.workspaceId,
      req.body.email,
      req.body.role
    );
    res.json(workspace);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/workspaces/:workspaceId/members/:userId */
async function removeMemberHandler(req, res, next) {
  try {
    const workspace = await workspaceService.removeMember(
      req.params.workspaceId,
      req.params.userId
    );
    res.json(workspace);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createWorkspaceHandler,
  getWorkspacesHandler,
  inviteMemberHandler,
  removeMemberHandler,
};
