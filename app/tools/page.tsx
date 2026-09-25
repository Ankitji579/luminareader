import Link from "next/link";
import { SUPPORTED_FORMATS } from "@/lib/reader-formats";
import AdSlot from "@/components/AdSlot";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata = {
  title: "All Online E-Book & Document Reader Tools — LuminaReader",
  description: "Browse all online document and e-book reader tools. Read EPUB, PDF, MOBI, AZW3, FB2, CBZ, and TXT files free in browser.",
};

export default function ToolsHubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">All Online Reader Tools</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Choose your e-book format to launch the optimized reading viewer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(SUPPORTED_FORMATS).map((fmt) => (
          <div key={fmt.slug} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  {fmt.extension}
                </span>
                <BookOpen className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{fmt.name}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {fmt.description}
              </p>
            </div>

            <Link
              href={`/read/${fmt.slug}`}
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all group"
            >
              <span>Open {fmt.name}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      <AdSlot slotId="4455667788" format="auto" />
    </div>
  );
}
