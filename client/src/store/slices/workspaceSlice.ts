/**
 * Workspace Redux Slice
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Workspace } from '../../types';
import api from '../../lib/axios';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,
};

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/workspaces');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to fetch workspaces' });
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/createWorkspace',
  async ({ name }: { name: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/workspaces', { name });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to create workspace' });
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearWorkspaceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Error fetching workspaces';
      })
      .addCase(createWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces.push(action.payload);
      })
      .addCase(createWorkspace.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Error creating workspace';
      });
  },
});

export const { clearWorkspaceError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
