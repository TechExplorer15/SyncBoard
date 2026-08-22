/**
 * Auth hook — provides typed dispatch and selectors for auth actions.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  clearError,
  selectAuth,
} from '../store/slices/authSlice';
import type { LoginCredentials, RegisterCredentials } from '../types';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);

  return {
    ...auth,
    login: (credentials: LoginCredentials) => dispatch(loginUser(credentials)),
    register: (credentials: RegisterCredentials) => dispatch(registerUser(credentials)),
    logout: () => dispatch(logoutUser()),
    refresh: () => dispatch(refreshToken()),
    clearError: () => dispatch(clearError()),
  };
}
