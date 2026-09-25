const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

code = code.replace(
  /const customHighlightsRef = useRef<\{ id: string, range: Range, colorId: string \}\[\]>\(\[\]\);/,
  `// Type definition is above this now
  const customHighlightsRef = useRef<PersistentHighlight[]>([]);`
);

// I already added the PersistentHighlight type right above renderCSSHighlights, but I should move it up or just leave it since the type will be lifted.
// Wait, I inserted it right before renderCSSHighlights. Let's make sure it's accessible globally or inside the component. I inserted it inside the component, so it should be fine.

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
