import Link from "next/link";
import ReaderWorkspace from "@/components/reader/ReaderWorkspace";
import AdSlot from "@/components/AdSlot";
import { 
  BookOpen, ShieldCheck, Lock, Zap, Sparkles, FileText, Smartphone, HelpCircle 
} from "lucide-react";
import { SUPPORTED_FORMATS } from "@/lib/reader-formats";

export const metadata = {
  title: "Free Online EPUB & E-Book Reader — LuminaReader",
  description: "Read EPUB, PDF, MOBI, AZW3, FB2, CBZ, and TXT files online in your web browser. Free, private, instant document viewer with dark mode and zero file uploads.",
  keywords: ["online epub reader", "read epub online", "open mobi online", "free pdf viewer browser", "kindle reader web", "online e-book reader"],
};

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="pt-8 sm:pt-12 text-center max-w-4xl mx-auto px-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Universal Online E-Book & Document Reader</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Read EPUB, PDF & MOBI Books <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Directly in Your Web Browser
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Open and read any e-book format instantly. 100% private, client-side browser reader with zero registration, zero software installation, and dark mode.
        </p>
      </section>

      {/* Main Interactive Reader Component */}
      <section id="reader" className="px-4">
        <ReaderWorkspace />
      </section>

      {/* Top Banner AdSlot */}
      <div className="max-w-4xl mx-auto px-4">
        <AdSlot slotId="1122334455" format="horizontal" />
      </div>

      {/* Supported Formats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supported E-Book & Document Formats</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Click any format to access specialized web reader tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(SUPPORTED_FORMATS).map((fmt) => (
            <Link
              key={fmt.slug}
              href={`/read/${fmt.slug}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  {fmt.extension}
                </span>
                <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {fmt.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {fmt.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose LuminaReader Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Designed for Fast, Private E-Reading</h2>
            <p className="text-slate-400 text-sm">
              Traditional desktop e-book readers require heavy software downloads. Online cloud converters compromise user privacy by uploading private documents to external servers. LuminaReader solves both.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Client-Side Privacy</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Your EPUB and PDF files are parsed locally inside your Web Browser using JavaScript Web Workers. No data is sent to external servers.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Zero Installation Needed</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Works instantly on Chromebooks, Mac, Windows, iOS, and Android. Open MOBI or AZW3 Kindle books without Amazon Kindle app.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Reading Customization</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Enjoy customizable typography, font sizing, sepia reading mode, dark night theme, chapter selection, and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mid Page In-Article AdSlot */}
      <div className="max-w-4xl mx-auto px-4">
        <AdSlot slotId="9988776655" format="auto" />
      </div>

      {/* Detailed FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Everything you need to know about reading e-books online</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              How do I open an EPUB file online without downloading software?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
              Simply drag and drop your .epub file into the reader zone above. LuminaReader parses the EPUB zip structure right in your web browser, allowing you to read all chapters instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Can I read Kindle MOBI and AZW3 files on a web browser?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
              Yes! LuminaReader supports .mobi and .azw3 Kindle formats directly, so you don't need to install Calibre or Amazon reader apps to view your books.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Is LuminaReader completely free?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
              Yes. LuminaReader is 100% free for all users. It is supported by non-intrusive web advertisements via Google AdSense.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
