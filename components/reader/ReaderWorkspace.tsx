"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Upload, BookOpen, Sun, Moon, Book, ZoomIn, ZoomOut, 
  List, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2, 
  Search, X, Type, ChevronDown, HelpCircle, RotateCcw,
  Volume2, MoveVertical, MoveHorizontal, Compass, Maximize2, Minimize2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { parseEpubArchive, ParsedBook, ParsedChapter, TocItem } from "@/lib/epub-parser";
import { GOOGLE_FONTS, FontOption } from "@/lib/fonts-data";
import { lookupWordComprehensive, DictionaryResult } from "@/lib/dictionary-service";

export default function ReaderWorkspace({ initialFormat }: { initialFormat?: string }) {
  // Book & Content States
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [bookAuthor, setBookAuthor] = useState<string>("");
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [pathMap, setPathMap] = useState<Record<string, number>>({});
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  // Customization & Typography
  const [fontSize, setFontSize] = useState<number>(19);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [theme, setTheme] = useState<"light" | "sepia" | "dark" | "oled" | "forest">("light");
  const [selectedFont, setSelectedFont] = useState<FontOption>(GOOGLE_FONTS[0]);
  const [scrollMode, setScrollMode] = useState<"horizontal" | "vertical">("horizontal");
  
  // Font Selector Modal
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState("");
  const [fontCategoryFilter, setFontCategoryFilter] = useState<string>("all");

  // UI Drawers & Controls
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

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to construct Google Font stylesheet URL
  const getGoogleFontHref = (googleName: string) => {
    return `https://fonts.googleapis.com/css2?family=${googleName}:wght@300;400;500;600;700;800&display=swap`;
  };

  // Inject font stylesheet dynamically into document head
  useEffect(() => {
    const fontHref = getGoogleFontHref(selectedFont.googleName);
    if (typeof document !== 'undefined' && !document.querySelector(`link[href="${fontHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontHref;
      document.head.appendChild(link);
    }
  }, [selectedFont]);

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
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Turn page forward / backward
  const triggerPageTurn = useCallback((direction: 'next' | 'prev') => {
    setPageFlipAnim(direction);
    setTimeout(() => setPageFlipAnim(null), 250);

    if (direction === 'next') {
      setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
    } else {
      setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
    }

    // Scroll back to top on page turn
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [chapters.length]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReading) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        triggerPageTurn('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        triggerPageTurn('prev');
      } else if (e.key === 'Escape') {
        setIsReading(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReading, triggerPageTurn]);

  // Process Document / EPUB File
  const processFile = async (f: File) => {
    setLoading(true);
    setFileName(f.name);
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    setFileType(ext);

    try {
      if (ext === 'epub') {
        const buffer = await f.arrayBuffer();
        const parsed = await parseEpubArchive(buffer, f.name);
        setBookTitle(parsed.title || f.name);
        setBookAuthor(parsed.author || "");
        setChapters(parsed.chapters);
        setToc(parsed.toc);
        setPathMap(parsed.pathMap);
        setCurrentChapterIndex(0);
        setIsReading(true);
        setLoading(false);
      } else {
        const text = await f.text();
        const paragraphs = text.split(/\n\s*\n/);
        const tempChapters: ParsedChapter[] = [];
        const tempToc: TocItem[] = [];
        const tempPathMap: Record<string, number> = {};
        let currentChunk = "";

        for (let i = 0; i < paragraphs.length; i++) {
          currentChunk += paragraphs[i] + "\n\n";
          if (currentChunk.length > 3500 || i === paragraphs.length - 1) {
            const chTitle = `Section ${tempChapters.length + 1}`;
            tempChapters.push({
              id: `section-${tempChapters.length + 1}`,
              fullPath: `section-${tempChapters.length + 1}`,
              fileName: `section-${tempChapters.length + 1}`,
              title: chTitle,
              html: currentChunk.replace(/\n/g, '<br/>'),
              textLength: currentChunk.length
            });
            tempToc.push({
              label: chTitle,
              chapterIndex: tempChapters.length - 1
            });
            tempPathMap[`section-${tempChapters.length}`] = tempChapters.length - 1;
            currentChunk = "";
          }
        }

        setBookTitle(f.name.replace(/\.[^/.]+$/, ""));
        setBookAuthor("Document");
        setChapters(tempChapters.length > 0 ? tempChapters : [{ id: "c1", fullPath: "c1", fileName: "c1", title: f.name, html: text.replace(/\n/g, '<br/>'), textLength: text.length }]);
        setToc(tempToc);
        setPathMap(tempPathMap);
        setCurrentChapterIndex(0);
        setIsReading(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Reader processing error:", err);
      try {
        const text = await f.text();
        setBookTitle(f.name);
        setChapters([{ id: "fallback", fullPath: "fallback", fileName: "fallback", title: f.name, html: text.replace(/\n/g, '<br/>').slice(0, 60000), textLength: text.length }]);
        setToc([{ label: "Start", chapterIndex: 0 }]);
        setCurrentChapterIndex(0);
        setIsReading(true);
      } catch {}
      setLoading(false);
    }
  };

  // Intercept click on in-book chapter hyperlinks
  const handleContentClick = (e: React.MouseEvent) => {
    const anchorEl = (e.target as HTMLElement).closest('a');
    if (anchorEl) {
      const targetFile = anchorEl.getAttribute('data-chapter-target');
      const anchor = anchorEl.getAttribute('data-anchor-target');
      const href = anchorEl.getAttribute('href');

      if (targetFile || (href && !href.startsWith('http') && !href.startsWith('mailto'))) {
        e.preventDefault();
        e.stopPropagation();

        const fileToFind = (targetFile || href || '').split('#')[0].split('/').pop() || '';
        const targetIdx = pathMap[fileToFind] ?? (targetFile ? pathMap[targetFile] : undefined);

        if (typeof targetIdx === 'number' && targetIdx >= 0 && targetIdx < chapters.length) {
          setCurrentChapterIndex(targetIdx);
          if (anchor) {
            setTimeout(() => {
              const el = document.getElementById(anchor) || document.querySelector(`[name="${anchor}"]`);
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
          return;
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  // Fullscreen toggle
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
    setFileName("Sherlock_Holmes_Classic_Demo.epub");
    setFileType("epub");
    setBookTitle("The Adventures of Sherlock Holmes");
    setBookAuthor("Sir Arthur Conan Doyle");

    const demoChapter1 = `<h1>Chapter 1: A Scandal in Bohemia</h1>
<p>To Sherlock Holmes she is always <strong>THE</strong> woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.</p>
<p>He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions.</p>
<p>And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.</p>`;

    const demoChapter2 = `<h1>Chapter 2: The Red-Headed League</h1>
<p>I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.</p>
<p>With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.</p>
<p>"You could not have come at a better time, my dear Watson," he said cordially.</p>
<p>"I was afraid that you were engaged."</p>
<p>"So I am. Very much so."</p>
<p>"Then I can wait in the next room."</p>
<p>"Not at all. This gentleman, Mr. Wilson, has been my partner and helper in many of my most interesting cases, and I have no doubt that he will be of the utmost use to me in yours also."</p>`;

    setChapters([
      { id: "ch1", fullPath: "ch1.html", fileName: "ch1.html", title: "Chapter 1: A Scandal in Bohemia", html: demoChapter1, textLength: demoChapter1.length },
      { id: "ch2", fullPath: "ch2.html", fileName: "ch2.html", title: "Chapter 2: The Red-Headed League", html: demoChapter2, textLength: demoChapter2.length }
    ]);
    setToc([
      { label: "Chapter 1: A Scandal in Bohemia", chapterIndex: 0 },
      { label: "Chapter 2: The Red-Headed League", chapterIndex: 1 }
    ]);
    setCurrentChapterIndex(0);
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

  // Filtered Fonts List
  const filteredFonts = GOOGLE_FONTS.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(fontSearchQuery.toLowerCase());
    const matchesCategory = fontCategoryFilter === "all" || f.category === fontCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  const currentChapter = chapters[currentChapterIndex];
  const progressPercent = chapters.length > 0 
    ? Math.round(((currentChapterIndex + 1) / chapters.length) * 100) 
    : 0;

  return (
    <div 
      ref={readerContainerRef}
      className={`w-full ${isReading ? 'fixed inset-0 z-50 bg-slate-950 p-0 overflow-hidden select-text' : 'max-w-7xl mx-auto my-4 px-2 sm:px-4'}`}
    >
      {loading && (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-w-xl mx-auto my-12">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opening E-Book Workspace...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading chapters, 116 typography engines & instant dictionary.</p>
        </div>
      )}

      {/* Upload Dropzone */}
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
                <span>Working Offline & Online Dictionary</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Kindle Flip, Vertical Scroll & 116 Fonts</span>
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
                onClick={() => setIsReading(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
                title="Exit Reader"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>

              <div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-xs font-semibold text-xs sm:text-sm truncate">
                <Book className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{bookTitle || fileName}</span>
              </div>
            </div>

            {/* Right Toolbar Controls */}
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

              {/* 116 Google Fonts Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowFontMenu(!showFontMenu)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  title="Choose from 116 Google Fonts"
                >
                  <Type className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate max-w-[70px] sm:max-w-[100px]">{selectedFont.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showFontMenu && (
                  <div className="absolute right-0 top-11 z-50 w-80 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-xs">116 Google Fonts</span>
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
                    <div className="max-h-64 overflow-y-auto space-y-1 pt-1 text-xs no-scrollbar">
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
                  onClick={() => setFontSize(Math.min(44, fontSize + 2))}
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
              {toc.length > 0 && (
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

          {/* Main Reading Viewport Area */}
          <div className="relative flex-1 flex overflow-hidden w-full h-full">
            {/* Table of Contents Drawer */}
            {showToc && toc.length > 0 && (
              <div className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50 dark:bg-slate-900 text-xs shrink-0 overflow-y-auto z-30 shadow-xl no-scrollbar hide-scrollbar">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                  <h4 className="font-bold text-sm">Table of Contents</h4>
                  <button onClick={() => setShowToc(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {toc.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentChapterIndex(item.chapterIndex);
                      setShowToc(false);
                      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors truncate font-medium ${
                      currentChapterIndex === item.chapterIndex
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Dictionary Sidebar Drawer */}
            {showDictionaryDrawer && (
              <div className="w-84 sm:w-96 border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900 text-xs shrink-0 overflow-y-auto z-30 shadow-2xl no-scrollbar hide-scrollbar">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span className="font-bold text-sm flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                    Dictionary & Lexicon
                  </span>
                  <button onClick={() => setShowDictionaryDrawer(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type word to define..."
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

                {dictionaryLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-xs">Consulting world lexicons...</p>
                  </div>
                ) : dictionaryData ? (
                  <div className="space-y-3 pt-2">
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
                      💡 Double-click or select any word in the book to view definitions and audio pronunciation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Selection Floating Word Card */}
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
                  <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
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

            {/* Keyboard Shortcuts Modal */}
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
            <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden">
              {/* Left & Right Click Navigation Margins for Kindle Page Turn */}
              {scrollMode === 'horizontal' && (
                <>
                  <button 
                    onClick={() => triggerPageTurn('prev')}
                    disabled={currentChapterIndex === 0}
                    className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-20 cursor-pointer flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-black/10 to-transparent dark:from-white/10 disabled:pointer-events-none"
                    title="Previous Page (←)"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center shadow-lg backdrop-blur">
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                  </button>

                  <button 
                    onClick={() => triggerPageTurn('next')}
                    disabled={currentChapterIndex >= chapters.length - 1}
                    className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-20 cursor-pointer flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/10 to-transparent dark:from-white/10 disabled:pointer-events-none"
                    title="Next Page (→)"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center shadow-lg backdrop-blur">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                </>
              )}

              {/* Reader Document Container with Zoom & Page Turn Transitions */}
              <div 
                ref={scrollContainerRef}
                onClick={handleContentClick}
                className={`w-full h-full no-scrollbar hide-scrollbar transition-transform duration-200 ease-out ${
                  scrollMode === 'vertical' 
                    ? 'overflow-y-auto overflow-x-hidden p-4 sm:p-10' 
                    : 'overflow-y-auto overflow-x-hidden p-4 sm:p-10 flex flex-col justify-start items-center'
                } ${
                  pageFlipAnim === 'next' 
                    ? '-translate-x-4 scale-[0.985] opacity-70' 
                    : pageFlipAnim === 'prev' 
                    ? 'translate-x-4 scale-[0.985] opacity-70' 
                    : 'translate-x-0 scale-100 opacity-100'
                }`}
                style={{
                  transform: `scale(${zoomScale / 100})`,
                  transformOrigin: 'top center'
                }}
              >
                {scrollMode === 'vertical' ? (
                  /* Vertical Continuous Scroll View: All Chapters Stacked */
                  <div className="max-w-3xl mx-auto w-full space-y-16 pb-24">
                    {chapters.map((ch, idx) => (
                      <article key={ch.id || idx} className="space-y-6 border-b border-slate-200 dark:border-slate-800 pb-16">
                        <header className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Chapter {idx + 1} of {chapters.length}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                            {ch.title}
                          </h2>
                        </header>
                        <div
                          className="leading-relaxed space-y-5 select-text prose dark:prose-invert max-w-none"
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            fontFamily: selectedFont.family,
                            lineHeight: '1.8'
                          }}
                          dangerouslySetInnerHTML={{ __html: ch.html }}
                          onMouseUp={() => {
                            const sel = window.getSelection()?.toString() || "";
                            const clean = sel.replace(/[^a-zA-Z]/g, '').trim();
                            if (clean && clean.length >= 2) executeDictionaryLookup(clean);
                          }}
                        />
                      </article>
                    ))}
                  </div>
                ) : (
                  /* Horizontal Paginated View: One Chapter per View */
                  <div className="max-w-3xl mx-auto w-full pb-20 pt-4">
                    {currentChapter ? (
                      <article className="space-y-6">
                        <header className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Chapter {currentChapterIndex + 1} of {chapters.length}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                            {currentChapter.title}
                          </h2>
                        </header>
                        <div
                          className="leading-relaxed space-y-5 select-text prose dark:prose-invert max-w-none"
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            fontFamily: selectedFont.family,
                            lineHeight: '1.8'
                          }}
                          dangerouslySetInnerHTML={{ __html: currentChapter.html }}
                          onMouseUp={() => {
                            const sel = window.getSelection()?.toString() || "";
                            const clean = sel.replace(/[^a-zA-Z]/g, '').trim();
                            if (clean && clean.length >= 2) executeDictionaryLookup(clean);
                          }}
                        />
                      </article>
                    ) : (
                      <p className="text-slate-400 text-center py-16">No chapter content loaded.</p>
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
              disabled={currentChapterIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow disabled:opacity-40 disabled:pointer-events-none"
              title="Previous Page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400">
                Chapter {currentChapterIndex + 1} of {Math.max(1, chapters.length)} ({progressPercent}%)
              </span>
              <div className="w-24 sm:w-36 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full" 
                  style={{ width: `${Math.max(5, progressPercent)}%` }} 
                />
              </div>
            </div>

            <button
              onClick={() => triggerPageTurn('next')}
              disabled={currentChapterIndex >= chapters.length - 1}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow disabled:opacity-40 disabled:pointer-events-none"
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
