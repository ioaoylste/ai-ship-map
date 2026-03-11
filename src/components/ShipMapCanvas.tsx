/**
 * 飞船地图画布：装甲外壳 + 推进器尾焰 + 完整正方形背景 + 大尺寸 NPC 实体
 */

import { motion } from "framer-motion";

export const MAP_WIDTH = 1400;
export const MAP_HEIGHT = 1400;
const THRUSTER_ZONE = 120; // 推进器尾焰区域高度

export type NpcColor = "blue" | "purple" | "green" | "red" | "teal";

export interface NpcEntity {
  id: string;
  name: string;
  role: string;
  room: string;
  top: string;
  left: string;
  color: NpcColor;
  avatar: string;
  imageUrl: string;
  dialog: string;
}

export const NPC_LIST: NpcEntity[] = [
  { id: "xiaocha", name: "小查", role: "接待助理", room: "迎宾厅", top: "40%", left: "18%", color: "blue", avatar: "🤖", imageUrl: "/xiaocha.png", dialog: "欢迎来到大模型号飞船！我是接待助理小查，可以带你从应用层一路逛到动力室，随时问我问题。" },
  { id: "aji", name: "阿吉", role: "图像义体人", room: "迎宾厅", top: "40%", left: "30%", color: "blue", avatar: "🎨", imageUrl: "/aj.png", dialog: "嘿，我是阿吉，专门帮大模型把文字变成画面。你脑子里的任何奇怪设想，我都能投射到全息大屏上。" },
  { id: "trans", name: "特兰斯", role: "Transformer 领航员", room: "舰桥", top: "15%", left: "45%", color: "purple", avatar: "👁️", imageUrl: "/trans.png", dialog: "这里是中央舰桥，特兰斯在此值班。我负责注意力分配和模型推理路线，所有 token 都要听我指挥。" },
  { id: "moe", name: "MoE", role: "混合专家休眠舱", room: "舰桥", top: "15%", left: "55%", color: "purple", avatar: "🧠", imageUrl: "/moe.png", dialog: "Zzz…我是 MoE 专家群。只有当路由器觉得我有用的时候，我才会从休眠舱里醒来，给模型一点「专业建议」。" },
  { id: "shredder", name: "碎纸怪兽", role: "预训练数据粉碎机", room: "燃料厂", top: "45%", left: "85%", color: "green", avatar: "🦖", imageUrl: "/long.png", dialog: "嗝——我是碎纸怪兽。日志、网页、代码、论文，全都丢给我，我会嚼碎成能喂给模型的训练样本。" },
  { id: "vector", name: "维克多", role: "向量数据库", room: "燃料厂", top: "42%", left: "65%", color: "green", avatar: "🗄️", imageUrl: "/v.png", dialog: "维克多在线，所有向量都在我这。只要你给我一个 query embedding，我就能从记忆深渊里捞出最相关的片段。" },
  { id: "rag", name: "拉格", role: "RAG 打捞员", room: "燃料厂", top: "22%", left: "80%", color: "green", avatar: "🪝", imageUrl: "/rag.png", dialog: "RAG 打捞员拉格报到，我专门从知识库和向量海里打捞事实碎片，再塞回模型上下文里，让它别瞎编。" },
  { id: "cpu-old", name: "西皮优老头", role: "CPU", room: "动力室", top: "75%", left: "15%", color: "red", avatar: "👴", imageUrl: "/cpu.png", dialog: "咳咳，我是西皮优老头，虽然算力不如年轻人，但调度、系统呼吸、基础服务都得靠我稳住。" },
  { id: "gpu-sailor", name: "吉皮优水手", role: "GPU", room: "动力室", top: "75%", left: "35%", color: "red", avatar: "💪", imageUrl: "/gpu.png", dialog: "这里是吉皮优水手，多卡并行、矩阵运算、加速推理，全是我的肌肉活。记得给我充足的冷却。" },
  { id: "openclaw", name: "OpenClaw 龙虾", role: "Agent 特勤", room: "特勤舱", top: "78%", left: "85%", color: "teal", avatar: "🦞", imageUrl: "/xia.png", dialog: "咔嚓…OpenClaw 龙虾待命。调用 API、调度工具、执行本地脚本——只要是高危任务，都可以丢给我。" },
];

export function getNpcCameraTarget(npc: NpcEntity) {
  const x = (parseFloat(npc.left) / 100) * MAP_WIDTH;
  const y = (parseFloat(npc.top) / 100) * MAP_HEIGHT;
  return { x, y };
}

const npcColorStyles: Record<
  NpcColor,
  { halo: string; labelBorder: string; labelGlow: string }
> = {
  blue: {
    halo: "bg-blue-400",
    labelBorder: "border-blue-400",
    labelGlow: "0 0 14px rgba(59,130,246,0.7)",
  },
  purple: {
    halo: "bg-purple-400",
    labelBorder: "border-purple-400",
    labelGlow: "0 0 14px rgba(168,85,247,0.7)",
  },
  green: {
    halo: "bg-emerald-400",
    labelBorder: "border-emerald-400",
    labelGlow: "0 0 14px rgba(52,211,153,0.7)",
  },
  red: {
    halo: "bg-red-400",
    labelBorder: "border-red-400",
    labelGlow: "0 0 14px rgba(248,113,113,0.7)",
  },
  teal: {
    halo: "bg-teal-400",
    labelBorder: "border-teal-400",
    labelGlow: "0 0 14px rgba(45,212,191,0.7)",
  },
};

