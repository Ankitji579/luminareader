"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import localforage from "localforage";
import { Clock, Library, Save, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SavedBook {
  id: string;
  name: string;
  addedAt: number;
  size: number;
}

export default function MyLibrary() {
  const [library, setLibrary] = useState<SavedBook[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedLib = localStorage.getItem("lumina_library");
    if (savedLib) {
      try {
        setLibrary(JSON.parse(savedLib));
      } catch (e) {}
    }
  }, []);

  const openBook = (name: string) => {
    sessionStorage.setItem("lumina_load_book", name);
    router.push("/");
  };

  const removeBook = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const bookId = `lumina_book_${name}`;
    await localforage.removeItem(bookId);
    setLibrary((prev) => {
      const newLib = prev.filter((p) => p.name !== name);
      localStorage.setItem("lumina_library", JSON.stringify(newLib));
      return newLib;
    });
  };

  if (library.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <Library className="w-10 h-10 text-slate-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your library is empty</h2>
          <p className="text-slate-500">Books you open will automatically be saved here for offline reading.</p>
        </div>
        <Link href="/" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
          Go upload a book
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
      
      {/* Hero Continue Reading */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Pick up where you left off
        </h2>
        
        <div 
          onClick={() => openBook(library[0].name)}
          className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-indigo-50">
                Most Recent
              </div>
              <div>
                <h3 className="text-3xl font-extrabold line-clamp-1">{library[0].name}</h3>
                <p className="text-indigo-200 text-sm mt-2 font-medium">
                  {(() => {
                    const prog = typeof window !== "undefined" ? localStorage.getItem(`lumina_prog_${library[0].name}`) : null;
                    if (prog) {
                      try { return `Resuming from Chapter ${JSON.parse(prog).chapterIndex + 1}`; } catch(e){}
                    }
                    return "Click to start reading";
                  })()}
                </p>
              </div>
            </div>
            <button className="shrink-0 w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Library Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Library className="w-6 h-6 text-slate-400" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">All Saved Books</h3>
          </div>
          <span className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 px-4 py-1.5 rounded-full">
            {library.length} {library.length === 1 ? "Book" : "Books"} • 5GB Capacity
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {library.map((book) => {
            const progRaw = typeof window !== "undefined" ? localStorage.getItem(`lumina_prog_${book.name}`) : null;
            let chapProg = 0;
            if (progRaw) {
              try { chapProg = JSON.parse(progRaw).chapterIndex; } catch(e) {}
            }
            const ext = book.name.split('.').pop()?.toUpperCase() || 'BOOK';
            
            return (
              <div 
                key={book.id} 
                onClick={() => openBook(book.name)}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-16 shrink-0 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-black text-xs overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    {ext}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate" title={book.name}>{book.name}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(book.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {chapProg > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                     <span className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold"><Save className="w-3.5 h-3.5" /> Saved at Chapter {chapProg + 1}</span>
                  </div>
                )}
                
                <button 
                  onClick={(e) => removeBook(book.name, e)} 
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all" 
                  title="Remove from device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
