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
const oldThunkRegex = /export const moveCardThunk = createAsyncThunk\([\s\S]*?\}\n\);\n/g;
const newThunk = `export const moveCardThunk = createAsyncThunk(
  'board/moveCard',
  async ({ cardId, targetListId, prevOrder, nextOrder }: { 
    cardId: string; targetListId: string; prevOrder: string | null; nextOrder: string | null;
  }, { rejectWithValue }) => {
    try {
      const response = await api.patch(\`/api/cards/\${cardId}/move\`, {
        targetListId, prevOrder, nextOrder
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { error: 'Failed to move card' });
    }
  }
);

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
`;
content = content.replace(oldThunkRegex, newThunk);


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
  /clearActiveBoard: \(state\) => \{\n\s*state\.activeBoard = null;\n\s*state\.activeUsers = \[\];\n\s*\},\n\s*\/\/ Real-time Event Reducers/,
  reducers
);

// 5. extraReducers builder for deleteCardThunk
content = content.replace(
  `      });\n  },\n});`,
  `      })\n      .addCase(deleteCardThunk.fulfilled, (state, action) => {\n        if (state.activeCardId === action.payload) {\n          state.activeCardId = null;\n        }\n      });\n  },\n});`
);

// 6. exports
content = content.replace(
  `export const { \n  clearBoardError, \n  clearActiveBoard,\n  listCreated,`,
  `export const { \n  clearBoardError, \n  clearActiveBoard,\n  openCardModal,\n  closeCardModal,\n  listCreated,`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Final patch complete!');
