"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function FlashcardsPage() {
  const { flashcards, setView } = useStore();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const current = flashcards[index];

  const paginate = (dir: number) => {
    setFlipped(false);
    setDirection(dir);
    setIndex((prev) => { const n = prev + dir; if (n < 0) return flashcards.length - 1; if (n >= flashcards.length) return 0; return n; });
  };

  if (!flashcards.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-base mb-6" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>No flashcards yet</p>
        <button className="btn-secondary text-sm px-6 py-3" onClick={() => setView("dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <header className="sticky top-0 z-30" style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button className="btn-secondary text-sm px-4 py-2" onClick={() => setView("dashboard")}>&larr; Back</button>
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-cyan)" }}>Flashcards</h2>
          <span className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{index + 1}/{flashcards.length}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <div className="progress-bar mb-8"><div className="progress-bar-fill" style={{ width: `${((index + 1) / flashcards.length) * 100}%` }} /></div>

          <div className="flashcard-container mb-8" onClick={() => setFlipped(!flipped)}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={index} className="flashcard-inner" initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }} animate={{ rotateY: flipped ? 180 : 0, opacity: 1 }} exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ transformStyle: "preserve-3d" }}>
                <div className="flashcard-front glass-card" style={{ backfaceVisibility: "hidden" }}>
                  <span className="badge badge-blue text-[10px] mb-4 self-start">Question</span>
                  <p className="text-base leading-relaxed" style={{ fontWeight: 400 }}>{current.front}</p>
                  <p className="text-sm mt-6" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Click to reveal</p>
                </div>
                <div className="flashcard-back glass-card" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <span className="badge badge-cyan text-[10px] mb-4 self-start">Answer</span>
                  <p className="text-sm leading-relaxed" style={{ fontWeight: 300 }}>{current.back}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4">
            <motion.button className="btn-secondary px-6 py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => paginate(-1)}>&larr; Prev</motion.button>
            <motion.button className={`btn-secondary px-6 py-3 ${mastered.has(current.id) ? "tab-active" : ""}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { if (!current) return; setMastered((p) => { const n = new Set(p); n.has(current.id) ? n.delete(current.id) : n.add(current.id); return n; }); }}>
              {mastered.has(current.id) ? "Mastered" : "Mark Mastered"}
            </motion.button>
            <motion.button className="btn-primary px-6 py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => paginate(1)}>Next &rarr;</motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
