"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function FlashcardsPage() {
  const {
    flashcards,
    flashcardIndex,
    setFlashcardIndex,
    flashcardFlipped,
    setFlashcardFlipped,
    setView,
  } = useStore();

  if (!flashcards.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
        <p className="text-base mb-4" style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}>
          No flashcards available
        </p>
        <button className="btn-secondary text-sm" onClick={() => setView("dashboard")}>
          &#8592; Back to Dashboard
        </button>
      </div>
    );
  }

  const card = flashcards[flashcardIndex];
  const total = flashcards.length;

  const next = () => {
    setFlashcardFlipped(false);
    setTimeout(() => setFlashcardIndex((flashcardIndex + 1) % total), 200);
  };

  const prev = () => {
    setFlashcardFlipped(false);
    setTimeout(() => setFlashcardIndex((flashcardIndex - 1 + total) % total), 200);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <motion.header
        className="sticky top-0 z-30 backdrop-blur-xl border-b"
        style={{ background: "rgba(5, 5, 8, 0.85)", borderColor: "rgba(57, 255, 20, 0.08)" }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="btn-secondary text-xs px-3 py-1.5"
              onClick={() => setView("dashboard")}
            >
              &#8592; Back
            </button>
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-green)" }}
            >
              Flashcards
            </h1>
          </div>
          <span className="badge badge-green text-[10px]">
            {flashcardIndex + 1} / {total}
          </span>
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center justify-between w-full max-w-2xl mb-8">
          <motion.button
            className="btn-secondary text-sm px-5 py-2.5"
            whileTap={{ scale: 0.95 }}
            onClick={prev}
          >
            &#8592; Prev
          </motion.button>
          <div className="flex gap-1.5">
            {flashcards.map((_: unknown, i: number) => (
              <button
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === flashcardIndex ? "var(--accent-green)" : "rgba(57, 255, 20, 0.12)",
                  boxShadow: i === flashcardIndex ? "0 0 8px rgba(57, 255, 20, 0.4)" : "none",
                }}
                onClick={() => {
                  setFlashcardFlipped(false);
                  setTimeout(() => setFlashcardIndex(i), 200);
                }}
              />
            ))}
          </div>
          <motion.button
            className="btn-secondary text-sm px-5 py-2.5"
            whileTap={{ scale: 0.95 }}
            onClick={next}
          >
            Next &#8594;
          </motion.button>
        </div>

        <motion.div
          className="flashcard-container w-full max-w-2xl"
          onClick={() => setFlashcardFlipped(!flashcardFlipped)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={flashcardIndex}
        >
          <div className={`flashcard-inner ${flashcardFlipped ? "flipped" : ""}`}>
            <div
              className="flashcard-front glass-card"
              style={{ background: "linear-gradient(135deg, rgba(10,10,18,0.95), rgba(15,15,24,0.8))" }}
            >
              <span
                className="text-[11px] uppercase tracking-widest mb-6 font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-green)" }}
              >
                Question {flashcardIndex + 1}
              </span>
              <p
                className="text-lg leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {card.front}
              </p>
              <p className="text-xs mt-6" style={{ color: "var(--text-secondary)" }}>
                {card.repo}
              </p>
              <p className="text-xs mt-3 opacity-40" style={{ color: "var(--accent-green)" }}>
                Click to reveal answer
              </p>
            </div>

            <div
              className="flashcard-back glass-card"
              style={{ background: "linear-gradient(135deg, rgba(57,255,20,0.06), rgba(0,229,255,0.04))" }}
            >
              <span
                className="text-[11px] uppercase tracking-widest mb-6 font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-cyan)" }}
              >
                Model Answer
              </span>
              <p
                className="text-sm leading-relaxed overflow-y-auto max-h-[240px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.back}
              </p>
              <p className="text-xs mt-3 opacity-40" style={{ color: "var(--accent-cyan)" }}>
                Click to flip back
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
