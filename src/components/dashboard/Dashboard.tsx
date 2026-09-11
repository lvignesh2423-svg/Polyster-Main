"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import ProfileCard from "./ProfileCard";
import RepoGrid from "./RepoGrid";
import WeaknessReport from "@/components/analysis/WeaknessReport";
import ExportSection from "@/components/export/ExportSection";

const NAV_CARDS = [
  { id: "qa" as const, label: "Q&A Console", desc: "Ask anything about your repos", icon: "\u{1F4AC}", color: "var(--accent-blue)" },
  { id: "mock" as const, label: "Mock Interview", desc: "10-question timed mock session", icon: "\u{1F3AB}", color: "var(--accent-teal)" },
  { id: "flashcards" as const, label: "Flashcards", desc: "Flip-card study mode", icon: "\u{1F4A7}", color: "var(--accent-cyan)" },
];

export default function Dashboard() {
  const { setView, reset, questions, weaknesses, strengths, setActiveTab } = useStore();

  const openSection = (id: string) => {
    setActiveTab(id as "qa" | "mock" | "flashcards");
    if (id === "qa") setView("qa");
    else if (id === "mock") setView("mock");
    else if (id === "flashcards") setView("flashcards");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <header
          className="sticky top-0 z-30"
          style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1
                className="text-lg font-bold cursor-pointer"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}
                onClick={() => { reset(); setView("hero"); }}
              >
                <span style={{ color: "var(--accent-blue)" }}>Repo</span>
                <span style={{ color: "var(--accent-cyan)" }}>Interview</span>
                <span className="ml-2 text-sm font-light" style={{ color: "var(--text-secondary)" }}>AI</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {questions.length > 0 && <span className="badge badge-green text-[11px]">{questions.length} Questions</span>}
                {weaknesses.length > 0 && <span className="badge badge-warning text-[11px]">{weaknesses.length} Flags</span>}
                {strengths.length > 0 && <span className="badge badge-success text-[11px]">{strengths.length} Strengths</span>}
              </div>
              <button className="btn-secondary text-sm px-4 py-2" onClick={() => useStore.getState().setShowSettings(true)}>
                &#9881; Settings
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          <ProfileCard />
          <RepoGrid />

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: "var(--text-secondary)" }}>
              Interview Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NAV_CARDS.map((card, i) => (
                <motion.button
                  key={card.id}
                  className="glass-card depth-hover p-6 text-left cursor-pointer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => openSection(card.id)}
                >
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <h4 className="text-base font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: card.color }}>
                    {card.label}
                  </h4>
                  <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{card.desc}</p>
                </motion.button>
              ))}
            </div>
          </section>

          <WeaknessReport />
          <ExportSection />

          <footer className="text-center py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              RepoInterview AI
            </p>
          </footer>
        </main>
      </motion.div>
    </div>
  );
}
