"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lumina_cookie_consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem("lumina_cookie_consent", "accepted");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Privacy & Cookie Notice</h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            We use cookies to analyze search traffic, save your local reading preferences, and serve personalized ads via Google AdSense. Your uploaded documents are processed 100% locally on your browser and are never uploaded to any server.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={acceptConsent}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-colors text-xs"
            >
              Accept & Continue
            </button>
            <a href="/privacy" className="text-slate-500 hover:underline">
              Read Policy
            </a>
          </div>
        </div>
        <button
          onClick={() => setShowConsent(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
