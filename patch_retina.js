const fs = require('fs');
let code = fs.readFileSync('components/reader/PdfViewer.tsx', 'utf8');

const targetStr = `        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;`;

const newStr = `        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // High-DPI (Retina) Display Support for crystal clear text and images
        const outputScale = window.devicePixelRatio || 1;
        
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : null;

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        };
        await page.render(renderContext).promise;`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('components/reader/PdfViewer.tsx', code);
