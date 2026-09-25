import MyLibrary from "@/components/library/MyLibrary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Library",
  description: "Access your privately stored EPUB and PDF books.",
};

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <MyLibrary />
      </div>
    </div>
  );
}
