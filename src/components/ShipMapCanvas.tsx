import { AnimatePresence, motion } from "framer-motion";

export const MAP_WIDTH = 1400;
export const MAP_HEIGHT = 1400;
const THRUSTER_ZONE = 120;

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
}

export interface FlowHopSignal {
  key: number;
  fromNpcId: string;
  toNpcId: string;
  color: string;
}

export const NPC_LIST: NpcEntity[] = [
  { id: "xiaocha", name: "小查", role: "接待助理", room: "迎宾厅", top: "40%", left: "18%", color: "blue", avatar: "🤖", imageUrl: "/xiaocha.png" },
  { id: "aji", name: "阿吉", role: "图像义体人", room: "迎宾厅", top: "40%", left: "30%", color: "blue", avatar: "🎨", imageUrl: "/aj.png" },
  { id: "trans", name: "特兰斯", role: "Transformer 领航员", room: "舰桥", top: "15%", left: "45%", color: "purple", avatar: "👁️", imageUrl: "/trans.png" },
  { id: "moe", name: "MoE", role: "混合专家休眠舱", room: "舰桥", top: "15%", left: "55%", color: "purple", avatar: "🧠", imageUrl: "/moe.png" },
  { id: "shredder", name: "碎纸怪兽", role: "预训练数据粉碎机", room: "燃料厂", top: "45%", left: "85%", color: "green", avatar: "🦖", imageUrl: "/long.png" },
  { id: "vector", name: "维克多", role: "向量数据库", room: "燃料厂", top: "42%", left: "65%", color: "green", avatar: "🗄️", imageUrl: "/v.png" },
  { id: "rag", name: "拉格", role: "RAG 打捞员", room: "燃料厂", top: "22%", left: "80%", color: "green", avatar: "🪝", imageUrl: "/rag.png" },
  { id: "cpu-old", name: "西皮优老头", role: "CPU", room: "动力室", top: "75%", left: "15%", color: "red", avatar: "👴", imageUrl: "/cpu.png" },
  { id: "gpu-sailor", name: "吉皮优水手", role: "GPU", room: "动力室", top: "75%", left: "35%", color: "red", avatar: "💪", imageUrl: "/gpu.png" },
  { id: "openclaw", name: "OpenClaw 龙虾", role: "Agent 特勤", room: "特勤舱", top: "78%", left: "85%", color: "teal", avatar: "🦞", imageUrl: "/xia.png" },
];

const ROOM_AREAS: Array<{ room: string; top: string; left: string; width: string; height: string }> = [
  { room: "迎宾厅", top: "30%", left: "8%", width: "26%", height: "24%" },
  { room: "舰桥", top: "7%", left: "34%", width: "30%", height: "20%" },
  { room: "燃料厂", top: "14%", left: "60%", width: "32%", height: "38%" },
  { room: "动力室", top: "60%", left: "8%", width: "36%", height: "28%" },
  { room: "特勤舱", top: "62%", left: "70%", width: "24%", height: "26%" },
];

export function getNpcCameraTarget(npc: NpcEntity) {
  return {
    x: (parseFloat(npc.left) / 100) * MAP_WIDTH,
    y: (parseFloat(npc.top) / 100) * MAP_HEIGHT,
  };
}

interface ShipMapCanvasProps {
  onNpcClick: (npc: NpcEntity) => void;
  activeHop: FlowHopSignal | null;
  activeNpcIds: Set<string>;
  interactionLocked: boolean;
  onEnterRoom: (room: string) => void;
}

export function ShipMapCanvas({ onNpcClick, activeHop, activeNpcIds, interactionLocked, onEnterRoom }: ShipMapCanvasProps) {
  const hopRoute = activeHop ? resolveFlowRoute(activeHop.fromNpcId, activeHop.toNpcId) : null;
  const hopPoints = activeHop && hopRoute ? sampleRoutePoints(hopRoute, 26) : null;
  const firstTargetId = activeNpcIds.values().next().value as string | undefined;
  const firstTarget = firstTargetId ? NPC_LIST.find((n) => n.id === firstTargetId) ?? null : null;

  return (
    <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT + THRUSTER_ZONE, zIndex: 10 }}>
      <div
        className="relative overflow-visible rounded-xl border-[16px] border-slate-900"
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
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/ship-map.png)",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <NeuralPathways activeHop={activeHop} route={hopRoute} hopPoints={hopPoints} />

        {ROOM_AREAS.map((area) => (
          <button
            key={area.room}
            type="button"
            onClick={() => onEnterRoom(area.room)}
            className="absolute rounded-md border border-cyan-300/0 hover:border-cyan-300/30"
            style={{ top: area.top, left: area.left, width: area.width, height: area.height, zIndex: 8 }}
          />
        ))}

        {NPC_LIST.map((npc) => {
          const isTarget = activeNpcIds.size === 0 || activeNpcIds.has(npc.id);
          const isClickable = !interactionLocked;
          return (
            <NpcSprite
              key={npc.id}
              npc={npc}
              target={isTarget}
              clickable={isClickable}
              onClick={() => onNpcClick(npc)}
            />
          );
        })}

        {firstTarget ? <ActiveNpcMarker npc={firstTarget} disabled={interactionLocked} /> : null}
      </div>

      <div className="absolute flex justify-center gap-24" style={{ left: 0, right: 0, top: MAP_HEIGHT - 16 }}>
        <Thruster size="md" delay={0} />
        <Thruster size="lg" delay={0.15} />
        <Thruster size="md" delay={0.3} />
      </div>
    </div>
  );
}

