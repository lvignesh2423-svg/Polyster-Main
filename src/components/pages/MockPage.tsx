"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { ChatMessage } from "@/lib/types";

export default function MockPage() {
  const { questions, setView, profile, repos } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [questionCount, setQuestionCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mockQuestions = questions.slice(0, 10);
  const maxQuestions = 10;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (completed || questionCount >= maxQuestions) return;
    const t = setInterval(() => setTimeLeft((p) => { if (p <= 1) { clearInterval(t); setCompleted(true); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [completed, questionCount]);

  const startInterview = useCallback(async () => {
    const firstQ = mockQuestions[0]?.question || "Tell me about yourself and your coding background.";
    setMessages([{
      id: "system",
      role: "assistant",
      content: "Welcome to your mock interview! I'll ask you 10 questions based on your GitHub repositories. Answer each one, and I'll provide feedback before moving on. Let's begin!\n\n**Question 1:** " + firstQ,
      timestamp: Date.now(),
    }]);
    setQuestionCount(1);
  }, [mockQuestions]);

  useEffect(() => {
    if (messages.length === 0 && !completed) startInterview();
  }, [messages.length, completed, startInterview]);

  const submitAnswer = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: Date.now() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, repos, mode: "mock", messages: allMessages.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp })) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.response || data.error || "Let's continue.", timestamp: Date.now() }]);
      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      if (newCount >= maxQuestions) setTimeout(() => setCompleted(true), 2000);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Network error — try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const skipQuestion = async () => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: "[Skipped]", timestamp: Date.now() }]);
    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    if (newCount >= maxQuestions) setCompleted(true);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (completed) {
    const answered = messages.filter((m) => m.role === "user" && m.content !== "[Skipped]").length;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div className="glass-card p-10 max-w-md w-full text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-4xl mb-4">&#127942;</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-teal)" }}>Interview Complete</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Great job! Here's your summary.</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl"><div className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>{answered}</div><div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>Answered</div></div>
            <div className="glass-card p-4 rounded-xl"><div className="text-2xl font-bold" style={{ color: "var(--accent-cyan)" }}>{maxQuestions - answered}</div><div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>Skipped</div></div>
          </div>
          <button className="btn-primary text-sm" onClick={() => setView("dashboard")}>Dashboard</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <header className="sticky top-0 z-30" style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button className="btn-secondary text-sm px-4 py-2" onClick={() => setView("dashboard")}>&larr; Back</button>
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-teal)" }}>Mock Interview</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{questionCount}/{maxQuestions}</span>
            <span className="text-sm font-mono" style={{ color: timeLeft < 30 ? "var(--error)" : "var(--accent-teal)" }}>{fmt(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6">
        <div className="progress-bar mb-6">
          <div className="progress-bar-fill" style={{ width: `${(questionCount / maxQuestions) * 100}%` }} />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((msg) => (
            <motion.div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontWeight: 300 }}>{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="chat-bubble-ai">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-teal)", animation: "pulse 1s infinite" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Evaluating...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary text-sm px-5 py-3" onClick={skipQuestion} disabled={isLoading}>Skip</button>
          <input type="text" className="neon-input flex-1 text-base" placeholder="Type your answer..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAnswer()} disabled={isLoading} />
          <motion.button className="btn-primary px-6 py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submitAnswer} disabled={isLoading || !input.trim()}>Submit</motion.button>
        </div>
      </div>
    </div>
  );
}
