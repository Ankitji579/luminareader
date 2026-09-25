const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

code = code.replace(
  /<article key=\{ch\.id \|\| idx\} className="space-y-6"/,
  '<article id={`chapter-container-${idx}`} key={ch.id || idx} className="space-y-6"'
);
code = code.replace(
  /<article className="space-y-6">/,
  '<article id={`chapter-container-${currentChapterIndex}`} className="space-y-6">'
);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
