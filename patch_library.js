const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Add localforage import
if (!code.includes('import localforage')) {
  code = code.replace(
    /import \{ useState, useEffect, useRef, useCallback \} from "react";/,
    `import { useState, useEffect, useRef, useCallback } from "react";\nimport localforage from "localforage";\nimport { Clock, Trash2, Library } from "lucide-react";`
  );
}

// 1. Add Library State
const stateInjection = `const [library, setLibrary] = useState<{ id: string, name: string, addedAt: number, progress?: number, lastChapter?: number }[]>([]);

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

  const saveLibrary = (newLib: any[]) => {
    setLibrary(newLib);
    localStorage.setItem("lumina_library", JSON.stringify(newLib));
  };
`;
code = code.replace('const [bookAuthor, setBookAuthor] = useState("");', 'const [bookAuthor, setBookAuthor] = useState("");\n  ' + stateInjection);


// 2. Modify processFile to handle saving to library
const oldProcessFileRegex = /const processFile = async \(f: File\) => \{\n\s+setLoading\(true\);\n\s+setFileName\(f\.name\);\n\s+const ext = f\.name\.split\("\."\)\.pop\(\)\?\.toLowerCase\(\) \|\| "";\n\s+setFileType\(ext\);/;

const newProcessFileStart = `const openBookBuffer = async (buffer: ArrayBuffer, name: string, ext: string, skipSave = false) => {
    setLoading(true);
    setFileName(name);
    setFileType(ext);
    try {
      if (!skipSave) {
        await localforage.setItem(\`book_buffer_\${name}\`, buffer);
        setLibrary(prev => {
          const exists = prev.find(p => p.name === name);
          if (exists) return prev;
          const newLib = [{ id: name, name, addedAt: Date.now() }, ...prev];
          localStorage.setItem("lumina_library", JSON.stringify(newLib));
          return newLib;
        });
      }

      if (ext === "epub") {
        const parsed = await parseEpubArchive(buffer, name);
        setBookTitle(parsed.title || name);
        setBookAuthor(parsed.author || "");
        setChapters(parsed.chapters);
        setToc(parsed.toc);
        setPathMap(parsed.pathMap);
        
        // Restore progress
        const savedProg = localStorage.getItem(\`lumina_progress_\${name}\`);
        if (savedProg) {
           const { chapterIndex } = JSON.parse(savedProg);
           setCurrentChapterIndex(chapterIndex || 0);
        } else {
           setCurrentChapterIndex(0);
        }
        
        setIsReading(true);
        setLoading(false);
      } else {
        // Fallback for TXT/etc if needed (omitted for brevity, assume similar structure or just focus on EPUB)
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer);
        // ... rest of TXT parsing ...
`;
// Wait, replacing processFile completely is tricky because of the TXT parsing logic.
// I will just inject right into `processFile` instead.
