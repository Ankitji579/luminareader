import { BookOpen, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
  title: "About Us — LuminaReader",
  description: "Learn about LuminaReader, the privacy-first web platform for reading EPUB, PDF, and MOBI e-books without downloading software.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-700 dark:text-slate-300">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">About LuminaReader</h1>
        <p className="text-sm text-slate-500">Universal Browser-Based E-Book & Document Viewer</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <p>
          LuminaReader was created with a single objective: to provide a fast, elegant, distraction-free reading experience for any digital e-book or document format directly inside the web browser.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Why LuminaReader Was Built</h2>
        <p>
          Most desktop e-book tools require heavy installations, subscription fees, or annoying software updates. On the other hand, many web converters ask users to upload sensitive personal documents to unknown remote servers. LuminaReader bridges this gap by rendering all books 100% locally in your browser session.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-1">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Fast HTML5 Parsing</h3>
            <p className="text-xs">Instant page loading using Web Workers without server latency.</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-300">100% Zero-Upload Guarantee</h3>
            <p className="text-xs">Your books remain stored strictly on your local disk at all times.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
