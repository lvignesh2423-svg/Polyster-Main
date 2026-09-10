"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { ChatMessage } from "@/lib/types";

export default function MockInterview() {
  const { chatHistory, addChatMessage, clearChat, profile, repos, isLoading, setIsLoading } =
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="badge badge-violet text-xs">
            Question {Math.min(questionCount, 10)} / 10
          </span>
          {score !== null && (
            <span className="badge badge-success text-xs">
              Score: {score}/100
            </span>
          )}
        </div>
        <motion.button
          className="btn-secondary text-xs"
          whileTap={{ scale: 0.95 }}
          onClick={startInterview}
        >
          {chatHistory.length > 0 ? "Restart" : "Start Mock Interview"}
        </motion.button>
      </div>

      <div className="glass-card flex flex-col h-[450px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
              <div className="text-4xl mb-4">&#127891;</div>
              <p className="text-sm">Click &quot;Start Mock Interview&quot; to begin.</p>
              <p className="text-xs mt-2">10 questions, timed, scored at the end.</p>
            </div>
          )}

          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                }
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your answer..."
              className="neon-input flex-1 text-sm"
              style={{ borderRadius: "12px", padding: "12px 16px" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
            />
            <motion.button
              className="btn-primary text-sm px-6"
              style={{ borderRadius: "12px", padding: "12px 20px" }}
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
