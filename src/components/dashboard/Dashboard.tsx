"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import ProfileCard from "./ProfileCard";
import RepoGrid from "./RepoGrid";
import InterviewTabs from "@/components/interview/InterviewTabs";
import WeaknessReport from "@/components/analysis/WeaknessReport";
import ExportSection from "@/components/export/ExportSection";

export default function Dashboard() {
  const { setView, reset, questions, weaknesses, strengths } = useStore();

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/5"
          style={{ background: "rgba(10, 10, 15, 0.8)" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1
                className="text-lg font-bold cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                onClick={() => {
                  reset();
                  setView("hero");
                }}
              >
                <span className="text-glow-violet">Repo</span>
                <span className="text-cyan">Interview</span>
              </h1>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                {questions.length > 0 && (
                  <span className="badge badge-violet text-[10px]">
                    {questions.length} Questions
                  </span>
                )}
                {weaknesses.length > 0 && (
                  <span className="badge badge-warning text-[10px]">
                    {weaknesses.length} Flags
                  </span>
                )}
                {strengths.length > 0 && (
                  <span className="badge badge-success text-[10px]">
                    {strengths.length} Strengths
                  </span>
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
            <InterviewTabs />
          </section>

          <WeaknessReport />

          <ExportSection />

          <footer className="text-center py-8 border-t border-white/5">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              RepoInterview AI &mdash; Built with Next.js + NVIDIA Llama 3.1 70B
            </p>
          </footer>
        </main>
      </motion.div>
    </div>
  );
}
