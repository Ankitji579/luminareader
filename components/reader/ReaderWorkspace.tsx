
type PersistentHighlight = {
  id: string;
  chapterIndex: number;
  startOffset: number;
  endOffset: number;
  colorId: string;
};
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme as useNextTheme } from "next-themes";

import localforage from "localforage";
import { Clock, Trash2, Library, Save } from "lucide-react";
import {
  Upload, BookOpen, Sun, Moon, Book, ZoomIn, ZoomOut,
  List, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2,
  Search, X, Type, ChevronDown, HelpCircle, RotateCcw,
  Volume2, MoveVertical, MoveHorizontal, Compass, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Palette, Bookmark, BookmarkCheck, Globe, Highlighter, Eraser,
} from "lucide-react";
import PdfViewer from "./PdfViewer";

import { parseEpubArchive, ParsedBook, ParsedChapter, TocItem } from "@/lib/epub-parser";
import { GOOGLE_FONTS, FontOption } from "@/lib/fonts-data";
import { lookupWordComprehensive, DictionaryResult } from "@/lib/dictionary-service";

// ─── HIGHLIGHT COLORS ─────────────────────────────────────────────────────────
// Semi-transparent so they look good on every theme
const HIGHLIGHT_COLORS = [
  { id: "yellow",  label: "Sunshine",  bg: "rgba(255, 236, 61, 0.55)",  border: "#f0c419" },
  { id: "green",   label: "Mint",      bg: "rgba(74, 222, 128, 0.45)",  border: "#22c55e" },
  { id: "pink",    label: "Rose",      bg: "rgba(249, 115, 148, 0.45)", border: "#f43f5e" },
  { id: "blue",    label: "Sky",       bg: "rgba(96, 165, 250, 0.45)",  border: "#3b82f6" },
  { id: "purple",  label: "Lavender",  bg: "rgba(167, 139, 250, 0.45)", border: "#8b5cf6" },
  { id: "orange",  label: "Peach",     bg: "rgba(251, 146, 60, 0.45)",  border: "#f97316" },
];

// ─── THEME SYSTEM ──────────────────────────────────────────────────────────────

export type ThemeName =
  | "light" | "sepia" | "dark" | "oled" | "forest" | "nord"
  | "solarized" | "gruvbox" | "catppuccin" | "rosepine" | "dracula"
  | "tokyonight" | "amber" | "midnight" | "highcontrast" | "paper";

