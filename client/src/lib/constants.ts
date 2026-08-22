/** Application-wide constants */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/** Routes */
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  BOARD: '/board/:boardId',
  WORKSPACE_SETTINGS: '/workspace/:workspaceId/settings',
} as const;
