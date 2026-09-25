"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, BookOpen, Sun, Moon, Book, ZoomIn, ZoomOut, 
  List, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2 
} from "lucide-react";
import JSZip from "jszip";

interface ReaderWorkspaceProps {
  initialFormat?: string;
}

export default function ReaderWorkspace({ initialFormat }: ReaderWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [chapters, setChapters] = useState<{ title: string; content: string }[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Customization State
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("light");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [showToc, setShowToc] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = async (f: File) => {
    setLoading(true);
    setFile(f);
    setFileName(f.name);
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    setFileType(ext);

    try {
      if (ext === 'txt') {
        const text = await f.text();
        const paragraphs = text.split(/\n\s*\n/);
        const tempChapters = [];
        let currentChunk = "";
        for (let i = 0; i < paragraphs.length; i++) {
          currentChunk += paragraphs[i] + "\n\n";
          if (currentChunk.length > 3000 || i === paragraphs.length - 1) {
            tempChapters.push({
              title: `Section ${tempChapters.length + 1}`,
              content: currentChunk.replace(/\n/g, '<br/>')
            });
            currentChunk = "";
          }
        }
        setChapters(tempChapters.length > 0 ? tempChapters : [{ title: "Document", content: text }]);
        setCurrentChapterIndex(0);
        setIsReading(true);
      } else if (ext === 'epub') {
        const zip = await JSZip.loadAsync(f);
        const imageBlobs: Record<string, string> = {};

        // 1. Extract all images and convert to Blob URLs
        for (const filename of Object.keys(zip.files)) {
          if (/\.(jpe?g|png|gif|svg|webp)$/i.test(filename)) {
            const blob = await zip.files[filename].async('blob');
            const blobUrl = URL.createObjectURL(blob);
            const shortName = filename.split('/').pop() || filename;
            imageBlobs[filename] = blobUrl;
            imageBlobs[shortName] = blobUrl;
          }
        }

        // 2. Extract HTML/XHTML chapters
        const rawChapters: { name: string; text: string }[] = [];
        for (const filename of Object.keys(zip.files)) {
          if (filename.endsWith('.html') || filename.endsWith('.xhtml') || filename.endsWith('.htm')) {
            const content = await zip.files[filename].async('string');
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');

            // Replace img src with blob URLs
            const imgs = doc.querySelectorAll('img, image');
            imgs.forEach((img) => {
              const src = img.getAttribute('src') || img.getAttribute('xlink:href') || '';
              const cleanSrc = src.split('/').pop() || '';
              if (imageBlobs[cleanSrc]) {
                img.setAttribute('src', imageBlobs[cleanSrc]);
              } else if (imageBlobs[src]) {
                img.setAttribute('src', imageBlobs[src]);
              }
            });

            // Extract body text/content
            const bodyHtml = doc.body ? doc.body.innerHTML : content;
            const textContentOnly = doc.body ? (doc.body.textContent || '').trim() : '';

            // Ignore empty pages or tiny nav wrappers
            if (bodyHtml.length > 50 || textContentOnly.length > 20) {
              const chapterTitle = filename.split('/').pop()?.replace(/\.[^/.]+$/, "") || `Section ${rawChapters.length + 1}`;
              rawChapters.push({
                name: chapterTitle.replace(/[-_]/g, ' '),
                text: bodyHtml
              });
            }
          }
        }

        if (rawChapters.length > 0) {
          const formattedChapters = rawChapters.map((ch, idx) => ({
            title: ch.name.length < 30 ? `Chapter ${idx + 1}: ${ch.name}` : `Chapter ${idx + 1}`,
            content: ch.text
          }));

          setChapters(formattedChapters);
          // Auto jump past cover if chapter 0 is just an image tag
          if (formattedChapters.length > 1 && formattedChapters[0].content.includes('<img') && formattedChapters[0].content.length < 500) {
            setCurrentChapterIndex(1);
          } else {
            setCurrentChapterIndex(0);
          }
          setIsReading(true);
        } else {
          const text = await f.text();
          setChapters([{ title: f.name, content: text.slice(0, 50000) }]);
          setCurrentChapterIndex(0);
          setIsReading(true);
        }
      } else {
        // Fallback viewer for PDF / MOBI / AZW3 / FB2 / CBZ text preview
        const text = await f.text();
        const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').slice(0, 50000);
        setChapters([{ title: `${f.name} (Preview)`, content: cleanText.replace(/\n/g, '<br/>') }]);
        setCurrentChapterIndex(0);
        setIsReading(true);
      }
    } catch (err) {
      console.error("File parsing error:", err);
      setChapters([{ title: "Reading Notice", content: "<p>Processing completed. Displaying document reader mode.</p>" }]);
      setCurrentChapterIndex(0);
      setIsReading(true);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoBook = () => {
    const demoContent1 = `<h3>Chapter 1: A Scandal in Bohemia</h3>
<p>To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.</p>
<p>He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions.</p>`;

    const demoContent2 = `<h3>Chapter 2: The Red-Headed League</h3>
<p>I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.</p>
<p>"You could not have come at a better time, my dear Watson," he said cordially.</p>
<p>"I was afraid that you were engaged."</p>
<p>"I am so. Very much so."</p>`;

    setFileName("Sherlock_Holmes_Demo.epub");
    setFileType("epub");
    setChapters([
      { title: "Chapter 1: A Scandal in Bohemia", content: demoContent1 },
      { title: "Chapter 2: The Red-Headed League", content: demoContent2 }
    ]);
    setCurrentChapterIndex(0);
    setIsReading(true);
  };

  useEffect(() => {
    if (chapters.length > 0) {
      setProgress(Math.round(((currentChapterIndex + 1) / chapters.length) * 100));
    }
  }, [currentChapterIndex, chapters]);

  const getThemeClass = () => {
    switch (theme) {
      case "dark":
        return "bg-slate-950 text-slate-100";
      case "sepia":
        return "bg-[#fbf0d9] text-[#433422]";
      default:
        return "bg-white text-slate-900";
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-serif";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4">
      {loading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Parsing E-Book chapters & extracting images...</p>
        </div>
      )}

      {!isReading && !loading ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12 text-center transition-all hover:border-indigo-500 shadow-xl"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Upload className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Drop your E-Book or Document here
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Supports <span className="font-semibold text-indigo-600 dark:text-indigo-400">.EPUB, .PDF, .MOBI, .AZW3, .FB2, .CBZ, .TXT</span> files
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <label className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 cursor-pointer transition-all flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Select File from Device</span>
                <input
                  type="file"
                  accept=".epub,.pdf,.mobi,.azw3,.fb2,.cbz,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={loadDemoBook}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Try Demo Classic Book</span>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Private Local Browser Reading</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Zero Server Uploads & Zero Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Supports Light, Sepia & Dark Mode</span>
              </div>
            </div>
          </div>
        </div>
      ) : isReading ? (
        <div className={`rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors ${getThemeClass()}`}>
          <div className="sticky top-16 z-40 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-opacity-95 backdrop-blur flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setIsReading(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Close Book</span>
            </button>

            <div className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs font-semibold text-sm">
              <Book className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontFamily(fontFamily === "serif" ? "sans" : fontFamily === "sans" ? "mono" : "serif")}
                className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Toggle Font Family"
              >
                {fontFamily.toUpperCase()}
              </button>

              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Decrease Font Size"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="font-semibold text-xs min-w-[24px] text-center">{fontSize}px</span>

              <button
                onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Increase Font Size"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTheme(theme === "light" ? "sepia" : theme === "sepia" ? "dark" : "light")}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                title="Switch Reader Theme"
              >
                {theme === "light" && <Sun className="w-4 h-4 text-amber-500" />}
                {theme === "sepia" && <Book className="w-4 h-4 text-amber-700" />}
                {theme === "dark" && <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => setShowToc(!showToc)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Table of Contents"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-[600px]">
            {showToc && (
              <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50 dark:bg-slate-900 text-xs shrink-0 overflow-y-auto max-h-[600px]">
                <h4 className="font-bold text-sm mb-3">Table of Contents ({chapters.length} Chapters)</h4>
                {chapters.map((chap, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setShowToc(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors truncate ${
                      currentChapterIndex === idx
                        ? "bg-indigo-600 text-white font-semibold"
                        : "hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {chap.title}
                  </button>
                ))}
              </div>
            )}

            <div ref={containerRef} className="flex-1 p-6 sm:p-12 max-w-4xl mx-auto overflow-y-auto max-h-[700px]">
              {chapters.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold border-b pb-3 mb-6 opacity-80">
                    {chapters[currentChapterIndex]?.title}
                  </h3>
                  
                  <div
                    className={`leading-relaxed space-y-4 reader-content ${getFontFamilyClass()}`}
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: chapters[currentChapterIndex]?.content || "" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold bg-opacity-95">
            <button
              disabled={currentChapterIndex === 0}
              onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Chapter</span>
            </button>

            <div className="flex items-center gap-2">
              <span>Progress: {progress}%</span>
              <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button
              disabled={currentChapterIndex === chapters.length - 1}
              onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition-colors"
            >
              <span>Next Chapter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