interface ThemeConfig {
  name: string; emoji: string;
  bg: string; text: string; subtext: string;
  toolbarBg: string; toolbarBorder: string; toolbarText: string;
  btnBg: string; btnText: string; btnBorder: string;
  btnHoverBg: string; btnActiveBg: string; btnActiveText: string;
  panelBg: string; panelBorder: string; panelText: string;
  panelSubtext: string; panelAccent: string; panelAccentText: string; panelItemBg: string;
  progressFg: string; progressBg: string;
  progressGrad: string; // gradient for fancy progress bar
  tocBg: string; tocBorder: string; tocActiveText: string;
  proseBg: string; proseText: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: {
    name: "Light", emoji: "☀️",
    bg: "#ffffff", text: "#1e293b", subtext: "#64748b",
    toolbarBg: "#f8fafc", toolbarBorder: "#e2e8f0", toolbarText: "#1e293b",
    btnBg: "#f1f5f9", btnText: "#334155", btnBorder: "#cbd5e1", btnHoverBg: "#e2e8f0",
    btnActiveBg: "#4f46e5", btnActiveText: "#ffffff",
    panelBg: "#ffffff", panelBorder: "#e2e8f0", panelText: "#1e293b",
    panelSubtext: "#64748b", panelAccent: "#4f46e5", panelAccentText: "#ffffff", panelItemBg: "#f8fafc",
    progressFg: "#4f46e5", progressBg: "#e2e8f0",
    progressGrad: "linear-gradient(90deg, #6366f1, #8b5cf6, #4f46e5)",
    tocBg: "#f8fafc", tocBorder: "#e2e8f0", tocActiveText: "#ffffff",
    proseBg: "#ffffff", proseText: "#1e293b",
  },
  sepia: {
    name: "Sepia", emoji: "📜",
    bg: "#fbf0d9", text: "#433422", subtext: "#7c6448",
    toolbarBg: "#f5e6c4", toolbarBorder: "#d4b896", toolbarText: "#433422",
    btnBg: "#ecdcc0", btnText: "#5a3e28", btnBorder: "#c4a27a", btnHoverBg: "#e0ccaa",
    btnActiveBg: "#8b5e3c", btnActiveText: "#fff8ee",
    panelBg: "#fdf6e3", panelBorder: "#d4b896", panelText: "#433422",
    panelSubtext: "#7c6448", panelAccent: "#8b5e3c", panelAccentText: "#fff8ee", panelItemBg: "#f5e6c8",
    progressFg: "#8b5e3c", progressBg: "#d4b896",
    progressGrad: "linear-gradient(90deg, #c8893c, #a0612a, #8b5e3c)",
    tocBg: "#f5e6c4", tocBorder: "#d4b896", tocActiveText: "#fff8ee",
    proseBg: "#fbf0d9", proseText: "#433422",
  },
  dark: {
    name: "Dark", emoji: "🌙",
    bg: "#0f172a", text: "#e2e8f0", subtext: "#94a3b8",
    toolbarBg: "#1e293b", toolbarBorder: "#334155", toolbarText: "#e2e8f0",
    btnBg: "#334155", btnText: "#cbd5e1", btnBorder: "#475569", btnHoverBg: "#475569",
    btnActiveBg: "#6366f1", btnActiveText: "#ffffff",
    panelBg: "#1e293b", panelBorder: "#334155", panelText: "#e2e8f0",
    panelSubtext: "#94a3b8", panelAccent: "#6366f1", panelAccentText: "#ffffff", panelItemBg: "#0f172a",
    progressFg: "#6366f1", progressBg: "#334155",
    progressGrad: "linear-gradient(90deg, #818cf8, #a78bfa, #6366f1)",
    tocBg: "#1e293b", tocBorder: "#334155", tocActiveText: "#ffffff",
    proseBg: "#0f172a", proseText: "#e2e8f0",
  },
  oled: {
    name: "OLED", emoji: "⚫",
    bg: "#000000", text: "#ffffff", subtext: "#a1a1aa",
    toolbarBg: "#0a0a0a", toolbarBorder: "#27272a", toolbarText: "#ffffff",
    btnBg: "#18181b", btnText: "#d4d4d8", btnBorder: "#3f3f46", btnHoverBg: "#27272a",
    btnActiveBg: "#7c3aed", btnActiveText: "#ffffff",
    panelBg: "#0a0a0a", panelBorder: "#27272a", panelText: "#ffffff",
    panelSubtext: "#a1a1aa", panelAccent: "#7c3aed", panelAccentText: "#ffffff", panelItemBg: "#18181b",
    progressFg: "#7c3aed", progressBg: "#27272a",
    progressGrad: "linear-gradient(90deg, #a78bfa, #c4b5fd, #7c3aed)",
    tocBg: "#0a0a0a", tocBorder: "#27272a", tocActiveText: "#ffffff",
    proseBg: "#000000", proseText: "#ffffff",
  },
  forest: {
    name: "Forest", emoji: "🌲",
    bg: "#071f12", text: "#d1fae5", subtext: "#6ee7b7",
    toolbarBg: "#0d2e1a", toolbarBorder: "#166534", toolbarText: "#d1fae5",
    btnBg: "#14532d", btnText: "#86efac", btnBorder: "#15803d", btnHoverBg: "#166534",
    btnActiveBg: "#16a34a", btnActiveText: "#f0fdf4",
    panelBg: "#0d2e1a", panelBorder: "#166534", panelText: "#d1fae5",
    panelSubtext: "#6ee7b7", panelAccent: "#16a34a", panelAccentText: "#f0fdf4", panelItemBg: "#071f12",
    progressFg: "#16a34a", progressBg: "#166534",
    progressGrad: "linear-gradient(90deg, #4ade80, #86efac, #16a34a)",
    tocBg: "#0d2e1a", tocBorder: "#166534", tocActiveText: "#f0fdf4",
    proseBg: "#071f12", proseText: "#d1fae5",
  },
  nord: {
    name: "Nord", emoji: "❄️",
    bg: "#2e3440", text: "#eceff4", subtext: "#88c0d0",
    toolbarBg: "#3b4252", toolbarBorder: "#434c5e", toolbarText: "#eceff4",
    btnBg: "#434c5e", btnText: "#d8dee9", btnBorder: "#4c566a", btnHoverBg: "#4c566a",
    btnActiveBg: "#81a1c1", btnActiveText: "#2e3440",
    panelBg: "#3b4252", panelBorder: "#434c5e", panelText: "#eceff4",
    panelSubtext: "#88c0d0", panelAccent: "#81a1c1", panelAccentText: "#2e3440", panelItemBg: "#2e3440",
    progressFg: "#81a1c1", progressBg: "#434c5e",
    progressGrad: "linear-gradient(90deg, #88c0d0, #81a1c1, #5e81ac)",
    tocBg: "#3b4252", tocBorder: "#434c5e", tocActiveText: "#2e3440",
    proseBg: "#2e3440", proseText: "#eceff4",
  },
  solarized: {
    name: "Solarized", emoji: "🌅",
    bg: "#fdf6e3", text: "#657b83", subtext: "#93a1a1",
    toolbarBg: "#eee8d5", toolbarBorder: "#d3c9a9", toolbarText: "#586e75",
    btnBg: "#e8e2d0", btnText: "#586e75", btnBorder: "#c8c1ab", btnHoverBg: "#ddd7c5",
    btnActiveBg: "#268bd2", btnActiveText: "#fdf6e3",
    panelBg: "#eee8d5", panelBorder: "#d3c9a9", panelText: "#657b83",
    panelSubtext: "#93a1a1", panelAccent: "#268bd2", panelAccentText: "#fdf6e3", panelItemBg: "#fdf6e3",
    progressFg: "#268bd2", progressBg: "#d3c9a9",
    progressGrad: "linear-gradient(90deg, #2aa198, #268bd2, #6c71c4)",
    tocBg: "#eee8d5", tocBorder: "#d3c9a9", tocActiveText: "#fdf6e3",
    proseBg: "#fdf6e3", proseText: "#657b83",
  },
  gruvbox: {
    name: "Gruvbox", emoji: "🍂",
    bg: "#282828", text: "#ebdbb2", subtext: "#a89984",
    toolbarBg: "#3c3836", toolbarBorder: "#504945", toolbarText: "#ebdbb2",
    btnBg: "#504945", btnText: "#d5c4a1", btnBorder: "#665c54", btnHoverBg: "#665c54",
    btnActiveBg: "#d79921", btnActiveText: "#282828",
    panelBg: "#3c3836", panelBorder: "#504945", panelText: "#ebdbb2",
    panelSubtext: "#a89984", panelAccent: "#d79921", panelAccentText: "#282828", panelItemBg: "#282828",
    progressFg: "#d79921", progressBg: "#504945",
    progressGrad: "linear-gradient(90deg, #fabd2f, #d79921, #b57614)",
    tocBg: "#3c3836", tocBorder: "#504945", tocActiveText: "#282828",
    proseBg: "#282828", proseText: "#ebdbb2",
  },
  catppuccin: {
    name: "Catppuccin", emoji: "🐱",
    bg: "#1e1e2e", text: "#cdd6f4", subtext: "#a6adc8",
    toolbarBg: "#181825", toolbarBorder: "#313244", toolbarText: "#cdd6f4",
    btnBg: "#313244", btnText: "#bac2de", btnBorder: "#45475a", btnHoverBg: "#45475a",
    btnActiveBg: "#cba6f7", btnActiveText: "#1e1e2e",
    panelBg: "#181825", panelBorder: "#313244", panelText: "#cdd6f4",
    panelSubtext: "#a6adc8", panelAccent: "#cba6f7", panelAccentText: "#1e1e2e", panelItemBg: "#1e1e2e",
    progressFg: "#cba6f7", progressBg: "#313244",
    progressGrad: "linear-gradient(90deg, #f5c2e7, #cba6f7, #89b4fa)",
    tocBg: "#181825", tocBorder: "#313244", tocActiveText: "#1e1e2e",
    proseBg: "#1e1e2e", proseText: "#cdd6f4",
  },
  rosepine: {
    name: "Rosé Pine", emoji: "🌸",
    bg: "#191724", text: "#e0def4", subtext: "#908caa",
    toolbarBg: "#1f1d2e", toolbarBorder: "#26233a", toolbarText: "#e0def4",
    btnBg: "#26233a", btnText: "#c4c0d9", btnBorder: "#403d52", btnHoverBg: "#403d52",
    btnActiveBg: "#c4a7e7", btnActiveText: "#191724",
    panelBg: "#1f1d2e", panelBorder: "#26233a", panelText: "#e0def4",
    panelSubtext: "#908caa", panelAccent: "#c4a7e7", panelAccentText: "#191724", panelItemBg: "#191724",
    progressFg: "#c4a7e7", progressBg: "#26233a",
    progressGrad: "linear-gradient(90deg, #ebbcba, #c4a7e7, #9ccfd8)",
    tocBg: "#1f1d2e", tocBorder: "#26233a", tocActiveText: "#191724",
    proseBg: "#191724", proseText: "#e0def4",
  },
  dracula: {
    name: "Dracula", emoji: "🧛",
    bg: "#282a36", text: "#f8f8f2", subtext: "#6272a4",
    toolbarBg: "#21222c", toolbarBorder: "#44475a", toolbarText: "#f8f8f2",
    btnBg: "#44475a", btnText: "#f8f8f2", btnBorder: "#6272a4", btnHoverBg: "#6272a4",
    btnActiveBg: "#ff79c6", btnActiveText: "#282a36",
    panelBg: "#21222c", panelBorder: "#44475a", panelText: "#f8f8f2",
    panelSubtext: "#6272a4", panelAccent: "#ff79c6", panelAccentText: "#282a36", panelItemBg: "#282a36",
    progressFg: "#ff79c6", progressBg: "#44475a",
    progressGrad: "linear-gradient(90deg, #bd93f9, #ff79c6, #ffb86c)",
    tocBg: "#21222c", tocBorder: "#44475a", tocActiveText: "#282a36",
    proseBg: "#282a36", proseText: "#f8f8f2",
  },
  tokyonight: {
    name: "Tokyo Night", emoji: "🗼",
    bg: "#1a1b26", text: "#c0caf5", subtext: "#565f89",
    toolbarBg: "#16161e", toolbarBorder: "#2f3549", toolbarText: "#c0caf5",
    btnBg: "#2f3549", btnText: "#a9b1d6", btnBorder: "#414868", btnHoverBg: "#414868",
    btnActiveBg: "#7aa2f7", btnActiveText: "#1a1b26",
    panelBg: "#16161e", panelBorder: "#2f3549", panelText: "#c0caf5",
    panelSubtext: "#565f89", panelAccent: "#7aa2f7", panelAccentText: "#1a1b26", panelItemBg: "#1a1b26",
    progressFg: "#7aa2f7", progressBg: "#2f3549",
    progressGrad: "linear-gradient(90deg, #bb9af7, #7aa2f7, #73daca)",
    tocBg: "#16161e", tocBorder: "#2f3549", tocActiveText: "#1a1b26",
    proseBg: "#1a1b26", proseText: "#c0caf5",
  },
  amber: {
    name: "Warm Amber", emoji: "🌻",
    bg: "#fefce8", text: "#713f12", subtext: "#92400e",
    toolbarBg: "#fef9c3", toolbarBorder: "#fde68a", toolbarText: "#713f12",
    btnBg: "#fef3c7", btnText: "#78350f", btnBorder: "#fcd34d", btnHoverBg: "#fde68a",
    btnActiveBg: "#d97706", btnActiveText: "#fffbeb",
    panelBg: "#fef9c3", panelBorder: "#fde68a", panelText: "#713f12",
    panelSubtext: "#92400e", panelAccent: "#d97706", panelAccentText: "#fffbeb", panelItemBg: "#fefce8",
    progressFg: "#d97706", progressBg: "#fde68a",
    progressGrad: "linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)",
    tocBg: "#fef9c3", tocBorder: "#fde68a", tocActiveText: "#fffbeb",
    proseBg: "#fefce8", proseText: "#713f12",
  },
  midnight: {
    name: "Midnight Blue", emoji: "🌌",
    bg: "#0a0e27", text: "#c7d2fe", subtext: "#818cf8",
    toolbarBg: "#0e1438", toolbarBorder: "#1e254a", toolbarText: "#c7d2fe",
    btnBg: "#1e254a", btnText: "#a5b4fc", btnBorder: "#312e81", btnHoverBg: "#2d3561",
    btnActiveBg: "#6366f1", btnActiveText: "#ffffff",
    panelBg: "#0e1438", panelBorder: "#1e254a", panelText: "#c7d2fe",
    panelSubtext: "#818cf8", panelAccent: "#6366f1", panelAccentText: "#ffffff", panelItemBg: "#0a0e27",
    progressFg: "#6366f1", progressBg: "#1e254a",
    progressGrad: "linear-gradient(90deg, #818cf8, #6366f1, #4338ca)",
    tocBg: "#0e1438", tocBorder: "#1e254a", tocActiveText: "#ffffff",
    proseBg: "#0a0e27", proseText: "#c7d2fe",
  },
  highcontrast: {
    name: "High Contrast", emoji: "♟️",
    bg: "#000000", text: "#ffff00", subtext: "#00ff00",
    toolbarBg: "#111111", toolbarBorder: "#ffff00", toolbarText: "#ffff00",
    btnBg: "#222222", btnText: "#ffff00", btnBorder: "#ffff00", btnHoverBg: "#333333",
    btnActiveBg: "#ffff00", btnActiveText: "#000000",
    panelBg: "#111111", panelBorder: "#ffff00", panelText: "#ffff00",
    panelSubtext: "#00ff00", panelAccent: "#ffff00", panelAccentText: "#000000", panelItemBg: "#000000",
    progressFg: "#ffff00", progressBg: "#333333",
    progressGrad: "linear-gradient(90deg, #00ff00, #ffff00, #ff0000)",
    tocBg: "#111111", tocBorder: "#ffff00", tocActiveText: "#000000",
    proseBg: "#000000", proseText: "#ffff00",
  },
  paper: {
    name: "Paper White", emoji: "📄",
    bg: "#f5f5f0", text: "#1a1a1a", subtext: "#555555",
    toolbarBg: "#ededea", toolbarBorder: "#d1d1cc", toolbarText: "#1a1a1a",
    btnBg: "#e8e8e4", btnText: "#333333", btnBorder: "#c8c8c4", btnHoverBg: "#ddddd9",
    btnActiveBg: "#222222", btnActiveText: "#f5f5f0",
    panelBg: "#ededea", panelBorder: "#d1d1cc", panelText: "#1a1a1a",
    panelSubtext: "#555555", panelAccent: "#222222", panelAccentText: "#f5f5f0", panelItemBg: "#f5f5f0",
    progressFg: "#222222", progressBg: "#d1d1cc",
    progressGrad: "linear-gradient(90deg, #555555, #222222, #000000)",
    tocBg: "#ededea", tocBorder: "#d1d1cc", tocActiveText: "#f5f5f0",
    proseBg: "#f5f5f0", proseText: "#1a1a1a",
  },
};

const THEME_ORDER: ThemeName[] = [
  "light","sepia","dark","oled","forest","nord","solarized","gruvbox",
  "catppuccin","rosepine","dracula","tokyonight","amber","midnight","highcontrast","paper"
];

// ─── BOOKMARK TYPE ─────────────────────────────────────────────────────────────

