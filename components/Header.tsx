"use client";

import Link from "next/link";
import { BookOpen, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-white">
              LuminaReader
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              100% Private
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/read/epub-online" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            EPUB Reader
          </Link>
          <Link href="/read/pdf-online" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            PDF Reader
          </Link>
          <Link href="/read/mobi-online" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            MOBI Reader
          </Link>
          <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            All Formats
          </Link>
          <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/read/epub-online"
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Reader</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
