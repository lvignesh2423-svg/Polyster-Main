"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const DIFFICULTIES = ["junior", "mid", "senior", "staff"] as const;
const ROLES = ["frontend", "backend", "fullstack", "mobile", "devops", "ml"] as const;
const STYLES = ["faang", "startup", "enterprise"] as const;

export default function SettingsPanel() {
  const { showSettings, setShowSettings, difficulty, setDifficulty, role, setRole, companyStyle, setCompanyStyle, profile, repos, setQuestions, setWeaknesses, setStrengths, setFlashcards } = useStore();
  const [regenStatus, setRegenStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [regenMsg, setRegenMsg] = React.useState("");

  const handleReload = async () => {
    if (!profile || regenStatus === "loading") return;
    setRegenStatus("loading");
    setRegenMsg("Generating...");
    try {
      const qRes = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, repos, difficulty, role, companyStyle }) });
      const qData = await qRes.json();
      if (qData.error) throw new Error(qData.error);
      const questions = Array.isArray(qData.questions) ? qData.questions : [];
      setQuestions(questions);
      setWeaknesses(qData.weaknesses || []);
      setStrengths(qData.strengths || []);
      setFlashcards(questions.map((q: { id: string; question: string; modelAnswer: string; relatedRepo: string }) => ({ id: q.id, front: q.question, back: q.modelAnswer, repo: q.relatedRepo || "" })));
      setRegenStatus("done");
      setRegenMsg(`Done — ${questions.length} questions`);
      setTimeout(() => { setRegenStatus("idle"); setShowSettings(false); }, 1200);
    } catch (err) {
      setRegenStatus("error");
      setRegenMsg(err instanceof Error ? err.message : "Failed");
      setTimeout(() => setRegenStatus("idle"), 3000);
    }
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setShowSettings(false)} />
          <motion.div className="glass-card relative w-full max-w-sm p-6" initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-blue)" }}>Settings</h3>
              <button onClick={() => setShowSettings(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}>&times;</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[9px] uppercase tracking-[0.15em] font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Difficulty</label>
                <div className="flex gap-1.5">
                  {DIFFICULTIES.map((d) => (
                    <button key={d} className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${difficulty === d ? "tab-active" : "tab-inactive"}`} onClick={() => setDifficulty(d)}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-[0.15em] font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Role</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ROLES.map((r) => (
                    <button key={r} className={`py-2 rounded-lg text-[11px] font-medium transition-all ${role === r ? "tab-active" : "tab-inactive"}`} onClick={() => setRole(r)}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-[0.15em] font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Company Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STYLES.map((s) => (
                    <button key={s} className={`py-2 rounded-lg text-[11px] font-medium transition-all ${companyStyle === s ? "tab-active" : "tab-inactive"}`} onClick={() => setCompanyStyle(s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-[9px] mb-3" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>API keys in .env.local</p>
                {regenMsg && <motion.p className="text-[11px] mb-2" style={{ color: regenStatus === "error" ? "var(--error)" : regenStatus === "done" ? "var(--accent-blue)" : "var(--text-secondary)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{regenMsg}</motion.p>}
                <motion.button className="btn-primary text-[11px] w-full py-2.5" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleReload} disabled={regenStatus === "loading" || !profile}>
                  {regenStatus === "loading" ? "..." : regenStatus === "done" ? "Done!" : "Regenerate"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
