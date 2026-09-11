"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import ProfileCard from "./ProfileCard";
import RepoGrid from "./RepoGrid";
import WeaknessReport from "@/components/analysis/WeaknessReport";
import ExportSection from "@/components/export/ExportSection";

const NAV_CARDS = [
  { id: "questions" as const, label: "Questions", desc: "10 AI-generated interview questions", icon: "\u{1F4CB}", color: "var(--accent-green)" },
  { id: "qa" as const, label: "Q&A Console", desc: "Ask anything about your repos", icon: "\u{1F4AC}", color: "var(--accent-cyan)" },
  { id: "mock" as const, label: "Mock Interview", desc: "10-question timed mock session", icon: "\u{1F3AB}", color: "var(--accent-teal)" },
  { id: "flashcards" as const, label: "Flashcards", desc: "Flip-card study mode", icon: "\u{1F4A7}", color: "var(--accent-lime)" },
];

export default function Dashboard() {
  const { setView, reset, questions, weaknesses, strengths, setActiveTab } = useStore();

  const openSection = (id: string) => {
    setActiveTab(id as "questions" | "qa" | "mock" | "flashcards");
    if (id === "questions") {
      setView("dashboard");
    } else if (id === "qa") {
      setView("qa");
    } else if (id === "mock") {
      setView("mock");
    } else if (id === "flashcards") {
      setView("flashcards");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header
          className="sticky top-0 z-30 backdrop-blur-xl border-b"
          style={{ background: "rgba(5, 5, 8, 0.85)", borderColor: "rgba(57, 255, 20, 0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1
                className="text-lg font-bold cursor-pointer"
                style={{ fontFamily: "'Syne', sans-serif" }}
                onClick={() => { reset(); setView("hero"); }}
              >
                <span className="text-glow-green" style={{ color: "var(--accent-green)" }}>Repo</span>
                <span style={{ color: "var(--accent-cyan)" }}>Interview</span>
              </h1>
              <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
                AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                {questions.length > 0 && (
                  <span className="badge badge-green text-[10px]">{questions.length} Questions</span>
                )}
                {weaknesses.length > 0 && (
                  <span className="badge badge-warning text-[10px]">{weaknesses.length} Flags</span>
                )}
                {strengths.length > 0 && (
                  <span className="badge badge-success text-[10px]">{strengths.length} Strengths</span>
                )}
              </div>
              <button
                className="btn-secondary text-xs px-4 py-2"
                onClick={() => useStore.getState().setShowSettings(true)}
              >
                &#9881; Settings
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <ProfileCard />

          <RepoGrid />

          <section>
            <h3
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-secondary)" }}
            >
              Interview Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {NAV_CARDS.map((card, i) => (
                <motion.button
                  key={card.id}
                  className="glass-card p-5 text-left cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openSection(card.id)}
                >
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h4
                    className="text-sm font-bold mb-1"
                    style={{ fontFamily: "'Syne', sans-serif", color: card.color }}
                  >
                    {card.label}
                  </h4>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {card.desc}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>

          <WeaknessReport />

          <ExportSection />

          <footer className="text-center py-8 border-t" style={{ borderColor: "rgba(57, 255, 20, 0.06)" }}>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              RepoInterview AI &mdash; Built with Next.js + LLM via OpenRouter
            </p>
          </footer>
        </main>
      </motion.div>
    </div>
  );
}
