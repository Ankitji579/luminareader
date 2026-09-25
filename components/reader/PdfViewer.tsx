import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfViewer({ file, zoomScale }: { file: File | Blob; zoomScale: number }) {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };
    loadPdf();
  }, [file]);

  if (!pdf) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full pb-32">
      {Array.from(new Array(numPages), (el, index) => (
        <PdfPage key={`page-\${index + 1}`} pdf={pdf} pageNumber={index + 1} zoomScale={zoomScale} />
      ))}
    </div>
  );
}

function PdfPage({ pdf, pageNumber, zoomScale }: { pdf: any; pageNumber: number; zoomScale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current || rendered) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: (zoomScale / 100) * 1.5 }); // Base scale + user zoom
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        setRendered(true);
      } catch (e) {
        console.error(`Error rendering page \${pageNumber}:`, e);
      }
    };

    // Use IntersectionObserver to lazy load pages!
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        renderPage();
        observer.disconnect();
      }
    }, { rootMargin: "500px" }); // load slightly ahead

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, [pdf, pageNumber, zoomScale, rendered]);

  // If zoom changes, re-render
  useEffect(() => {
    setRendered(false);
  }, [zoomScale]);

  return (
    <div className="bg-white shadow-xl shadow-black/10 overflow-hidden" style={{ minHeight: "800px", minWidth: "600px" }}>
      <canvas ref={canvasRef} className="block w-full h-auto" />
    </div>
  );
}
