"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function HeroSection() {
  const [input, setInput] = useState("");
  const { setView, setProfile, setRepos, setIsLoading, setLoadingMessage } =
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
        { msg: "Cloning repositories...", delay: 1500 },
        { msg: "Analyzing code structure...", delay: 3000 },
        { msg: "Reading commit history...", delay: 4500 },
        { msg: "Building interview intelligence...", delay: 6000 },
      ];

      steps.forEach((step) => {
        setTimeout(() => setLoadingMessage(step.msg), step.delay);
      });

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
          difficulty: "mid",
          role: "fullstack",
          companyStyle: "faang",
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
      setTimeout(() => setView("dashboard"), 1000);
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
          background: `radial-gradient(circle at ${50 + mousePos.x * 0.5}% ${50 + mousePos.y * 0.5}%, rgba(124, 58, 237, 0.12) 0%, transparent 60%)`,
          transition: "background 0.3s ease",
        }}
      />

      {mounted && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-xl border border-white/5"
              style={{
                width: 120 + i * 40,
                height: 80 + i * 20,
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                background: `linear-gradient(135deg, rgba(${i % 2 === 0 ? "124,58,237" : "34,211,238"}, 0.03), transparent)`,
              }}
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 5, 0],
                rotateX: [0, 2, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
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
          <span className="badge badge-violet text-xs">
            AI-Powered Interview Prep
          </span>
        </motion.div>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em" }}
        >
          <span className="text-glow-violet">Repo</span>
          <span className="text-cyan text-glow-cyan">Interview</span>
          <br />
          <span className="text-3xl md:text-4xl text-text-secondary font-light">
            AI
          </span>
        </h1>

        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-secondary)" }}
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
          className="btn-primary text-lg px-10 py-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={!input.trim()}
        >
          Analyze Portfolio
        </motion.button>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm"
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
                <div className="w-1.5 h-1.5 rounded-full bg-violet" />
                {feat}
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
