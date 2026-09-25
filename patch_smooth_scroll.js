const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Add chapterProgressRef and remove chapterProgress state
code = code.replace(
  /const \[chapterProgress, setChapterProgress\] = useState\(0\);/,
  `const chapterProgressRef = useRef<HTMLDivElement>(null);`
);

// 2. Update the JSX for the progress bar
const oldUIRegex = /<div \n\s+className="absolute left-0 top-0 h-full transition-all duration-150 ease-out rounded-r-full"\n\s+style=\{\{ \n\s+width: \`\$\{chapterProgress\}%\`, \n\s+background: T\.panelAccent,\n\s+boxShadow: \`0 0 12px \$\{T\.panelAccent\}, 0 0 4px \$\{T\.panelAccent\}\`\n\s+\}\} \n\s+\/>/;

const newUI = `<div 
              ref={chapterProgressRef}
              className="absolute left-0 top-0 h-full rounded-r-full will-change-[width]"
              style={{ 
                width: "0%", 
                background: T.panelAccent,
                boxShadow: \`0 0 12px \${T.panelAccent}, 0 0 4px \${T.panelAccent}\`
              }} 
            />`;

code = code.replace(oldUIRegex, newUI);

// 3. Update handleScroll logic to use the ref instead of setState
// Replacing the horizontal logic
code = code.replace(
  /setChapterProgress\(max <= 0 \? 100 : Math\.min\(100, Math\.max\(0, \(\(scrollTop \/ max\) \* 100\)\)\)\);/g,
  `if (chapterProgressRef.current) chapterProgressRef.current.style.width = (max <= 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / max) * 100))) + "%";`
);

// Replacing the vertical logic
code = code.replace(
  /setChapterProgress\(progress\);/g,
  `if (chapterProgressRef.current) chapterProgressRef.current.style.width = progress + "%";`
);

code = code.replace(
  /if \(!found\) setChapterProgress\(0\);/g,
  `if (!found && chapterProgressRef.current) chapterProgressRef.current.style.width = "0%";`
);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
