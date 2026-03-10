import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTypingEffect } from "../hooks/useTypingEffect";

interface RPGDialogProps {
  visible: boolean;
  npcName: string;
  npcRole: string;
  npcAvatar: string;
  text: string;
  onClose: () => void;
}

export function RPGDialog({
  visible,
  npcName,
  npcRole,
  npcAvatar,
  text,
  onClose,
}: RPGDialogProps) {
  const { display } = useTypingEffect(text, 45, visible);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.95 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{ y: 80, opacity: 0, scale: 0.98 }}
          transition={{
            type: "spring",
            damping: 22,
            stiffness: 280,
          }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
        >
          <motion.div
            initial={{ filter: "blur(4px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="max-w-3xl mx-auto rounded-lg overflow-hidden bg-black/90"
            style={{
              border: "2px solid rgba(34,211,238,0.5)",
              boxShadow:
                "0 0 40px rgba(34,211,238,0.25), inset 0 0 30px rgba(34,211,238,0.05)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                borderBottom: "1px solid rgba(34,211,238,0.35)",
                background: "rgba(6,78,59,0.2)",
              }}
            >
              <span className="font-mono text-cyan-400 font-bold tracking-wider">
                {npcName || "未知乘员"}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-4 flex gap-4">
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-14 h-14 rounded-xl border border-cyan-400/60 bg-slate-900/80 flex items-center justify-center text-3xl shadow-[0_0_18px_rgba(34,211,238,0.6)]">
                  <span className="select-none">{npcAvatar || "👤"}</span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 text-center leading-snug">
                  {npcRole || "未知角色"}
                </div>
              </div>

              <div className="flex-1 min-h-[80px]">
                <p className="font-mono text-sm text-slate-200 leading-relaxed">
                  {display}
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
