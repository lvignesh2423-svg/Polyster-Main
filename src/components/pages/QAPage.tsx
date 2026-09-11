"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { ChatMessage } from "@/lib/types";

export default function QAPage() {
  const { setView, questions, repos, profile } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
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
        body: JSON.stringify({ profile, repos, messages: allMessages.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp })) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.response || data.error || "No response", timestamp: Date.now() }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Network error.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <header className="sticky top-0 z-30" style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button className="btn-secondary text-sm px-4 py-2" onClick={() => setView("dashboard")}>&larr; Back</button>
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-blue)" }}>Q&A Console</h2>
          <div />
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.length === 0 && (
            <motion.div className="flex flex-col items-center justify-center h-full text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-base mb-6" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Ask anything about your code or repos</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {["What are my weakest areas?", "How can I improve?", "What questions should I expect?", "Explain my architecture"].map((p) => (
                  <button key={p} className="btn-secondary text-sm px-4 py-2" onClick={() => setInput(p)}>{p}</button>
                ))}
              </div>
            </motion.div>
          )}
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
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-blue)", animation: "pulse 1s infinite" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" className="neon-input flex-1 text-base" placeholder="Ask about your repos..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} disabled={isLoading} />
          <motion.button className="btn-primary px-6 py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={sendMessage} disabled={isLoading || !input.trim()}>Send</motion.button>
        </div>
      </div>
    </div>
  );
}
