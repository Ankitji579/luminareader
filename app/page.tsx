import ReaderWorkspace from "@/components/reader/ReaderWorkspace";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Zap, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] dark:bg-[#0a0a0a] selection:bg-indigo-500/30 overflow-hidden relative flex flex-col">
      
      {/* Modern Grid Background with Radial Fade */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#4f46e520,transparent)]"></div>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-6 py-12 lg:py-24 gap-16 relative z-10">
        
        {/* Left Column: Copy & Typography */}
        <div className="flex-1 space-y-10 lg:pr-10 text-center lg:text-left z-10 w-full">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Next-Gen Reading Experience
          </div>
          
          <div className="space-y-4 animate-fade-in-up delay-100">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.05]">
              Books, but <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-300% animate-gradient">
                better.
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Drop any EPUB or PDF to instantly enter a distraction-free, customizable reading environment. 
              Zero servers. Zero sign-ups. Absolute privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 animate-fade-in-up delay-200">
            {[
              { icon: Zap, title: "Instant Rendering", desc: "Native-like performance in your browser." },
              { icon: Shield, title: "100% Private", desc: "Files never leave your local device." },
              { icon: Sparkles, title: "Beautiful Typography", desc: "116+ fonts and complete layout control." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-2 p-5 rounded-3xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-left">
                <feature.icon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Dropzone Widget */}
        <div className="flex-1 w-full max-w-2xl lg:max-w-none relative animate-fade-in delay-300 z-10">
          {/* Decorative ambient glow behind the widget */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[100px] rounded-[3rem] -z-10" />
          
          <div className="relative w-full rounded-[2.5rem] p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-indigo-500/10">
            <ErrorBoundary>
              <ReaderWorkspace />
            </ErrorBoundary>
          </div>
        </div>

      </main>
      
    </div>
  );
}
