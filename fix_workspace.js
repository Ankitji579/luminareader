const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const oldDropzoneStart = `      {/* ── UPLOAD DROPZONE ─────────────────────────────────────────────────── */}
      {!isReading && !loading && !pdfModePrompt ? (
        <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative group overflow-hidden rounded-[2rem] border border-dashed border-indigo-500/30 dark:border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-10 sm:p-16 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 w-full">`;

const newDropzoneStart = `      {/* ── UPLOAD DROPZONE ─────────────────────────────────────────────────── */}
      {!isReading && !loading && !pdfModePrompt ? (
        <div className="relative w-full rounded-[2.5rem] p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-indigo-500/10">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[100px] rounded-[3rem] -z-10" />
          <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative group overflow-hidden rounded-[2rem] border border-dashed border-indigo-500/30 dark:border-indigo-400/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-10 sm:p-16 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 w-full">`;

const oldDropzoneEnd = `            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <label className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-slate-900/20 dark:shadow-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                <UploadCloud className="w-5 h-5" /><span>Select File</span>
                <input type="file" accept=".epub,.pdf,.mobi,.azw3,.fb2,.cbz,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              
              <button onClick={loadDemoBook} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 hover:border-indigo-500/50 hover:text-slate-900 dark:hover:text-white">
                <Sparkles className="w-5 h-5 text-indigo-500" /><span>Try Demo Book</span>
              </button>
            </div>
            
          </div>
        </div>
      ) : null}`;

const newDropzoneEnd = `            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <label className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-slate-900/20 dark:shadow-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                <UploadCloud className="w-5 h-5" /><span>Select File</span>
                <input type="file" accept=".epub,.pdf,.mobi,.azw3,.fb2,.cbz,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              
              <button onClick={loadDemoBook} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 hover:border-indigo-500/50 hover:text-slate-900 dark:hover:text-white">
                <Sparkles className="w-5 h-5 text-indigo-500" /><span>Try Demo Book</span>
              </button>
            </div>
            
          </div>
        </div>
        </div>
      ) : null}`;

code = code.replace(oldDropzoneStart, newDropzoneStart);
code = code.replace(oldDropzoneEnd, newDropzoneEnd);
fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
