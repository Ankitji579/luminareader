import Link from "next/link";
import { BookOpen, Heart, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">LuminaReader</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The privacy-first universal document & e-book reader. Read EPUB, PDF, MOBI, AZW3, FB2, and CBZ files directly in your web browser with zero server uploads.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
              <Lock className="w-4 h-4 shrink-0" />
              <span>100% Client-Side Processing</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">E-Book Readers</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/read/epub-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">EPUB Reader Online</Link></li>
              <li><Link href="/read/pdf-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">PDF Reader Online</Link></li>
              <li><Link href="/read/mobi-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">MOBI Kindle Reader</Link></li>
              <li><Link href="/read/azw3-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">AZW3 Viewer</Link></li>
              <li><Link href="/read/fb2-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">FB2 E-Book Viewer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Specialized Tools</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/read/cbz-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">CBZ Comic Reader</Link></li>
              <li><Link href="/read/txt-online" className="hover:text-indigo-600 dark:hover:text-indigo-400">TXT Document Reader</Link></li>
              <li><Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">All Supported Formats</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Legal & Information</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">About LuminaReader</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy & Security</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact & Feedback</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LuminaReader. All rights reserved. Designed for search-driven reading utility.</p>
          <div className="flex items-center gap-1">
            <span>Built for fast, private reading</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
