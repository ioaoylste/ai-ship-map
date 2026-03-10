/**
 * 飞船地图画布：漂浮发光外壳 + 整图背景 + 大尺寸 NPC 实体
 * 画布比例 16:9，外壳带厚重金属边框、发光、立体倾斜
 */

import { motion } from "framer-motion";

export const MAP_WIDTH = 2560;
export const MAP_HEIGHT = 1440;

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
  dialog: string;
}

export const NPC_LIST: NpcEntity[] = [
  { id: "xiaocha", name: "小查", role: "接待助理", room: "迎宾厅", top: "35%", left: "18%", color: "blue", avatar: "🤖", dialog: "欢迎来到大模型号飞船！我是接待助理小查，可以带你从应用层一路逛到动力室，随时问我问题。" },
  { id: "aji", name: "阿吉", role: "图像义体人", room: "迎宾厅", top: "35%", left: "26%", color: "blue", avatar: "🎨", dialog: "嘿，我是阿吉，专门帮大模型把文字变成画面。你脑子里的任何奇怪设想，我都能投射到全息大屏上。" },
  { id: "trans", name: "特兰斯", role: "Transformer 领航员", room: "舰桥", top: "12%", left: "45%", color: "purple", avatar: "👁️", dialog: "这里是中央舰桥，特兰斯在此值班。我负责注意力分配和模型推理路线，所有 token 都要听我指挥。" },
  { id: "moe", name: "MoE", role: "混合专家休眠舱", room: "舰桥", top: "12%", left: "55%", color: "purple", avatar: "🧠", dialog: "Zzz…我是 MoE 专家群。只有当路由器觉得我有用的时候，我才会从休眠舱里醒来，给模型一点「专业建议」。" },
  { id: "shredder", name: "碎纸怪兽", role: "预训练数据粉碎机", room: "燃料厂", top: "40%", left: "85%", color: "green", avatar: "🦖", dialog: "嗝——我是碎纸怪兽。日志、网页、代码、论文，全都丢给我，我会嚼碎成能喂给模型的训练样本。" },
  { id: "vector", name: "维克多", role: "向量数据库", room: "燃料厂", top: "40%", left: "70%", color: "green", avatar: "🗄️", dialog: "维克多在线，所有向量都在我这。只要你给我一个 query embedding，我就能从记忆深渊里捞出最相关的片段。" },
  { id: "rag", name: "拉格", role: "RAG 打捞员", room: "燃料厂", top: "22%", left: "80%", color: "green", avatar: "🪝", dialog: "RAG 打捞员拉格报到，我专门从知识库和向量海里打捞事实碎片，再塞回模型上下文里，让它别瞎编。" },
  { id: "cpu-old", name: "西皮优老头", role: "CPU", room: "动力室", top: "78%", left: "18%", color: "red", avatar: "👴", dialog: "咳咳，我是西皮优老头，虽然算力不如年轻人，但调度、系统呼吸、基础服务都得靠我稳住。" },
  { id: "gpu-sailor", name: "吉皮优水手", role: "GPU", room: "动力室", top: "78%", left: "32%", color: "red", avatar: "💪", dialog: "这里是吉皮优水手，多卡并行、矩阵运算、加速推理，全是我的肌肉活。记得给我充足的冷却。" },
  { id: "openclaw", name: "OpenClaw 龙虾", role: "Agent 特勤", room: "特勤舱", top: "80%", left: "85%", color: "teal", avatar: "🦞", dialog: "咔嚓…OpenClaw 龙虾待命。调用 API、调度工具、执行本地脚本——只要是高危任务，都可以丢给我。" },
];

export function getNpcCameraTarget(npc: NpcEntity) {
  const x = (parseFloat(npc.left) / 100) * MAP_WIDTH;
  const y = (parseFloat(npc.top) / 100) * MAP_HEIGHT;
  return { x, y };
}

const npcColorStyles: Record<
  NpcColor,
  { border: string; halo: string; labelBorder: string; labelGlow: string; boxGlow: string }
