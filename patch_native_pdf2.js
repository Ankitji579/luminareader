const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const startTag = '<div\n              ref={scrollContainerRef}';
const endTag = '</div>\n            </div>';

const startIdx = code.indexOf(startTag);
if (startIdx !== -1) {
  // Find the exact end of the scroll container
  const endIdx = code.indexOf(endTag, startIdx) + endTag.length;
  
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx);
  
  const newRender = `<div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto w-full relative scroll-smooth"
              style={{ paddingBottom: fileType === "pdf" ? "0" : "50vh" }}
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
                    fontWeight: fontWeigth,
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
            
  code = before + newRender + after;
  fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
}
