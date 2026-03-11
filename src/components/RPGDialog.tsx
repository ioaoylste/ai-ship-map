import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useTypingEffect } from "../hooks/useTypingEffect";
import type { GlossaryTerm } from "../data/glossary";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildKeywordRegex(terms: GlossaryTerm[]) {
  const keywords = [...terms]
    .map((term) => term.keyword)
    .sort((a, b) => b.length - a.length)
    .map((keyword) => escapeRegExp(keyword));
  if (keywords.length === 0) return null;
  return new RegExp(`(${keywords.join("|")})`, "g");
}

interface RPGDialogProps {
  visible: boolean;
  npcName: string;
  npcRole: string;
  npcAvatar: string;
  text: string;
  accentColor: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  glossaryTerms: GlossaryTerm[];
  collectedTerms: string[];
  onCollectTerm: (termId: string) => void;
  onAction?: () => void;
  onClose: () => void;
}

export function RPGDialog({
  visible,
  npcName,
  npcRole,
  npcAvatar,
  text,
  accentColor,
  actionLabel,
  actionDisabled,
  glossaryTerms,
  collectedTerms,
  onCollectTerm,
  onAction,
  onClose,
}: RPGDialogProps) {
  const { display } = useTypingEffect(text, 45, visible);

  const keywordMap = new Map(glossaryTerms.map((term) => [term.keyword, term]));
  const keywordRegex = buildKeywordRegex(glossaryTerms);

  const parts = keywordRegex ? display.split(keywordRegex) : [display];

  useEffect(() => {
    if (!display || glossaryTerms.length === 0) return;
    for (const term of glossaryTerms) {
      if (display.includes(term.keyword) && !collectedTerms.includes(term.id)) {
        onCollectTerm(term.id);
      }
    }
  }, [collectedTerms, display, glossaryTerms, onCollectTerm]);

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
              border: `2px solid ${accentColor}`,
              boxShadow:
                `0 0 40px ${accentColor}55, inset 0 0 30px ${accentColor}1f`,
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                borderBottom: `1px solid ${accentColor}66`,
                background: "rgba(6,18,34,0.35)",
              }}
            >
              <span className="font-mono font-bold tracking-wider" style={{ color: accentColor }}>
                {npcName || "未知乘员"}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded transition-colors"
                style={{ color: accentColor, backgroundColor: "rgba(15,23,42,0.4)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-4 flex gap-4">
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div
                  className="w-14 h-14 rounded-xl border bg-slate-900/80 flex items-center justify-center text-3xl"
                  style={{ borderColor: `${accentColor}99`, boxShadow: `0 0 18px ${accentColor}88` }}
                >
                  <span className="select-none">{npcAvatar || "👤"}</span>
                </div>
                <div className="text-[11px] font-mono text-center leading-snug" style={{ color: `${accentColor}` }}>
                  {npcRole || "未知角色"}
                </div>
              </div>

              <div className="flex-1 min-h-[80px]">
                <p className="font-mono text-sm text-slate-200 leading-relaxed">
                  {parts.map((part, index) => {
                    const term = keywordMap.get(part);
                    if (!term) return <span key={`${part}-${index}`}>{part}</span>;
                    return (
                      <button
                        key={`${term.id}-${index}`}
                        type="button"
                        onClick={() => onCollectTerm(term.id)}
                        className="mx-0.5 inline-flex items-center gap-1 rounded px-1 align-baseline text-yellow-400 underline decoration-yellow-300/80 decoration-2 underline-offset-2 transition-colors hover:text-yellow-300"
                      >
                        <span>{part}</span>
                        <span className="text-[11px] animate-pulse">✨</span>
                      </button>
                    );
                  })}
                  <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ backgroundColor: accentColor }} />
                </p>
                {actionLabel ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={onAction}
                      disabled={actionDisabled}
                      className="rounded-md px-3 py-1.5 text-xs font-mono font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-55"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 0 16px ${accentColor}99`,
                      }}
                    >
                      {actionLabel}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
