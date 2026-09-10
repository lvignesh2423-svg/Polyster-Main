"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function AnalyzingState() {
  const { loadingMessage } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-8">
          <div className="morph-spinner mx-auto" />
        </div>

        <motion.h2
          className="text-2xl font-semibold mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          key={loadingMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loadingMessage}
        </motion.h2>

        <div className="progress-bar w-64 mx-auto mt-6">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "linear" }}
          />
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
          {[
            { label: "Repos", icon: "\u{1F4E6}" },
            { label: "Languages", icon: "\u{1F4BB}" },
            { label: "Commits", icon: "\u{1F4DD}" },
            { label: "Questions", icon: "\u{1F4A1}" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="glass-card p-4 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
