import React from "react";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
