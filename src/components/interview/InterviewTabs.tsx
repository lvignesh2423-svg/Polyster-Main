"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

const TABS = [
  { id: "questions" as const, label: "Questions", icon: "\u{1F4CB}" },
  { id: "qa" as const, label: "Q&A", icon: "\u{1F4AC}" },
  { id: "mock" as const, label: "Mock Interview", icon: "\u{1F3AB}" },
  { id: "flashcards" as const, label: "Flashcards", icon: "\u{1F4A7}" },
];

export default function InterviewTabs() {
  const { setView, setActiveTab } = useStore();

  const handleTab = (id: string) => {
    setActiveTab(id as "questions" | "qa" | "mock" | "flashcards");
    if (id === "qa") setView("qa");
    else if (id === "mock") setView("mock");
    else if (id === "flashcards") setView("flashcards");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all border tab-inactive"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            onClick={() => handleTab(tab.id)}
            whileTap={{ scale: 0.97 }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
