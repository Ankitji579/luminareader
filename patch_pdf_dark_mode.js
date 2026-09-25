const fs = require('fs');
let code = fs.readFileSync('components/reader/PdfViewer.tsx', 'utf8');

// 1. Add useTheme import
if (!code.includes('import { useTheme }')) {
  code = code.replace(
    /import React, \{ useEffect, useRef, useState \} from 'react';/,
    `import React, { useEffect, useRef, useState } from 'react';\nimport { useTheme } from 'next-themes';`
  );
}

// 2. Add isDark calculation to PdfViewer
code = code.replace(
  /export default function PdfViewer\(\{ file, zoomScale \}: \{ file: File \| Blob; zoomScale: number \}\) \{/,
  `export default function PdfViewer({ file, zoomScale }: { file: File | Blob; zoomScale: number }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "dark" || (theme === "system" && systemTheme === "dark"));`
);

// 3. Pass isDark to PdfPage
code = code.replace(
  /<PdfPage key=\{`page-\$\{index \+ 1\}`\} pdf=\{pdf\} pageNumber=\{index \+ 1\} zoomScale=\{zoomScale\} \/>/g,
  `<PdfPage key={\`page-\${index + 1}\`} pdf={pdf} pageNumber={index + 1} zoomScale={zoomScale} isDark={isDark} />`
);

// 4. Add isDark prop to PdfPage signature
code = code.replace(
  /function PdfPage\(\{ pdf, pageNumber, zoomScale \}: \{ pdf: any; pageNumber: number; zoomScale: number \}\) \{/,
  `function PdfPage({ pdf, pageNumber, zoomScale, isDark }: { pdf: any; pageNumber: number; zoomScale: number; isDark: boolean }) {`
);

// 5. Add filter to Canvas and fix container bg for dark mode
const targetCanvasStr = `  return (
    <div className="bg-white shadow-xl shadow-black/10 overflow-hidden flex items-center justify-center" style={{ minHeight: "800px", minWidth: "600px", maxWidth: "100%" }}>
      <canvas ref={canvasRef} className="block max-w-full" />
    </div>
  );`;

const newCanvasStr = `  return (
    <div className="bg-white dark:bg-[#121212] shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden flex items-center justify-center transition-colors duration-300" style={{ minHeight: "800px", minWidth: "600px", maxWidth: "100%" }}>
      <canvas 
        ref={canvasRef} 
        className="block max-w-full" 
        style={{ 
          filter: isDark ? 'invert(1) hue-rotate(180deg) contrast(1.1) brightness(0.9)' : 'none',
          transition: 'filter 0.3s ease'
        }} 
      />
    </div>
  );`;

code = code.replace(targetCanvasStr, newCanvasStr);

fs.writeFileSync('components/reader/PdfViewer.tsx', code);
