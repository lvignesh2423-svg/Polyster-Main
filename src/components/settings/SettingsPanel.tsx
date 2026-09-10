"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const DIFFICULTIES = ["junior", "mid", "senior", "staff"] as const;
const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile"] as const;
const STYLES = ["faang", "startup", "enterprise"] as const;

export default function SettingsPanel() {
  const {
    showSettings,
    setShowSettings,
    difficulty,
    setDifficulty,
    role,
    setRole,
    companyStyle,
    setCompanyStyle,
    githubToken,
    setGithubToken,
    nvidiaKey,
    setNvidiaKey,
  } = useStore();

  return (
    <AnimatePresence>
      {showSettings && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-96 max-w-full z-50 overflow-y-auto"
            style={{
              background: "linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-2xl"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#10005;
                </button>
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
                >
                  Difficulty
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        difficulty === d ? "tab-active" : "tab-inactive"
                      }`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
                >
                  Role Target
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        role === r ? "tab-active" : "tab-inactive"
                      }`}
                      onClick={() => setRole(r)}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
                >
                  Company Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        companyStyle === s ? "tab-active" : "tab-inactive"
                      }`}
                      onClick={() => setCompanyStyle(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
                >
                  API Keys
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="GitHub Token"
                    className="neon-input text-sm"
                    style={{ borderRadius: "10px", padding: "10px 14px" }}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="NVIDIA API Key"
                    className="neon-input text-sm"
                    style={{ borderRadius: "10px", padding: "10px 14px" }}
                    value={nvidiaKey}
                    onChange={(e) => setNvidiaKey(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
