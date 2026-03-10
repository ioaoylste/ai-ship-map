import type { ReactNode } from "react";

type GlowColor = "blue" | "purple" | "green" | "cyan" | "red";

const glowStyles: Record<GlowColor, string> = {
  blue: "shadow-[0_0_20px_rgba(59,130,246,0.6)] border-cyan-400/70",
  purple: "shadow-[0_0_20px_rgba(168,85,247,0.6)] border-purple-400/70",
  green: "shadow-[0_0_20px_rgba(34,197,94,0.6)] border-emerald-400/70",
  cyan: "shadow-[0_0_20px_rgba(6,182,212,0.6)] border-teal-400/70",
  red: "shadow-[0_0_20px_rgba(239,68,68,0.6)] border-rose-400/70",
};

const borderColors: Record<GlowColor, string> = {
  blue: "border-cyan-400",
  purple: "border-purple-400",
  green: "border-emerald-400",
  cyan: "border-teal-400",
  red: "border-rose-400",
};

interface RoomProps {
  name: string;
  layer: string;
  glow: GlowColor;
  x: number;
  y: number;
  width?: number;
  height?: number;
  children?: ReactNode;
}

export function Room({ name, layer, glow, x, y, width = 220, height = 160, children }: RoomProps) {
  return (
    <div
      className={`absolute rounded-lg border-2 bg-black/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${borderColors[glow]} ${glowStyles[glow]}`}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <div className="p-4 h-full flex flex-col">
        <div className={`text-sm font-mono font-bold ${glow === "blue" ? "text-cyan-400" : glow === "purple" ? "text-purple-400" : glow === "green" ? "text-emerald-400" : glow === "cyan" ? "text-teal-400" : "text-rose-400"}`}>
          {name}
        </div>
        <div className="text-xs font-mono text-slate-500 mt-1">{layer}</div>
        <div className="flex-1 flex items-end justify-center mt-4">{children}</div>
      </div>
    </div>
  );
}
