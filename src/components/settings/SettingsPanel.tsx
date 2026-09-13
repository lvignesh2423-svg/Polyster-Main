"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const DIFFICULTIES = ["junior", "mid", "senior", "staff"] as const;
const ROLES = ["frontend", "backend", "fullstack", "mobile", "devops", "ml"] as const;
const STYLES = ["faang", "startup", "enterprise"] as const;

export default function SettingsPanel() {
  const showSettings = useStore((s) => s.showSettings);
  const setShowSettings = useStore((s) => s.setShowSettings);
  const difficulty = useStore((s) => s.difficulty);
  const setDifficulty = useStore((s) => s.setDifficulty);
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const companyStyle = useStore((s) => s.companyStyle);
  const setCompanyStyle = useStore((s) => s.setCompanyStyle);
  const profile = useStore((s) => s.profile);
  const repos = useStore((s) => s.repos);
  const setQuestions = useStore((s) => s.setQuestions);
  const setWeaknesses = useStore((s) => s.setWeaknesses);
  const setStrengths = useStore((s) => s.setStrengths);
  const setFlashcards = useStore((s) => s.setFlashcards);

  const [regenStatus, setRegenStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [regenMsg, setRegenMsg] = React.useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSettings(false);
    };
    if (showSettings) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [showSettings, setShowSettings]);

  const handleReload = async () => {
    if (!profile || regenStatus === "loading") return;
    setRegenStatus("loading");
    setRegenMsg("Generating...");
    try {
      const qRes = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, repos, difficulty, role, companyStyle }),
      });
      const qData = await qRes.json();
      if (qData.error) throw new Error(qData.error);
      const questions = Array.isArray(qData.questions) ? qData.questions : [];
      setQuestions(questions);
      setWeaknesses(qData.weaknesses || []);
      setStrengths(qData.strengths || []);
      setFlashcards(
        questions.map((q: { id: string; question: string; modelAnswer: string; relatedRepo: string }) => ({
          id: q.id,
          front: q.question,
          back: q.modelAnswer,
          repo: q.relatedRepo || "",
        }))
      );
      setRegenStatus("done");
      setRegenMsg(`Done — ${questions.length} questions`);
      setTimeout(() => {
        setRegenStatus("idle");
        setShowSettings(false);
      }, 1200);
    } catch (err) {
      setRegenStatus("error");
      setRegenMsg(err instanceof Error ? err.message : "Failed");
      setTimeout(() => setRegenStatus("idle"), 3000);
    }
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            className="glass-card relative w-full max-w-sm p-7"
            style={{ zIndex: 10000 }}
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-red-bright)" }}>
                Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-medium block mb-3" style={{ color: "var(--text-secondary)" }}>
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${difficulty === d ? "tab-active" : "tab-inactive"}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-medium block mb-3" style={{ color: "var(--text-secondary)" }}>
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all ${role === r ? "tab-active" : "tab-inactive"}`}
                      onClick={() => setRole(r)}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] font-medium block mb-3" style={{ color: "var(--text-secondary)" }}>
                  Company Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all ${companyStyle === s ? "tab-active" : "tab-inactive"}`}
                      onClick={() => setCompanyStyle(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] mb-4" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                  API keys configured in .env.local
                </p>
                {regenMsg && (
                  <motion.p
                    className="text-xs mb-3"
                    style={{
                      color: regenStatus === "error" ? "var(--error)" : regenStatus === "done" ? "var(--accent-green)" : "var(--text-secondary)",
                      fontWeight: 300,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {regenMsg}
                  </motion.p>
                )}
                <motion.button
                  className="btn-primary text-xs w-full py-3"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleReload}
                  disabled={regenStatus === "loading" || !profile}
                >
                  {regenStatus === "loading" ? "Generating..." : regenStatus === "done" ? "Done!" : "Regenerate Questions"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