function Thruster({ size, delay }: { size: "md" | "lg"; delay: number }) {
  const w = size === "lg" ? 60 : 40;
  const h = size === "lg" ? 110 : 80;
  return (
    <motion.div
      className="rounded-b-full"
      style={{
        width: w,
        height: h,
        background: "linear-gradient(to bottom, #0ea5e9, #06b6d4, #22d3ee, rgba(34,211,238,0))",
        boxShadow:
          "0 0 30px rgba(14,165,233,0.7), 0 0 60px rgba(6,182,212,0.4), inset 0 -10px 20px rgba(255,255,255,0.15)",
        animation: "thrusterFlicker 1.2s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function NpcSprite({ npc, target, clickable, onClick }: { npc: NpcEntity; target: boolean; clickable: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        top: npc.top,
        left: npc.left,
        opacity: target ? 1 : 0.5,
        zIndex: target ? 20 : 12,
        cursor: clickable ? "pointer" : "not-allowed",
      }}
      whileHover={clickable ? { scale: 1.06 } : undefined}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="whitespace-nowrap rounded-md border border-cyan-300/55 bg-black/90 px-3.5 py-1.5 text-base font-mono text-white">
          {npc.name} · {npc.role}
          <span className={`ml-2 rounded px-2 py-[2px] text-[11px] ${target ? "bg-cyan-400/30 text-cyan-100" : "bg-slate-700/70 text-slate-400"}`}>
            {target ? "TARGET" : "WAIT"}
          </span>
        </span>
        <img src={npc.imageUrl} alt={npc.name} className="h-44 w-44 object-contain" draggable={false} />
      </div>
    </motion.button>
  );
}

