const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Remove the library section HTML
const libRegex = /\{\/\* ── CONTINUE READING & MY LIBRARY ──────────────────────────────────── \*\/\}[\s\S]*?\{\/\* ── READING MODE ─────────────────────────────────────────────────── \*\//i;
code = code.replace(libRegex, '{/* ── READING MODE ─────────────────────────────────────────────────── */}');

// 2. Add useEffect to read sessionStorage on mount and load book
const effectRegex = /const \[currentChapterIndex, setCurrentChapterIndex\] = useState<number>\(0\);/;
const effectNew = `const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  // Auto-load book from library redirect
  useEffect(() => {
    const bookToLoad = sessionStorage.getItem("lumina_load_book");
    if (bookToLoad) {
      sessionStorage.removeItem("lumina_load_book");
      loadFromLibrary(bookToLoad);
    }
  }, []);`;
code = code.replace(effectRegex, effectNew);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
