"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function HeroSection() {
  const [input, setInput] = useState("");
  const { setView, setProfile, setRepos, setIsLoading, setLoadingMessage, difficulty, role, companyStyle } =
    useStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handler = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
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
        body: JSON.stringify({ profile: data.profile, repos: data.repos, difficulty, role, companyStyle }),
      });
      const qData = await qRes.json();
      if (qData.error) throw new Error(qData.error);

      useStore.getState().setQuestions(qData.questions || []);
      useStore.getState().setWeaknesses(qData.weaknesses || []);
      useStore.getState().setStrengths(qData.strengths || []);

      const flashcards = (qData.questions || []).map(
        (q: { id: string; question: string; modelAnswer: string; relatedRepo: string }) => ({
          id: q.id, front: q.question, back: q.modelAnswer, repo: q.relatedRepo,
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
    <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {mounted && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="shape-3d parallax-layer"
              style={{
                width: 80 + i * 40,
                height: 60 + i * 30,
                left: `${10 + i * 16}%`,
                top: `${15 + (i % 3) * 28}%`,
                borderRadius: i % 2 === 0 ? "16px" : "50%",
                transform: `translate(${mousePos.x * (5 + i * 2)}px, ${mousePos.y * (5 + i * 2)}px)`,
              }}
            />
          ))}
        </>
      )}

      <motion.div
        className="relative z-10 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="inline-block mb-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <span className="badge badge-blue text-[10px] glow-pulse">AI-Powered Interview Prep</span>
        </motion.div>

        <h1
          className="text-4xl md:text-5xl font-bold mb-4 parallax-layer"
          style={{
            fontFamily: "'Syne', sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)`,
          }}
        >
          <span style={{ color: "var(--accent-blue)" }}>Repo</span>
          <span style={{ color: "var(--accent-cyan)" }}>Interview</span>
          <span className="ml-2 text-lg md:text-xl font-light align-middle" style={{ color: "var(--text-secondary)" }}>
            AI
          </span>
        </h1>

        <p
          className="text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: "'Outfit', sans-serif", color: "var(--text-secondary)", fontWeight: 300 }}
        >
          Paste your GitHub. AI reads every repo, generates interview questions, and coaches you on YOUR code.
        </p>

        <div
          className="relative max-w-md mx-auto mb-6 parallax-layer"
          style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
        >
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
          className="btn-primary text-sm px-10 py-3"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAnalyze}
          disabled={!input.trim()}
        >
          Analyze Portfolio
        </motion.button>

        <div
          className="mt-12 flex flex-wrap justify-center gap-6 text-xs"
          style={{ fontFamily: "'Outfit', sans-serif", color: "var(--text-secondary)", fontWeight: 300 }}
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
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--accent-blue)", boxShadow: "0 0 6px rgba(59, 130, 246, 0.5)" }}
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
