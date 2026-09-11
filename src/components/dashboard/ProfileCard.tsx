"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

export default function ProfileCard() {
  const { profile } = useStore();
  if (!profile) return null;

  return (
    <GlassCard className="p-6" delay={0}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: "2px solid rgba(57, 255, 20, 0.25)" }}>
            <Image
              src={profile.avatar_url}
              alt={profile.login}
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: "var(--accent-green)", border: "2px solid var(--bg-surface)" }}>
          </div>
        </motion.div>

        <div className="flex-1 text-center md:text-left">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {profile.name || profile.login}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ fontFamily: "'Outfit', sans-serif", color: "var(--text-secondary)" }}
          >
            @{profile.login}
          </p>
          {profile.bio && (
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              {profile.bio}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { label: "Repos", value: profile.public_repos },
            { label: "Followers", value: profile.followers },
            { label: "Following", value: profile.following },
            { label: "Joined", value: new Date(profile.created_at).getFullYear() },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-3 rounded-xl">
              <div
                className="text-xl font-bold"
                style={{ fontFamily: "'Space Grotesk', monospace", color: "var(--accent-green)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-[10px] uppercase tracking-widest mt-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text-secondary)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
