/** Core domain types for SyncBoard */

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

/** Workspace roles */
export type Role = 'viewer' | 'member' | 'admin';

/** Card in a Kanban board */
export interface Card {
  _id: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  assignees: string[];
  order: string;
  createdAt: string;
  updatedAt: string;
}

/** List (column) in a board */
export interface List {
  _id: string;
  boardId: string;
  title: string;
  order: string;
  cards: Card[];
}

/** Board */
export interface Board {
  _id: string;
  workspaceId: string;
  title: string;
  lists: List[];
}

/** Workspace member */
export interface WorkspaceMember {
  userId: string;
  role: Role;
  joinedAt: string;
  user?: User;
}

/** Workspace */
export interface Workspace {
  _id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
}
