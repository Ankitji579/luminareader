const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Add imports
if (!code.includes('import localforage')) {
  code = code.replace(
    /import \{ useState, useEffect, useRef, useCallback \} from "react";/,
    `import { useState, useEffect, useRef, useCallback } from "react";\nimport localforage from "localforage";\nimport { Clock, Trash2, Library, Save } from "lucide-react";`
  );
}

// 2. Add library state and effects
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
        // Mock a File object if it's just a Blob
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

code = code.replace('const [bookAuthor, setBookAuthor] = useState("");', 'const [bookAuthor, setBookAuthor] = useState("");\n  ' + libraryState);

// 3. Update processFile signature and logic
const oldProcess = /const processFile = async \(f: File\) => \{/;
const newProcess = `const processFile = async (f: File, fromLibrary = false) => {
    if (!fromLibrary) saveToLibrary(f, f.name);`;

code = code.replace(oldProcess, newProcess);

// 4. Restore progress inside processFile
code = code.replace(/setCurrentChapterIndex\(0\);/g, `
        const savedProg = localStorage.getItem(\`lumina_prog_\${f.name}\`);
        if (savedProg) {
          try {
            setCurrentChapterIndex(JSON.parse(savedProg).chapterIndex || 0);
          } catch(e) { setCurrentChapterIndex(0); }
        } else {
          setCurrentChapterIndex(0);
        }
`);

// 5. Inject Library UI below the dropzone
const dropzoneEndRegex = /<div className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500 shrink-0" \/><span\>Kindle Flip, Vertical Scroll & 116 Fonts<\/span><\/div>\n\s+<\/div>\n\s+<\/div>\n\s+<\/div>\n\s+\) \: null\}/;

const libraryUI = `<div className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500 shrink-0" /><span>Kindle Flip, Vertical Scroll & 116 Fonts</span></div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── MY LIBRARY ──────────────────────────────────────────────────────── */}
      {!isReading && !loading && library.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8 mb-16 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 px-2 text-slate-800 dark:text-slate-200">
            <Library className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold">My Local Library</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {library.map((book) => {
              const progRaw = typeof window !== "undefined" ? localStorage.getItem(\`lumina_prog_\${book.name}\`) : null;
              let chapProg = 0;
              if (progRaw) {
                try { chapProg = JSON.parse(progRaw).chapterIndex; } catch(e) {}
              }
              
              return (
                <div 
                  key={book.id} 
                  onClick={() => loadFromLibrary(book.name)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-16 shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center text-indigo-500 font-bold uppercase text-xs overflow-hidden">
                    {book.name.split('.').pop()}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={book.name}>{book.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(book.addedAt).toLocaleDateString()}</span>
                      {chapProg > 0 && <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-medium"><Save className="w-3 h-3" /> Ch {chapProg + 1}</span>}
                    </div>
                  </div>
                  <button onClick={(e) => removeFromLibrary(book.name, e)} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all" title="Remove from device">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}`;

code = code.replace(dropzoneEndRegex, libraryUI);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
