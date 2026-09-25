const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Add currentFile state
code = code.replace(
  /const \[pdfUrl, setPdfUrl\] = useState<string \| null>\(null\);/,
  `const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | Blob | null>(null);`
);

// 2. Import PdfViewer
code = code.replace(
  /import \{ CheckCircle2, HelpCircle, ArrowLeft, Upload, BookOpen, Sparkles, ShieldCheck, FileText, ChevronDown, AlignLeft, Search, ZoomIn, ZoomOut, Moon, Sun, Monitor, Type, X, Maximize, Settings, AlignCenter, AlignRight, Book, MoveHorizontal, MoveVertical, Highlighter, Eraser, Volume2, Globe, Clock, Trash2, Library, Save \} from "lucide-react";/,
  `import { CheckCircle2, HelpCircle, ArrowLeft, Upload, BookOpen, Sparkles, ShieldCheck, FileText, ChevronDown, AlignLeft, Search, ZoomIn, ZoomOut, Moon, Sun, Monitor, Type, X, Maximize, Settings, AlignCenter, AlignRight, Book, MoveHorizontal, MoveVertical, Highlighter, Eraser, Volume2, Globe, Clock, Trash2, Library, Save } from "lucide-react";
import PdfViewer from "./PdfViewer";`
);

// 3. Update processFile to set currentFile
const pdfLogicTarget = `} else if (ext === "pdf") {
        const url = URL.createObjectURL(f);
        setPdfUrl(url);`;
        
const pdfLogicNew = `} else if (ext === "pdf") {
        setCurrentFile(f);
        const url = URL.createObjectURL(f);
        setPdfUrl(url);`;

code = code.replace(pdfLogicTarget, pdfLogicNew);

// 4. Update the render block to use PdfViewer
const renderTarget = `{fileType === "pdf" && pdfUrl ? (
                   <iframe src={pdfUrl} className="w-full h-full border-none" style={{ minHeight: '85vh' }} title="PDF Viewer" />
                ) : scrollMode === "vertical" ? (`

const renderNew = `{fileType === "pdf" && currentFile ? (
                   <div className="w-full h-full p-4 sm:p-10" style={{ background: T.bg }}>
                     <PdfViewer file={currentFile} zoomScale={zoomScale} />
                   </div>
                ) : scrollMode === "vertical" ? (`

code = code.replace(renderTarget, renderNew);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
