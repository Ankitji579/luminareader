const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const regex = /const savedProg = localStorage\.getItem\(\`lumina_prog_\$\{f\.name\}\`\);\n\s+if \(savedProg\) \{\n\s+try \{\n\s+setCurrentChapterIndex\(JSON\.parse\(savedProg\)\.chapterIndex \|\| 0\);\n\s+\} catch\(e\) \{ setCurrentChapterIndex\(0\); \}\n\s+\} else \{\n\s+setCurrentChapterIndex\(0\);\n\s+\}/g;

let count = 0;
code = code.replace(regex, (match) => {
  count++;
  if (count === 4) {
    // 4th match is in loadDemoBook
    return 'setCurrentChapterIndex(0);';
  }
  return match;
});

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
