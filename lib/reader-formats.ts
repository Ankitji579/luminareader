export interface FormatInfo {
  slug: string;
  name: string;
  extension: string;
  mimeType: string;
  title: string;
  description: string;
  keywords: string[];
  features: string[];
  faq: { question: string; answer: string }[];
}

export const SUPPORTED_FORMATS: Record<string, FormatInfo> = {
  "epub-online": {
    slug: "epub-online",
    name: "EPUB Reader",
    extension: ".epub",
    mimeType: "application/epub+zip",
    title: "Free Online EPUB Reader — Open & Read EPUB Books in Browser",
    description: "Read EPUB files online directly in your browser. Free, fast, secure e-book viewer with dark mode, custom fonts, offline reading, and no file uploads to servers.",
    keywords: ["online epub reader", "read epub online", "open epub online", "free epub viewer", "epub reader no install", "epub book reader browser"],
    features: [
      "100% Client-Side Privacy: Your files never leave your device",
      "Custom Typography: Adjust font size, line spacing, and fonts (Serif, Sans, Dyslexic)",
      "Theme Options: Light, Dark, Sepia, and High-Contrast reading modes",
      "Table of Contents & Bookmarks: Easy chapter navigation and progress saving",
      "Full Keyboard Shortcuts: Next/Previous page with arrow keys"
    ],
    faq: [
      {
        question: "Is my EPUB book uploaded to any server?",
        answer: "No. LuminaReader processes all files locally inside your browser using HTML5 JavaScript APIs. Your books remain completely private on your device."
      },
      {
        question: "Do I need to install any extension or software?",
        answer: "No installation required. LuminaReader works instantly in Chrome, Safari, Firefox, Edge, and mobile browsers."
      },
      {
        question: "Does it save my reading progress?",
        answer: "Yes! Your current position and reading preferences are saved in local browser storage so you can resume anytime."
      }
    ]
  },
  "pdf-online": {
    slug: "pdf-online",
    name: "PDF Reader",
    extension: ".pdf",
    mimeType: "application/pdf",
    title: "Online PDF Reader & Viewer — Open PDF Documents Free",
    description: "Lightweight online PDF viewer. Open, view, and read PDF e-books and documents directly in your web browser without downloading heavy desktop viewers.",
    keywords: ["online pdf reader", "open pdf online", "read pdf in browser", "free pdf viewer", "fast pdf reader online"],
    features: [
      "Instant PDF Loading with hardware acceleration",
      "Zoom & Rotation controls for complex layouts and scanned documents",
      "Page Thumbnail Navigation & Page Jumping",
      "Zero registration or file limits"
    ],
    faq: [
      {
        question: "Can I read large PDF e-books?",
        answer: "Yes, LuminaReader streams and renders PDF pages efficiently directly in your browser."
      }
    ]
  },
  "mobi-online": {
    slug: "mobi-online",
    name: "MOBI Reader",
    extension: ".mobi",
    mimeType: "application/x-mobipocket-ebook",
    title: "Free MOBI Reader Online — Read Kindle MOBI E-Books in Browser",
    description: "Open and read MOBI kindle e-books online. Free browser-based MOBI file viewer with customizable font sizes, night mode, and chapter selection.",
    keywords: ["mobi reader online", "read mobi files online", "open mobi book in browser", "kindle mobi viewer free"],
    features: [
      "Native Kindle MOBI format parsing",
      "Automatic Chapter Break detection",
      "Seamless mobile & tablet responsiveness"
    ],
    faq: [
      {
        question: "How do I open MOBI files on PC without Kindle app?",
        answer: "Simply drop your .mobi file into LuminaReader to read it instantly in your web browser without installing Amazon software."
      }
    ]
  },
  "azw3-online": {
    slug: "azw3-online",
    name: "AZW3 / KF8 Reader",
    extension: ".azw3",
    mimeType: "application/vnd.amazon.mobi8-ebook",
    title: "AZW3 Reader Online — View Amazon Kindle Format 8 E-Books",
    description: "Read AZW3 (Kindle Format 8) e-books online without a Kindle device. Free, responsive web reader for AZW3 e-books.",
    keywords: ["azw3 reader online", "open azw3 file online", "read kindle azw3 browser", "azw3 viewer free"],
    features: [
      "Support for modern Kindle formatting",
      "Clean reader layout with night mode",
      "No account registration needed"
    ],
    faq: [
      {
        question: "What is an AZW3 file?",
        answer: "AZW3 is Amazon's Kindle Format 8 e-book format, featuring richer formatting than standard MOBI files."
      }
    ]
  },
  "fb2-online": {
    slug: "fb2-online",
    name: "FB2 Reader",
    extension: ".fb2",
    mimeType: "application/x-fictionbook+xml",
    title: "FB2 Reader Online — Open FictionBook2 E-Books Free",
    description: "Read FB2 (FictionBook 2.0) e-books directly online in your browser. Supports XML parsing, chapter navigation, and font customization.",
    keywords: ["fb2 reader online", "open fb2 online", "read fictionbook online", "fb2 viewer browser"],
    features: [
      "XML FictionBook metadata & inline image support",
      "Footnote & annotation rendering",
      "Custom themes and dark mode"
    ],
    faq: [
      {
        question: "Can FB2 files be read online?",
        answer: "Yes, LuminaReader parses FB2 XML structures into structured chapters for easy browser reading."
      }
    ]
  },
  "cbz-online": {
    slug: "cbz-online",
    name: "CBZ Comic Reader",
    extension: ".cbz",
    mimeType: "application/x-cbz",
    title: "CBZ Reader Online — Read Comic Books & Manga in Browser",
    description: "Free online CBZ comic book viewer. Open and read CBZ comic files and manga directly in your browser with full screen & fit-to-width controls.",
    keywords: ["cbz reader online", "read comic cbz online", "manga reader cbz", "online comic book viewer"],
    features: [
      "High-speed comic page viewing",
      "Fit to width, fit to height, and full-screen modes",
      "Double-page spread view support"
    ],
    faq: [
      {
        question: "Are CBZ comic files safe to view online?",
        answer: "Yes! LuminaReader extracts images directly on your local device without uploading them."
      }
    ]
  },
  "txt-online": {
    slug: "txt-online",
    name: "TXT / Document Reader",
    extension: ".txt",
    mimeType: "text/plain",
    title: "Free Online Text Reader — Clean Reader View for TXT Files",
    description: "Transform raw TXT files into a beautiful, distraction-free reading experience with customizable fonts, margins, and dark mode.",
    keywords: ["txt reader online", "read text file online", "clean text reader browser", "txt viewer dark mode"],
    features: [
      "Auto-detect encoding (UTF-8, ASCII)",
      "Distraction-free reading environment",
      "Reading time and word count statistics"
    ],
    faq: [
      {
        question: "Why use a text reader instead of notepad?",
        answer: "LuminaReader offers line spacing, customizable fonts, dark themes, and bookmarks for long text reading."
      }
    ]
  }
};
