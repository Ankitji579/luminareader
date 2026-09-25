const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const startMarker = '{/* ── MY LIBRARY ──────────────────────────────────────────────────────── */}';
// I need to replace from startMarker down to the end of the library div, which is right before `</div>` and `);` of the render.
// The render ends with `</div>\n  );\n}`.

const startIdx = code.indexOf(startMarker);

if (startIdx !== -1) {
  // Find the exact end of the library block.
  // We can just grab everything from startMarker to the end of the return statement.
  const returnEnd = code.lastIndexOf(');');
  
  const before = code.substring(0, startIdx);
  
  const newLibraryUI = `{/* ── CONTINUE READING & MY LIBRARY ──────────────────────────────────── */}
      {!isReading && !loading && library.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8 mb-16 space-y-8 animate-fade-in">
          
          {/* Continue Reading (Most Recent) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => loadFromLibrary(library[0].name)}>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-indigo-50">
                  <Clock className="w-3.5 h-3.5" /> Continue Reading
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold line-clamp-1">{library[0].name}</h3>
                  <p className="text-indigo-200 text-sm mt-1">
                    {(() => {
                      const prog = typeof window !== "undefined" ? localStorage.getItem(\`lumina_prog_\${library[0].name}\`) : null;
                      if (prog) {
                        try { return \`Pick up exactly where you left off at Chapter \${JSON.parse(prog).chapterIndex + 1}\`; } catch(e){}
                      }
                      return "Pick up exactly where you left off";
                    })()}
                  </p>
                </div>
              </div>
              <button className="shrink-0 px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-95 transition-all">
                Resume Book
              </button>
            </div>
          </div>

          {/* Library Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Library className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold">My Local Library</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {library.length} {library.length === 1 ? "Book" : "Books"} Stored (Up to 5GB Capacity)
              </span>
            </div>
            
            {library.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {library.slice(1).map((book) => {
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
            )}
          </div>
        </div>
      )}
    </div>`;

  code = before + newLibraryUI + '\n  );\n}';
  fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
}
