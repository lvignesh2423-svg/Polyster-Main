"use client";

export default function MorphSpinner({ size = 60 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="morph-spinner"
        style={{ width: size, height: size }}
      />
      <div className="shimmer w-32 h-2 rounded-full bg-white/5" />
    </div>
  );
}