interface Bookmark {
  id: string;
  chapterIndex: number;
  chapterTitle: string;
  scrollTop: number;
  label: string;
  createdAt: number;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ReaderWorkspace({ initialFormat }: { initialFormat?: string }) {
  // Book & Content States
  const [fileName, setFileName] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | Blob | null>(null);
  const [pdfModePrompt, setPdfModePrompt] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [bookAuthor, setBookAuthor] = useState<string>("");
  const [library, setLibrary] = useState<{ id: string, name: string, addedAt: number, size: number }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLib = localStorage.getItem("lumina_library");
      if (savedLib) {
        try {
          setLibrary(JSON.parse(savedLib));
        } catch (e) {}
      }
    }
  }, []);

  const saveToLibrary = (file: File | Blob, name: string) => {
    const bookId = `lumina_book_${name}`;
    localforage.setItem(bookId, file).then(() => {
      setLibrary(prev => {
        const filtered = prev.filter(p => p.name !== name);
        const newLib = [{ id: bookId, name, addedAt: Date.now(), size: file.size }, ...filtered];
        localStorage.setItem("lumina_library", JSON.stringify(newLib));
        return newLib;
      });
    });
  };

  const loadFromLibrary = async (name: string) => {
    setLoading(true);
    try {
      const bookId = `lumina_book_${name}`;
      const file: File | Blob | null = await localforage.getItem(bookId);
      if (file) {
        const f = file instanceof File ? file : new File([file], name, { type: file.type });
        await processFile(f, true);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const removeFromLibrary = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const bookId = `lumina_book_${name}`;
    await localforage.removeItem(bookId);
    setLibrary(prev => {
      const newLib = prev.filter(p => p.name !== name);
      localStorage.setItem("lumina_library", JSON.stringify(newLib));
      return newLib;
    });
  };
  
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [pathMap, setPathMap] = useState<Record<string, number>>({});
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  // Customization & Typography
  const [fontSize, setFontSize] = useState<number>(19);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [theme, setTheme] = useState<ThemeName>("light");
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme();

  // Sync initial reader theme with global Next.js theme
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [resolvedTheme]);

  const changeTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    if (setNextTheme) {
      setNextTheme(newTheme === "light" || newTheme === "sepia" ? "light" : "dark");
    }
  };
  const [selectedFont, setSelectedFont] = useState<FontOption>(GOOGLE_FONTS[0]);
  const [scrollMode, setScrollMode] = useState<"horizontal" | "vertical">("horizontal");

  // Font Selector Modal
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState("");
  const [fontCategoryFilter, setFontCategoryFilter] = useState<string>("all");

  // Theme Picker
  const [showThemePicker, setShowThemePicker] = useState(false);

  // UI Drawers & Controls
  const [showToc, setShowToc] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageFlipAnim, setPageFlipAnim] = useState<"next" | "prev" | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Dictionary State — word selection only creates bubble, manual input is separate
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<DictionaryResult | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [isMultiWord, setIsMultiWord] = useState(false);
  const [translationText, setTranslationText] = useState("");
  const [showDictionaryDrawer, setShowDictionaryDrawer] = useState(false);
  const [manualWordInput, setManualWordInput] = useState("");
  const [sidebarDictData, setSidebarDictData] = useState<DictionaryResult | null>(null);
  const [sidebarDictLoading, setSidebarDictLoading] = useState(false);
  // Bubble position: track click Y to show above/below
  const [bubblePos, setBubblePos] = useState<{ above: boolean }>({ above: false });

  // Progress for vertical scroll (0–100)
  // Track chapter progress
  useEffect(() => {
    if (isReading && fileName) {
      localStorage.setItem(`lumina_prog_${fileName}`, JSON.stringify({ chapterIndex: currentChapterIndex }));
    }
  }, [currentChapterIndex, isReading, fileName]);
  
  const [verticalProgress, setVerticalProgress] = useState(0);
  const chapterProgressRef = useRef<HTMLDivElement>(null);

  // Highlighter
  const [activeHighlightColor, setActiveHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false); // NEW: Dedicated highlighter mode
  const [isEraserMode, setIsEraserMode] = useState(false); // NEW: Dedicated eraser mode

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Save text selection range so we can restore it after state updates
  const savedRangeRef = useRef<Range | null>(null);
  // Store persistent user highlights
  // Type definition is above this now
  const customHighlightsRef = useRef<PersistentHighlight[]>([]);

  // Short alias for current theme config
  const T = THEMES[theme];

  // ─── FONT INJECTION ────────────────────────────────────────────────────────

  const getGoogleFontHref = (googleName: string) =>
    `https://fonts.googleapis.com/css2?family=${googleName}:wght@300;400;500;600;700;800&display=swap`;

  useEffect(() => {
    const fontHref = getGoogleFontHref(selectedFont.googleName);
    if (typeof document !== "undefined" && !document.querySelector(`link[href="${fontHref}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontHref;
      document.head.appendChild(link);
    }
  }, [selectedFont]);

  // ─── SCROLL & CHAPTER PROGRESS TRACKER ──────────────────────────────────────
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isReading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const max = scrollHeight - clientHeight;
      const pct = max <= 0 ? 100 : Math.min(100, Math.round((scrollTop / max) * 100));
      setVerticalProgress(pct);

      if (scrollMode === "horizontal") {
        if (chapterProgressRef.current) chapterProgressRef.current.style.width = (max <= 0 ? 100 : Math.min(100, Math.max(0, (scrollTop / max) * 100))) + "%";
      } else {
        // Vertical mode: calculate progress based on the chapter in view
        let found = false;
        const containerRect = container.getBoundingClientRect();
        
        for (let i = 0; i < chapters.length; i++) {
          const el = document.getElementById(`chapter-container-${i}`);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          
          const relTop = rect.top - containerRect.top;
          const relBottom = rect.bottom - containerRect.top;
          
          if (relTop <= containerRect.height && relBottom >= 0) {
            if (relTop <= 0 && relBottom >= 0) {
              const maxScroll = Math.max(1, rect.height - containerRect.height);
              const progress = Math.min(100, Math.max(0, (-relTop / maxScroll) * 100));
              if (chapterProgressRef.current) chapterProgressRef.current.style.width = progress + "%";
              
              if (currentChapterIndex !== i && -relTop > 50) {
                 setCurrentChapterIndex(i);
              }
              found = true;
              break;
            } else if (relTop > 0) {
              if (!found && chapterProgressRef.current) chapterProgressRef.current.style.width = "0%";
              found = true;
              break;
            }
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Slight delay to allow DOM to render before calculating
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollMode, isReading, chapters, currentChapterIndex]);

  // Reset vertical progress when switching modes
  useEffect(() => {
    if (scrollMode === "horizontal") setVerticalProgress(0);
  }, [scrollMode]);

  // ─── DICTIONARY BUBBLE HELPERS ─────────────────────────────────────────────

  const closeDictionaryBubble = useCallback(() => {
    setSelectedWord(null);
    if (typeof CSS !== "undefined" && "highlights" in CSS) {
      (CSS as any).highlights.delete("dict-selection");
    }
    window.getSelection()?.removeAllRanges();
  }, []);

  // ─── DICTIONARY / TRANSLATION BUBBLE (selection-triggered) ───────────────────

  const applyDictHighlight = useCallback(() => {
    setTimeout(() => {
      const range = savedRangeRef.current;
      if (!range) return;

      if (typeof CSS !== "undefined" && "highlights" in CSS) {
        try {
          const highlight = new (window as any).Highlight(range);
          (CSS as any).highlights.set("dict-selection", highlight);
        } catch (e) {}
      }

      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 10);
  }, []);

  const executeBubbleTranslation = useCallback(async (text: string, above: boolean) => {
    setBubblePos({ above });
    setSelectedWord(text);
    setDictionaryData(null);
    setTranslationText("");
    setDictionaryLoading(true);
    
    applyDictHighlight();

    try {
      // Import the helper dynamically if needed, or assume it's imported at the top
      const { fetchHindiTranslation } = await import("@/lib/dictionary-service");
      const translated = await fetchHindiTranslation(text);
      if (translated) {
        setTranslationText(translated);
      } else {
        setTranslationText("Translation not available.");
      }
    } catch (e) {
      console.error("Translation error:", e);
      setTranslationText("Translation error.");
    } finally {
      setDictionaryLoading(false);
    }
  }, [applyDictHighlight]);

  const executeBubbleLookup = useCallback(async (word: string, above: boolean) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "").trim();
    if (!clean || clean.length < 2) return;
    setBubblePos({ above });
    setSelectedWord(clean);
    setDictionaryData(null);
    setDictionaryLoading(true);

    applyDictHighlight();

    try {
      const result = await lookupWordComprehensive(clean);
      result.hindiTranslation = undefined;
      setDictionaryData(result);
    } catch (e) {
      console.error("Dictionary lookup error:", e);
    } finally {
      setDictionaryLoading(false);
    }
  }, [applyDictHighlight]);

  // ─── DICTIONARY — SIDEBAR (manual input) ──────────────────────────────────

  const executeSidebarLookup = useCallback(async (word: string) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "").trim();
    if (!clean || clean.length < 2) return;
    setSidebarDictLoading(true);
    setSidebarDictData(null);
    try {
      const result = await lookupWordComprehensive(clean);
      result.hindiTranslation = undefined; // user must click Translate button
      setSidebarDictData(result);
    } catch (e) {
      console.error("Sidebar lookup error:", e);
    } finally {
      setSidebarDictLoading(false);
    }
  }, []);

  // ─── HINDI TRANSLATION (on-demand, button-triggered) ──────────────────────

  const fetchHindi = useCallback(async (word: string, forSidebar: boolean) => {
    try {
      const { fetchHindiTranslation } = await import("@/lib/dictionary-service");
      const translated = await fetchHindiTranslation(word);
      if (translated && translated.toLowerCase() !== word.toLowerCase()) {
        if (forSidebar) {
          setSidebarDictData(prev => prev ? { ...prev, hindiTranslation: translated } : prev);
        } else {
          setDictionaryData(prev => prev ? { ...prev, hindiTranslation: translated } : prev);
        }
      }
    } catch { /* silent */ }
  }, []);

  // ─── SPEECH ────────────────────────────────────────────────────────────────

  const speakWord = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ─── PAGE TURN ─────────────────────────────────────────────────────────────

  const triggerPageTurn = useCallback(
    (direction: "next" | "prev") => {
      setPageFlipAnim(direction);
      setTimeout(() => setPageFlipAnim(null), 300);
      if (direction === "next") {
        setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
      } else {
        setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
      }
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    },
    [chapters.length]
  );

  // ─── KEYBOARD NAV ──────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReading) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault(); triggerPageTurn("next");
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault(); triggerPageTurn("prev");
      } else if (e.key === "Escape") {
        if (selectedWord) { closeDictionaryBubble(); return; }
        if (showThemePicker) { setShowThemePicker(false); return; }
        if (showFontMenu) { setShowFontMenu(false); return; }
        setIsReading(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReading, triggerPageTurn, selectedWord, showThemePicker, showFontMenu, closeDictionaryBubble]);

  // Close bubble on outside click
  useEffect(() => {
    if (!selectedWord) return;
    const handler = (e: MouseEvent) => {
      const bubble = document.getElementById("dict-bubble");
      if (bubble && !bubble.contains(e.target as Node)) {
        closeDictionaryBubble();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedWord, closeDictionaryBubble]);

  // ─── FILE PROCESSING ───────────────────────────────────────────────────────

  const processFile = async (f: File, fromLibrary = false, forcePdfMode?: 'original' | 'text') => {
    const extRaw = f.name.split(".").pop()?.toLowerCase() || "";
    if (extRaw === "pdf" && !forcePdfMode) {
      setPdfModePrompt(f);
      return;
    }
    
    if (!fromLibrary) saveToLibrary(f, f.name);
    setLoading(true);
    setFileName(f.name);
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    setFileType(ext === "pdf" && forcePdfMode === "text" ? "pdf-text" : ext);
    try {
      if (ext === "epub") {
        const buffer = await f.arrayBuffer();
        const parsed = await parseEpubArchive(buffer, f.name);
        setBookTitle(parsed.title || f.name);
        setBookAuthor(parsed.author || "");
        setChapters(parsed.chapters);
        setToc(parsed.toc);
        setPathMap(parsed.pathMap);
        
        const savedProg = localStorage.getItem(`lumina_prog_${f.name}`);
        if (savedProg) {
          try {
            setCurrentChapterIndex(JSON.parse(savedProg).chapterIndex || 0);
          } catch(e) { setCurrentChapterIndex(0); }
        } else {
          setCurrentChapterIndex(0);
        }

        setIsReading(true);
        setLoading(false);
      } else if (ext === "pdf" && forcePdfMode === "original") {
        setCurrentFile(f);
        const url = URL.createObjectURL(f);
        setPdfUrl(url);
        setBookTitle(f.name.replace(/\.[^/.]+$/, ""));
        setBookAuthor("PDF Document");
        setChapters([]);
        setToc([]);
        setIsReading(true);
        setLoading(false);
      } else if (ext === "pdf" && forcePdfMode === "text") {
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== "undefined") {
          const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const blob = new Blob([`importScripts('${workerUrl}');`], { type: 'text/javascript' });
          pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(blob));
        }
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        const tempChapters = [];
        const tempToc = [];
        const tempPathMap: Record<string, number> = {};
        
        let currentChunk = "";
        let chunkIndex = 0;
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => (item as any).str || "").join(" ");
            
            currentChunk += textItems + "<br/><br/>";
            
            if (i % 10 === 0 || i === pdf.numPages) {
                chunkIndex++;
                const chTitle = `Section ${chunkIndex} (Pages ${i - (i % 10 === 0 ? 9 : (i % 10) - 1)}-${i})`;
                
                tempChapters.push({
                   id: `pdf-sec-${chunkIndex}`,
                   fullPath: `pdf-sec-${chunkIndex}`,
                   fileName: `pdf-sec-${chunkIndex}`,
                   title: chTitle,
                   html: currentChunk,
                   textLength: currentChunk.length
                });
                tempToc.push({ label: chTitle, chapterIndex: chunkIndex - 1 });
                tempPathMap[`pdf-sec-${chunkIndex}`] = chunkIndex - 1;
                currentChunk = "";
            }
        }
        
        setBookTitle(f.name.replace(/\.[^/.]+$/, ""));
        setBookAuthor("PDF (Text Mode)");
        setChapters(tempChapters.length > 0 ? tempChapters : [{ id: "c1", title: "Empty", html: "No text found", textLength: 0, fullPath: "c1", fileName: "c1" }]);
        setToc(tempToc);
        setPathMap(tempPathMap);
        
        const savedProg = localStorage.getItem(`lumina_prog_${f.name}`);
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
            tempChapters.push({ id: `section-${tempChapters.length + 1}`, fullPath: `section-${tempChapters.length + 1}`, fileName: `section-${tempChapters.length + 1}`, title: chTitle, html: currentChunk.replace(/\n/g, "<br/>"), textLength: currentChunk.length });
            tempToc.push({ label: chTitle, chapterIndex: tempChapters.length - 1 });
            tempPathMap[`section-${tempChapters.length}`] = tempChapters.length - 1;
            currentChunk = "";
          }
        }
        setBookTitle(f.name.replace(/\.[^/.]+$/, ""));
        setBookAuthor("Document");
        setChapters(tempChapters.length > 0 ? tempChapters : [{ id: "c1", fullPath: "c1", fileName: "c1", title: f.name, html: text.replace(/\n/g, "<br/>"), textLength: text.length }]);
        setToc(tempToc);
        setPathMap(tempPathMap);
        
        const savedProg = localStorage.getItem(`lumina_prog_${f.name}`);
        if (savedProg) {
          try {
            setCurrentChapterIndex(JSON.parse(savedProg).chapterIndex || 0);
          } catch(e) { setCurrentChapterIndex(0); }
        } else {
          setCurrentChapterIndex(0);
        }

        setIsReading(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Reader processing error:", err);
      try {
        const text = await f.text();
        setBookTitle(f.name);
        setChapters([{ id: "fallback", fullPath: "fallback", fileName: "fallback", title: f.name, html: text.replace(/\n/g, "<br/>").slice(0, 60000), textLength: text.length }]);
        setToc([{ label: "Start", chapterIndex: 0 }]);
        
        const savedProg = localStorage.getItem(`lumina_prog_${f.name}`);
        if (savedProg) {
          try {
            setCurrentChapterIndex(JSON.parse(savedProg).chapterIndex || 0);
          } catch(e) { setCurrentChapterIndex(0); }
        } else {
          setCurrentChapterIndex(0);
        }

        setIsReading(true);
      } catch {}
      setLoading(false);
    }
  };

  // ─── INTERNAL LINK HANDLING ────────────────────────────────────────────────

  const handleContentClick = (e: React.MouseEvent) => {
    const anchorEl = (e.target as HTMLElement).closest("a");
    if (anchorEl) {
      const targetFile = anchorEl.getAttribute("data-chapter-target");
      const anchor = anchorEl.getAttribute("data-anchor-target");
      const href = anchorEl.getAttribute("href");
      if (targetFile || (href && !href.startsWith("http") && !href.startsWith("mailto"))) {
        e.preventDefault(); e.stopPropagation();
        const fileToFind = (targetFile || href || "").split("#")[0].split("/").pop() || "";
        const targetIdx = pathMap[fileToFind] ?? (targetFile ? pathMap[targetFile] : undefined);
        if (typeof targetIdx === "number" && targetIdx >= 0 && targetIdx < chapters.length) {
          setCurrentChapterIndex(targetIdx);
          if (anchor) setTimeout(() => { const el = document.getElementById(anchor) || document.querySelector(`[name="${anchor}"]`); el?.scrollIntoView({ behavior: "smooth" }); }, 100);
          if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
          return;
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processFile(f); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); };

  // ─── FULLSCREEN ────────────────────────────────────────────────────────────

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { readerContainerRef.current?.requestFullscreen?.(); setIsFullscreen(true); }
    else { document.exitFullscreen?.(); setIsFullscreen(false); }
  };

  // ─── BOOKMARKS ─────────────────────────────────────────────────────────────

  const isCurrentPageBookmarked = bookmarks.some(b => b.chapterIndex === currentChapterIndex);

  const toggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      setBookmarks(prev => prev.filter(b => b.chapterIndex !== currentChapterIndex));
    } else {
      const scrollTop = scrollContainerRef.current?.scrollTop || 0;
      const ch = chapters[currentChapterIndex];
      setBookmarks(prev => [...prev, {
        id: `bm-${Date.now()}`,
        chapterIndex: currentChapterIndex,
        chapterTitle: ch?.title || `Chapter ${currentChapterIndex + 1}`,
        scrollTop,
        label: `${ch?.title || `Chapter ${currentChapterIndex + 1}`}`,
        createdAt: Date.now(),
      }]);
    }
  };

  const jumpToBookmark = (bm: Bookmark) => {
    setCurrentChapterIndex(bm.chapterIndex);
    setShowBookmarks(false);
    setTimeout(() => {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = bm.scrollTop;
    }, 80);
  };

  // ─── DEMO BOOK ─────────────────────────────────────────────────────────────

  const loadDemoBook = async () => {
    setLoading(true);
    setFileName("Sherlock_Holmes_Classic_Demo.epub");
    setFileType("epub");
    setBookTitle("The Adventures of Sherlock Holmes");
    setBookAuthor("Sir Arthur Conan Doyle");
    const demoChapter1 = `<h1>Chapter 1: A Scandal in Bohemia</h1><p>To Sherlock Holmes she is always <strong>THE</strong> woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.</p><p>He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions.</p><p>And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.</p>`;
    const demoChapter2 = `<h1>Chapter 2: The Red-Headed League</h1><p>I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.</p><p>With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.</p><p>"You could not have come at a better time, my dear Watson," he said cordially.</p>`;
    setChapters([
      { id: "ch1", fullPath: "ch1.html", fileName: "ch1.html", title: "Chapter 1: A Scandal in Bohemia", html: demoChapter1, textLength: demoChapter1.length },
      { id: "ch2", fullPath: "ch2.html", fileName: "ch2.html", title: "Chapter 2: The Red-Headed League", html: demoChapter2, textLength: demoChapter2.length },
    ]);
    setToc([
      { label: "Chapter 1: A Scandal in Bohemia", chapterIndex: 0 },
      { label: "Chapter 2: The Red-Headed League", chapterIndex: 1 },
    ]);
    
        setCurrentChapterIndex(0);

    setIsReading(true);
    setLoading(false);
  };

  // ─── COMPUTED ──────────────────────────────────────────────────────────────

  const filteredFonts = GOOGLE_FONTS.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(fontSearchQuery.toLowerCase());
    const matchesCategory = fontCategoryFilter === "all" || f.category === fontCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  const currentChapter = chapters[currentChapterIndex];
  // For horizontal mode — chapter-based progress
  const horizontalProgress = chapters.length > 0 ? Math.round(((currentChapterIndex + 1) / chapters.length) * 100) : 0;
  // Progress to show in bottom bar
  const displayProgress = scrollMode === "vertical" ? verticalProgress : horizontalProgress;

  
  // ─── PERMANENT HIGHLIGHTER SYSTEM (CSS Custom Highlights) ────────────────
  
  // DOM Walker to get exact character offsets relative to a container
  const getSelectionOffsets = (container: HTMLElement, range: Range) => {
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return { start, end: start + range.toString().length };
  };

  // DOM Walker to restore a Range from exact character offsets
  const createRangeFromOffsets = (container: HTMLElement, start: number, end: number): Range | null => {
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(container, 0);
    range.collapse(true);
    
    const nodeStack: Node[] = [container];
    let node: Node | undefined;
    let foundStart = false;
    let stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        const textLength = node.nodeValue?.length || 0;
        const nextCharIndex = charIndex + textLength;
        
        if (!foundStart && start >= charIndex && start <= nextCharIndex) {
          range.setStart(node, start - charIndex);
          foundStart = true;
        }
        if (foundStart && end >= charIndex && end <= nextCharIndex) {
          range.setEnd(node, end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
    return stop ? range : null;
  };

  const renderCSSHighlights = useCallback(() => {
    if (typeof CSS === "undefined" || !("highlights" in CSS)) return;
    
    const groups: Record<string, Range[]> = {};
    HIGHLIGHT_COLORS.forEach(c => groups[c.id] = []);

    customHighlightsRef.current.forEach(h => {
      const article = document.getElementById(`chapter-container-${h.chapterIndex}`);
      if (!article) return;
      const range = createRangeFromOffsets(article, h.startOffset, h.endOffset);
      if (range && groups[h.colorId]) {
        groups[h.colorId].push(range);
      }
    });

    HIGHLIGHT_COLORS.forEach(c => {
      const highlightName = `lumina-hl-${c.id}`;
      try {
        (CSS as any).highlights.delete(highlightName);
        if (groups[c.id].length > 0) {
          const highlight = new (window as any).Highlight(...groups[c.id]);
          (CSS as any).highlights.set(highlightName, highlight);
        }
      } catch (e) {
        console.error("CSS Highlights error", e);
      }
    });
  }, []);

  const saveHighlightsLocal = () => {
    if (typeof window !== "undefined" && bookTitle) {
      localStorage.setItem(`lumina_hl_${bookTitle}`, JSON.stringify(customHighlightsRef.current));
    }
  };

  const applyHighlightColor = useCallback((range: Range, color: typeof HIGHLIGHT_COLORS[0]) => {
    let container: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === 3) container = container.parentElement;
    const article = container?.closest('article[id^="chapter-container-"]');
    
    if (!article) return;
    const chapterIndex = parseInt(article.id.replace('chapter-container-', ''), 10);
    const { start, end } = getSelectionOffsets(article as HTMLElement, range);
    
    customHighlightsRef.current.push({
      id: Date.now().toString(),
      chapterIndex,
      startOffset: start,
      endOffset: end,
      colorId: color.id
    });
    
    saveHighlightsLocal();
    renderCSSHighlights();
  }, [renderCSSHighlights, bookTitle]);

  const eraseHighlights = useCallback((range: Range) => {
    let container: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === 3) container = container.parentElement;
    const article = container?.closest('article[id^="chapter-container-"]');
    if (!article) return;
    const chapterIndex = parseInt(article.id.replace('chapter-container-', ''), 10);
    const { start, end } = getSelectionOffsets(article as HTMLElement, range);

    customHighlightsRef.current = customHighlightsRef.current.filter(h => {
      if (h.chapterIndex !== chapterIndex) return true;
      // Intersection math on character offsets
      const overlap = Math.max(start, h.startOffset) < Math.min(end, h.endOffset);
      return !overlap;
    });

    saveHighlightsLocal();
    renderCSSHighlights();
  }, [renderCSSHighlights, bookTitle]);


  

  // Re-apply highlights whenever the component re-renders (like during theme or font changes)
  // because React updating the <style> tags might clear the CSS custom highlights registry in some browsers.
  useEffect(() => {
    renderCSSHighlights();
  });


  // ─── MOUSE SELECTION HANDLER ───────────────────────────────────────────────

  const handleTextMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
    const selStr = selection.toString().trim();
    if (!selStr) return;
    
    const range = selection.getRangeAt(0).cloneRange();

    // ── ERASER MODE ──
    if (isEraserMode) {
      if (typeof CSS !== "undefined" && "highlights" in CSS) {
        eraseHighlights(range);
      } else {
        // Fallback for older browsers
        try {
          document.designMode = "on";
          document.execCommand("removeFormat", false);
          document.execCommand("backColor", false, "transparent");
          document.designMode = "off";
        } catch (e) {}
      }
      selection.removeAllRanges();
      return; // Skip dictionary
    }

    // ── HIGHLIGHTER MODE ──
    if (isHighlightMode) {
      if (typeof CSS !== "undefined" && "highlights" in CSS) {
        // Modern approach: Native Highlight API
        applyHighlightColor(range, activeHighlightColor);
      } else {
        // Fallback for older browsers
        try {
          document.designMode = "on";
          document.execCommand("backColor", false, activeHighlightColor.bg);
          document.execCommand("HiliteColor", false, activeHighlightColor.bg);
          document.designMode = "off";
        } catch (e) {}
      }
      selection.removeAllRanges();
      return; // Skip dictionary lookup completely!
    }

    // ── DICTIONARY / TRANSLATION MODE ──
    const words = selStr.split(/\s+/).filter(w => w.trim().length > 0);
    
    // Save the selection range BEFORE React state update collapses it
    savedRangeRef.current = range;
    const winH = window.innerHeight;
    const y = e.clientY;

    if (words.length === 1) {
      // SINGLE WORD: Dictionary
      const clean = words[0].replace(/[^a-zA-Z]/g, "").trim();
      if (clean && clean.length >= 2) {
        setIsMultiWord(false);
        executeBubbleLookup(clean, y > winH * 0.55);
      }
    } else if (words.length > 1) {
      // MULTI WORD: Translation
      setIsMultiWord(true);
      executeBubbleTranslation(selStr, y > winH * 0.55);
    }
  };

  // ─── STYLE HELPERS ─────────────────────────────────────────────────────────

  const getBubbleStyle = (): React.CSSProperties => ({
    position: "absolute",
    zIndex: 50,
    width: "22rem",
    maxWidth: "calc(100vw - 2rem)",
    right: "1.5rem",
    background: T.panelBg,
    border: `1.5px solid ${T.panelBorder}`,
    color: T.panelText,
    borderRadius: "1rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    padding: "1rem",
    ...(bubblePos.above ? { bottom: "4.5rem" } : { top: "1rem" }),
  });

  const btnStyle: React.CSSProperties = { background: T.btnBg, color: T.btnText, border: `1px solid ${T.btnBorder}` };
  const btnActiveStyle: React.CSSProperties = { background: T.btnActiveBg, color: T.btnActiveText, border: `1px solid ${T.btnActiveBg}` };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={readerContainerRef}
      className={`w-full ${isReading ? "fixed inset-0 z-50 p-0 overflow-hidden select-text" : "max-w-7xl mx-auto my-4 px-2 sm:px-4"}`}
      style={isReading ? { background: T.bg, color: T.text } : undefined}
    >
      {loading && (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-w-xl mx-auto my-12">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opening E-Book Workspace...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading chapters, 116 typography engines & instant dictionary.</p>
        </div>
      )}

      {/* ── UPLOAD DROPZONE ─────────────────────────────────────────────────── */}
      {!isReading && !loading ? (
        <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative group overflow-hidden rounded-[2rem] border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 sm:p-20 text-center transition-all hover:border-indigo-500/50 hover:bg-white/60 dark:hover:bg-black/60 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/20 max-w-4xl mx-auto w-full">
          
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-500 ease-out rotate-3 group-hover:rotate-6">
              <Upload className="w-10 h-10 drop-shadow-md -rotate-3 group-hover:-rotate-6 transition-transform duration-500" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Drop your book here</h2>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">Supports <span className="text-indigo-600 dark:text-indigo-400 font-bold">.EPUB</span> and <span className="text-indigo-600 dark:text-indigo-400 font-bold">.PDF</span></p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <label className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-slate-900/20 dark:shadow-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" /><span>Select File</span>
                <input type="file" accept=".epub,.pdf,.mobi,.azw3,.fb2,.cbz,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadDemoBook} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 hover:border-indigo-500/50 hover:text-slate-900 dark:hover:text-white">
                <Sparkles className="w-5 h-5 text-indigo-500" /><span>Try Demo Book</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── CONTINUE READING & MY LIBRARY ──────────────────────────────────── */}
      {!isReading && !loading && library.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8 mb-16 space-y-8 animate-fade-in px-4">
          
          {/* Continue Reading (Most Recent) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => loadFromLibrary(library[0].name)}>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-indigo-50">
                  <Clock className="w-3.5 h-3.5" /> Continue Reading
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold line-clamp-1">{library[0].name}</h3>
                  <p className="text-indigo-200 text-sm mt-1">
                    {(() => {
                      const prog = typeof window !== "undefined" ? localStorage.getItem(`lumina_prog_${library[0].name}`) : null;
                      if (prog) {
                        try { return `Pick up exactly where you left off at Chapter ${JSON.parse(prog).chapterIndex + 1}`; } catch(e){}
                      }
                      return "Pick up exactly where you left off";
                    })()}
                  </p>
                </div>
              </div>
              <button className="shrink-0 px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-95 transition-all">
                Resume Book
              </button>
            </div>
          </div>

          {/* Library Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 text-slate-800 dark:text-slate-200 gap-2">
              <div className="flex items-center gap-2">
                <Library className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold">My Local Library</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {library.length} {library.length === 1 ? "Book" : "Books"} Stored (Up to 5GB Capacity)
              </span>
            </div>
            
            {library.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {library.slice(1).map((book) => {
                  const progRaw = typeof window !== "undefined" ? localStorage.getItem(`lumina_prog_${book.name}`) : null;
                  let chapProg = 0;
                  if (progRaw) {
                    try { chapProg = JSON.parse(progRaw).chapterIndex; } catch(e) {}
                  }
                  
                  return (
                    <div 
                      key={book.id} 
                      onClick={() => loadFromLibrary(book.name)}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg"
                    >
                      <div className="w-12 h-16 shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center text-indigo-500 font-bold uppercase text-xs overflow-hidden">
                        {book.name.split('.').pop()}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={book.name}>{book.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(book.addedAt).toLocaleDateString()}</span>
                          {chapProg > 0 && <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-medium"><Save className="w-3 h-3" /> Ch {chapProg + 1}</span>}
                        </div>
                      </div>
                      <button onClick={(e) => removeFromLibrary(book.name, e)} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all" title="Remove from device">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {isReading ? (
        /* ── READING MODE ─────────────────────────────────────────────────── */
        <div className="flex flex-col h-screen w-screen" style={{ background: T.bg, color: T.text }}>

          {/* ── TOP TOOLBAR ─────────────────────────────────────────────── */}
          <div className="relative h-14 px-3 sm:px-5 flex items-center justify-between gap-2 text-xs shrink-0 z-30" style={{ background: T.toolbarBg, borderBottom: `1px solid ${T.toolbarBorder}`, color: T.toolbarText }}>
            
            
            {/* Left: Close + Title */}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsReading(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors" style={btnStyle} title="Exit Reader">
                <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Close</span>
              </button>
              <div className="flex items-center gap-1.5 max-w-[130px] sm:max-w-xs font-semibold text-xs sm:text-sm truncate">
                <Book className="w-4 h-4 shrink-0" style={{ color: T.panelAccent }} />
                <span className="truncate">{bookTitle || fileName}</span>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Scroll Mode Toggle */}
              <button onClick={() => setScrollMode(scrollMode === "horizontal" ? "vertical" : "horizontal")} className="p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center" style={scrollMode === "vertical" ? btnActiveStyle : btnStyle} title="Switch between Page Flip and Vertical Scroll">
                {scrollMode === "horizontal" ? <MoveHorizontal className="w-4 h-4" /> : <MoveVertical className="w-4 h-4" />}
              </button>

              {/* Dictionary Launcher */}
              <button onClick={() => setShowDictionaryDrawer(!showDictionaryDrawer)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5" style={showDictionaryDrawer ? btnActiveStyle : btnStyle} title="Open Dictionary">
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* Bookmark */}
              <button onClick={toggleBookmark} className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1" style={isCurrentPageBookmarked ? btnActiveStyle : btnStyle} title={isCurrentPageBookmarked ? "Remove Bookmark" : "Bookmark This Page"}>
                {isCurrentPageBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>

              {/* Bookmarks List */}
              <div className="relative">
                <button onClick={() => setShowBookmarks(!showBookmarks)} className="p-1.5 rounded-lg text-xs font-semibold transition-colors relative flex items-center justify-center" style={showBookmarks ? btnActiveStyle : btnStyle} title="View Bookmarks">
                  <List className="w-4 h-4" />
                  {bookmarks.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full text-[8px] font-extrabold shadow-sm" style={{ background: T.panelAccent, color: T.panelAccentText }}>
                      {bookmarks.length}
                    </span>
                  )}
                </button>
                {showBookmarks && (
                  <div className="absolute right-0 top-11 z-50 w-72 p-3 rounded-2xl shadow-2xl space-y-2" style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, color: T.panelText }}>
                    <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                      <span className="font-bold text-xs">📌 Bookmarks</span>
                      <button onClick={() => setShowBookmarks(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>
                    {bookmarks.length === 0 ? (
                      <p className="text-xs py-3 text-center" style={{ color: T.panelSubtext }}>No bookmarks yet. Click the 🔖 icon to save a page.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
                        {bookmarks.map(bm => (
                          <div key={bm.id} className="flex items-center gap-2 rounded-xl px-2.5 py-2" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
                            <button onClick={() => jumpToBookmark(bm)} className="flex-1 text-left text-xs font-medium truncate" style={{ color: T.panelText }}>{bm.label}</button>
                            <button onClick={() => setBookmarks(prev => prev.filter(b => b.id !== bm.id))} className="shrink-0" style={{ color: T.panelSubtext }} title="Remove"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Highlighter Tool */}
              <div className="relative flex items-center">
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${T.btnBorder}`, background: T.btnBg }}>
                  {/* Mode Toggle Button */}
                  <button 
                    onClick={() => { setIsHighlightMode(!isHighlightMode); setIsEraserMode(false); }} 
                    className="px-3 py-1.5 flex items-center transition-colors border-r" 
                    style={isHighlightMode ? { background: activeHighlightColor.bg, borderColor: T.btnBorder } : { background: "transparent", borderColor: T.btnBorder }} 
                    title="Highlighter Mode"
                  >
                    <Highlighter className="w-4 h-4" style={!isHighlightMode ? { color: activeHighlightColor.border } : { color: T.text }} />
                  </button>

                  {/* Eraser Mode Toggle */}
                  <button 
                    onClick={() => { setIsEraserMode(!isEraserMode); setIsHighlightMode(false); }}
                    className="px-3 py-1.5 flex items-center transition-colors border-r"
                    style={isEraserMode ? { background: T.panelAccent, color: T.panelAccentText, borderColor: T.btnBorder } : { background: "transparent", color: T.btnText, borderColor: T.btnBorder }}
                    title="Eraser Mode"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>

                  {/* Color Picker Toggle */}
                  <button 
                    onClick={() => setShowHighlightPicker(!showHighlightPicker)} 
                    className="px-2 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors h-full flex items-center gap-1.5" 
                    title="Choose Color"
                  >
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: activeHighlightColor.bg, border: `1px solid ${activeHighlightColor.border}` }} />
                    <ChevronDown className="w-3 h-3" style={{ color: T.btnText }} />
                  </button>
                </div>

                {/* Color Picker Dropdown (Safely outside the overflow-hidden box!) */}
                {showHighlightPicker && (
                  <div className="absolute right-0 top-11 z-50 w-48 p-2 rounded-2xl shadow-2xl space-y-1" style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, color: T.panelText }}>
                    <div className="flex items-center justify-between pb-2 mb-1" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                      <span className="font-bold text-xs px-1">Colors</span>
                      <button onClick={() => setShowHighlightPicker(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>
                    {HIGHLIGHT_COLORS.map(color => (
                      <button key={color.id} onClick={() => { setActiveHighlightColor(color); setIsHighlightMode(true); setIsEraserMode(false); setShowHighlightPicker(false); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105" style={{ background: color.bg, color: T.text, border: `1px solid ${color.border}`, opacity: activeHighlightColor.id === color.id ? 1 : 0.6 }}>
                        <span className="w-3 h-3 rounded-full" style={{ background: color.border }} />
                        {color.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Selector */}
              <div className="relative">
                <button onClick={() => setShowFontMenu(!showFontMenu)} className="p-1.5 rounded-lg flex items-center justify-center transition-colors" style={showFontMenu ? btnActiveStyle : btnStyle} title={`Choose Font (Current: ${selectedFont.name})`}>
                  <Type className="w-4 h-4" />
                </button>
                {showFontMenu && (
                  <div className="absolute right-0 top-11 z-50 w-80 p-3 rounded-2xl shadow-2xl space-y-2.5" style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, color: T.panelText }}>
                    <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                      <div><span className="font-bold text-xs">116 Google Fonts</span><span className="text-[10px] block" style={{ color: T.panelSubtext }}>Select font to apply live</span></div>
                      <button onClick={() => setShowFontMenu(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-medium no-scrollbar">
                      {["all","serif","sans-serif","dyslexic","monospace","script","display"].map((cat) => (
                        <button key={cat} onClick={() => setFontCategoryFilter(cat)} className="px-2 py-1 rounded-md capitalize shrink-0 transition-colors" style={fontCategoryFilter === cat ? { background: T.panelAccent, color: T.panelAccentText, fontWeight: 700 } : { background: T.panelItemBg, color: T.panelSubtext }}>{cat}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5" style={{ color: T.panelSubtext }} />
                      <input type="text" placeholder="Search font by name..." value={fontSearchQuery} onChange={(e) => setFontSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-none focus:outline-none" style={{ background: T.panelItemBg, color: T.panelText }} />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1 pt-1 text-xs no-scrollbar">
                      {filteredFonts.map((font) => (
                        <button key={font.name} onClick={() => { setSelectedFont(font); setShowFontMenu(false); }} className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors" style={selectedFont.name === font.name ? { background: T.panelAccent, color: T.panelAccentText, fontWeight: 600 } : { background: "transparent", color: T.panelText }}
                          onMouseEnter={(e) => { if (selectedFont.name !== font.name) (e.currentTarget as HTMLElement).style.background = T.panelItemBg; }}
                          onMouseLeave={(e) => { if (selectedFont.name !== font.name) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <span style={{ fontFamily: font.family }} className="text-sm">{font.name}</span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: T.btnBg, color: T.panelSubtext }}>{font.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Font Size */}
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${T.btnBorder}` }}>
                <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-2 py-1.5 text-xs" style={{ background: T.btnBg, color: T.btnText }} title="Smaller Font"><ZoomOut className="w-3.5 h-3.5" /></button>
                <span className="font-semibold text-xs px-1.5 min-w-[26px] text-center" style={{ background: T.btnBg, color: T.btnText }}>{fontSize}</span>
                <button onClick={() => setFontSize(Math.min(44, fontSize + 2))} className="px-2 py-1.5 text-xs" style={{ background: T.btnBg, color: T.btnText }} title="Larger Font"><ZoomIn className="w-3.5 h-3.5" /></button>
              </div>

              {/* Page Zoom */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: T.btnBg, color: T.btnText }}>
                <span className="text-[11px] font-mono font-bold">{zoomScale}%</span>
                <button onClick={() => setZoomScale(Math.min(180, zoomScale + 10))} className="text-xs font-bold px-1" title="Zoom In">+</button>
                <button onClick={() => setZoomScale(Math.max(70, zoomScale - 10))} className="text-xs font-bold px-1" title="Zoom Out">-</button>
                {zoomScale !== 100 && <button onClick={() => setZoomScale(100)} className="p-0.5" title="Reset Zoom"><RotateCcw className="w-3 h-3" /></button>}
              </div>

              {/* Theme Picker */}
              <div className="relative">
                <button onClick={() => setShowThemePicker(!showThemePicker)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors" style={showThemePicker ? btnActiveStyle : btnStyle} title="Switch Theme">
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{T.emoji}</span>
                </button>
                {showThemePicker && (
                  <div className="absolute right-0 top-11 z-50 w-72 p-3 rounded-2xl shadow-2xl space-y-2" style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, color: T.panelText }}>
                    <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                      <span className="font-bold text-xs">16 Themes</span>
                      <button onClick={() => setShowThemePicker(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {THEME_ORDER.map((tid) => {
                        const t = THEMES[tid]; const isActive = theme === tid;
                        return (
                          <button key={tid} onClick={() => { changeTheme(tid); setShowThemePicker(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: isActive ? T.panelAccent : T.panelItemBg, color: isActive ? T.panelAccentText : T.panelText, border: isActive ? `1.5px solid ${T.panelAccent}` : `1px solid ${T.panelBorder}` }}>
                            <span className="text-base leading-none">{t.emoji}</span><span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-1.5 rounded-lg hidden sm:inline-flex" style={btnStyle} title="Toggle Fullscreen">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* TOC Toggle */}
              {toc.length > 0 && (
                <button onClick={() => setShowToc(!showToc)} className="p-1.5 rounded-lg transition-colors" style={showToc ? btnActiveStyle : btnStyle} title="Table of Contents">
                  <List className="w-4 h-4" />
                </button>
              )}

              {/* Shortcuts */}
              <button onClick={() => setShowShortcuts(!showShortcuts)} className="p-1.5 rounded-lg hidden sm:inline-flex" style={showShortcuts ? btnActiveStyle : btnStyle} title="Keyboard Shortcuts">
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── CHAPTER PROGRESS BAR (Top Edge) ── */}
          <div className="w-full h-1.5 z-40 relative" style={{ background: T.toolbarBg }}>
            <div className="absolute inset-0 opacity-10" style={{ background: T.toolbarText }} />
            <div 
              ref={chapterProgressRef}
              className="absolute left-0 top-0 h-full rounded-r-full will-change-[width]"
              style={{ 
                width: "0%", 
                background: T.panelAccent,
                boxShadow: `0 0 12px ${T.panelAccent}, 0 0 4px ${T.panelAccent}`
              }} 
            />
          </div>

          {/* ── MAIN VIEWPORT ──────────────────────────────────────────── */}
          <div className="relative flex-1 flex overflow-hidden w-full h-full">

            {/* TOC Drawer */}
            {showToc && toc.length > 0 && (
              <div className="w-72 sm:w-80 p-4 space-y-2 text-xs shrink-0 overflow-y-auto z-30 shadow-xl no-scrollbar hide-scrollbar" style={{ background: T.tocBg, borderRight: `1px solid ${T.tocBorder}`, color: T.panelText }}>
                <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: `1px solid ${T.tocBorder}` }}>
                  <h4 className="font-bold text-sm">Table of Contents</h4>
                  <button onClick={() => setShowToc(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                </div>
                {toc.map((item, idx) => (
                  <button key={idx} onClick={() => { setCurrentChapterIndex(item.chapterIndex); setShowToc(false); if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0; }} className="w-full text-left p-2.5 rounded-xl transition-colors truncate font-medium"
                    style={currentChapterIndex === item.chapterIndex ? { background: T.panelAccent, color: T.tocActiveText } : { background: "transparent", color: T.panelText }}
                    onMouseEnter={(e) => { if (currentChapterIndex !== item.chapterIndex) (e.currentTarget as HTMLElement).style.background = T.panelItemBg; }}
                    onMouseLeave={(e) => { if (currentChapterIndex !== item.chapterIndex) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Dictionary Sidebar Drawer */}
            {showDictionaryDrawer && (
              <div className="w-80 sm:w-96 p-4 space-y-3 text-xs shrink-0 overflow-y-auto z-30 shadow-2xl no-scrollbar hide-scrollbar" style={{ background: T.panelBg, borderRight: `1px solid ${T.panelBorder}`, color: T.panelText }}>
                <div className="flex items-center justify-between pb-2.5" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                  <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: T.panelAccent }}>
                    <BookOpen className="w-4 h-4" />Dictionary & Lexicon
                  </span>
                  <button onClick={() => setShowDictionaryDrawer(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                </div>

                {/* Manual search — keeps its own state, does NOT clear when word is selected in text */}
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Type word to define..." value={manualWordInput} onChange={(e) => setManualWordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") executeSidebarLookup(manualWordInput); }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2"
                    style={{ background: T.panelItemBg, color: T.panelText, border: `1px solid ${T.panelBorder}` }} />
                  <button onClick={() => executeSidebarLookup(manualWordInput)} className="px-3.5 py-2 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-transform" style={{ background: T.panelAccent, color: T.panelAccentText }}>Lookup</button>
                </div>

                {sidebarDictLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: T.panelAccent, borderTopColor: "transparent" }} />
                    <p className="text-xs" style={{ color: T.panelSubtext }}>Consulting world lexicons...</p>
                  </div>
                ) : sidebarDictData ? (
                  <DictionaryResultPanel data={sidebarDictData} T={T} isPlayingAudio={isPlayingAudio} onSpeak={speakWord} onFetchHindi={() => fetchHindi(sidebarDictData.word, true)} isSidebar={true} />
                ) : (
                  <div className="p-4 rounded-xl text-xs" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
                    <p className="font-semibold" style={{ color: T.panelText }}>💡 Select any word in the book, or type a word above and click Lookup.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── FLOATING DICTIONARY / TRANSLATION BUBBLE (selection-triggered, no sidebar) ── */}
            {selectedWord && !showDictionaryDrawer && (
              <div id="dict-bubble" style={getBubbleStyle()} className="animate-in fade-in duration-150">
                {isMultiWord ? (
                  /* TRANSLATION VIEW */
                  <>
                    <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" style={{ color: T.panelAccent }} />
                        <span className="font-extrabold text-sm uppercase tracking-wide" style={{ color: T.panelAccent }}>Translation</span>
                      </div>
                      <button onClick={closeDictionaryBubble} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>

                    {dictionaryLoading ? (
                      <div className="flex items-center gap-2 py-3 justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: T.panelAccent, borderTopColor: "transparent" }} />
                        <span className="text-xs" style={{ color: T.panelSubtext }}>Translating text...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg max-h-32 overflow-y-auto no-scrollbar" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
                          <p className="text-xs leading-relaxed italic" style={{ color: T.panelSubtext }}>&ldquo;{selectedWord}&rdquo;</p>
                        </div>
                        <div className="p-3 rounded-lg shadow-inner" style={{ background: T.btnBg, border: `1px solid ${T.panelBorder}` }}>
                          <p className="text-sm font-medium leading-relaxed" style={{ color: T.text, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{translationText}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* DICTIONARY VIEW */
                  <>
                    <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm capitalize" style={{ color: T.panelAccent }}>{dictionaryData?.word || selectedWord}</span>
                        <span className="font-mono text-[11px]" style={{ color: T.panelSubtext }}>{dictionaryData?.phonetic}</span>
                        <button onClick={() => speakWord(dictionaryData?.word || selectedWord)} className="p-1 rounded transition-transform hover:scale-105" style={{ background: T.panelItemBg, color: T.panelAccent }} title="Pronounce">
                          <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                        </button>
                      </div>
                      <button onClick={closeDictionaryBubble} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>

                    {dictionaryLoading ? (
                      <div className="flex items-center gap-2 py-3 justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: T.panelAccent, borderTopColor: "transparent" }} />
                        <span className="text-xs" style={{ color: T.panelSubtext }}>Looking up...</span>
                      </div>
                    ) : dictionaryData ? (
                      <div className="space-y-2">
                        <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2">
                          {dictionaryData.meanings.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="space-y-1 pb-2" style={{ borderBottom: idx < 2 ? `1px solid ${T.panelBorder}` : "none" }}>
                              <span className="font-semibold italic text-[11px]" style={{ color: T.panelAccent }}>{m.partOfSpeech}</span>
                              <p className="leading-relaxed text-xs" style={{ color: T.panelText }}>{m.definition}</p>
                              {m.example && <p className="italic text-[11px]" style={{ color: T.panelSubtext }}>&ldquo;{m.example}&rdquo;</p>}
                            </div>
                          ))}
                        </div>

                        {/* Hindi — shown only after user clicks Translate */}
                        {dictionaryData.hindiTranslation ? (
                          <div className="mt-1 px-3 py-2 rounded-lg" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-sm">🇮🇳</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.panelSubtext }}>Hindi</span>
                            </div>
                            <p className="text-sm font-bold" style={{ color: T.panelText, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{dictionaryData.hindiTranslation}</p>
                          </div>
                        ) : (
                          <button onClick={() => fetchHindi(dictionaryData.word, false)} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ background: T.panelItemBg, color: T.panelText, border: `1px solid ${T.panelBorder}` }}>
                            <Globe className="w-3.5 h-3.5" style={{ color: T.panelAccent }} />🇮🇳 Translate to Hindi
                          </button>
                        )}

                        <div className="pt-1 text-[10px] flex items-center justify-between" style={{ color: T.panelSubtext }}>
                          <span>Source: {dictionaryData.source}</span>
                          <button onClick={() => { setShowDictionaryDrawer(true); setSelectedWord(null); }} className="underline" style={{ color: T.panelAccent }}>Full panel →</button>
                        </div>
                      </div>
                    ) : (
                      <p className="py-1 text-xs text-center" style={{ color: T.panelSubtext }}>Searching definition...</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
              <div className="absolute top-4 left-4 z-40 w-72 p-4 rounded-2xl shadow-2xl space-y-3 text-xs" style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, color: T.panelText }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                  <span className="font-bold text-sm">Keyboard Shortcuts</span>
                  <button onClick={() => setShowShortcuts(false)} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {[["→ / Space","Next Page"],["←","Previous Page"],["B","Bookmark page"],["Esc","Close reader"]].map(([key, action]) => (
                    <div key={key} className="flex justify-between">
                      <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: T.btnBg, color: T.btnText }}>{key}</kbd>
                      <span style={{ color: T.panelSubtext }}>{action}</span>
                    </div>
                  ))}
                  <div className="flex justify-between"><kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: T.btnBg, color: T.btnText }}>Select Word</kbd><span style={{ color: T.panelSubtext }}>Dictionary</span></div>
                </div>
              </div>
            )}

            {/* ── READER VIEWPORT ──────────────────────────────────────── */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden">
              {/* Left / Right Click Nav for Kindle */}
              {scrollMode === "horizontal" && (
                <>
                  <button onClick={() => triggerPageTurn("prev")} disabled={currentChapterIndex === 0} className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-20 cursor-pointer flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity disabled:pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent)" }} title="Previous Page (←)">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}><ChevronLeft className="w-5 h-5" /></div>
                  </button>
                  <button onClick={() => triggerPageTurn("next")} disabled={currentChapterIndex >= chapters.length - 1} className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-20 cursor-pointer flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity disabled:pointer-events-none" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.12), transparent)" }} title="Next Page (→)">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}><ChevronRight className="w-5 h-5" /></div>
                  </button>
                </>
              )}

              {/* Reader Document Container */}
              <div
                ref={scrollContainerRef}
                onClick={handleContentClick}
                className={`w-full h-full no-scrollbar hide-scrollbar ${scrollMode === "vertical" ? "overflow-y-auto overflow-x-hidden p-4 sm:p-10" : "overflow-y-auto overflow-x-hidden p-4 sm:p-10 flex flex-col justify-start items-center"}`}
                style={{
                  transform: `scale(${zoomScale / 100}) ${pageFlipAnim === "next" ? "translateX(-12px)" : pageFlipAnim === "prev" ? "translateX(12px)" : ""}`,
                  opacity: pageFlipAnim ? 0.65 : 1,
                  transformOrigin: "top center",
                  transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease",
                }}
              >
                {fileType === "pdf" && currentFile ? (
                   <div className="w-full h-full p-4 sm:p-10" style={{ background: T.bg }}>
                     <PdfViewer file={currentFile} zoomScale={zoomScale} isDark={resolvedTheme === "dark"} />
                   </div>
                ) : scrollMode === "vertical" ? (
                  <div className="max-w-3xl mx-auto w-full space-y-16 pb-24">
                    {chapters.map((ch, idx) => (
                      <article id={`chapter-container-${idx}`} key={ch.id || idx} className="space-y-6" style={{ borderBottom: `1px solid ${T.toolbarBorder}`, paddingBottom: "4rem" }}>
                        <header className="pb-3" style={{ borderBottom: `1px solid ${T.toolbarBorder}` }}>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.panelAccent }}>Chapter {idx + 1} of {chapters.length}</span>
                          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight" style={{ color: T.text }}>{ch.title}</h2>
                        </header>
                        <div className="leading-relaxed space-y-5 select-text" style={{ fontSize: `${fontSize}px`, fontFamily: selectedFont.family, lineHeight: "1.85", color: T.proseText }} dangerouslySetInnerHTML={{ __html: ch.html }} onMouseUp={handleTextMouseUp} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto w-full pb-20 pt-4">
                    {currentChapter ? (
                      <article id={`chapter-container-${currentChapterIndex}`} className="space-y-6">
                        <header className="pb-3" style={{ borderBottom: `1px solid ${T.toolbarBorder}` }}>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T.panelAccent }}>Chapter {currentChapterIndex + 1} of {chapters.length}</span>
                          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight" style={{ color: T.text }}>{currentChapter.title}</h2>
                        </header>
                        <div className="leading-relaxed space-y-5 select-text" style={{ fontSize: `${fontSize}px`, fontFamily: selectedFont.family, lineHeight: "1.85", color: T.proseText }} dangerouslySetInnerHTML={{ __html: currentChapter.html }} onMouseUp={handleTextMouseUp} />
                      </article>
                    ) : (
                      <p className="text-center py-16" style={{ color: T.subtext }}>No chapter content loaded.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM PROGRESS & NAV BAR ────────────────────────────── */}
          <div className="shrink-0 z-20" style={{ background: T.toolbarBg, borderTop: `1px solid ${T.toolbarBorder}` }}>

            {/* ══ ULTRA-SMOOTH PROGRESS BAR ══ */}
            <div className="relative w-full" style={{ height: "6px", background: T.progressBg }}>
              {/* Track glow underneath */}
              <div className="absolute inset-0" style={{ background: T.progressBg, borderRadius: "0 0 0 0" }} />

              {/* Main fill — spring-physics transition */}
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${Math.max(0.5, displayProgress)}%`,
                  background: T.progressGrad,
                  backgroundSize: "300% 100%",
                  animation: "gradSlide 3s linear infinite",
                  transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  borderRadius: "0 3px 3px 0",
                  boxShadow: `0 0 12px ${T.progressFg}88, 0 0 4px ${T.progressFg}44`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Inner shimmer sweep */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                    animation: "shimmerSweep 1.8s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Floating percentage tooltip above the orb */}
              {displayProgress > 2 && displayProgress < 98 && (
                <div
                  className="absolute select-none pointer-events-none"
                  style={{
                    left: `calc(${displayProgress}% - 18px)`,
                    top: "-24px",
                    transition: "left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    zIndex: 10,
                  }}
                >
                  <div
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      background: T.progressFg,
                      color: "#fff",
                      boxShadow: `0 2px 8px ${T.progressFg}80`,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {displayProgress}%
                  </div>
                  {/* Tiny caret */}
                  <div className="w-0 h-0 mx-auto" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `4px solid ${T.progressFg}` }} />
                </div>
              )}

              {/* Glowing orb at tip */}
              {displayProgress > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `calc(${Math.max(0.5, displayProgress)}% - 5px)`,
                    transition: "left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    width: "10px",
                    height: "10px",
                    background: "#fff",
                    border: `2px solid ${T.progressFg}`,
                    boxShadow: `0 0 0 3px ${T.progressFg}44, 0 0 12px ${T.progressFg}99`,
                    animation: "orbPulse 2s ease-in-out infinite",
                    zIndex: 5,
                  }}
                />
              )}
            </div>

            {/* Nav row */}
            <div className="h-11 px-4 sm:px-8 flex items-center justify-between text-xs font-semibold">
              <button onClick={() => triggerPageTurn("prev")} disabled={currentChapterIndex === 0} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl active:scale-95 transition-all shadow disabled:opacity-40 disabled:pointer-events-none" style={{ background: T.panelAccent, color: T.panelAccentText }} title="Previous Page">
                <ArrowLeft className="w-3.5 h-3.5" /><span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2" style={{ color: T.subtext }}>
                {scrollMode === "vertical" ? (
                  <span>{verticalProgress}% through book</span>
                ) : (
                  <span>Chapter {currentChapterIndex + 1} / {Math.max(1, chapters.length)}</span>
                )}
                {isCurrentPageBookmarked && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: T.panelAccent + "30", color: T.panelAccent }}>
                    <BookmarkCheck className="w-3 h-3" /> Bookmarked
                  </span>
                )}
              </div>

              <button onClick={() => triggerPageTurn("next")} disabled={currentChapterIndex >= chapters.length - 1} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl active:scale-95 transition-all shadow disabled:opacity-40 disabled:pointer-events-none" style={{ background: T.panelAccent, color: T.panelAccentText }} title="Next Page">
                <span className="hidden sm:inline">Next</span><ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Keyframes and Custom Highlight styles */}
          <style>{`
            @keyframes shimmerSweep {
              0%   { transform: translateX(-120%); }
              60%  { transform: translateX(120%); }
              100% { transform: translateX(120%); }
            }
            @keyframes gradSlide {
              0%   { background-position: 0% 50%; }
              50%  { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes orbPulse {
              0%, 100% { box-shadow: 0 0 0 3px var(--orb-ring, rgba(99,102,241,0.3)), 0 0 10px rgba(99,102,241,0.5); transform: translateY(-50%) scale(1); }
              50%       { box-shadow: 0 0 0 5px var(--orb-ring, rgba(99,102,241,0.15)), 0 0 18px rgba(99,102,241,0.7); transform: translateY(-50%) scale(1.15); }
            }
            mark[data-lumina-highlight] { cursor: pointer; }
            mark[data-lumina-highlight]:hover { filter: brightness(1.1); }
            ::highlight(dict-selection) {
              background-color: ${T.panelAccent}50;
              color: ${T.text};
            }
            ::highlight(lumina-hl-yellow) { background-color: rgba(255, 236, 61, 0.55); color: inherit; }
            ::highlight(lumina-hl-green) { background-color: rgba(74, 222, 128, 0.45); color: inherit; }
            ::highlight(lumina-hl-pink) { background-color: rgba(249, 115, 148, 0.45); color: inherit; }
            ::highlight(lumina-hl-blue) { background-color: rgba(96, 165, 250, 0.45); color: inherit; }
            ::highlight(lumina-hl-purple) { background-color: rgba(167, 139, 250, 0.45); color: inherit; }
            ::highlight(lumina-hl-orange) { background-color: rgba(251, 146, 60, 0.45); color: inherit; }
          `}</style>
        </div>
      ) : null}
      
      {/* ── PDF MODE PROMPT MODAL ────────────────────────────────────────── */}
      {pdfModePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-fade-in border border-slate-200 dark:border-slate-800">
             <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">How to open PDF?</h3>
             <div className="space-y-4">
               <button 
                 onClick={() => { processFile(pdfModePrompt, false, 'text'); setPdfModePrompt(null); }} 
                 className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-lg bg-slate-50 dark:bg-slate-800/50 group"
               >
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Type className="w-5 h-5" /></div>
                   <div className="font-bold text-lg text-slate-900 dark:text-white">Text Mode</div>
                 </div>
                 <div className="text-sm text-slate-500 dark:text-slate-400 ml-11">Extracts text for custom fonts, themes, highlighting, and dictionary. (Original layout is removed). Best for novels.</div>
               </button>
               <button 
                 onClick={() => { processFile(pdfModePrompt, false, 'original'); setPdfModePrompt(null); }} 
                 className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg bg-slate-50 dark:bg-slate-800/50 group"
               >
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"><FileText className="w-5 h-5" /></div>
                   <div className="font-bold text-lg text-slate-900 dark:text-white">Original Mode</div>
                 </div>
                 <div className="text-sm text-slate-500 dark:text-slate-400 ml-11">Preserves exact visual layout, columns, images, and tables perfectly. (No custom fonts). Best for textbooks.</div>
               </button>
             </div>
             <button onClick={() => setPdfModePrompt(null)} className="w-full py-3 text-center font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DICTIONARY RESULT PANEL ──────────────────────────────────────────────────

function DictionaryResultPanel({
  data, T, isPlayingAudio, onSpeak, onFetchHindi, isSidebar,
}: {
  data: DictionaryResult; T: ThemeConfig; isPlayingAudio: boolean;
  onSpeak: (w: string) => void; onFetchHindi: () => void; isSidebar: boolean;
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
        <div>
          <span className="font-extrabold text-lg capitalize block" style={{ color: T.panelText }}>{data.word}</span>
          <span className="font-mono text-xs" style={{ color: T.panelAccent }}>{data.phonetic}</span>
        </div>
        <button onClick={() => onSpeak(data.word)} className="p-2.5 rounded-xl shadow-md hover:opacity-90 transition-all"
          style={{ background: T.panelAccent, color: T.panelAccentText, outline: isPlayingAudio ? `3px solid ${T.panelAccent}` : "none", outlineOffset: "2px" }} title="Pronounce">
          <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`} />
        </button>
      </div>

      <div className="space-y-2.5 pt-1">
        {data.meanings.map((m, idx) => (
          <div key={idx} className="p-3 rounded-xl space-y-1.5" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: T.panelAccent + "22", color: T.panelAccent }}>{m.partOfSpeech}</span>
            <p className="leading-relaxed text-xs" style={{ color: T.panelText }}>{m.definition}</p>
            {m.example && <p className="italic text-[11px] pl-2" style={{ color: T.panelSubtext, borderLeft: `2px solid ${T.panelAccent}` }}>&ldquo;{m.example}&rdquo;</p>}
          </div>
        ))}
      </div>

      {/* Hindi Translation — shown after button click */}
      {data.hindiTranslation ? (
        <div className="p-3 rounded-xl" style={{ background: T.panelItemBg, border: `1px solid ${T.panelBorder}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🇮🇳</span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.panelSubtext }}>Hindi Translation</span>
          </div>
          <p className="text-base font-bold" style={{ color: T.panelText, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{data.hindiTranslation}</p>
        </div>
      ) : (
        <button onClick={onFetchHindi} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90" style={{ background: T.panelItemBg, color: T.panelText, border: `1px solid ${T.panelBorder}` }}>
          <Globe className="w-3.5 h-3.5" style={{ color: T.panelAccent }} />
          🇮🇳 Translate to Hindi
        </button>
      )}

      <div className="pt-1 text-[10px] flex items-center justify-between" style={{ color: T.panelSubtext }}>
        <span>Source: {data.source}</span>
        <span>Lumina Reader</span>
      </div>
    </div>
  );
}
