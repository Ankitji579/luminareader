const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const targetStr = `          \`}</style>
        </div>
      ) : null}`;

const newStr = `          \`}</style>
        </div>
      ) : null}
      
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
      )}`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
