"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";

export default function ProfileCard() {
  const { profile } = useStore();
  if (!profile) return null;

  return (
    <GlassCard className="p-7" delay={0}>
      <div className="flex flex-col md:flex-row items-center gap-7">
        <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
          <div className="w-20 h-20 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <Image src={profile.avatar_url} alt={profile.login} width={80} height={80} className="object-cover" />
          </div>
        </motion.div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            {profile.name || profile.login}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>@{profile.login}</p>
          {profile.bio && <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>{profile.bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          {[
            { label: "Repos", value: profile.public_repos },
            { label: "Followers", value: profile.followers },
            { label: "Following", value: profile.following },
            { label: "Joined", value: new Date(profile.created_at).getFullYear() },
          ].map((stat) => (
            <div key={stat.label} className="glass-card depth-hover px-4 py-3 rounded-xl">
              <div className="text-xl font-bold" style={{ color: "var(--accent-blue)" }}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] mt-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
