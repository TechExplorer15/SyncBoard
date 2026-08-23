/**
 * Role-based access control middleware.
 * Checks that the user's workspace role meets the minimum required level.
 *
 * Must run AFTER loadWorkspace middleware (which sets req.workspaceMembership).
 *
 * Role hierarchy: viewer (0) < member (1) < admin (2)
 * A member can do everything a viewer can, an admin can do everything.
 */
const { ROLE_RANK } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Creates middleware that requires a minimum role.
 * @param {'viewer' | 'member' | 'admin'} minRole - Minimum role required
 * @returns {import('express').RequestHandler}
 */
function requireRole(minRole) {
  return (req, res, next) => {
    const userRole = req.workspaceMembership?.role;

    if (!userRole) {
      logger.error('requireRole called without workspace membership', {
        path: req.path,
        userId: req.user?.userId,
      });
      return res.status(500).json({
        error: 'Internal server error',
        code: 'MISSING_MEMBERSHIP',
      });
    }

    if (ROLE_RANK[userRole] < ROLE_RANK[minRole]) {
      logger.debug('Permission denied', {
        userId: req.user.userId,
        userRole,
        requiredRole: minRole,
        path: req.path,
      });
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

module.exports = requireRole;
