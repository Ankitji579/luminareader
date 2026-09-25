import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReaderWorkspace from "@/components/reader/ReaderWorkspace";
import AdSlot from "@/components/AdSlot";
import { SUPPORTED_FORMATS } from "@/lib/reader-formats";
import { CheckCircle2, HelpCircle, ArrowLeft } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(SUPPORTED_FORMATS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const format = SUPPORTED_FORMATS[params.slug];
  if (!format) return {};

  return {
    title: format.title,
    description: format.description,
    keywords: format.keywords,
  };
}

export default function FormatReaderPage({ params }: Props) {
  const format = SUPPORTED_FORMATS[params.slug];
  if (!format) notFound();

  return (
    <div className="space-y-10 pb-16">
      <section className="pt-6 max-w-4xl mx-auto px-4 space-y-4">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Reader Tools</span>
        </Link>

        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-block font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {format.extension} Format Web Viewer
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {format.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {format.description}
          </p>
        </div>
      </section>

      <section className="px-4">
        <ReaderWorkspace initialFormat={format.extension} />
      </section>

      <div className="max-w-4xl mx-auto px-4">
        <AdSlot slotId="3344556677" format="horizontal" />
      </div>

      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Key Features of Lumina {format.name}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {format.features.map((feat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{feat}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions About {format.name}
        </h2>

        <div className="space-y-3">
          {format.faq.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                {item.question}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Explore Other E-Book Formats</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.values(SUPPORTED_FORMATS)
            .filter((f) => f.slug !== format.slug)
            .map((f) => (
              <Link
                key={f.slug}
                href={`/read/${f.slug}`}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors"
              >
                {f.name} ({f.extension})
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
