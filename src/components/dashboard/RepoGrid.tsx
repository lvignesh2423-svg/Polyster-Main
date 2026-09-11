"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6", JavaScript: "#F7DF1E", Python: "#3572A5",
  Java: "#B07219", Go: "#00ADD8", Rust: "#DEA584", C: "#555555",
  "C++": "#F34B7D", Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138",
  Kotlin: "#A97BFF", Dart: "#00B4AB", HTML: "#E34F26", CSS: "#563D7C",
  Shell: "#89E051", Vue: "#41B883", SCSS: "#C6538C",
};

export default function RepoGrid() {
  const {
    repos, selectedRepos, toggleRepo, profile, difficulty, role, companyStyle,
    setQuestions, setWeaknesses, setStrengths, setFlashcards,
  } = useStore();

  const [regenStatus, setRegenStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [regenMsg, setRegenMsg] = React.useState("");

  if (!repos.length) return null;

  const handleRegenSelected = async () => {
    if (!profile || selectedRepos.length === 0 || regenStatus === "loading") return;
    setRegenStatus("loading");
    setRegenMsg("Generating...");
    try {
      const reposToUse = repos.filter((r) => selectedRepos.includes(r.full_name));
      const qRes = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, repos: reposToUse, difficulty, role, companyStyle }),
      });
      const qData = await qRes.json();
      if (qData.error) throw new Error(qData.error);
      const questions = Array.isArray(qData.questions) ? qData.questions : [];
      setQuestions(questions);
      setWeaknesses(qData.weaknesses || []);
      setStrengths(qData.strengths || []);
      setFlashcards(questions.map((q: { id: string; question: string; modelAnswer: string; relatedRepo: string }) => ({
        id: q.id, front: q.question, back: q.modelAnswer, repo: q.relatedRepo || "",
      })));
      setRegenStatus("done");
      setRegenMsg(`Generated ${questions.length} questions`);
      setTimeout(() => setRegenStatus("idle"), 2000);
    } catch (err) {
      setRegenStatus("error");
      setRegenMsg(err instanceof Error ? err.message : "Failed");
      setTimeout(() => setRegenStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-secondary)" }}>
          Repositories ({repos.length})
        </h3>
        {selectedRepos.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "var(--accent-blue)", fontWeight: 400 }}>{selectedRepos.length} selected</span>
            <motion.button className="btn-primary text-xs px-4 py-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRegenSelected} disabled={regenStatus === "loading"}>
              {regenStatus === "loading" ? "..." : "Regenerate"}
            </motion.button>
          </div>
        )}
      </div>

      {regenMsg && (
        <motion.p className="text-sm" style={{ color: regenStatus === "error" ? "var(--error)" : regenStatus === "done" ? "var(--accent-blue)" : "var(--text-secondary)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {regenMsg}
        </motion.p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo, i) => {
          const isSelected = selectedRepos.includes(repo.full_name);
          return (
            <GlassCard key={repo.id} delay={i * 0.04} className="p-5 cursor-pointer">
              <div onClick={() => toggleRepo(repo.full_name)}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-semibold truncate flex-1" style={{ fontFamily: "'Syne', sans-serif" }}>{repo.name}</h4>
                  {repo.interviewRelevance > 60 && <span className="badge badge-green text-[9px] ml-2">TOP</span>}
                </div>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                  {repo.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(repo.languages).sort(([, a], [, b]) => b - a).slice(0, 3).map(([lang]) => (
                    <span key={lang} className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${LANG_COLORS[lang] || "#666"}18`, color: LANG_COLORS[lang] || "#999" }}>
                      {lang}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                  <span>&#9733; {repo.stargazers_count}</span>
                  <span>Fork {repo.forks_count}</span>
                  <span>{repo.commits.length} commits</span>
                </div>
                <div className="mt-3 progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${repo.interviewRelevance}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Relevance</span>
                  <span className="text-[10px] font-medium" style={{ color: "var(--accent-blue)" }}>{repo.interviewRelevance}%</span>
                </div>
                {repo.weaknessFlags.length > 0 && (
                  <div className="mt-2">
                    {repo.weaknessFlags.slice(0, 1).map((flag) => (
                      <div key={flag} className="text-[10px] flex items-center gap-1" style={{ color: "var(--warning)" }}>&#9888; {flag}</div>
                    ))}
                  </div>
                )}
              </div>
              {isSelected && <motion.div className="mt-2 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="badge badge-blue text-[9px]">Selected</span></motion.div>}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
