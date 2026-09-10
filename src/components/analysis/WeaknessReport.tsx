"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

export default function WeaknessReport() {
  const { weaknesses, strengths, repos } = useStore();

  const chartData = useMemo(() => {
    if (!repos.length) return [];

    const categories = [
      { label: "Documentation", key: "docs" },
      { label: "Testing", key: "tests" },
      { label: "Activity", key: "activity" },
      { label: "Complexity", key: "complexity" },
      { label: "Languages", key: "languages" },
      { label: "Community", key: "community" },
    ];

    return categories.map((cat) => {
      let score = 50;
      switch (cat.key) {
        case "docs":
          score = repos.reduce((acc, r) => {
            const hasGoodDocs = (r.readme?.length || 0) > 500;
            return acc + (hasGoodDocs ? 1 : 0);
          }, 0) / repos.length * 100;
          break;
        case "tests":
          score = repos.reduce((acc, r) => {
            const hasTests = r.files.some(
              (f) =>
                f.path.includes("test") ||
                f.path.includes("spec") ||
                f.path.includes("__tests__")
            );
            return acc + (hasTests ? 1 : 0);
          }, 0) / repos.length * 100;
          break;
        case "activity":
          score = repos.reduce((acc, r) => acc + r.commits.length, 0) / (repos.length * 20) * 100;
          break;
        case "complexity":
          score = repos.reduce((acc, r) => acc + r.files.length, 0) / (repos.length * 20) * 100;
          break;
        case "languages":
          score =
            repos.reduce((acc, r) => acc + Object.keys(r.languages).length, 0) /
            (repos.length * 3) * 100;
          break;
        case "community":
          score =
            repos.reduce((acc, r) => acc + r.stargazers_count + r.forks_count, 0) /
            (repos.length * 10) * 100;
          break;
      }
      return { category: cat.label, score: Math.min(100, Math.round(score)) };
    });
  }, [repos]);

  return (
    <div className="space-y-6">
      <h3
        className="text-lg font-semibold uppercase tracking-widest"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
      >
        Analysis Report
      </h3>

      {chartData.length > 0 && (
        <GlassCard className="p-6" delay={0}>
          <h4
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Portfolio Radar
          </h4>
          <div className="radar-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "#A0A0B8", fontSize: 11, fontFamily: "Space Grotesk" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#A0A0B8", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#7C3AED"
                  fill="#7C3AED"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {strengths.length > 0 && (
        <GlassCard className="p-6" delay={0.1}>
          <h4
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-success">&#10003;</span> Strengths
          </h4>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="badge badge-success text-[10px] mt-0.5">{s.category}</span>
                <div>
                  <p className="text-xs font-semibold">{s.repo}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {weaknesses.length > 0 && (
        <GlassCard className="p-6" delay={0.2}>
          <h4
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-error">&#9888;</span> Weaknesses
          </h4>
          <div className="space-y-3">
            {weaknesses.map((w, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl"
                style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.1)" }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold">{w.repo}</p>
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: "'Chakra Petch', monospace", color: w.score > 60 ? "var(--success)" : w.score > 30 ? "var(--warning)" : "var(--error)" }}
                  >
                    {w.score}/100
                  </span>
                </div>
                <div className="space-y-1">
                  {w.issues.map((issue, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{
                          background:
                            issue.severity === "high"
                              ? "var(--error)"
                              : issue.severity === "medium"
                              ? "var(--warning)"
                              : "var(--text-secondary)",
                        }}
                      />
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {issue.message}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
