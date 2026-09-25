import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — LuminaReader",
  description: "LuminaReader privacy policy detailing our 100% client-side document processing model, cookie usage, Google AdSense disclosures, and GDPR compliance.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-700 dark:text-slate-300">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Client-Side Privacy Standard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Client-Side Document Processing Guarantee</h2>
          <p>
            LuminaReader is engineered as a zero-knowledge web reader application. When you open or drag-and-drop any e-book or document file (including .EPUB, .PDF, .MOBI, .AZW3, .FB2, .CBZ, or .TXT) into LuminaReader, your file is processed <strong>entirely inside your browser using HTML5 File APIs and Web Workers</strong>.
          </p>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900">
            🔒 Your files are NEVER uploaded to our servers, stored on cloud databases, or transmitted over the internet to any third party.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Cookies & Local Storage</h2>
          <p>
            We use browser LocalStorage strictly to preserve your user preferences, such as your last read chapter index, font size choices, line height settings, and reading theme (light, sepia, or dark mode).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Third-Party Advertising & Google AdSense</h2>
          <p>
            LuminaReader displays advertisements served by Google AdSense to keep our service free. Google uses cookies to serve ads based on your prior visits to our website or other websites on the Internet:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to LuminaReader and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Google Ad Settings</a>.</li>
            <li>You can also opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-indigo-600 underline">www.aboutads.info</a>.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Contact Information</h2>
          <p>
            If you have questions regarding this Privacy Policy, please contact us at <a href="mailto:privacy@luminareader.com" className="text-indigo-600 underline">privacy@luminareader.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
