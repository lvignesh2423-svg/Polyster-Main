"use client";

import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

export default function ExportSection() {
  const { profile, questions, weaknesses, strengths } = useStore();

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ format: "markdown", profile, questions, weaknesses, strengths }) });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-prep-${profile?.login || "export"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    }
  };

  return (
    <GlassCard className="p-6" delay={0}>
      <h3 className="text-base font-semibold mb-4" style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-blue)" }}>Export</h3>
      <button className="btn-primary text-sm" onClick={handleExport}>Export as Markdown</button>
    </GlassCard>
  );
}
