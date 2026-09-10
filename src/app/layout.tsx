import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoInterview AI — GitHub Portfolio Interview Prep",
  description:
    "AI-powered interview preparation based on your GitHub repositories. Get personalized questions, mock interviews, and weakness reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
