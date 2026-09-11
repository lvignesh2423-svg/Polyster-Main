"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

export default function ExportSection() {
  const { profile, questions, weaknesses, strengths } = useStore();
  const [copied, setCopied] = useState(false);

  const shareUrl = profile ? `${window.location.origin}?user=${profile.login}` : "";

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

  const handleCopy = () => {
    if (!shareUrl) return;
    const input = document.getElementById("share-url-input") as HTMLInputElement;
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999);
      try {
        navigator.clipboard.writeText(shareUrl);
      } catch {
        document.execCommand("copy");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GlassCard className="p-6" delay={0}>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ fontFamily: "'Syne', sans-serif", color: "var(--accent-green)" }}
      >
        Export & Share
      </h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <button className="btn-primary text-sm" onClick={handleExportMarkdown}>
          Export as Markdown
        </button>
      </div>
      {shareUrl && (
        <div className="flex gap-2">
          <input
            id="share-url-input"
            type="text"
            readOnly
            value={shareUrl}
            className="neon-input flex-1 text-xs"
            style={{ borderRadius: "8px", padding: "8px 12px", cursor: "text" }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            className="btn-secondary text-xs px-4"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </GlassCard>
  );
}
