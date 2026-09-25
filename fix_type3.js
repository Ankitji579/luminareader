const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const typeDef = `
type PersistentHighlight = {
  id: string;
  chapterIndex: number;
  startOffset: number;
  endOffset: number;
  colorId: string;
};
`;

code = typeDef + '\\n' + code;

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
