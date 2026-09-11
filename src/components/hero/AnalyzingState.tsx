"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function AnalyzingState() {
  const { loadingMessage } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6"><div className="morph-spinner mx-auto" /></div>
        <motion.h2
          className="text-base font-light mb-3"
          style={{ color: "var(--accent-blue)" }}
          key={loadingMessage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loadingMessage}
        </motion.h2>
        <div className="progress-bar w-40 mx-auto mt-4">
          <motion.div className="progress-bar-fill" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 8, ease: "linear" }} />
        </div>
      </motion.div>
    </div>
  );
}
