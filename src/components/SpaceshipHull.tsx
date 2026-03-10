import { Bot, Bug } from "lucide-react";
import type { ReactNode } from "react";

export type NpcId = "xiaocha" | "lobster";

interface SpaceshipHullProps {
  onNpcClick: (id: NpcId) => void;
}

export function SpaceshipHull({ onNpcClick }: SpaceshipHullProps) {
  return (
    <div className="relative w-[2800px] h-[2800px]">
      {/* 飞船外壳 Hull */}
      <div
        className="
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[1400px] h-[2200px]
          rounded-[50%_50%_16%_16%]
          border-[8px] border-slate-500/80
          shadow-[0_0_80px_rgba(15,23,42,1),0_0_120px_rgba(34,211,238,0.25)]
          bg-gradient-to-b from-slate-900 via-black to-slate-950
          overflow-hidden
        "
      >
        <div
          className="
            pointer-events-none
            absolute inset-6
            rounded-[44%_44%_22%_22%]
            border border-cyan-400/25
            shadow-[0_0_40px_rgba(34,211,238,0.45)]
          "
        />

        <div
          className="
            relative w-full h-full
            px-10 py-14
            flex flex-col gap-8
            metal-floor
          "
        >
          {/* 顶部/船头：中央舰桥 */}
          <section className="flex justify-center">
            <RoomPanel
              variant="bridge"
              title="中央舰桥"
              subtitle="Model 层"
              accent="purple"
            >
              <p className="text-xs text-slate-300/80 leading-relaxed">
                主控大脑舱。负责模型推理、路由和能力编排，是整艘大模型号的驾驶舱。
              </p>
            </RoomPanel>
          </section>

          {/* 中部：左右舱 + 纵向主走廊 */}
          <section className="flex-1 grid grid-cols-[1.1fr_0.35fr_1.1fr] gap-6 items-stretch">
            <div className="flex flex-col justify-center">
              <RoomPanel title="全息迎宾厅" subtitle="App 层" accent="cyan">
                <p className="text-xs text-slate-300/80 mb-3 leading-relaxed">
                  面向用户的交互界面，在这里可以和各种 Agent、工具和可视化组件打交道。
                </p>
                <button
                  onClick={() => onNpcClick("xiaocha")}
                  className="
                    inline-flex items-center gap-2 px-4 py-2
                    rounded-lg border-2 border-cyan-400/70
                    bg-cyan-950/40 text-cyan-300
                    hover:bg-cyan-500/20 hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]
                    transition-all font-mono text-sm
                  "
                >
                  <Bot size={18} />
                  小查 · 迎宾引导 AI
                </button>
              </RoomPanel>
            </div>

            <div className="flex flex-col justify-between items-center py-4">
              <CorridorVertical />
              <CorridorVertical />
              <CorridorVertical />
            </div>

            <div className="flex flex-col justify-center">
              <RoomPanel title="燃料提炼厂" subtitle="Data 层" accent="green">
                <p className="text-xs text-slate-300/80 leading-relaxed">
                  从原始数据开采、清洗到向量化，是为大模型输送高能燃料的数据引擎。
                </p>
              </RoomPanel>
            </div>
          </section>

          <section className="flex items-center justify-center my-2">
            <CorridorHorizontal />
          </section>

          {/* 底部/船尾 */}
          <section className="grid grid-cols-[1.25fr_0.75fr] gap-6 items-stretch">
            <RoomPanel
              variant="engine"
              title="底层动力室"
              subtitle="Hardware 层"
              accent="red"
            >
              <p className="text-xs text-slate-300/80 leading-relaxed">
                GPU 集群、加速芯片与冷却系统在此。负责为所有推理请求提供算力与能耗调度。
              </p>
            </RoomPanel>

            <RoomPanel title="自动化特勤舱" subtitle="Agent 层" accent="teal">
              <p className="text-xs text-slate-300/80 mb-3 leading-relaxed">
                高危任务与自动化编排在这里执行，是大模型号上的多工具、多流程联合作战中枢。
              </p>
              <button
                onClick={() => onNpcClick("lobster")}
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  rounded-lg border-2 border-teal-400/70
                  bg-teal-950/40 text-teal-300
                  hover:bg-teal-500/20 hover:shadow-[0_0_18px_rgba(20,184,166,0.6)]
                  transition-all font-mono text-sm
                "
              >
                <Bug size={18} />
                OpenClaw 龙虾 · 特勤执行官
              </button>
            </RoomPanel>
          </section>
        </div>
      </div>
    </div>
  );
}

type Accent = "cyan" | "purple" | "green" | "teal" | "red";

interface RoomPanelProps {
  title: string;
  subtitle: string;
  accent: Accent;
  variant?: "bridge" | "engine" | "default";
  children?: ReactNode;
}

const accentBorder: Record<Accent, string> = {
  cyan: "border-cyan-400/70",
  purple: "border-purple-400/70",
  green: "border-emerald-400/70",
  teal: "border-teal-400/70",
  red: "border-rose-400/70",
};

const accentText: Record<Accent, string> = {
  cyan: "text-cyan-300",
  purple: "text-purple-300",
  green: "text-emerald-300",
  teal: "text-teal-300",
  red: "text-rose-300",
};

function RoomPanel({
  title,
  subtitle,
  accent,
  variant = "default",
  children,
}: RoomPanelProps) {
  const shape =
    variant === "bridge"
      ? "rounded-t-[999px] rounded-b-3xl"
      : variant === "engine"
        ? "rounded-[2rem]"
        : "rounded-2xl";

  return (
    <div
      className={`
        ${shape}
        border-2 ${accentBorder[accent]}
        bg-slate-950/70
        shadow-[0_0_24px_rgba(15,23,42,0.9),0_0_32px_rgba(34,211,238,0.15)]
        metal-floor
        relative overflow-hidden
      `}
    >
      <div className="h-2 caution-stripes opacity-70" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/5 shadow-[0_0_40px_rgba(15,23,42,0.8)]" />
      <div className="relative px-5 py-4 flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2
            className={`text-sm font-mono font-semibold tracking-[0.18em] uppercase ${accentText[accent]}`}
          >
            {title}
          </h2>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.25em]">
            {subtitle}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          ─────────────────────────────────────────
        </div>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function CorridorVertical() {
  return (
    <div
      className="
        w-4 flex-1 rounded-full
        neon-corridor
        shadow-[0_0_25px_rgba(34,211,238,0.55)]
      "
    />
  );
}

function CorridorHorizontal() {
  return (
    <div
      className="
        h-4 w-3/4 rounded-full
        neon-corridor
        shadow-[0_0_25px_rgba(34,211,238,0.55)]
      "
    />
  );
}
