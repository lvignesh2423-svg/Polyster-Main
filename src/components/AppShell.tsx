"use client";

import { useState, useEffect, Suspense, lazy, Component, ReactNode } from "react";
import { useStore } from "@/store/useStore";

const HeroSection = lazy(() => import("@/components/hero/HeroSection"));
const AnalyzingState = lazy(() => import("@/components/hero/AnalyzingState"));
const Dashboard = lazy(() => import("@/components/dashboard/Dashboard"));
const QAPage = lazy(() => import("@/components/pages/QAPage"));
const FlashcardsPage = lazy(() => import("@/components/pages/FlashcardsPage"));
const MockPage = lazy(() => import("@/components/pages/MockPage"));
const SettingsPanel = lazy(() => import("@/components/settings/SettingsPanel"));

function Spinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="morph-spinner" />
      <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
        Loading...
      </p>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: "" };
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h2 className="text-xl mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--error)" }}>
            {this.state.error}
          </p>
          <button
            className="btn-primary text-sm"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RainDrops() {
  return (
    <div className="rain-container">
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} className="rain-drop" />
      ))}
    </div>
  );
}

function ShellContent() {
  const { view } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <Spinner />;

  return (
    <Suspense fallback={<Spinner />}>
      <RainDrops />
      {view === "hero" && <HeroSection />}
      {view === "analyzing" && <AnalyzingState />}
      {view === "dashboard" && <Dashboard />}
      {view === "qa" && <QAPage />}
      {view === "flashcards" && <FlashcardsPage />}
      {view === "mock" && <MockPage />}
      <SettingsPanel />
    </Suspense>
  );
}

export default function AppShell() {
  return (
    <ErrorBoundary>
      <ShellContent />
    </ErrorBoundary>
  );
}
