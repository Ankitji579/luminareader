import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Safe worker loading for Next.js (bypasses cross-origin worker CORS issues)
if (typeof window !== "undefined") {
  const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

export default function PdfViewer({ file, zoomScale }: { file: File | Blob; zoomScale: number }) {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // We use a blob proxy for the worker to avoid strict CORS block on Web Workers from CDNs
        if (typeof window !== "undefined") {
          const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const blob = new Blob([`importScripts('${workerUrl}');`], { type: 'text/javascript' });
          pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(blob));
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const loadedPdf = await loadingTask.promise;
        if (isMounted) {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
        }
      } catch (err: any) {
        console.error("Failed to load PDF:", err);
        if (isMounted) {
          setError(err.message || "Failed to parse PDF document.");
        }
      }
    };
    loadPdf();
    return () => { isMounted = false; };
  }, [file]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-red-500 gap-4">
        <div className="text-xl font-bold">PDF Rendering Error</div>
        <div className="text-sm bg-red-100 p-4 rounded-lg">{error}</div>
        <div className="text-xs text-slate-500">Please try opening a different file or check your internet connection (needed once for the PDF engine).</div>
      </div>
    );
  }

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
        <PdfPage key={`page-${index + 1}`} pdf={pdf} pageNumber={index + 1} zoomScale={zoomScale} />
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
        const viewport = page.getViewport({ scale: (zoomScale / 100) * 1.5 }); 
        
        const canvas = canvasRef.current;
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
        await page.render(renderContext).promise;
        setRendered(true);
      } catch (e) {
        console.error(`Error rendering page ${pageNumber}:`, e);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        renderPage();
        observer.disconnect();
      }
    }, { rootMargin: "500px" });

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, [pdf, pageNumber, zoomScale, rendered]);

  useEffect(() => {
    setRendered(false);
  }, [zoomScale]);

  return (
    <div className="bg-white shadow-xl shadow-black/10 overflow-hidden flex items-center justify-center" style={{ minHeight: "800px", minWidth: "600px", maxWidth: "100%" }}>
      <canvas ref={canvasRef} className="block max-w-full" />
    </div>
  );
}