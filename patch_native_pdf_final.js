const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const targetStr = `              >
                {scrollMode === "vertical" ? (
                  <div className="max-w-3xl mx-auto w-full space-y-16 pb-24">`;

const newStr = `              >
                {fileType === "pdf" && pdfUrl ? (
                   <iframe src={pdfUrl} className="w-full h-full border-none" style={{ minHeight: '85vh' }} title="PDF Viewer" />
                ) : scrollMode === "vertical" ? (
                  <div className="max-w-3xl mx-auto w-full space-y-16 pb-24">`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
