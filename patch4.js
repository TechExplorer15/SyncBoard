const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/store/slices/boardSlice.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the entire thunk
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
`;

content = content.replace(oldThunkRegex, newThunk);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed moveCardThunk!');