function ActiveNpcMarker({ npc, disabled }: { npc: NpcEntity; disabled: boolean }) {
  return (
    <div className="pointer-events-none absolute" style={{ top: npc.top, left: npc.left, transform: "translate(-50%, -50%)", zIndex: 36 }}>
      <motion.div className="absolute left-1/2" style={{ top: -106, x: "-50%" }} animate={{ y: [0, -7, 0], opacity: disabled ? 0.45 : 1 }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}>
        <div className="h-0 w-0 border-l-[9px] border-r-[9px] border-t-[14px] border-l-transparent border-r-transparent border-t-cyan-300" />
      </motion.div>
      <motion.div className="absolute left-1/2 top-4 h-36 w-36 rounded-full border border-cyan-300/70" style={{ x: "-50%" }} animate={{ opacity: [0.25, 0.85, 0.25], scale: [0.92, 1.08, 0.92] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

interface Point { x: number; y: number }
interface CubicSegment { c1: Point; c2: Point; end: Point }
interface RouteGeometry { id: string; fromNpcId: string; toNpcId: string; start: Point; segments: CubicSegment[] }

const FLOW_ROUTES: RouteGeometry[] = [
  createRoute("xiaocha-trans", "xiaocha", "trans", [{ x: 370, y: 520 }, { x: 540, y: 360 }]),
  createRoute("trans-rag", "trans", "rag", [{ x: 780, y: 180 }, { x: 980, y: 210 }]),
  createRoute("xiaocha-openclaw", "xiaocha", "openclaw", [{ x: 420, y: 760 }, { x: 900, y: 860 }]),
  createRoute("openclaw-gpu", "openclaw", "gpu-sailor", [{ x: 1080, y: 980 }, { x: 700, y: 1040 }]),
  createRoute("trans-vector", "trans", "vector", [{ x: 660, y: 300 }, { x: 800, y: 430 }]),
];

function createRoute(id: string, fromNpcId: string, toNpcId: string, via: Point[]): RouteGeometry {
  const start = getNpcPoint(fromNpcId);
  const end = getNpcPoint(toNpcId);
  const nodes = [start, ...via, end];
  const segments: CubicSegment[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const current = nodes[i];
    const next = nodes[i + 1];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    segments.push({ c1: { x: current.x + dx * 0.34, y: current.y + dy * 0.04 }, c2: { x: current.x + dx * 0.68, y: current.y + dy * 0.96 }, end: next });
  }
  return { id, fromNpcId, toNpcId, start, segments };
}

function getNpcPoint(npcId: string): Point {
  const npc = NPC_LIST.find((item) => item.id === npcId);
  if (!npc) return { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
  return { x: (parseFloat(npc.left) / 100) * MAP_WIDTH, y: (parseFloat(npc.top) / 100) * MAP_HEIGHT };
}

function routePathD(route: RouteGeometry) {
  let d = `M ${route.start.x} ${route.start.y}`;
  for (const segment of route.segments) {
    d += ` C ${segment.c1.x} ${segment.c1.y} ${segment.c2.x} ${segment.c2.y} ${segment.end.x} ${segment.end.y}`;
  }
  return d;
}

function reverseRoute(route: RouteGeometry): RouteGeometry {
  const nodes = [route.start, ...route.segments.map((segment) => segment.end)];
  const reversedNodes = [...nodes].reverse();
  const reversedSegments = [...route.segments].reverse().map((segment, index) => ({ c1: segment.c2, c2: segment.c1, end: reversedNodes[index + 1] }));
  return { ...route, start: reversedNodes[0], segments: reversedSegments };
}

function resolveFlowRoute(fromNpcId: string, toNpcId: string): RouteGeometry | null {
  const direct = FLOW_ROUTES.find((route) => route.fromNpcId === fromNpcId && route.toNpcId === toNpcId);
  if (direct) return direct;
  const reverse = FLOW_ROUTES.find((route) => route.fromNpcId === toNpcId && route.toNpcId === fromNpcId);
  return reverse ? reverseRoute(reverse) : null;
}

function sampleRoutePoints(route: RouteGeometry, steps: number) {
  if (route.segments.length === 0) return [route.start];
  const points: Point[] = [];
  const perSegment = Math.max(4, Math.floor(steps / route.segments.length));
  let segmentStart = route.start;
  route.segments.forEach((segment, segmentIndex) => {
    for (let i = 0; i <= perSegment; i += 1) {
      if (segmentIndex > 0 && i === 0) continue;
      points.push(sampleCubic(segmentStart, segment, i / perSegment));
    }
    segmentStart = segment.end;
  });
  return points;
}

function sampleCubic(start: Point, segment: CubicSegment, t: number): Point {
  const inv = 1 - t;
  return {
    x: inv * inv * inv * start.x + 3 * inv * inv * t * segment.c1.x + 3 * inv * t * t * segment.c2.x + t * t * t * segment.end.x,
    y: inv * inv * inv * start.y + 3 * inv * inv * t * segment.c1.y + 3 * inv * t * t * segment.c2.y + t * t * t * segment.end.y,
  };
}

function NeuralPathways({ activeHop, route, hopPoints }: { activeHop: FlowHopSignal | null; route: RouteGeometry | null; hopPoints: Array<{ x: number; y: number }> | null }) {
  return (
    <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
      <defs>
        <filter id="flowGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" result="blurred" />
          <feMerge><feMergeNode in="blurred" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {FLOW_ROUTES.map((path, index) => (
        <g key={path.id}>
          <path d={routePathD(path)} stroke="rgba(148,163,184,0.22)" strokeWidth="3" fill="none" />
          <motion.path d={routePathD(path)} stroke="rgba(34,211,238,0.24)" strokeWidth="1.8" fill="none" strokeDasharray="8 15" initial={{ strokeDashoffset: 0, opacity: 0.16 }} animate={{ strokeDashoffset: [-8, -58], opacity: [0.12, 0.35, 0.12] }} transition={{ duration: 2.3, ease: "linear", repeat: Infinity, delay: index * 0.16 }} />
        </g>
      ))}
      <AnimatePresence>
        {activeHop && route ? (
          <motion.path key={`path-${activeHop.key}`} d={routePathD(route)} stroke={activeHop.color} strokeWidth="4" fill="none" filter="url(#flowGlow)" strokeDasharray="10 14" initial={{ pathLength: 0, opacity: 0.2, strokeDashoffset: 0 }} animate={{ pathLength: 1, opacity: [0.25, 1, 0.2], strokeDashoffset: [0, -48] }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: "linear" }} />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {activeHop && hopPoints ? (
          <motion.circle key={`orb-${activeHop.key}`} cx={hopPoints[0].x} cy={hopPoints[0].y} r="6" fill={activeHop.color} filter="url(#flowGlow)" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0], cx: hopPoints.map((point) => point.x), cy: hopPoints.map((point) => point.y) }} exit={{ opacity: 0 }} transition={{ duration: 0.95, ease: "linear" }} />
        ) : null}
      </AnimatePresence>
    </svg>
  );
}
