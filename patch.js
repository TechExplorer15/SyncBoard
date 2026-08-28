const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/store/slices/boardSlice.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. activeCardId to state
content = content.replace(
  'activeUsers: ActiveUser[];',
  'activeUsers: ActiveUser[];\n  activeCardId: string | null;'
);
content = content.replace(
  'activeUsers: [],',
  'activeUsers: [],\n  activeCardId: null,'
);

// 2. fix PUT to PATCH
content = content.replace(
  'api.put(`/api/boards/${boardId}/lists/${listId}/cards/${cardId}/move`',
  'api.patch(`/api/cards/${cardId}/move`'
);

// 3. Add thunks
const thunks = `
export const updateCardThunk = createAsyncThunk(
  'board/updateCard',
  async ({ cardId, title, description }: { cardId: string; title?: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(\`/api/cards/\${cardId}\`, { title, description });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to update card' });
    }
  }
);

export const deleteCardThunk = createAsyncThunk(
  'board/deleteCard',
  async (cardId: string, { rejectWithValue }) => {
    try {
      await api.delete(\`/api/cards/\${cardId}\`);
      return cardId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to delete card' });
    }
  }
);

const boardSlice = createSlice({`;
content = content.replace('const boardSlice = createSlice({', thunks);

// 4. reducers
const reducers = `
    clearActiveBoard: (state) => {
      state.activeBoard = null;
      state.activeUsers = [];
      state.activeCardId = null;
    },
    openCardModal: (state, action) => {
      state.activeCardId = action.payload;
    },
    closeCardModal: (state) => {
      state.activeCardId = null;
    },
    // Real-time Event Reducers`;
content = content.replace(
  `    clearActiveBoard: (state) => {\n      state.activeBoard = null;\n      state.activeUsers = [];\n    },\n    // Real-time Event Reducers`,
  reducers
);

// 5. extraReducers builder for deleteCardThunk
content = content.replace(
  `      });\n  },\n});`,
  `      })\n      .addCase(deleteCardThunk.fulfilled, (state, action) => {\n        if (state.activeCardId === action.payload) {\n          state.activeCardId = null;\n        }\n      });\n  },\n});`
);

// 6. exports
content = content.replace(
  `  clearBoardError, clearActiveBoard,\n  listCreated, listDeleted,`,
  `  clearBoardError, clearActiveBoard,\n  openCardModal, closeCardModal,\n  listCreated, listDeleted,`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
