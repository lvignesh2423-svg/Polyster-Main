"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function HeroSection() {
  const [input, setInput] = useState("");
  const { setView, setProfile, setRepos, setIsLoading, setLoadingMessage, difficulty, role, companyStyle } =
    useStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setView("analyzing");
    setIsLoading(true);
    setLoadingMessage("Fetching GitHub profile...");

    try {
      const steps = [
        { msg: "Fetching GitHub profile...", delay: 0 },
        { msg: "Cloning repositories...", delay: 1200 },
        { msg: "Analyzing code structure...", delay: 2400 },
        { msg: "Building interview intelligence...", delay: 3600 },
      ];
      steps.forEach((step) => setTimeout(() => setLoadingMessage(step.msg), step.delay));

      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProfile(data.profile);
      setRepos(data.repos);
      setLoadingMessage("Generating interview questions...");

      const qRes = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: data.profile,
          repos: data.repos,
          difficulty,
          role,
          companyStyle,
        }),
      });
      const qData = await qRes.json();
      if (qData.error) throw new Error(qData.error);

      useStore.getState().setQuestions(qData.questions || []);
      useStore.getState().setWeaknesses(qData.weaknesses || []);
      useStore.getState().setStrengths(qData.strengths || []);

      const flashcards = (qData.questions || []).map(
        (q: { id: string; question: string; modelAnswer: string; relatedRepo: string }) => ({
          id: q.id,
          front: q.question,
          back: q.modelAnswer,
          repo: q.relatedRepo,
        })
      );
      useStore.getState().setFlashcards(flashcards);

      setLoadingMessage("Dashboard ready!");
      setTimeout(() => setView("dashboard"), 800);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setView("hero");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + mousePos.x * 0.5}% ${50 + mousePos.y * 0.5}%, rgba(57, 255, 20, 0.07) 0%, transparent 55%)`,
          transition: "background 0.3s ease",
        }}
      />

      {mounted && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="shape-3d"
              style={{
                width: 100 + i * 50,
                height: 60 + i * 30,
                left: `${10 + i * 14}%`,
                top: `${15 + (i % 3) * 28}%`,
                borderRadius: i % 2 === 0 ? "20px" : "50%",
                border: `1px solid rgba(57, 255, 20, ${0.03 + i * 0.005})`,
                background: `linear-gradient(135deg, rgba(57, 255, 20, ${0.01 + i * 0.003}), transparent)`,
              }}
              animate={{
                y: [0, -12, 0],
                rotateY: [0, 8, 0],
                rotateX: [0, 3, 0],
              }}
              transition={{
                duration: 7 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
            />
          ))}
        </>
      )}

      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="inline-block mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <span className="badge badge-green text-xs">AI-Powered Interview Prep</span>
        </motion.div>

        <h1
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em" }}
        >
          <span className="text-glow-green" style={{ color: "var(--accent-green)" }}>Repo</span>
          <span className="text-glow-cyan" style={{ color: "var(--accent-cyan)" }}>Interview</span>
          <br />
          <span className="text-3xl md:text-4xl font-light" style={{ color: "var(--text-secondary)" }}>
            AI
          </span>
        </h1>

        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "'Outfit', sans-serif", color: "var(--text-secondary)" }}
        >
          Paste your GitHub profile. AI reads every repo, generates real
          interview questions, and coaches you on YOUR code.
        </p>

        <div className="relative max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="github.com/username or @handle"
            className="neon-input text-center"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
        </div>

        <motion.button
          className="btn-primary text-base px-10 py-4"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAnalyze}
          disabled={!input.trim()}
        >
          Analyze Portfolio
        </motion.button>

        <div
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
        >
          {["AI-Generated Questions", "Live Q&A", "Mock Interviews", "Weakness Reports"].map(
            (feat, i) => (
              <motion.div
                key={feat}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent-green)", boxShadow: "0 0 6px rgba(57, 255, 20, 0.5)" }}
                />
                {feat}
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
