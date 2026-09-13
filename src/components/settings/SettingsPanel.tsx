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

  if (!showSettings) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
        }}
        onClick={() => setShowSettings(false)}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          zIndex: 10001,
          width: "100%",
          maxWidth: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "rgba(15, 15, 15, 0.95)",
          border: "1px solid rgba(220, 38, 38, 0.2)",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(220, 38, 38, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Red glow accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.5), transparent)",
            borderRadius: "20px 20px 0 0",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              color: "#EF4444",
              letterSpacing: "-0.01em",
            }}
          >
            Settings
          </h3>
          <button
            onClick={() => setShowSettings(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              color: "#94A3B8",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Difficulty */}
          <div>
            <label
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 500,
                color: "#94A3B8",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Difficulty
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  className={difficulty === d ? "tab-active" : "tab-inactive"}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 500,
                color: "#94A3B8",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Role
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  className={role === r ? "tab-active" : "tab-inactive"}
                  style={{
                    padding: "10px 0",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setRole(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Company Style */}
          <div>
            <label
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 500,
                color: "#94A3B8",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Company Style
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {STYLES.map((s) => (
                <button
                  key={s}
                  className={companyStyle === s ? "tab-active" : "tab-inactive"}
                  style={{
                    padding: "10px 0",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setCompanyStyle(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "20px" }}>
            <p style={{ fontSize: "10px", color: "#94A3B8", marginBottom: "12px", fontWeight: 300 }}>
              API keys configured in .env.local
            </p>
            {regenMsg && (
              <p
                style={{
                  fontSize: "12px",
                  marginBottom: "12px",
                  color: regenStatus === "error" ? "#EF4444" : regenStatus === "done" ? "#39FF14" : "#94A3B8",
                  fontWeight: 300,
                }}
              >
                {regenMsg}
              </p>
            )}
            <button
              className="btn-primary"
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: "13px",
                fontWeight: 500,
              }}
              onClick={handleReload}
              disabled={regenStatus === "loading" || !profile}
            >
              {regenStatus === "loading" ? "Generating..." : regenStatus === "done" ? "Done!" : "Regenerate Questions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
