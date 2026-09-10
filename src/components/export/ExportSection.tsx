"use client";

import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

export default function ExportSection() {
  const { profile, questions, weaknesses, strengths } = useStore();

  const handleExportMarkdown = async () => {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "markdown",
          profile,
          questions,
          weaknesses,
          strengths,
        }),
      });

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}?user=${profile?.login || ""}`
    );
    alert("Link copied!");
  };

  return (
    <GlassCard className="p-6" delay={0}>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Export & Share
      </h3>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary text-sm" onClick={handleExportMarkdown}>
          Export as Markdown
        </button>
        <button className="btn-secondary text-sm" onClick={handleCopyLink}>
          Copy Share Link
        </button>
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
        Download your interview prep sheet or share a read-only link.
      </p>
    </GlassCard>
  );
}
