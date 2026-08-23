/**
 * Workspace routes.
 * All routes require authentication.
 * Member management requires admin role.
 */
const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const loadWorkspace = require('../middleware/loadWorkspace');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createWorkspaceSchema, inviteMemberSchema } = require('../schemas/workspace.schema');
const {
  createWorkspaceHandler,
  getWorkspacesHandler,
  inviteMemberHandler,
  removeMemberHandler,
} = require('../controllers/workspace.controller');

const router = Router();

// All workspace routes require auth
router.use(authenticate);

// Create workspace & list user's workspaces
router.post('/', validate(createWorkspaceSchema), createWorkspaceHandler);
router.get('/', getWorkspacesHandler);

// Member management (admin only)
router.post(
  '/:workspaceId/members',
  loadWorkspace({ idParam: 'workspaceId' }),
  requireRole('admin'),
  validate(inviteMemberSchema),
  inviteMemberHandler
);

router.delete(
  '/:workspaceId/members/:userId',
  loadWorkspace({ idParam: 'workspaceId' }),
  requireRole('admin'),
  removeMemberHandler
);

module.exports = router;
