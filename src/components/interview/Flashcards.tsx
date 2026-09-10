"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function Flashcards() {
  const {
    flashcards,
    flashcardIndex,
    setFlashcardIndex,
    flashcardFlipped,
    setFlashcardFlipped,
  } = useStore();

  if (!flashcards.length) return null;

  const card = flashcards[flashcardIndex];
  const total = flashcards.length;

  const next = () => {
    setFlashcardFlipped(false);
    setTimeout(() => {
      setFlashcardIndex((flashcardIndex + 1) % total);
    }, 200);
  };

  const prev = () => {
    setFlashcardFlipped(false);
    setTimeout(() => {
      setFlashcardIndex((flashcardIndex - 1 + total) % total);
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="badge badge-cyan text-xs">
          Card {flashcardIndex + 1} / {total}
        </span>
        <div className="flex gap-2">
          <motion.button
            className="btn-secondary text-xs px-4 py-2"
            whileTap={{ scale: 0.95 }}
            onClick={prev}
          >
            &#8592; Prev
          </motion.button>
          <motion.button
            className="btn-secondary text-xs px-4 py-2"
            whileTap={{ scale: 0.95 }}
            onClick={next}
          >
            Next &#8594;
          </motion.button>
        </div>
      </div>

      <div
        className="flashcard-container"
        onClick={() => setFlashcardFlipped(!flashcardFlipped)}
      >
        <div className={`flashcard-inner ${flashcardFlipped ? "flipped" : ""}`}>
          <div
            className="flashcard-front glass-card"
            style={{ background: "linear-gradient(135deg, rgba(30,30,46,0.9), rgba(42,42,64,0.7))" }}
          >
            <span
              className="text-[10px] uppercase tracking-widest mb-4 font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-cyan)" }}
            >
              Question
            </span>
            <p
              className="text-base leading-relaxed"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {card.front}
            </p>
            <p className="text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
              {card.repo}
            </p>
            <p className="text-xs mt-2 opacity-50" style={{ color: "var(--text-secondary)" }}>
              Click to flip
            </p>
          </div>

          <div
            className="flashcard-back glass-card"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.1))" }}
          >
            <span
              className="text-[10px] uppercase tracking-widest mb-4 font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-violet)" }}
            >
              Model Answer
            </span>
            <p
              className="text-sm leading-relaxed overflow-y-auto max-h-[220px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {card.back}
            </p>
            <p className="text-xs mt-2 opacity-50" style={{ color: "var(--text-secondary)" }}>
              Click to flip back
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1">
        {flashcards.map((_: unknown, i: number) => (
          <button
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background:
                i === flashcardIndex
                  ? "var(--accent-violet)"
                  : "rgba(255,255,255,0.1)",
            }}
            onClick={() => {
              setFlashcardFlipped(false);
              setTimeout(() => setFlashcardIndex(i), 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
