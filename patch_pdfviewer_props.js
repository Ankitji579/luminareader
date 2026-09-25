const fs = require('fs');
let code = fs.readFileSync('components/reader/PdfViewer.tsx', 'utf8');

// Remove next-themes from PdfViewer
code = code.replace(/import \{ useTheme \} from 'next-themes';\n/g, '');

// Change signature to accept isDark
code = code.replace(
  /export default function PdfViewer\(\{ file, zoomScale \}: \{ file: File \| Blob; zoomScale: number \}\) \{/,
  `export default function PdfViewer({ file, zoomScale, isDark }: { file: File | Blob; zoomScale: number; isDark: boolean }) {`
);

// Remove the local isDark calculation inside PdfViewer
code = code.replace(
  /  const \{ theme, systemTheme \} = useTheme\(\);\n  const \[mounted, setMounted\] = useState\(false\);\n  useEffect\(\(\) => setMounted\(true\), \[\]\);\n  const isDark = mounted && \(theme === "dark" \|\| \(theme === "system" && systemTheme === "dark"\)\);\n/g,
  ``
);

fs.writeFileSync('components/reader/PdfViewer.tsx', code);
