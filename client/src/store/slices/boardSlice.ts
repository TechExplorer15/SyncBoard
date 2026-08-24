/**
 * Board Redux Slice
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Board, ActiveUser } from '../../types';
import api from '../../lib/axios';

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  activeUsers: ActiveUser[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  activeBoard: null,
  activeUsers: [],
  isLoading: false,
  error: null,
};

export const fetchWorkspaceBoards = createAsyncThunk(
  'board/fetchWorkspaceBoards',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/workspaces/${workspaceId}/boards`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to fetch boards' });
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async ({ workspaceId, title }: { workspaceId: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/workspaces/${workspaceId}/boards`, { title });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to create board' });
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/boards/${boardId}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to fetch board details' });
    }
  }
);

export const createList = createAsyncThunk(
  'board/createList',
  async ({ boardId, title }: { boardId: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/boards/${boardId}/lists`, { title });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to create list' });
    }
  }
);

export const createCard = createAsyncThunk(
  'board/createCard',
  async ({ boardId, listId, title }: { boardId: string; listId: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/boards/${boardId}/lists/${listId}/cards`, { title });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to create card' });
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    clearActiveBoard: (state) => {
      state.activeBoard = null;
      state.activeUsers = [];
    },
    // Real-time Event Reducers
    listCreated: (state, action) => {
      if (state.activeBoard && state.activeBoard._id === action.payload.boardId) {
        // Prevent duplicates
        const exists = state.activeBoard.lists.find(l => l._id === action.payload._id);
        if (!exists) {
          state.activeBoard.lists.push({ ...action.payload, cards: [] });
        }
      }
    },
    listDeleted: (state, action) => {
      if (state.activeBoard && state.activeBoard._id === action.payload.boardId) {
        state.activeBoard.lists = state.activeBoard.lists.filter(l => l._id !== action.payload.listId);
      }
    },
    cardCreated: (state, action) => {
      if (state.activeBoard && state.activeBoard._id === action.payload.boardId) {
        const list = state.activeBoard.lists.find(l => l._id === action.payload.listId);
        if (list) {
          const exists = list.cards.find(c => c._id === action.payload._id);
          if (!exists) list.cards.push(action.payload);
        }
      }
    },
    cardUpdated: (state, action) => {
      if (state.activeBoard && state.activeBoard._id === action.payload.boardId) {
        const list = state.activeBoard.lists.find(l => l._id === action.payload.listId);
        if (list) {
          const cardIndex = list.cards.findIndex(c => c._id === action.payload._id);
          if (cardIndex !== -1) {
            list.cards[cardIndex] = { ...list.cards[cardIndex], ...action.payload };
          }
        }
      }
    },
    cardMoved: (state, action) => {
      if (state.activeBoard && state.activeBoard._id === action.payload.boardId) {
        // Remove from old list
        for (const list of state.activeBoard.lists) {
          const idx = list.cards.findIndex(c => c._id === action.payload._id);
          if (idx !== -1) {
            list.cards.splice(idx, 1);
            break;
          }
        }
        
        // Add to new list and sort by order
        const targetList = state.activeBoard.lists.find(l => l._id === action.payload.listId);
        if (targetList) {
          targetList.cards.push(action.payload);
          targetList.cards.sort((a, b) => {
            if (a.order === b.order) return a._id.localeCompare(b._id);
            return a.order.localeCompare(b.order);
          });
        }
      }
    },
    cardDeleted: (state, action) => {
      if (state.activeBoard && state.activeBoard._id === action.payload.boardId) {
        const list = state.activeBoard.lists.find(l => l._id === action.payload.listId);
        if (list) {
          list.cards = list.cards.filter(c => c._id !== action.payload.cardId);
        }
      }
    },
    presenceUpdated: (state, action) => {
      state.activeUsers = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Workspace Boards
      .addCase(fetchWorkspaceBoards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = action.payload;
      })
      .addCase(fetchWorkspaceBoards.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Error fetching boards';
      })
      
      // Create Board
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Error creating board';
      })
      
      // Fetch Active Board
      .addCase(fetchBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeBoard = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Error fetching board';
      })
      
      // Create List
      .addCase(createList.fulfilled, (state, action) => {
        if (state.activeBoard) {
          state.activeBoard.lists.push(action.payload);
        }
      })
      
      // Create Card
      .addCase(createCard.fulfilled, (state, action) => {
        if (state.activeBoard) {
          const list = state.activeBoard.lists.find(l => l._id === action.payload.listId);
          if (list) {
            if (!list.cards) {
              list.cards = [];
            }
            list.cards.push(action.payload);
          }
        }
      });
  },
});

export const { 
  clearBoardError, 
  clearActiveBoard,
  listCreated,
  listDeleted,
  cardCreated,
  cardUpdated,
  cardMoved,
  cardDeleted,
  presenceUpdated
} = boardSlice.actions;
export default boardSlice.reducer;
