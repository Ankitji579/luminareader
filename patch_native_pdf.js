const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// 1. Add pdfUrl state
if (!code.includes('const [pdfUrl, setPdfUrl] = useState')) {
  code = code.replace(
    /const \[fileName, setFileName\] = useState<string>\(""\);/,
    `const [fileName, setFileName] = useState<string>("");\n  const [pdfUrl, setPdfUrl] = useState<string | null>(null);`
  );
}

// 2. Update processFile to use Native PDF URL
const oldPdfLogicStart = `} else if (ext === "pdf") {`;
const oldPdfLogicEndRegex = /setLoading\(false\);\n\s+\} else \{\n\s+const text = await f\.text\(\);/;

// We need to replace the entire pdf processing block
const processFileRegex = /\} else if \(ext === "pdf"\) \{[\s\S]*?setLoading\(false\);\n\s+\} else \{/m;

const newPdfLogic = `} else if (ext === "pdf") {
        const url = URL.createObjectURL(f);
        setPdfUrl(url);
        setBookTitle(f.name.replace(/\\.[^/.]+$/, ""));
        setBookAuthor("PDF Document");
        setChapters([]);
        setToc([]);
        setIsReading(true);
        setLoading(false);
      } else {`;

code = code.replace(processFileRegex, newPdfLogic);

// 3. Update Render Block
const renderRegex = /<div\n\s+ref=\{scrollContainerRef\}[\s\S]*?\{chapters\.map\(\(ch, idx\) => \([\s\S]*?<\/article>\n\s+\)\)\}\n\s+<\/div>\n\s+<\/div>/;

const newRender = `<div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto w-full relative scroll-smooth"
              style={{ paddingBottom: "50vh" }}
            >
              {fileType === "pdf" && pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-[85vh] border-none" title="PDF Reader" />
              ) : (
                <div 
                  className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-16 transition-all duration-300 relative"
                  style={{
                    fontFamily: \`var(--font-\${selectedFont.googleName.replace(/\\+/g, "")}), sans-serif\`,
                    fontSize: \`\${fontSize}px\`,
                    lineHeight: lineSpacing,
                    transform: \`scale(\${zoomScale / 100})\`,
                    transformOrigin: "top center",
                    fontWeight: fontWeigth, // typo in original code
                    color: T.text
                  }}
                >
                  {chapters.map((ch, idx) => (
                    <article
                      key={idx}
                      id={\`chapter-container-\${idx}\`}
                      className={\`\${scrollMode === "horizontal" ? (idx === currentChapterIndex ? "block animate-fade-in" : "hidden") : "mb-24 sm:mb-32"}\`}
                      style={{ position: "relative" }}
                    >
                      <div className="mb-12 pb-4 border-b-2" style={{ borderColor: T.panelBorder, opacity: 0.8 }}>
                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: T.panelAccent }}>Chapter {idx + 1} of {chapters.length}</h2>
                        <h1 className="text-2xl sm:text-4xl font-extrabold" style={{ color: T.text }}>{ch.title}</h1>
                      </div>
                      <div
                        className="reader-content text-justify"
                        dangerouslySetInnerHTML={{ __html: ch.html }}
                        style={{ color: T.text }}
                      />
                    </article>
                  ))}
                </div>
              )}
            </div>`;

code = code.replace(/<div\n\s+ref=\{scrollContainerRef\}[\s\S]*?<\/article>\n\s+\)\)\}\n\s+<\/div>\n\s+<\/div>/, newRender);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
