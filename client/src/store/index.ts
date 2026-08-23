/**
 * Redux store configuration for SyncBoard.
 * Wires up token accessor/refresher for the axios interceptor.
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { selectAccessToken, refreshToken } from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import boardReducer from './slices/boardSlice';
import { setTokenAccessor, setTokenRefresher } from '../lib/axios';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    board: boardReducer,
  },
});

// Wire up axios interceptors to read/refresh tokens from the store
setTokenAccessor(() => selectAccessToken(store.getState()));
setTokenRefresher(async () => {
  const result = await store.dispatch(refreshToken());
  if (refreshToken.fulfilled.match(result)) {
    return result.payload.accessToken;
  }
  return null;
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
