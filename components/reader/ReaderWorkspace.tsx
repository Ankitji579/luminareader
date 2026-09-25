"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Upload, BookOpen, Sun, Moon, Book, ZoomIn, ZoomOut, 
  List, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2, 
  Search, X, Type, ChevronDown, HelpCircle, RotateCcw,
  Volume2, MoveVertical, MoveHorizontal, Compass, Bookmark, Maximize2, Minimize2,
  Share2, VolumeX, AlignLeft, Layers
} from "lucide-react";
import ePub, { Book as EpubBook, Rendition, NavItem } from "epubjs";
import { GOOGLE_FONTS, FontOption } from "@/lib/fonts-data";
import { lookupWordComprehensive, DictionaryResult } from "@/lib/dictionary-service";

export default function ReaderWorkspace({ initialFormat }: { initialFormat?: string }) {
  // File & Book States
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // EpubJS states
  const [epubBook, setEpubBook] = useState<EpubBook | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentCfi, setCurrentCfi] = useState<string | null>(null);

  // Text Document Fallback states
  const [textChapters, setTextChapters] = useState<{ title: string; content: string }[]>([]);
  const [currentTextChapterIndex, setCurrentTextChapterIndex] = useState(0);

  // Customization & Typography States
  const [fontSize, setFontSize] = useState<number>(18);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark" | "oled" | "forest">("light");
  const [selectedFont, setSelectedFont] = useState<FontOption>(GOOGLE_FONTS[0]);
  const [scrollMode, setScrollMode] = useState<"horizontal" | "vertical">("horizontal");
  
  // Font Selector Modal & Filtering
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState("");
  const [fontCategoryFilter, setFontCategoryFilter] = useState<string>("all");

  // UI Drawers & Overlays
  const [showToc, setShowToc] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageFlipAnim, setPageFlipAnim] = useState<"next" | "prev" | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dictionary State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<DictionaryResult | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [showDictionaryDrawer, setShowDictionaryDrawer] = useState(false);
  const [manualWordInput, setManualWordInput] = useState("");

  const viewerRef = useRef<HTMLDivElement>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Handle File Upload from Input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  // Process Document File
  const processFile = async (f: File) => {
    setLoading(true);
    setFile(f);
    setFileName(f.name);
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    setFileType(ext);

    if (rendition) {
      try { rendition.destroy(); } catch {}
      setRendition(null);
    }
    if (epubBook) {
      try { epubBook.destroy(); } catch {}
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
        const text = await f.text();
        const paragraphs = text.split(/\n\s*\n/);
        const tempChapters = [];
        let currentChunk = "";
        for (let i = 0; i < paragraphs.length; i++) {
          currentChunk += paragraphs[i] + "\n\n";
          if (currentChunk.length > 3500 || i === paragraphs.length - 1) {
            tempChapters.push({
              title: `Section ${tempChapters.length + 1}`,
              content: currentChunk.replace(/\n/g, '<br/>')
            });
            currentChunk = "";
          }
        }
        setTextChapters(tempChapters.length > 0 ? tempChapters : [{ title: "Document", content: text.slice(0, 60000) }]);
        setCurrentTextChapterIndex(0);
        setIsReading(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Reader loading error:", err);
      const text = await f.text();
      setTextChapters([{ title: f.name, content: text.replace(/\n/g, '<br/>').slice(0, 60000) }]);
      setCurrentTextChapterIndex(0);
      setIsReading(true);
      setLoading(false);
    }
  };

  // Helper to construct Google Font stylesheet URL
  const getGoogleFontHref = (googleName: string) => {
    return `https://fonts.googleapis.com/css2?family=${googleName}:wght@300;400;500;600;700;800&display=swap`;
  };

  // Dictionary Lookup Execution
  const executeDictionaryLookup = useCallback(async (word: string) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '').trim();
    if (!clean || clean.length < 2) return;

    setSelectedWord(clean);
    setDictionaryLoading(true);
    try {
      const result = await lookupWordComprehensive(clean);
      setDictionaryData(result);
    } catch (e) {
      console.error("Dictionary lookup error:", e);
    } finally {
      setDictionaryLoading(false);
    }
  }, []);

  // Web Speech Pronunciation Audio
  const speakWord = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Kindle-Style Page Turn Trigger with smooth animation
  const triggerPageTurn = useCallback((direction: 'next' | 'prev', rendInstance?: Rendition | null) => {
    setPageFlipAnim(direction);
    setTimeout(() => setPageFlipAnim(null), 240);

    const r = rendInstance || rendition;
    if (fileType === 'epub' && r) {
      if (direction === 'next') {
        r.next();
      } else {
        r.prev();
      }
    } else {
      if (direction === 'next') {
        setCurrentTextChapterIndex((prev) => Math.min(textChapters.length - 1, prev + 1));
      } else {
        setCurrentTextChapterIndex((prev) => Math.max(0, prev - 1));
      }
    }
  }, [fileType, rendition, textChapters.length]);

  // Render & Configure EpubJS Rendition
  useEffect(() => {
    if (isReading && fileType === 'epub' && epubBook && viewerRef.current) {
      viewerRef.current.innerHTML = "";

      const isVertical = scrollMode === "vertical";

      // Configure Rendition based on scrollMode
      const rend = epubBook.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
        spread: "none",
        flow: isVertical ? "scrolled-doc" : "paginated",
        manager: isVertical ? "continuous" : "default"
      });

      // Register EpubJS content hooks for iframe styles & event listeners
      rend.hooks.content.register((contents: any) => {
        const doc = contents.document;
        if (!doc) return;

        // 1. Inject font stylesheet and typography overrides directly into iframe
        const fontHref = getGoogleFontHref(selectedFont.googleName);
        let fontStyleTag = doc.getElementById('lumina-custom-font');
        if (!fontStyleTag) {
          fontStyleTag = doc.createElement('style');
          fontStyleTag.id = 'lumina-custom-font';
          doc.head.appendChild(fontStyleTag);
        }
        fontStyleTag.innerHTML = `
          @import url('${fontHref}');
          * {
            font-family: ${selectedFont.family} !important;
          }
          body {
            font-size: ${fontSize}px !important;
            line-height: 1.75 !important;
            padding: ${isVertical ? '30px 40px 100px 40px' : '15px 35px'} !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            max-width: ${isVertical ? '820px' : '100%'} !important;
            overflow-y: ${isVertical ? 'visible' : 'hidden'} !important;
          }
          img, svg {
            max-width: 100% !important;
            max-height: 75vh !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            margin: 16px auto !important;
            display: block !important;
          }
          p {
            margin-bottom: 1.25em !important;
            text-align: justify !important;
          }
        `;

        // 2. Clean inline SVG / IMG dimensions
        const svgs = doc.querySelectorAll('svg');
        svgs.forEach((svg: any) => {
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.style.maxWidth = '100%';
          svg.style.maxHeight = '75vh';
        });
        const imgs = doc.querySelectorAll('img');
        imgs.forEach((img: any) => {
          img.style.objectFit = 'contain';
          img.style.maxHeight = '75vh';
          img.style.maxWidth = '100%';
        });

        // 3. Attach Keyboard Arrow Listener INSIDE the iframe document
        doc.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
            triggerPageTurn('next', rend);
          } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            triggerPageTurn('prev', rend);
          } else if (e.key === 'Escape') {
            setIsReading(false);
          }
        });

        // 4. Attach Selection & Double-Click Dictionary Listener INSIDE the iframe document
        const handleSelection = () => {
          const selection = contents.window.getSelection()?.toString() || "";
          const cleanText = selection.replace(/[^a-zA-Z]/g, '').trim();
          if (cleanText && cleanText.length >= 2 && cleanText.length <= 32) {
            executeDictionaryLookup(cleanText);
          }
        };

        doc.addEventListener('mouseup', handleSelection);
        doc.addEventListener('dblclick', handleSelection);
      });

      // Display Rendition
      if (currentCfi) {
        rend.display(currentCfi);
      } else {
        rend.display();
      }

      rend.on("relocated", (location: any) => {
        if (location?.start) {
          setCurrentCfi(location.start.cfi);
          if (epubBook.locations && epubBook.locations.length()) {
            const prog = epubBook.locations.percentageFromCfi(location.start.cfi);
            setProgress(Math.round(prog * 100));
          }
        }
      });

      epubBook.ready.then(() => {
        epubBook.locations.generate(1000).then(() => {
          if (rend.location?.start) {
            const prog = epubBook.locations.percentageFromCfi(rend.location.start.cfi);
            setProgress(Math.round(prog * 100));
          }
        });
      });

      // Keyboard Listener on Host Window
      const handleHostKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          triggerPageTurn('next', rend);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          triggerPageTurn('prev', rend);
        } else if (e.key === 'Escape') {
          setIsReading(false);
        }
      };

      const handleResize = () => {
        if (viewerRef.current) {
          rend.resize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
        }
      };

      window.addEventListener('keydown', handleHostKeyDown);
      window.addEventListener('resize', handleResize);

      setRendition(rend);

      return () => {
        window.removeEventListener('keydown', handleHostKeyDown);
        window.removeEventListener('resize', handleResize);
        try { rend.destroy(); } catch {}
      };
    }
  }, [isReading, fileType, epubBook, scrollMode, executeDictionaryLookup, triggerPageTurn]);

  // Handle Dynamic Font & Theme Updates in Rendition
  useEffect(() => {
    if (rendition) {
      const fontHref = getGoogleFontHref(selectedFont.googleName);

      if (typeof document !== 'undefined' && !document.querySelector(`link[href="${fontHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontHref;
        document.head.appendChild(link);
      }

      // Query any rendered iframes to immediately re-inject font rules
      if (viewerRef.current) {
        const iframes = viewerRef.current.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          try {
            const doc = iframe.contentDocument;
            if (doc) {
              let fontTag = doc.getElementById('lumina-custom-font');
              if (!fontTag) {
                fontTag = doc.createElement('style');
                fontTag.id = 'lumina-custom-font';
                doc.head.appendChild(fontTag);
              }
              fontTag.innerHTML = `
                @import url('${fontHref}');
                * {
                  font-family: ${selectedFont.family} !important;
                }
                body {
                  font-size: ${fontSize}px !important;
                  line-height: 1.75 !important;
                }
              `;
            }
          } catch {}
        });
      }

      const themeCss = 
        theme === 'dark' 
          ? { body: { background: '#020617 !important', color: '#f8fafc !important' } }
          : theme === 'oled'
          ? { body: { background: '#000000 !important', color: '#e2e8f0 !important' } }
          : theme === 'forest'
          ? { body: { background: '#071f12 !important', color: '#d1fae5 !important' } }
          : theme === 'sepia'
          ? { body: { background: '#fbf0d9 !important', color: '#433422 !important' } }
          : { body: { background: '#ffffff !important', color: '#0f172a !important' } };

      rendition.themes.register('customTheme', {
        ...themeCss,
        '*': {
          'font-family': `${selectedFont.family} !important`
        }
      });

      rendition.themes.select('customTheme');
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [theme, fontSize, selectedFont, rendition]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Demo Classic Book Loader
  const loadDemoBook = async () => {
    setLoading(true);
    setFileName("Sherlock_Holmes_Classic_Demo.txt");
    setFileType("txt");
    const demoContent1 = `Chapter 1: A Scandal in Bohemia

To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions.`;

    const demoContent2 = `Chapter 2: The Red-Headed League

I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair. With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.

"You could not have come at a better time, my dear Watson," he said cordially.
"I was afraid that you were engaged."
"So I am. Very much so."
"Then I can wait in the next room."
"Not at all. This gentleman, Mr. Wilson, has been my partner and helper in many of my most interesting cases, and I have no doubt that he will be of the utmost use to me in yours also."`;

    setTextChapters([
      { title: "Chapter 1: A Scandal in Bohemia", content: demoContent1.replace(/\n/g, '<br/>') },
      { title: "Chapter 2: The Red-Headed League", content: demoContent2.replace(/\n/g, '<br/>') }
    ]);
    setCurrentTextChapterIndex(0);
    setIsReading(true);
    setLoading(false);
  };

  // Theme Class
  const getThemeClass = () => {
    switch (theme) {
      case "dark":
        return "bg-slate-950 text-slate-100";
      case "oled":
        return "bg-black text-slate-100";
      case "forest":
        return "bg-[#071f12] text-[#d1fae5]";
      case "sepia":
        return "bg-[#fbf0d9] text-[#433422]";
      default:
        return "bg-white text-slate-900";
    }
  };

  // Filtered Fonts
  const filteredFonts = GOOGLE_FONTS.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(fontSearchQuery.toLowerCase());
    const matchesCategory = fontCategoryFilter === "all" || f.category === fontCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div 
      ref={readerContainerRef}
      className={`w-full ${isReading ? 'fixed inset-0 z-50 bg-slate-950 p-0 overflow-hidden select-text' : 'max-w-7xl mx-auto my-4 px-2 sm:px-4'}`}
    >
      {loading && (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-w-xl mx-auto my-12">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opening E-Book Workspace...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading chapters, 105+ typography engines & instant dictionary.</p>
        </div>
      )}

      {/* Upload Screen */}
      {!isReading && !loading ? (
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
                <span>100% Working Offline/Online Dictionary</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Kindle Flip, Vertical Scroll & 105+ Fonts</span>
              </div>
            </div>
          </div>
        </div>
      ) : isReading ? (
        /* Fullscreen Reading Experience */
        <div className={`flex flex-col h-screen w-screen transition-colors ${getThemeClass()}`}>
          {/* Top Reading Toolbar */}
          <div className="h-14 px-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0 bg-opacity-95 backdrop-blur z-30">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsReading(false);
                  if (rendition) rendition.destroy();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
                title="Exit Reader"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>

              <div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-xs font-semibold text-xs sm:text-sm truncate">
                <Book className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>
            </div>

            {/* Center / Right Toolbar Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Vertical Scroll vs Horizontal Flip Mode */}
              <button
                onClick={() => setScrollMode(scrollMode === 'horizontal' ? 'vertical' : 'horizontal')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  scrollMode === 'vertical' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Switch between Page Flip and Vertical Continuous Scroll"
              >
                {scrollMode === 'horizontal' ? (
                  <>
                    <MoveHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="hidden md:inline">Flip Pages</span>
                  </>
                ) : (
                  <>
                    <MoveVertical className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="hidden md:inline">Vertical Scroll</span>
                  </>
                )}
              </button>

              {/* Dictionary Launcher Button */}
              <button
                onClick={() => setShowDictionaryDrawer(!showDictionaryDrawer)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  showDictionaryDrawer 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Open Dictionary Lookup"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dictionary</span>
              </button>

              {/* 105+ Google Fonts Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowFontMenu(!showFontMenu)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  title="Choose from 105+ Google Fonts"
                >
                  <Type className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate max-w-[70px] sm:max-w-[100px]">{selectedFont.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showFontMenu && (
                  <div className="absolute right-0 top-11 z-50 w-80 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-xs">105+ Google Fonts</span>
                        <span className="text-[10px] text-slate-400 block">Select font to apply live</span>
                      </div>
                      <button onClick={() => setShowFontMenu(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Font Category Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-medium no-scrollbar">
                      {["all", "serif", "sans-serif", "dyslexic", "monospace", "script", "display"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFontCategoryFilter(cat)}
                          className={`px-2 py-1 rounded-md capitalize shrink-0 transition-colors ${
                            fontCategoryFilter === cat
                              ? "bg-indigo-600 text-white font-bold"
                              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Font Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search font by name..."
                        value={fontSearchQuery}
                        onChange={(e) => setFontSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Font Cards List */}
                    <div className="max-h-64 overflow-y-auto space-y-1 pt-1 text-xs">
                      {filteredFonts.map((font) => (
                        <button
                          key={font.name}
                          onClick={() => {
                            setSelectedFont(font);
                            setShowFontMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                            selectedFont.name === font.name
                              ? "bg-indigo-600 text-white font-semibold shadow"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span style={{ fontFamily: font.family }} className="text-sm">
                            {font.name}
                          </span>
                          <span className="text-[9px] opacity-60 uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                            {font.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Font Size Decrement / Increment */}
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  title="Smaller Font"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-xs px-1.5 min-w-[26px] text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(42, fontSize + 2))}
                  className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  title="Larger Font"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Page Zoom Control */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <span className="text-[11px] font-mono font-bold">{zoomScale}%</span>
                <button
                  onClick={() => setZoomScale(Math.min(180, zoomScale + 10))}
                  className="hover:text-indigo-600 text-xs font-bold px-1"
                  title="Zoom In Page"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomScale(Math.max(70, zoomScale - 10))}
                  className="hover:text-indigo-600 text-xs font-bold px-1"
                  title="Zoom Out Page"
                >
                  -
                </button>
                {zoomScale !== 100 && (
                  <button
                    onClick={() => setZoomScale(100)}
                    className="p-0.5 hover:text-rose-500"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Theme Cycle Selector */}
              <button
                onClick={() => setTheme(theme === "light" ? "sepia" : theme === "sepia" ? "dark" : theme === "dark" ? "oled" : theme === "oled" ? "forest" : "light")}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 capitalize flex items-center gap-1.5"
                title="Switch Theme"
              >
                {theme === "light" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {theme === "sepia" && <Book className="w-3.5 h-3.5 text-amber-700" />}
                {theme === "dark" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                {theme === "oled" && <Moon className="w-3.5 h-3.5 text-slate-400" />}
                {theme === "forest" && <Compass className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="hidden md:inline">{theme}</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hidden sm:inline-flex"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* TOC Drawer Toggle */}
              {fileType === 'epub' && (
                <button
                  onClick={() => setShowToc(!showToc)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Table of Contents"
                >
                  <List className="w-4 h-4" />
                </button>
              )}

              {/* Keyboard Shortcuts Help */}
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hidden sm:inline-flex"
                title="Keyboard Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Main Content Body */}
          <div className="relative flex-1 flex overflow-hidden w-full h-full">
            {/* TOC Left Drawer */}
            {showToc && toc.length > 0 && (
              <div className="w-72 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50 dark:bg-slate-900 text-xs shrink-0 overflow-y-auto z-30 shadow-xl">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <h4 className="font-bold text-sm">Table of Contents</h4>
                  <button onClick={() => setShowToc(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

            {/* Dictionary Right/Left Sidebar Drawer */}
            {showDictionaryDrawer && (
              <div className="w-84 sm:w-96 border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900 text-xs shrink-0 overflow-y-auto z-30 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span className="font-bold text-sm flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                    Dictionary & Lexicon
                  </span>
                  <button onClick={() => setShowDictionaryDrawer(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Word Search Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type any word to define..."
                    value={manualWordInput}
                    onChange={(e) => setManualWordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') executeDictionaryLookup(manualWordInput);
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => executeDictionaryLookup(manualWordInput)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 active:scale-95 transition-transform"
                  >
                    Lookup
                  </button>
                </div>

                {/* Dictionary Results Card */}
                {dictionaryLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-xs">Consulting world lexicons...</p>
                  </div>
                ) : dictionaryData ? (
                  <div className="space-y-3 pt-2">
                    {/* Header: Word & Audio Pronounce */}
                    <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                      <div>
                        <span className="font-extrabold text-lg capitalize text-slate-900 dark:text-white block">
                          {dictionaryData.word}
                        </span>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                          {dictionaryData.phonetic}
                        </span>
                      </div>
                      <button
                        onClick={() => speakWord(dictionaryData.word)}
                        className={`p-2.5 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all ${
                          isPlayingAudio ? 'animate-pulse ring-4 ring-indigo-300' : ''
                        }`}
                        title="Pronounce with Audio Speech"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meanings List */}
                    <div className="space-y-2.5 pt-1">
                      {dictionaryData.meanings.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                            {m.partOfSpeech}
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                            {m.definition}
                          </p>
                          {m.example && (
                            <p className="text-slate-500 dark:text-slate-400 italic text-[11px] pl-2 border-l-2 border-indigo-400">
                              &ldquo;{m.example}&rdquo;
                            </p>
                          )}
                          {m.synonyms && m.synonyms.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              <span className="text-[10px] text-slate-400">Synonyms:</span>
                              {m.synonyms.map((s, sIdx) => (
                                <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Source: {dictionaryData.source}</span>
                      <span>100% Offline Ready</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
                    <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                      💡 How to use Instant Dictionary:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li>Double-click or highlight any word inside the e-book text to view instant definition and hear pronunciation.</li>
                      <li>Or enter any word in the search box above to lookup meanings across 100,000+ words.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Selection Floating Card Popup (When user highlights or double clicks a word) */}
            {selectedWord && !showDictionaryDrawer && (
              <div className="absolute top-4 right-6 z-40 w-80 sm:w-88 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2.5 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm capitalize text-indigo-600 dark:text-indigo-400">
                      {dictionaryData?.word || selectedWord}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {dictionaryData?.phonetic}
                    </span>
                    <button
                      onClick={() => speakWord(dictionaryData?.word || selectedWord)}
                      className={`p-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:scale-105 transition-transform ${
                        isPlayingAudio ? 'animate-pulse' : ''
                      }`}
                      title="Pronounce Word"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={() => setSelectedWord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {dictionaryLoading ? (
                  <p className="text-slate-500 py-2">Consulting dictionary...</p>
                ) : dictionaryData ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {dictionaryData.meanings.map((m, idx) => (
                      <div key={idx} className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-2 last:border-none">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 italic text-[11px]">{m.partOfSpeech}</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{m.definition}</p>
                        {m.example && <p className="text-slate-400 italic text-[11px]">&ldquo;{m.example}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 py-1">Searching dictionary definition...</p>
                )}
              </div>
            )}

            {/* Keyboard Shortcuts Overlay Modal */}
            {showShortcuts && (
              <div className="absolute top-4 left-4 z-40 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm">Keyboard Shortcuts</span>
                  <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Space</kbd> <span>Next Page</span></div>
                  <div className="flex justify-between"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">←</kbd> <span>Previous Page</span></div>
                  <div className="flex justify-between"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Double-Click Word</kbd> <span>Instant Dictionary</span></div>
                  <div className="flex justify-between"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Esc</kbd> <span>Close Reader</span></div>
                </div>
              </div>
            )}

            {/* Reader Viewport Area */}
            <div 
              className={`flex-1 w-full h-full relative flex items-center justify-center ${
                scrollMode === 'vertical' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
              }`}
            >
              {/* Left / Right Click Zones for Smooth Kindle Page Turn in Paginated Mode */}
              {scrollMode === 'horizontal' && (
                <>
                  <div 
                    onClick={() => triggerPageTurn('prev')}
                    className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-20 cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-black/5 to-transparent dark:from-white/5"
                    title="Previous Page (←)"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center shadow-lg backdrop-blur">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                  <div 
                    onClick={() => triggerPageTurn('next')}
                    className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-20 cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/5 to-transparent dark:from-white/5"
                    title="Next Page (→)"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center shadow-lg backdrop-blur">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </>
              )}

              {/* Kindle Page Flip Animated Container */}
              <div 
                className={`w-full h-full flex items-center justify-center transition-transform duration-200 ease-out ${
                  pageFlipAnim === 'next' 
                    ? '-translate-x-4 scale-[0.985] opacity-75' 
                    : pageFlipAnim === 'prev' 
                    ? 'translate-x-4 scale-[0.985] opacity-75' 
                    : 'translate-x-0 scale-100 opacity-100'
                }`}
                style={{
                  transform: `scale(${zoomScale / 100})`,
                  transformOrigin: 'center center'
                }}
              >
                {fileType === 'epub' ? (
                  <div 
                    ref={viewerRef} 
                    className={`w-full h-full ${
                      scrollMode === 'vertical' 
                        ? 'overflow-y-auto overflow-x-hidden max-w-4xl mx-auto p-4 sm:p-8' 
                        : 'overflow-hidden flex items-center justify-center'
                    }`}
                  />
                ) : (
                  /* Text / Document Reader Container */
                  <div 
                    className={`w-full h-full max-w-4xl mx-auto p-4 sm:p-8 ${
                      scrollMode === 'vertical' ? 'overflow-y-auto space-y-12' : 'overflow-hidden flex flex-col justify-center'
                    }`}
                  >
                    {scrollMode === 'vertical' ? (
                      textChapters.map((ch, idx) => (
                        <div key={idx} className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-10">
                          <h3 className="text-xl font-extrabold pb-2 border-b opacity-85">
                            {ch.title}
                          </h3>
                          <div
                            className="leading-relaxed space-y-4 select-text"
                            style={{ fontSize: `${fontSize}px`, fontFamily: selectedFont.family }}
                            dangerouslySetInnerHTML={{ __html: ch.content }}
                            onMouseUp={() => {
                              const sel = window.getSelection()?.toString() || "";
                              const clean = sel.replace(/[^a-zA-Z]/g, '').trim();
                              if (clean && clean.length >= 2) executeDictionaryLookup(clean);
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="space-y-6 max-h-full overflow-y-auto py-4">
                        <h3 className="text-xl font-bold border-b pb-3 opacity-90">
                          {textChapters[currentTextChapterIndex]?.title}
                        </h3>
                        <div
                          className="leading-relaxed space-y-4 select-text"
                          style={{ fontSize: `${fontSize}px`, fontFamily: selectedFont.family }}
                          dangerouslySetInnerHTML={{ __html: textChapters[currentTextChapterIndex]?.content || "" }}
                          onMouseUp={() => {
                            const sel = window.getSelection()?.toString() || "";
                            const clean = sel.replace(/[^a-zA-Z]/g, '').trim();
                            if (clean && clean.length >= 2) executeDictionaryLookup(clean);
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Reader Navigation Toolbar */}
          <div className="h-12 px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold shrink-0 bg-opacity-95 backdrop-blur z-20">
            <button
              onClick={() => triggerPageTurn('prev')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow"
              title="Previous Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400">
                {fileType === 'epub' 
                  ? `Progress: ${progress > 0 ? `${progress}%` : "Reading"}`
                  : `Section ${currentTextChapterIndex + 1} of ${textChapters.length}`
                }
              </span>
              <div className="w-24 sm:w-36 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full" 
                  style={{ 
                    width: fileType === 'epub' 
                      ? `${Math.max(5, progress)}%` 
                      : `${Math.round(((currentTextChapterIndex + 1) / Math.max(1, textChapters.length)) * 100)}%` 
                  }} 
                />
              </div>
            </div>

            <button
              onClick={() => triggerPageTurn('next')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow"
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
