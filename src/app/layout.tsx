import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoInterview AI — GitHub Portfolio Interview Prep",
  description:
    "AI-powered interview preparation based on your GitHub repositories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
