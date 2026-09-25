"use client";

import Link from "next/link";
import { BookOpen, Library, UploadCloud } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header id="lumina-global-header" className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Lumina<span className="text-indigo-500">.</span></span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          
          <Link
            href="/library"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all"
          >
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">My Library</span>
          </Link>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
          
          <ThemeToggle />

          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hidden sm:flex items-center gap-2 px-4 py-2 ml-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Book
          </Link>
          
        </div>
      </div>
    </header>
  );
}
