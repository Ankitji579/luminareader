const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const oldRegex = /\{\/\* ── CHAPTER PROGRESS BAR \(Top Edge\) ── \*\/\}\n\s+<div className="w-full h-1\.5 z-40 relative" style=\{\{ background: T\.toolbarBg \}\}>\n\s+<div \n\s+className="h-full transition-all duration-150 ease-out rounded-r-full"\n\s+style=\{\{ \n\s+width: \`\$\{chapterProgress\}%\`, \n\s+background: T\.panelAccent,\n\s+boxShadow: \`0 0 12px \$\{T\.panelAccent\}, 0 0 4px \$\{T\.panelAccent\}\`\n\s+\}\} \n\s+\/>\n\s+<\/div>/;

const newUI = `{/* ── CHAPTER PROGRESS BAR (Top Edge) ── */}
          <div className="w-full h-1.5 z-40 relative" style={{ background: T.toolbarBg }}>
            <div className="absolute inset-0 opacity-10" style={{ background: T.toolbarText }} />
            <div 
              className="absolute left-0 top-0 h-full transition-all duration-150 ease-out rounded-r-full"
              style={{ 
                width: \`\${chapterProgress}%\`, 
                background: T.panelAccent,
                boxShadow: \`0 0 12px \${T.panelAccent}, 0 0 4px \${T.panelAccent}\`
              }} 
            />
          </div>`;

code = code.replace(oldRegex, newUI);
fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
