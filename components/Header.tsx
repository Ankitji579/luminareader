
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Library, UploadCloud } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import localforage from "localforage";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isUploading, setIsUploading] = useState(false);

  const handleGlobalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const name = file.name;
      const bookId = `lumina_book_${name}`;
      
      // Save to IndexedDB
      await localforage.setItem(bookId, file);
      
      // Update Library in localStorage
      const savedLib = localStorage.getItem("lumina_library");
      let lib = savedLib ? JSON.parse(savedLib) : [];
      if (!lib.some((b: any) => b.name === name)) {
        lib.unshift({ id: Date.now().toString(), name, addedAt: Date.now(), size: file.size });
        localStorage.setItem("lumina_library", JSON.stringify(lib));
      }

      // Signal reader workspace and route to homepage
      sessionStorage.setItem("lumina_load_book", name);
      
      if (pathname === "/") {
        window.dispatchEvent(new CustomEvent('lumina-trigger-load', { detail: name }));
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Global upload failed:", err);
    }
    setIsUploading(false);
    
    // Clear the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

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

          <label
            className="hidden sm:flex cursor-pointer items-center gap-2 px-4 py-2 ml-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {isUploading ? "Uploading..." : "Upload Book"}
            <input type="file" accept=".epub,.pdf,.mobi,.azw3,.fb2,.cbz,.txt" onChange={handleGlobalUpload} className="hidden" />
          </label>
          
        </div>
      </div>
    </header>
  );
}
