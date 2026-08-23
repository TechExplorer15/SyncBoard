/**
 * Workspace service — business logic for workspace CRUD and member management.
 */
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Creates a new workspace. The creator becomes the admin.
 * @param {string} name
 * @param {string} ownerId
 * @returns {Promise<object>}
 */
async function createWorkspace(name, ownerId) {
  const workspace = await Workspace.create({
    name,
    ownerId,
    members: [{ userId: ownerId, role: ROLES.ADMIN }],
  });
  logger.info('Workspace created', { workspaceId: workspace._id, ownerId });
  return workspace;
}

/**
 * Returns all workspaces the user is a member of.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
async function getUserWorkspaces(userId) {
  return Workspace.find({ 'members.userId': userId })
    .populate('members.userId', 'name email')
    .sort({ createdAt: -1 });
}

/**
 * Invites a user to a workspace by email.
 * @param {string} workspaceId
 * @param {string} email
 * @param {string} role
 * @returns {Promise<object>}
 */
async function inviteMember(workspaceId, email, role) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User with this email not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const workspace = await Workspace.findById(workspaceId);
  const existing = workspace.members.find(
    (m) => m.userId.toString() === user._id.toString()
  );
  if (existing) {
    const error = new Error('User is already a member of this workspace');
    error.statusCode = 409;
    error.code = 'ALREADY_MEMBER';
    throw error;
  }

  workspace.members.push({ userId: user._id, role });
  await workspace.save();

  logger.info('Member invited to workspace', {
    workspaceId,
    userId: user._id,
    role,
  });

  return workspace;
}

/**
 * Removes a member from a workspace.
 * @param {string} workspaceId
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function removeMember(workspaceId, userId) {
  const workspace = await Workspace.findById(workspaceId);

  if (workspace.ownerId.toString() === userId) {
    const error = new Error('Cannot remove the workspace owner');
    error.statusCode = 400;
    error.code = 'CANNOT_REMOVE_OWNER';
    throw error;
  }

  workspace.members = workspace.members.filter(
    (m) => m.userId.toString() !== userId
  );
  await workspace.save();

  logger.info('Member removed from workspace', { workspaceId, userId });

  return workspace;
}

module.exports = { createWorkspace, getUserWorkspaces, inviteMember, removeMember };
