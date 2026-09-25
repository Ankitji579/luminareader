export const metadata = {
  title: "Terms of Service — LuminaReader",
  description: "Terms of service and acceptable usage policy for LuminaReader online document and e-book reader.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-700 dark:text-slate-300">
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-slate-500">Effective Date: September 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using LuminaReader ("the Website"), you agree to be bound by these Terms of Service. LuminaReader provides browser-based reading software tools for user-provided files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. User Content & Copyright Compliance</h2>
          <p>
            LuminaReader does not host, store, index, distribute, or provide access to copyrighted books, digital documents, or proprietary media. You are solely responsible for ensuring that you have legal authorization to open and read any document file you choose to load into LuminaReader.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Disclaimer of Warranties</h2>
          <p>
            LuminaReader is provided "AS IS" without warranty of any kind. We do not guarantee uninterrupted access or error-free rendering for all custom e-book files.
          </p>
        </section>
      </div>
    </div>
  );
}