> = {
  blue: {
    border: "border-blue-400",
    halo: "bg-blue-400",
    labelBorder: "border-blue-400",
    labelGlow: "0 0 14px rgba(59,130,246,0.7)",
    boxGlow: "0 0 20px rgba(59,130,246,0.8)",
  },
  purple: {
    border: "border-purple-400",
    halo: "bg-purple-400",
    labelBorder: "border-purple-400",
    labelGlow: "0 0 14px rgba(168,85,247,0.7)",
    boxGlow: "0 0 20px rgba(168,85,247,0.8)",
  },
  green: {
    border: "border-emerald-400",
    halo: "bg-emerald-400",
    labelBorder: "border-emerald-400",
    labelGlow: "0 0 14px rgba(52,211,153,0.7)",
    boxGlow: "0 0 20px rgba(52,211,153,0.8)",
  },
  red: {
    border: "border-red-400",
    halo: "bg-red-400",
    labelBorder: "border-red-400",
    labelGlow: "0 0 14px rgba(248,113,113,0.7)",
    boxGlow: "0 0 20px rgba(248,113,113,0.8)",
  },
  teal: {
    border: "border-teal-400",
    halo: "bg-teal-400",
    labelBorder: "border-teal-400",
    labelGlow: "0 0 14px rgba(45,212,191,0.7)",
    boxGlow: "0 0 20px rgba(45,212,191,0.8)",
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
        height: MAP_HEIGHT,
        perspective: 1000,
      }}
    >
      {/* 飞船漂浮外壳：厚重金属边框 + 发光 + 立体倾斜 */}
      <div
        className="relative overflow-hidden rounded-[120px_120px_20px_20px] border-[20px] border-slate-700"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          transform: "rotateX(-4deg)",
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 0 50px rgba(0, 100, 255, 0.3))",
        }}
      >
        {/* 地图背景图 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/ship-map.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* NPC 大尺寸互动组件 */}
        {NPC_LIST.map((npc) => (
          <NpcSprite key={npc.id} npc={npc} onClick={() => onNpcClick(npc)} />
        ))}
      </div>
    </div>
  );
}

interface NpcSpriteProps {
  npc: NpcEntity;
  onClick: () => void;
}

/**
 * 64x64 大尺寸 NPC 实体 + 呼吸光晕 + 16px 名牌
 * TODO: 未来若有透明 PNG，在此替换为 <img src={npc.imageUrl} />
 */
function NpcSprite({ npc, onClick }: NpcSpriteProps) {
  const style = npcColorStyles[npc.color];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="
        absolute -translate-x-1/2 -translate-y-1/2
        flex flex-col items-center gap-3
        group cursor-pointer
      "
      style={{ top: npc.top, left: npc.left }}
      whileHover={{ scale: 1.25 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* 名牌：16px 字体，全黑背景，霓虹描边，放置在上方 */}
      <span
        className={`
          px-4 py-2 rounded
          text-base font-mono font-bold text-white
          bg-black
          border-2 ${style.labelBorder}
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

      {/* 64x64 主体容器 + 呼吸光晕 */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* 呼吸光晕：底层，雷达闪烁效果 */}
        <div
          className={`
            absolute -left-4 -top-4 w-24 h-24 rounded-full
            opacity-40 animate-pulse
            -z-10
            ${style.halo}
          `}
        />

        {/* 64x64 主块：高透明黑底 + 4px 霓虹边框 */}
        <div
          className={`
            w-16 h-16 rounded-lg
            bg-black/80
            border-[4px] ${style.border}
            flex items-center justify-center
          `}
          style={{ boxShadow: style.boxGlow }}
        >
          {/* TODO: 若有透明 PNG，在此替换为 <img src={npc.imageUrl} /> */}
          <span className="text-3xl select-none">{npc.avatar}</span>
        </div>
      </div>
    </motion.button>
  );
}
