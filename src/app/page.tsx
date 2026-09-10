"use client";

import dynamic from "next/dynamic";

const AppShell = dynamic(() => import("@/components/AppShell"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="morph-spinner" />
    </div>
  ),
});

export default function Home() {
  return <AppShell />;
}
