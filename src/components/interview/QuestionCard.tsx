"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types";
import type { InterviewQuestion, QuestionCategory } from "@/lib/types";

export default function QuestionCard({ question }: { question: InterviewQuestion }) {
  const [expanded, setExpanded] = useState(false);

  const categoryColor = (cat: QuestionCategory) => {
    const map: Record<QuestionCategory, string> = {
      "project-deep-dive": "badge-cyan",
      "technical-decisions": "badge-violet",
      "code-specific": "badge-magenta",
      "problem-solving": "badge-cyan",
      "debugging-scenarios": "badge-warning",
      behavioral: "badge-success",
      "gaps-red-flags": "badge-error",
      "trending-modern": "badge-violet",
    };
    return map[cat] || "badge-violet";
  };

  return (
    <motion.div
      className="glass-card p-5 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: "rgba(124, 58, 237, 0.3)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">
          {CATEGORY_ICONS[question.category]}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge text-[10px] ${categoryColor(question.category)}`}>
              {CATEGORY_LABELS[question.category]}
            </span>
            {question.relatedRepo && (
              <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {question.relatedRepo}
              </span>
            )}
          </div>
          <h4
            className="text-sm font-semibold leading-relaxed"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {question.question}
          </h4>
        </div>
        <motion.span
          className="text-sm"
          animate={{ rotate: expanded ? 180 : 0 }}
          style={{ color: "var(--text-secondary)" }}
        >
          &#9662;
        </motion.span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
              <div>
                <h5
                  className="text-[10px] uppercase tracking-widest mb-2 font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-cyan)" }}
                >
                  Model Answer
                </h5>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {question.modelAnswer}
                </p>
              </div>

              <div>
                <h5
                  className="text-[10px] uppercase tracking-widest mb-2 font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-violet)" }}
                >
                  Key Points Interviewer Listens For
                </h5>
                <ul className="space-y-1">
                  {question.keyPoints.map((kp, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                      <span className="text-cyan mt-0.5">&#10003;</span> {kp}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5
                  className="text-[10px] uppercase tracking-widest mb-2 font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-magenta)" }}
                >
                  Common Mistakes
                </h5>
                <ul className="space-y-1">
                  {question.commonMistakes.map((cm, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                      <span className="text-error mt-0.5">&#10007;</span> {cm}
                    </li>
                  ))}
                </ul>
              </div>

              {question.followUp && (
                <div
                  className="glass-card p-3 rounded-xl"
                  style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}
                >
                  <h5
                    className="text-[10px] uppercase tracking-widest mb-1 font-semibold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--warning)" }}
                  >
                    Follow-up Question
                  </h5>
                  <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
                    {question.followUp}
                  </p>
                </div>
              )}

              {question.relatedFile && (
                <div className="text-[11px] flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <span>&#128196;</span> Referenced file: <span className="text-cyan font-mono">{question.relatedFile}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
