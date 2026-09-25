const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Add pdfModePrompt state
code = code.replace(
  /const \[currentFile, setCurrentFile\] = useState<File \| Blob \| null>\(null\);/,
  `const [currentFile, setCurrentFile] = useState<File | Blob | null>(null);\n  const [pdfModePrompt, setPdfModePrompt] = useState<File | null>(null);`
);

// 2. Replace processFile signature and add the intercept
const processFileTarget = `const processFile = async (f: File, fromLibrary = false) => {
    if (!fromLibrary) saveToLibrary(f, f.name);`;

const processFileNew = `const processFile = async (f: File, fromLibrary = false, forcePdfMode?: 'original' | 'text') => {
    const extRaw = f.name.split(".").pop()?.toLowerCase() || "";
    if (extRaw === "pdf" && !forcePdfMode) {
      setPdfModePrompt(f);
      return;
    }
    
    if (!fromLibrary) saveToLibrary(f, f.name);`;

code = code.replace(processFileTarget, processFileNew);

// 3. Update setFileType
code = code.replace(
  /setFileType\(ext\);/,
  `setFileType(ext === "pdf" && forcePdfMode === "text" ? "pdf-text" : ext);`
);

// 4. Update the pdf parsing block
const pdfLogicRegex = /\} else if \(ext === "pdf"\) \{[\s\S]*?setLoading\(false\);\n\s+\} else \{/;

const pdfLogicNew = `} else if (ext === "pdf" && forcePdfMode === "original") {
        setCurrentFile(f);
        const url = URL.createObjectURL(f);
        setPdfUrl(url);
        setBookTitle(f.name.replace(/\\.[^/.]+$/, ""));
        setBookAuthor("PDF Document");
        setChapters([]);
        setToc([]);
        setIsReading(true);
        setLoading(false);
      } else if (ext === "pdf" && forcePdfMode === "text") {
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== "undefined") {
          const workerUrl = \`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.js\`;
          const blob = new Blob([\`importScripts('\${workerUrl}');\`], { type: 'text/javascript' });
          pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(blob));
        }
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        const tempChapters = [];
        const tempToc = [];
        const tempPathMap = {};
        
        let currentChunk = "";
        let chunkIndex = 0;
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => (item).str || "").join(" ");
            
            currentChunk += textItems + "<br/><br/>";
            
            if (i % 10 === 0 || i === pdf.numPages) {
                chunkIndex++;
                const chTitle = \`Section \${chunkIndex} (Pages \${i - (i % 10 === 0 ? 9 : (i % 10) - 1)}-\${i})\`;
                
                tempChapters.push({
                   id: \`pdf-sec-\${chunkIndex}\`,
                   fullPath: \`pdf-sec-\${chunkIndex}\`,
                   fileName: \`pdf-sec-\${chunkIndex}\`,
                   title: chTitle,
                   html: currentChunk,
                   textLength: currentChunk.length
                });
                tempToc.push({ label: chTitle, chapterIndex: chunkIndex - 1 });
                tempPathMap[\`pdf-sec-\${chunkIndex}\`] = chunkIndex - 1;
                currentChunk = "";
            }
        }
        
        setBookTitle(f.name.replace(/\\.[^/.]+$/, ""));
        setBookAuthor("PDF (Text Mode)");
        setChapters(tempChapters.length > 0 ? tempChapters : [{ id: "c1", title: "Empty", html: "No text found", textLength: 0, fullPath: "c1", fileName: "c1" }]);
        setToc(tempToc);
        setPathMap(tempPathMap);
        
        const savedProg = localStorage.getItem(\`lumina_prog_\${f.name}\`);
        if (savedProg) {
          try {
            setCurrentChapterIndex(JSON.parse(savedProg).chapterIndex || 0);
          } catch(e) { setCurrentChapterIndex(0); }
        } else {
          setCurrentChapterIndex(0);
        }
        setIsReading(true);
        setLoading(false);
      } else {`;

code = code.replace(pdfLogicRegex, pdfLogicNew);


// 5. Inject the PDF Mode Modal UI at the very bottom of the render block (before final closing div)
const modalUI = `
      {/* ── PDF MODE PROMPT MODAL ────────────────────────────────────────── */}
      {pdfModePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-fade-in border border-slate-200 dark:border-slate-800">
             <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">How to open PDF?</h3>
             <div className="space-y-4">
               <button 
                 onClick={() => { processFile(pdfModePrompt, false, 'text'); setPdfModePrompt(null); }} 
                 className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-lg bg-slate-50 dark:bg-slate-800/50 group"
               >
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Type className="w-5 h-5" /></div>
                   <div className="font-bold text-lg text-slate-900 dark:text-white">Text Mode</div>
                 </div>
                 <div className="text-sm text-slate-500 dark:text-slate-400 ml-11">Extracts text for custom fonts, themes, highlighting, and dictionary. (Original layout is removed). Best for novels.</div>
               </button>
               <button 
                 onClick={() => { processFile(pdfModePrompt, false, 'original'); setPdfModePrompt(null); }} 
                 className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg bg-slate-50 dark:bg-slate-800/50 group"
               >
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
                   <div className="font-bold text-lg text-slate-900 dark:text-white">Original Mode</div>
                 </div>
                 <div className="text-sm text-slate-500 dark:text-slate-400 ml-11">Preserves exact visual layout, columns, images, and tables perfectly. (No custom fonts). Best for textbooks.</div>
               </button>
             </div>
             <button onClick={() => setPdfModePrompt(null)} className="w-full py-3 text-center font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n\}$/, modalUI);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
