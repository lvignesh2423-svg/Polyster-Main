"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { CATEGORY_LABELS } from "@/lib/types";
import type { QuestionCategory } from "@/lib/types";
import QuestionCard from "./QuestionCard";

export default function QuestionsTab() {
  const { questions } = useStore();
  const [filter, setFilter] = useState<QuestionCategory | "all">("all");

  const categories = ["all", ...new Set(questions.map((q) => q.category))] as (
    | QuestionCategory
    | "all"
  )[];

  const filtered =
    filter === "all" ? questions : questions.filter((q) => q.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`badge text-xs cursor-pointer transition-all ${
              filter === cat ? "badge-green" : "badge-green opacity-40"
            }`}
            style={{ opacity: filter === cat ? 1 : 0.4 }}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
            No questions in this category.
          </p>
        )}
      </div>
    </div>
  );
}
