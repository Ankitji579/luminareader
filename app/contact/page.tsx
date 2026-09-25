import { Mail, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact & Support — LuminaReader",
  description: "Get in touch with the LuminaReader support team for inquiries, feedback, or technical questions.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-slate-700 dark:text-slate-300">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact & Feedback</h1>
        <p className="text-sm text-slate-500">We would love to hear your feedback or answer any inquiries.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Email Us</h3>
            <p className="text-slate-500">support@luminareader.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Format Requests</h3>
            <p className="text-slate-500">Have a custom document format request? Email us with subject &quot;Format Request&quot;.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
