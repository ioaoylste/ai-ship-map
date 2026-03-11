import { motion } from "framer-motion";
import type { NpcEntity } from "./ShipMapCanvas";

interface NPCContainerProps {
  npcs: NpcEntity[];
  allowedNpcIds: Set<string>;
  onNpcClick: (npc: NpcEntity) => void;
}

export function NPC_Container({ npcs, allowedNpcIds, onNpcClick }: NPCContainerProps) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(npcs.length)));

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(240px, 1fr))` }}>
      {npcs.map((npc) => {
        const active = allowedNpcIds.size === 0 || allowedNpcIds.has(npc.id);
        return (
          <motion.button
            key={npc.id}
            type="button"
            onClick={() => onNpcClick(npc)}
            className="rounded-md border border-cyan-300/55 bg-black/70 p-5 text-left"
            style={{ opacity: active ? 1 : 0.5 }}
            whileHover={active ? { scale: 1.03 } : undefined}
          >
            <p className="font-mono text-xl text-cyan-100">{npc.name}</p>
            <p className="font-mono text-base text-slate-300">{npc.role}</p>
            <div className="mt-4 flex items-center gap-3">
              <img src={npc.imageUrl} alt={npc.name} className="h-20 w-20 object-contain" draggable={false} />
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">{npc.room}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
