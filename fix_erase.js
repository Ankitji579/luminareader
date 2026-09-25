const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Remove the old eraseHighlights function
const oldEraseRegex = /const eraseHighlights = useCallback\(\(range: Range\) => \{\n\s+\/\/ Find all highlights that intersect with the erased range[\s\S]*?return !intersects; \/\/ KEEP highlights that DO NOT intersect\n\s+\}\);\n\n\s+renderCSSHighlights\(\);\n\s+\}, \[renderCSSHighlights\]\);/;

code = code.replace(oldEraseRegex, "");

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
