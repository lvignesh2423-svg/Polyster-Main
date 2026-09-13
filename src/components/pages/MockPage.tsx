"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { ChatMessage } from "@/lib/types";

const SEC_PER_QUESTION = 180;
const MAX_QUESTIONS = 10;

export default function MockPage() {
  const { questions, setView, profile, repos } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SEC_PER_QUESTION);
  const [questionCount, setQuestionCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mockQuestions = questions.slice(0, MAX_QUESTIONS);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis || null;
    return () => {
      synthRef.current?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (completed || questionCount >= MAX_QUESTIONS) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSkipAuto();
          return SEC_PER_QUESTION;
        }
        return p - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionCount, completed]);

  const speak = (text: string) => {
    synthRef.current?.cancel();
    const clean = text.replace(/[#*`_~\[\]]/g, "").replace(/\n{2,}/g, ". ");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synthRef.current?.speak(utter);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
  };

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setInput((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleSkipAuto = useCallback(() => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: "[Time expired]", timestamp: Date.now() }]);
    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    setTimeLeft(SEC_PER_QUESTION);
    if (newCount >= MAX_QUESTIONS) {
      setTimeout(() => setCompleted(true), 1000);
    }
  }, [questionCount]);

  const startInterview = useCallback(async () => {
    const firstQ = mockQuestions[0]?.question || "Tell me about yourself and your coding background.";
    const welcomeMsg = `Welcome to your mock interview! I will ask you 10 questions based on your GitHub repositories and actual code. You have 3 minutes per question. You can type or use the microphone to answer. Let us begin!\n\nQuestion 1: ${firstQ}`;
    setMessages([{
      id: "system",
      role: "assistant",
      content: welcomeMsg,
      timestamp: Date.now(),
    }]);
    setQuestionCount(1);
    setTimeLeft(SEC_PER_QUESTION);
    setTimeout(() => speak(welcomeMsg), 500);
  }, [mockQuestions]);

  useEffect(() => {
    if (messages.length === 0 && !completed) startInterview();
  }, [messages.length, completed, startInterview]);

  const submitAnswer = async () => {
    if (!input.trim() || isLoading) return;
    stopSpeaking();
    stopListening();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: Date.now() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    setTimeLeft(SEC_PER_QUESTION);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, repos, mode: "mock", messages: allMessages.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp })) }),
      });
      const data = await res.json();
      const reply = data.response || data.error || "Let us continue.";
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: reply, timestamp: Date.now() }]);
      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      if (newCount >= MAX_QUESTIONS) {
        setTimeout(() => setCompleted(true), 2000);
      } else {
        setTimeout(() => speak(reply), 500);
      }
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Network error — try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const skipQuestion = () => {
    stopSpeaking();
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: "[Skipped]", timestamp: Date.now() }]);
    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    setTimeLeft(SEC_PER_QUESTION);
    if (newCount >= MAX_QUESTIONS) setCompleted(true);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const timerColor = timeLeft <= 30 ? "var(--error)" : timeLeft <= 60 ? "var(--warning)" : "var(--accent-teal)";

  if (completed) {
    const answered = messages.filter((m) => m.role === "user" && m.content !== "[Skipped]" && m.content !== "[Time expired]").length;
    const skipped = messages.filter((m) => m.role === "user" && (m.content === "[Skipped]" || m.content === "[Time expired]")).length;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "transparent" }}>
        <motion.div className="glass-card p-10 max-w-md w-full text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-4xl mb-4">&#127942;</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-teal)" }}>Interview Complete</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Great job! Here is your summary.</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>{answered}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>Answered</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold" style={{ color: "var(--warning)" }}>{skipped}</div>
              <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>Skipped / Timed Out</div>
            </div>
          </div>
          <button className="btn-primary text-sm" onClick={() => setView("dashboard")}>Dashboard</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
      <header className="sticky top-0 z-30" style={{ background: "rgba(10, 10, 10, 0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button className="btn-secondary text-sm px-4 py-2" onClick={() => { stopSpeaking(); stopListening(); setView("dashboard"); }}>&larr; Back</button>
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-teal)" }}>Mock Interview</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{questionCount}/{MAX_QUESTIONS}</span>
            <span className="text-sm font-mono font-bold" style={{ color: timerColor }}>{fmt(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-6">
        <div className="progress-bar mb-6">
          <div className="progress-bar-fill" style={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }} />
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

        <div className="flex gap-2 items-center">
          <button
            className="btn-secondary text-sm px-4 py-3"
            onClick={skipQuestion}
            disabled={isLoading}
          >
            Skip
          </button>
          <button
            className={`text-sm px-4 py-3 rounded-xl border transition-all ${isListening ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/4 border-white/8 text-white/60 hover:border-red-500/30"}`}
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            )}
          </button>
          <input
            type="text"
            className="neon-input flex-1 text-base"
            placeholder={isListening ? "Listening..." : "Type or speak your answer..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
            disabled={isLoading}
          />
          <motion.button
            className="btn-primary px-6 py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitAnswer}
            disabled={isLoading || !input.trim()}
          >
            Submit
          </motion.button>
        </div>
      </div>
    </div>
  );
}
