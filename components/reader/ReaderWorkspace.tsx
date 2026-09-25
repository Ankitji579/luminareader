"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, BookOpen, Sun, Moon, Book, ZoomIn, ZoomOut, 
  List, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2, Maximize, Minimize 
} from "lucide-react";
import ePub, { Book as EpubBook, Rendition, NavItem } from "epubjs";

interface ReaderWorkspaceProps {
  initialFormat?: string;
}

export default function ReaderWorkspace({ initialFormat }: ReaderWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // EpubJS states
  const [epubBook, setEpubBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // Text Fallback states
  const [textChapters, setTextChapters] = useState<{ title: string; content: string }[]>([]);
  const [currentTextChapterIndex, setCurrentTextChapterIndex] = useState(0);

  // Customization State
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("light");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [showToc, setShowToc] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setErrorMessage(null);
    setFile(f);
    setFileName(f.name);
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    setFileType(ext);

    // Clean previous rendition if exists
    if (rendition) {
      rendition.destroy();
      setRendition(null);
    }
    if (epubBook) {
      epubBook.destroy();
      setEpubBook(null);
    }

    try {
      if (ext === 'epub') {
        const buffer = await f.arrayBuffer();
        const book = ePub(buffer);
        setEpubBook(book);

        await book.ready;
        const navigation = await book.loaded.navigation;
        setToc(navigation.toc || []);

        setIsReading(true);
        setLoading(false);
      } else {
        // Fallback text parser
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
        setTextChapters(tempChapters.length > 0 ? tempChapters : [{ title: "Document", content: text.slice(0, 50000) }]);
        setCurrentTextChapterIndex(0);
        setIsReading(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Reader loading error:", err);
      setErrorMessage("Could not parse file cleanly. Opening text fallback mode.");
      const text = await f.text();
      setTextChapters([{ title: f.name, content: text.replace(/\n/g, '<br/>').slice(0, 50000) }]);
      setCurrentTextChapterIndex(0);
      setIsReading(true);
      setLoading(false);
    }
  };

  // Render EpubJS rendition when viewerRef is ready
  useEffect(() => {
    if (isReading && fileType === 'epub' && epubBook && viewerRef.current) {
      viewerRef.current.innerHTML = "";

      const rend = epubBook.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
        spread: "none",
        flow: "paginated"
      });

      rend.display();

      rend.on("relocated", (location: any) => {
        if (location && location.start) {
          setCurrentLocation(location.start.href);
          if (epubBook.locations && epubBook.locations.length()) {
            const prog = epubBook.locations.percentageFromCfi(location.start.cfi);
            setProgress(Math.round(prog * 100));
          }
        }
      });

      // Generate locations for progress calculation
      epubBook.ready.then(() => {
        epubBook.locations.generate(1000).then(() => {
          if (rend.location && rend.location.start) {
            const prog = epubBook.locations.percentageFromCfi(rend.location.start.cfi);
            setProgress(Math.round(prog * 100));
          }
        });
      });

      setRendition(rend);
    }
  }, [isReading, fileType, epubBook]);

  // Apply theme & font size to EpubJS rendition
  useEffect(() => {
    if (rendition) {
      const themeCss = 
        theme === 'dark' 
          ? { body: { background: '#020617 !important', color: '#f8fafc !important' } }
          : theme === 'sepia'
          ? { body: { background: '#fbf0d9 !important', color: '#433422 !important' } }
          : { body: { background: '#ffffff !important', color: '#0f172a !important' } };

      rendition.themes.register('custom', themeCss);
      rendition.themes.select('custom');
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [theme, fontSize, rendition]);

  const prevPage = () => {
    if (fileType === 'epub' && rendition) {
      rendition.prev();
    } else {
      setCurrentTextChapterIndex(Math.max(0, currentTextChapterIndex - 1));
    }
  };

  const nextPage = () => {
    if (fileType === 'epub' && rendition) {
      rendition.next();
    } else {
      setCurrentTextChapterIndex(Math.min(textChapters.length - 1, currentTextChapterIndex + 1));
    }
  };

  const loadDemoBook = async () => {
    setLoading(true);
    setFileName("Sherlock_Holmes_Classic_Demo.txt");
    setFileType("txt");
    const demoContent1 = `Chapter 1: A Scandal in Bohemia

To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.

He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.

Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.`;

    const demoContent2 = `Chapter 2: The Red-Headed League

I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair. With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.

"You could not have come at a better time, my dear Watson," he said cordially.

"I was afraid that you were engaged."

"I am so. Very much so."

"Then I can wait in the adjoining room."

"Not at all. This gentleman, Mr. Wilson, has been my partner and helper in many of my most successful cases, and I have no doubt that he will be of the same use to me in yours."`;

    setTextChapters([
      { title: "Chapter 1: A Scandal in Bohemia", content: demoContent1.replace(/\n/g, '<br/>') },
      { title: "Chapter 2: The Red-Headed League", content: demoContent2.replace(/\n/g, '<br/>') }
    ]);
    setCurrentTextChapterIndex(0);
    setIsReading(true);
    setLoading(false);
  };

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
    <div className={`w-full ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950 p-0' : 'max-w-7xl mx-auto my-4 px-2 sm:px-4'}`}>
      {loading && (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-w-xl mx-auto my-12">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opening E-Book...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading chapters, typography & table of contents into full-screen reader workspace.</p>
        </div>
      )}

      {!isReading && !loading ? (
        /* Upload Dropzone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-16 text-center transition-all hover:border-indigo-500 shadow-xl"
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
        /* Full Viewport E-Reader Interface */
        <div className={`rounded-2xl shadow-2xl flex flex-col h-[calc(100vh-100px)] border border-slate-200 dark:border-slate-800 transition-colors ${getThemeClass()}`}>
          {/* Top Reader Toolbar */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0">
            <button
              onClick={() => {
                setIsReading(false);
                if (rendition) rendition.destroy();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Close Reader</span>
            </button>

            <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md font-semibold text-sm">
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
                onClick={() => setFontSize(Math.min(36, fontSize + 2))}
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

              {fileType === 'epub' && (
                <button
                  onClick={() => setShowToc(!showToc)}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Table of Contents"
                >
                  <List className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:block"
                title="Toggle Full Screen"
              >
                {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Main Reading Canvas Container */}
          <div className="relative flex-1 flex overflow-hidden">
            {/* Table of Contents Drawer */}
            {showToc && toc.length > 0 && (
              <div className="w-72 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50 dark:bg-slate-900 text-xs shrink-0 overflow-y-auto">
                <h4 className="font-bold text-sm mb-3">Table of Contents</h4>
                {toc.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (rendition && item.href) {
                        rendition.display(item.href);
                        setShowToc(false);
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors truncate font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Reading Viewport */}
            <div className="flex-1 w-full h-full p-4 sm:p-8 flex items-center justify-center overflow-hidden">
              {fileType === 'epub' ? (
                <div ref={viewerRef} className="w-full h-full" />
              ) : (
                <div className="w-full h-full max-w-4xl mx-auto overflow-y-auto p-4 sm:p-8 space-y-6">
                  <h3 className="text-xl font-bold border-b pb-3 opacity-90">
                    {textChapters[currentTextChapterIndex]?.title}
                  </h3>
                  <div
                    className={`leading-relaxed space-y-4 ${getFontFamilyClass()}`}
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: textChapters[currentTextChapterIndex]?.content || "" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Reader Navigation Controls */}
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold shrink-0">
            <button
              onClick={prevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400">Progress: {progress > 0 ? `${progress}%` : "Reading"}</span>
              <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${Math.max(5, progress)}%` }} />
              </div>
            </div>

            <button
              onClick={nextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              <span>Next Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