interface ShipMapCanvasProps {
  onNpcClick: (npc: NpcEntity) => void;
}

export function ShipMapCanvas({ onNpcClick }: ShipMapCanvasProps) {
  return (
    <div
      className="relative"
      style={{
        width: MAP_WIDTH,
        height: MAP_HEIGHT + THRUSTER_ZONE,
        zIndex: 10,
      }}
    >
      {/* ── 太空堡垒装甲外壳 ── */}
      <div
        className="relative overflow-hidden rounded-xl border-[16px] border-slate-900"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          boxShadow:
            "inset 0 0 60px rgba(0,0,0,0.8)," +
            "0 0 80px rgba(30,58,138,0.5)," +
            "0 0 160px rgba(30,58,138,0.3)," +
            "0 4px 0 0 #0f172a," +
            "0 8px 0 0 #020617",
        }}
      >
        {/* 地图背景图 — 绝对不裁剪 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/ship-map.png)",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* NPC 互动层 */}
        {NPC_LIST.map((npc) => (
          <NpcSprite key={npc.id} npc={npc} onClick={() => onNpcClick(npc)} />
        ))}
      </div>

      {/* ── 三组推进器尾焰 ── */}
      <div
        className="absolute flex justify-center gap-24"
        style={{
          left: 0,
          right: 0,
          top: MAP_HEIGHT - 16, // 紧贴装甲底边
        }}
      >
        <Thruster size="md" delay={0} />
        <Thruster size="lg" delay={0.15} />
        <Thruster size="md" delay={0.3} />
      </div>
    </div>
  );
}

/* ── 推进器尾焰组件 ── */
function Thruster({ size, delay }: { size: "md" | "lg"; delay: number }) {
  const w = size === "lg" ? 60 : 40;
  const h = size === "lg" ? 110 : 80;
  return (
    <motion.div
      className="rounded-b-full"
      style={{
        width: w,
        height: h,
        background:
          "linear-gradient(to bottom, #0ea5e9, #06b6d4, #22d3ee, rgba(34,211,238,0))",
        boxShadow:
          "0 0 30px rgba(14,165,233,0.7), 0 0 60px rgba(6,182,212,0.4), inset 0 -10px 20px rgba(255,255,255,0.15)",
        animation: "thrusterFlicker 1.2s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

/* ── NPC Sprite ── */
interface NpcSpriteProps {
  npc: NpcEntity;
  onClick: () => void;
}

function NpcSprite({ npc, onClick }: NpcSpriteProps) {
  const style = npcColorStyles[npc.color];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="
        absolute -translate-x-1/2 -translate-y-1/2
        flex flex-col items-center gap-1
        group cursor-pointer
      "
      style={{
        top: npc.top,
        left: npc.left,
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.7))",
      }}
      whileHover={{ scale: 1.1, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.9))" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* 名牌 */}
      <span
        className={`
          px-3 py-1 rounded-md
          text-sm font-mono font-bold text-white
          bg-black/90
          border ${style.labelBorder}
          whitespace-nowrap
          transition-all duration-200
          group-hover:bg-slate-800
        `}
        style={{
          boxShadow: style.labelGlow,
          textShadow: "0 0 6px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,0.9)",
        }}
      >
        {npc.name} · {npc.role}
      </span>

      {/* 角色主体：底盘 + 悬浮 bounce + 外发光描边 */}
      <div className="relative flex flex-col items-center">
        {/* 角色悬浮动画容器 */}
        <motion.div
          className="flex items-end justify-center"
          style={{ width: 112, height: 112 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {npc.imageUrl ? (
            <img
              src={npc.imageUrl}
              alt={npc.name}
              className="select-none object-contain"
              draggable={false}
              style={{
                imageRendering: "pixelated",
                width: 112,
                height: 112,
                filter:
                  "drop-shadow(1px 1px 0 #fff) " +
                  "drop-shadow(-1px -1px 0 #fff) " +
                  "drop-shadow(-1px 1px 0 #fff) " +
                  "drop-shadow(1px -1px 0 #fff) " +
                  "drop-shadow(0 0 6px rgba(255,255,255,0.45))",
              }}
            />
          ) : (
            <span
              className="select-none"
              style={{
                fontSize: 68,
                filter: "drop-shadow(0 0 3px #fff) drop-shadow(0 0 6px rgba(255,255,255,0.4))",
              }}
            >
              {npc.avatar}
            </span>
          )}
        </motion.div>

        {/* 实心圆形底盘 */}
        <div
          className={`
            w-24 h-6 rounded-[50%] -mt-3
            bg-black/70 border ${style.labelBorder} blur-md
          `}
          style={{
            boxShadow: `0 4px 10px rgba(0,0,0,0.75), inset 0 0 8px rgba(0,0,0,0.6)`,
          }}
        />

        {/* 呼吸雷达光环 — 底盘下方 */}
        <div
          className={`
            absolute w-36 h-36 rounded-full
            opacity-35 animate-pulse
            -z-10
            ${style.halo}
          `}
          style={{ bottom: -30, left: "50%", transform: "translateX(-50%)" }}
        />
      </div>
    </motion.button>
  );
}
