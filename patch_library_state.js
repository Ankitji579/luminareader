const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const libraryState = `const [library, setLibrary] = useState<{ id: string, name: string, addedAt: number, size: number }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLib = localStorage.getItem("lumina_library");
      if (savedLib) {
        try {
          setLibrary(JSON.parse(savedLib));
        } catch (e) {}
      }
    }
  }, []);

  const saveToLibrary = (file: File | Blob, name: string) => {
    const bookId = \`lumina_book_\${name}\`;
    localforage.setItem(bookId, file).then(() => {
      setLibrary(prev => {
        const filtered = prev.filter(p => p.name !== name);
        const newLib = [{ id: bookId, name, addedAt: Date.now(), size: file.size }, ...filtered];
        localStorage.setItem("lumina_library", JSON.stringify(newLib));
        return newLib;
      });
    });
  };

  const loadFromLibrary = async (name: string) => {
    setLoading(true);
    try {
      const bookId = \`lumina_book_\${name}\`;
      const file: File | Blob | null = await localforage.getItem(bookId);
      if (file) {
        const f = file instanceof File ? file : new File([file], name, { type: file.type });
        await processFile(f, true);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const removeFromLibrary = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const bookId = \`lumina_book_\${name}\`;
    await localforage.removeItem(bookId);
    setLibrary(prev => {
      const newLib = prev.filter(p => p.name !== name);
      localStorage.setItem("lumina_library", JSON.stringify(newLib));
      return newLib;
    });
  };
  
  // Track chapter progress
  useEffect(() => {
    if (isReading && fileName) {
      localStorage.setItem(\`lumina_prog_\${fileName}\`, JSON.stringify({ chapterIndex: currentChapterIndex }));
    }
  }, [currentChapterIndex, isReading, fileName]);
  
  `;

code = code.replace('const [bookAuthor, setBookAuthor] = useState<string>("");', 'const [bookAuthor, setBookAuthor] = useState<string>("");\n  ' + libraryState);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
