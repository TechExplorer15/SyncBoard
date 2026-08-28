const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/store/slices/boardSlice.ts');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /async \(\{ boardId, listId, cardId, targetListId, prevOrder, nextOrder \}: \{ \n\s*boardId: string; listId: string; cardId: string; targetListId: string; prevOrder: string \| null; nextOrder: string \| null;\n\s*\}\, \{ rejectWithValue \}\) => \{/,
  'async ({ cardId, targetListId, prevOrder, nextOrder }: { \n    cardId: string; targetListId: string; prevOrder: string | null; nextOrder: string | null;\n  }, { rejectWithValue }) => {'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done fixing args again!');
