const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Remove the tracking effect from its current location
code = code.replace(
  /\/\/ Track chapter progress\n\s+useEffect\(\(\) => \{\n\s+if \(isReading && fileName\) \{\n\s+localStorage\.setItem\(\`lumina_prog_\$\{fileName\}\`, JSON\.stringify\(\{ chapterIndex: currentChapterIndex \}\)\);\n\s+\}\n\s+\}, \[currentChapterIndex, isReading, fileName\]\);\n\s+/m,
  ''
);

// Add it near the end of the state declarations (e.g., near setVerticalProgress)
code = code.replace(
  'const [verticalProgress, setVerticalProgress] = useState(0);',
  `// Track chapter progress
  useEffect(() => {
    if (isReading && fileName) {
      localStorage.setItem(\`lumina_prog_\${fileName}\`, JSON.stringify({ chapterIndex: currentChapterIndex }));
    }
  }, [currentChapterIndex, isReading, fileName]);
  
  const [verticalProgress, setVerticalProgress] = useState(0);`
);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
