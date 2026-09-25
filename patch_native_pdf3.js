const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

const targetStr = `            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto w-full relative scroll-smooth"
              style={{ paddingBottom: "50vh" }}
            >
              <div 
                className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-16 transition-all duration-300 relative"`;

const newStr = `            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto w-full relative scroll-smooth"
              style={{ paddingBottom: fileType === "pdf" ? "0" : "50vh" }}
            >
              {fileType === "pdf" && pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-[85vh] border-none" title="PDF Reader" />
              ) : (
              <div 
                className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-16 transition-all duration-300 relative"`;

code = code.replace(targetStr, newStr);

const endTarget = `</article>
                  ))}
                </div>
            </div>
          </div>`;

const endNew = `</article>
                  ))}
                </div>
              )}
            </div>
          </div>`;

code = code.replace(endTarget, endNew);

fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
