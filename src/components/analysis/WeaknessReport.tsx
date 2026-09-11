"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function WeaknessReport() {
  const { weaknesses, strengths } = useStore();
  if (!weaknesses.length && !strengths.length) return null;

  return (
    <div className="space-y-10">
      {strengths.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.15)" }}>
              <span style={{ color: "var(--accent-green)", fontSize: "14px" }}>&#10003;</span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-green)" }}>
                Strengths
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                {strengths.length} areas where you excel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strengths.map((s, i) => (
              <motion.div
                key={s.repo + s.message}
                className="glass-card depth-hover p-5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: "var(--accent-green)", boxShadow: "0 0 8px rgba(57,255,20,0.4)" }} />
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed mb-2" style={{ fontWeight: 400, color: "var(--text-primary)" }}>
                      {s.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-green text-[10px]">{s.repo}</span>
                      <span className="text-[10px]" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{s.category}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {weaknesses.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <span style={{ color: "var(--warning)", fontSize: "14px" }}>&#9888;</span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--warning)" }}>
                Areas to Improve
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                {weaknesses.length} repositories need attention
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {weaknesses.map((w, i) => (
              <motion.div
                key={w.repo + w.issues.map((iss) => iss.message).join(",")}
                className="glass-card depth-hover p-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--warning)", boxShadow: "0 0 8px rgba(251,191,36,0.4)" }} />
                  <h4 className="text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>{w.repo}</h4>
                  <span className="text-[10px] ml-auto" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
                    Score: {w.score}/100
                  </span>
                </div>

                <div className="space-y-2.5">
                  {w.issues.map((issue, j) => (
                    <div key={j} className="flex items-start gap-3 pl-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium mt-0.5 shrink-0 ${
                        issue.severity === "high" ? "badge-error" :
                        issue.severity === "medium" ? "badge-warning" : "badge-blue"
                      }`}>
                        {issue.severity}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ fontWeight: 300, color: "var(--text-primary)" }}>
                        {issue.message}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
