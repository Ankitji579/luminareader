const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Remove from inside the component
code = code.replace(/type PersistentHighlight = \{\n\s+id: string;\n\s+chapterIndex: number;\n\s+startOffset: number;\n\s+endOffset: number;\n\s+colorId: string;\n\s+\};\n/, '');

// Add to the top of the file
const topType = `
type PersistentHighlight = {
  id: string;
  chapterIndex: number;
  startOffset: number;
  endOffset: number;
  colorId: string;
};
`;

code = code.replace(/import \{.*?\} from "lucide-react";/, match => match + '\n' + topType);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
