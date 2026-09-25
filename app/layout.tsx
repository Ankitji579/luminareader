import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://luminareader.com"),
  title: {
    default: "LuminaReader — Free Online EPUB & E-Book Reader",
    template: "%s | LuminaReader"
  },
  description: "Read EPUB, PDF, MOBI, AZW3, FB2, CBZ, and TXT e-books online in your browser. 100% private client-side viewer with dark mode and zero server uploads.",
  keywords: ["online epub reader", "read epub in browser", "free mobi reader", "open pdf online", "e-book web viewer"],
  authors: [{ name: "LuminaReader Team" }],
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google AdSense Script Integration */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased font-sans">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
