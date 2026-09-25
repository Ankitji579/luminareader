import ReaderWorkspace from "@/components/reader/ReaderWorkspace";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black selection:bg-indigo-500/30 overflow-hidden relative flex flex-col">
      {/* Subtle background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Ultra Minimalist Header */}
      <header className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Lumina<span className="text-indigo-500">.</span></span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Hero & Workspace */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-32 pb-20 relative z-10">
        
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            100% Private Local Processing
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] animate-fade-in-up">
            Your books.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-300% animate-gradient">
              Beautifully rendered.
            </span>
          </h1>
          
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium animate-fade-in-up delay-100">
            Drop any EPUB or PDF to instantly enter a distraction-free, customizable reading environment. Nothing is uploaded.
          </p>
        </div>

        <div className="w-full animate-fade-in-up delay-200">
          <ReaderWorkspace />
        </div>

      </main>
      
      {/* Minimal Footer */}
      <footer className="py-8 text-center text-sm font-medium text-slate-400 dark:text-slate-600 relative z-10">
        <p>Lumina Reader. Fast, private, and beautiful.</p>
      </footer>
    </div>
  );
}
