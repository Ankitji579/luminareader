const fs = require('fs');
let code = fs.readFileSync('components/reader/PdfViewer.tsx', 'utf8');

const targetStr = `  return (
    <div className="bg-white shadow-xl shadow-black/10 overflow-hidden" style={{ minHeight: "800px", minWidth: "600px", maxWidth: "100%" }}>
      <canvas ref={canvasRef} className="block w-full h-auto" />
    </div>
  );`;

const newStr = `  return (
    <div className="bg-white shadow-xl shadow-black/10 overflow-hidden flex items-center justify-center" style={{ minHeight: "800px", minWidth: "600px", maxWidth: "100%" }}>
      <canvas ref={canvasRef} className="block max-w-full" />
    </div>
  );`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('components/reader/PdfViewer.tsx', code);
