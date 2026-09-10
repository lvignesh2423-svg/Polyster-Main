"use client";

import { useStore } from "@/store/useStore";
import HeroSection from "@/components/hero/HeroSection";
import AnalyzingState from "@/components/hero/AnalyzingState";
import Dashboard from "@/components/dashboard/Dashboard";
import ParticleField from "@/components/ui/ParticleField";
import SettingsPanel from "@/components/settings/SettingsPanel";

export default function AppShell() {
  const { view } = useStore();

  return (
    <>
      <ParticleField />
      <SettingsPanel />
      {view === "hero" && <HeroSection />}
      {view === "analyzing" && <AnalyzingState />}
      {view === "dashboard" && <Dashboard />}
    </>
  );
}
