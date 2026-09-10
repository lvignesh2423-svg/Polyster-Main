"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import QuestionsTab from "./QuestionsTab";
import QAConsole from "./QAConsole";
import MockInterview from "./MockInterview";
import Flashcards from "./Flashcards";

const TABS = [
  { id: "questions" as const, label: "Questions", icon: "\u{1F4CB}" },
  { id: "qa" as const, label: "Q&A", icon: "\u{1F4AC}" },
  { id: "mock" as const, label: "Mock Interview", icon: "\u{1F3AB}" },
  { id: "flashcards" as const, label: "Flashcards", icon: "\u{1F4A7}" },
];

export default function InterviewTabs() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all border ${
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.97 }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div>
        {activeTab === "questions" && <QuestionsTab />}
        {activeTab === "qa" && <QAConsole />}
        {activeTab === "mock" && <MockInterview />}
        {activeTab === "flashcards" && <Flashcards />}
      </div>
    </div>
  );
}
