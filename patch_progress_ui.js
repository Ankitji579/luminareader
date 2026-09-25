const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const oldRegex = /\{\/\* ── CHAPTER PROGRESS BAR \(Top Edge\) ── \*\/\}\n\s+<div className="absolute bottom-0 left-0 right-0 h-1 z-40 overflow-hidden" style=\{\{ background: T.toolbarBorder \}\}>\n\s+<div \n\s+className="h-full transition-all duration-150 ease-out"\n\s+style=\{\{ \n\s+width: \`\$\{chapterProgress\}%\`, \n\s+background: T.panelAccent,\n\s+boxShadow: \`0 0 10px \$\{T.panelAccent\}\`\n\s+\}\} \n\s+\/>\n\s+<\/div>/;

const newUI = `{/* ── TOP TOOLBAR ─────────────────────────────────────────────── */}`;

// Wait, I need to remove it from inside the toolbar and place it AFTER the toolbar.
// Let's replace the whole Top Toolbar block carefully.

code = code.replace(oldRegex, ''); // Remove the inner one

const insertRegex = /\{\/\* ── MAIN VIEWPORT ──────────────────────────────────────────── \*\/\}/;
const replacement = `{/* ── CHAPTER PROGRESS BAR (Top Edge) ── */}
          <div className="w-full h-1.5 z-40 relative" style={{ background: T.toolbarBg }}>
            <div 
              className="h-full transition-all duration-150 ease-out rounded-r-full"
              style={{ 
                width: \`\${chapterProgress}%\`, 
                background: T.panelAccent,
                boxShadow: \`0 0 12px \${T.panelAccent}, 0 0 4px \${T.panelAccent}\`
              }} 
            />
          </div>

          {/* ── MAIN VIEWPORT ──────────────────────────────────────────── */}`;

code = code.replace(insertRegex, replacement);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
