const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Insert the load logic when book changes
code = code.replace(
  /useEffect\(\(\) => \{\n    if \(isReading\) \{\n      \/\/ Reset states for new book/,
  `useEffect(() => {
    if (typeof window !== "undefined" && bookTitle) {
      const savedHl = localStorage.getItem(\`lumina_hl_\${bookTitle}\`);
      if (savedHl) {
        try {
          customHighlightsRef.current = JSON.parse(savedHl);
        } catch (e) {}
      } else {
        customHighlightsRef.current = [];
      }
    }
  }, [bookTitle]);

  useEffect(() => {
    if (isReading) {
      // Reset states for new book`
);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
