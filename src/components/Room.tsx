import type { ReactNode } from "react";

type GlowColor = "blue" | "purple" | "green" | "cyan" | "red";

const colorMap: Record<GlowColor, { border: string; glow: string; title: string }> = {
  blue: { border: "border-cyan-300/70", glow: "0 0 28px rgba(59,130,246,0.45)", title: "text-cyan-200" },
  purple: { border: "border-purple-300/70", glow: "0 0 28px rgba(168,85,247,0.45)", title: "text-purple-200" },
  green: { border: "border-emerald-300/70", glow: "0 0 28px rgba(34,197,94,0.45)", title: "text-emerald-200" },
  cyan: { border: "border-teal-300/70", glow: "0 0 28px rgba(6,182,212,0.45)", title: "text-teal-200" },
  red: { border: "border-rose-300/70", glow: "0 0 28px rgba(239,68,68,0.45)", title: "text-rose-200" },
};

interface RoomProps {
  name: string;
  layer: string;
  glow: GlowColor;
  children?: ReactNode;
}

export function Room({ name, layer, glow, children }: RoomProps) {
  const style = colorMap[glow];
  return (
    <div className={`w-[min(1080px,94vw)] rounded-xl border bg-slate-950/88 p-5 ${style.border}`} style={{ boxShadow: style.glow }}>
      <div className="mb-4">
        <p className="font-mono text-xs text-slate-400">ROOM MODE</p>
        <p className={`font-mono text-lg ${style.title}`}>{name}</p>
        <p className="font-mono text-xs text-slate-400">{layer}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">{children}</div>
    </div>
  );
}
