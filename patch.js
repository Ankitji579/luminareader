const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Replace handleTextMouseUp to use executeBubbleTranslation for multi-word
code = code.replace(
  /const words = selStr\.split\(\/\\s\+\/\)\.filter\(w => w\.trim\(\)\.length > 0\);[\s\S]*?executeBubbleTranslation\(selStr, y > winH \* 0\.55\);\n    }\n  \};/,
  `const words = selStr.split(/\\s+/).filter(w => w.trim().length > 0);
    
    // Save the selection range BEFORE React state update collapses it
    savedRangeRef.current = range;
    const winH = window.innerHeight;
    const y = e.clientY;

    if (words.length === 1) {
      // SINGLE WORD: Dictionary
      const clean = words[0].replace(/[^a-zA-Z]/g, "").trim();
      if (clean && clean.length >= 2) {
        setIsMultiWord(false);
        executeBubbleLookup(clean, y > winH * 0.55);
      }
    } else if (words.length > 1) {
      // MULTI WORD: Translation
      setIsMultiWord(true);
      executeBubbleTranslation(selStr, y > winH * 0.55);
    }
  };`
);

// We need to alter the toolbar JSX to remove text labels from buttons.
// Button 1: Flip Pages -> <BookOpen> or <MoveHorizontal> without the text
code = code.replace(/<span className="hidden sm:inline">Flip<br \/>Pages<\/span>/, "");
// Button 2: Dictionary -> remove text
code = code.replace(/<span className="hidden sm:inline">Dictionary<\/span>/, "");
// Button 3: Bookmarks -> remove text
code = code.replace(/<span className="hidden sm:inline">Bookmarks<br \/>\(\{bookmarks.length\}\)<\/span>/, '<span className="text-[10px] font-bold">({bookmarks.length})</span>');

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
