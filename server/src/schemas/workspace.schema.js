/**
 * Zod schemas for workspace endpoints.
 */
const { z } = require('zod');
const { ROLES } = require('../utils/constants');

const createWorkspaceSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
});

const inviteMemberSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase(),
  role: z
    .enum([ROLES.VIEWER, ROLES.MEMBER, ROLES.ADMIN], {
      errorMap: () => ({ message: 'Role must be viewer, member, or admin' }),
    })
    .default(ROLES.MEMBER),
});

module.exports = { createWorkspaceSchema, inviteMemberSchema };
