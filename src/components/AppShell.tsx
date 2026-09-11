"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";

const HeroSection = dynamic(() => import("@/components/hero/HeroSection"));
const AnalyzingState = dynamic(() => import("@/components/hero/AnalyzingState"));
const Dashboard = dynamic(() => import("@/components/dashboard/Dashboard"));
const QAPage = dynamic(() => import("@/components/pages/QAPage"));
const FlashcardsPage = dynamic(() => import("@/components/pages/FlashcardsPage"));
const MockPage = dynamic(() => import("@/components/pages/MockPage"));
const SettingsPanel = dynamic(() => import("@/components/settings/SettingsPanel"));

const RAIN_DROPS = Array.from({ length: 15 }, (_, i) => <div key={i} className="rain-drop" />);

const ORBS = [
  { color: "rgba(59, 130, 246, 0.12)", size: 300, left: "10%", top: "20%", delay: 0, dur: 12 },
  { color: "rgba(6, 182, 212, 0.08)", size: 250, left: "70%", top: "60%", delay: 3, dur: 15 },
  { color: "rgba(139, 92, 246, 0.06)", size: 200, left: "50%", top: "10%", delay: 6, dur: 18 },
  { color: "rgba(59, 130, 246, 0.05)", size: 350, left: "80%", top: "30%", delay: 2, dur: 20 },
];

function RainDrops() {
  return <div className="rain-container">{RAIN_DROPS}</div>;
}

function AnimatedOrbs() {
  return (
    <>
      {ORBS.map((o, i) => (
        <div
          key={i}
          className="orb"
          style={{
            width: o.size,
            height: o.size,
            background: o.color,
            left: o.left,
            top: o.top,
            animationDelay: `${o.delay}s`,
            animationDuration: `${o.dur}s`,
          }}
        />
      ))}
    </>
  );
}

function FloatingParticles() {
  const [particles, setParticles] = useState<{ left: string; delay: number; dur: number }[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 8,
        dur: 6 + Math.random() * 8,
      }))
    );
  }, []);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{ left: p.left, bottom: "-10px", animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  );
}

const SHAPES = [
  { w: 160, h: 110, left: "5%", top: "10%", r: "20px", dur: 12, del: 0 },
  { w: 100, h: 100, left: "82%", top: "18%", r: "50%", dur: 18, del: 2 },
  { w: 200, h: 150, left: "62%", top: "65%", r: "32px", dur: 15, del: 4 },
  { w: 70, h: 70, left: "15%", top: "72%", r: "16px", dur: 20, del: 1 },
  { w: 120, h: 120, left: "90%", top: "48%", r: "24px", dur: 14, del: 3 },
  { w: 80, h: 50, left: "40%", top: "5%", r: "12px", dur: 16, del: 5 },
];

function FloatingShapes() {
  return (
    <>
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="shape-3d"
          style={{
            width: s.w,
            height: s.h,
            left: s.left,
            top: s.top,
            borderRadius: s.r,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.del}s`,
          }}
        />
      ))}
    </>
  );
}

export default function AppShell() {
  const { view } = useStore();

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-base)" }}>
      <RainDrops />
      <AnimatedOrbs />
      <FloatingParticles />
      <FloatingShapes />
      <div className="relative z-10">
        {view === "hero" && <HeroSection />}
        {view === "analyzing" && <AnalyzingState />}
        {view === "dashboard" && <Dashboard />}
        {view === "qa" && <QAPage />}
        {view === "flashcards" && <FlashcardsPage />}
        {view === "mock" && <MockPage />}
      </div>
      <SettingsPanel />
    </div>
  );
}
