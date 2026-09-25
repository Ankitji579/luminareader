"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: boolean;
}

export default function AdSlot({ slotId = "0000000000", format = "auto", className = "", label = true }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !isLoaded.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      } catch (err) {
        console.error("AdSense execution error:", err);
      }
    }
  }, []);

  return (
    <div className={`my-6 mx-auto text-center overflow-hidden ${className}`}>
      {label && (
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
          Advertisement
        </span>
      )}
      <div className="min-h-[100px] w-full flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/80 dark:border-slate-800/80 p-2">
        {process.env.NODE_ENV === "production" ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client="ca-pub-0000000000000000"
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="py-6 px-4 text-xs font-mono text-slate-500 dark:text-slate-400 text-center">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">[AdSense Ad Unit Placeholder]</p>
            <p className="text-[11px] text-slate-400">Slot ID: {slotId} | Format: {format}</p>
          </div>
        )}
      </div>
    </div>
  );
}
