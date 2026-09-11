"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { ChatMessage } from "@/lib/types";

export default function MockPage() {
  const { chatHistory, addChatMessage, clearChat, profile, repos, isLoading, setIsLoading, setView } =
    useStore();
  const [input, setInput] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const startInterview = async () => {
    clearChat();
    setScore(null);
    setQuestionCount(1);
    setIsLoading(true);

    const startMsg: ChatMessage = {
      id: "system",
      role: "assistant",
      content:
        "Welcome to your mock interview. I'll ask you 10 questions based on your GitHub portfolio. Take your time, and answer as you would in a real interview. Let's begin!\n\nQuestion 1: Tell me about yourself and the projects you've been working on recently.",
      timestamp: Date.now(),
    };
    addChatMessage(startMsg);
    setIsLoading(false);
  };

  const sendAnswer = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          repos,
          messages: [...chatHistory, userMsg],
          mode: "mock",
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      addChatMessage(aiMsg);
      setQuestionCount((c) => c + 1);

      if (questionCount >= 10 || data.response.includes("Final Score")) {
        const scoreMatch = data.response.match(/(\d+)\s*(?:\/100|%|out of)/);
        if (scoreMatch) setScore(parseInt(scoreMatch[1]));
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        timestamp: Date.now(),
      };
      addChatMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
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
              Mock Interview
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge badge-green text-[10px]">
              Q{Math.min(questionCount, 10)} / 10
            </span>
            {score !== null && (
              <span className="badge badge-cyan text-[10px]">
                Score: {score}/100
              </span>
            )}
          </div>
        </div>
      </motion.header>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <div className="flex items-center justify-end px-6 pt-4">
          <motion.button
            className="btn-secondary text-xs"
            whileTap={{ scale: 0.95 }}
            onClick={startInterview}
          >
            {chatHistory.length > 0 ? "Restart" : "Start Mock Interview"}
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.length === 0 && (
            <motion.div
              className="text-center py-20"
              style={{ color: "var(--text-secondary)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-5xl mb-4">&#127891;</div>
              <p className="text-base mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Ready for your mock interview?
              </p>
              <p className="text-sm">Click &quot;Start Mock Interview&quot; to begin. 10 questions, scored at the end.</p>
            </motion.div>
          )}

          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-green)", animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-green)", animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-green)", animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t" style={{ borderColor: "rgba(57, 255, 20, 0.06)" }}>
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Type your answer..."
              className="neon-input flex-1 text-sm"
              style={{ borderRadius: "12px", padding: "14px 18px" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
            />
            <motion.button
              className="btn-primary text-sm px-6"
              style={{ borderRadius: "12px", padding: "14px 22px" }}
              whileTap={{ scale: 0.95 }}
              onClick={sendAnswer}
              disabled={!input.trim() || isLoading}
            >
              Answer
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
