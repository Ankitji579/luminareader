const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// The exact string to replace:
const target1 = 'setChapterProgress(max <= 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / max) * 100)));';
const replacement1 = 'if (chapterProgressRef.current) chapterProgressRef.current.style.width = (max <= 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / max) * 100))) + "%";';
code = code.replace(target1, replacement1);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
