const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const regex = /\} else \{\n\s+const text = await f\.text\(\);/;

const newLogic = `} else if (ext === "pdf") {
        // PDF Parsing Logic using pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = \`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.js\`;
        
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        const tempChapters = [];
        const tempToc = [];
        const tempPathMap = {};
        
        // Group multiple PDF pages into "chunks" so we don't have 500 tiny chapters
        let currentChunk = "";
        let chunkIndex = 0;
        
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              // Try to preserve basic paragraph structure by checking vertical positions if needed, 
              // but for simplicity join with spaces and let the browser wrap
              const textItems = textContent.items.map(item => item.str).join(" ");
              
              currentChunk += textItems + "<br/><br/>";
              
              // Every 10 pages, create a new chapter
              if (i % 10 === 0 || i === pdf.numPages) {
                  chunkIndex++;
                  const chTitle = \`Section \${chunkIndex} (Pages \${i - (i % 10 === 0 ? 9 : (i % 10) - 1)}-\${i})\`;
                  
                  tempChapters.push({
                     id: \`pdf-sec-\${chunkIndex}\`,
                     fullPath: \`pdf-sec-\${chunkIndex}\`,
                     fileName: \`pdf-sec-\${chunkIndex}\`,
                     title: chTitle,
                     html: currentChunk,
                     textLength: currentChunk.length
                  });
                  tempToc.push({ label: chTitle, chapterIndex: chunkIndex - 1 });
                  tempPathMap[\`pdf-sec-\${chunkIndex}\`] = chunkIndex - 1;
                  
                  currentChunk = "";
              }
            } catch(e) {
               console.warn("Failed to parse PDF page", i, e);
            }
        }
        
        setBookTitle(f.name.replace(/\\.[^/.]+$/, ""));
        setBookAuthor("PDF Document");
        setChapters(tempChapters.length > 0 ? tempChapters : [{ id: "c1", title: "Empty", html: "No text found", textLength: 0, fullPath: "c1", fileName: "c1" }]);
        setToc(tempToc);
        setPathMap(tempPathMap);
        
        const savedProg = localStorage.getItem(\`lumina_prog_\${f.name}\`);
        if (savedProg) {
          try {
            setCurrentChapterIndex(JSON.parse(savedProg).chapterIndex || 0);
          } catch(e) { setCurrentChapterIndex(0); }
        } else {
          setCurrentChapterIndex(0);
        }

        setIsReading(true);
        setLoading(false);
      } else {
        const text = await f.text();`;

code = code.replace(regex, newLogic);
fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
