import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DraggableMap } from "./components/DraggableMap";
import { RPGDialog } from "./components/RPGDialog";
import { Room } from "./components/Room";
import {
  type FlowHopSignal,
  ShipMapCanvas,
  type NpcEntity,
  NPC_LIST,
  getNpcCameraTarget,
} from "./components/ShipMapCanvas";
import { Starfield } from "./components/Starfield";
import { getDialog } from "./data/npcConfig";
import { TASK_FLOW_MAP, type TaskFlowId, type TaskTone } from "./config/taskFlows";
import { GLOSSARY_TERMS, type GlossaryTerm } from "./data/glossary";
import { CRAFT_RECIPES, drawWeightedTaskBatchByDay, type AvailableTask } from "./config/taskInbox";

const HOP_ANIMATION_MS = 900;
const POWER_NODES = new Set(["cpu-old", "gpu-sailor"]);
const CODEX_STORAGE_KEY = "ai-ship-map.collectedTerms.v1";

function getRarityVisual(rarity: "common" | "rare" | "epic") {
  if (rarity === "epic") {
    return {
      border: "rgba(244,114,182,0.92)",
      glow: "0 0 22px rgba(236,72,153,0.55)",
      badgeBg: "rgba(236,72,153,0.22)",
      badgeText: "#fbcfe8",
      title: "#fdf2f8",
      analogy: "#f9a8d4",
      burst: "+1 史诗知识碎片",
      label: "EPIC",
    };
  }
  if (rarity === "rare") {
    return {
      border: "rgba(56,189,248,0.9)",
      glow: "0 0 20px rgba(14,165,233,0.5)",
      badgeBg: "rgba(14,165,233,0.22)",
      badgeText: "#bae6fd",
      title: "#e0f2fe",
      analogy: "#67e8f9",
      burst: "+1 稀有知识碎片",
      label: "RARE",
    };
  }
  return {
    border: "rgba(45,212,191,0.84)",
    glow: "0 0 16px rgba(20,184,166,0.4)",
    badgeBg: "rgba(20,184,166,0.2)",
    badgeText: "#ccfbf1",
    title: "#e6fffa",
    analogy: "#99f6e4",
    burst: "+1 普通知识碎片",
    label: "COMMON",
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getNpcById(npcId: string) {
  return NPC_LIST.find((npc) => npc.id === npcId) ?? null;
}

function getZoomPreset(npc: NpcEntity) {
  if (npc.room === "舰桥") return 2;
  if (npc.room === "动力室") return 1.95;
  if (npc.room === "燃料厂") return 1.75;
  if (npc.room === "特勤舱") return 1.85;
  return 1.6;
}

function getRoomGlow(room: string): "blue" | "purple" | "green" | "cyan" | "red" {
  if (room === "舰桥") return "purple";
  if (room === "燃料厂") return "green";
  if (room === "动力室") return "red";
  if (room === "特勤舱") return "cyan";
  return "blue";
}

function getChapterVisual(tone: TaskTone) {
  if (tone === "amber") {
    return {
      border: "rgba(251,191,36,0.78)",
      text: "#fef3c7",
      glow: "0 0 22px rgba(245,158,11,0.45)",
      chipBg: "rgba(245,158,11,0.18)",
      chipText: "#fde68a",
      chipLabel: "BLIND-ZONE",
    };
  }
  if (tone === "orange") {
    return {
      border: "rgba(251,146,60,0.82)",
      text: "#ffedd5",
      glow: "0 0 24px rgba(249,115,22,0.46)",
      chipBg: "rgba(249,115,22,0.2)",
      chipText: "#fdba74",
      chipLabel: "CONTEXT",
    };
  }
  if (tone === "yellow") {
    return {
      border: "rgba(250,204,21,0.82)",
      text: "#fef9c3",
      glow: "0 0 24px rgba(234,179,8,0.46)",
      chipBg: "rgba(234,179,8,0.2)",
      chipText: "#fde047",
      chipLabel: "HALLUCINATION",
    };
  }
  if (tone === "pink") {
    return {
      border: "rgba(244,114,182,0.82)",
      text: "#fdf2f8",
      glow: "0 0 24px rgba(236,72,153,0.48)",
      chipBg: "rgba(236,72,153,0.2)",
      chipText: "#f9a8d4",
      chipLabel: "PROMPT",
    };
  }
  if (tone === "red") {
    return {
      border: "rgba(248,113,113,0.82)",
      text: "#ffe4e6",
      glow: "0 0 24px rgba(239,68,68,0.48)",
      chipBg: "rgba(239,68,68,0.2)",
      chipText: "#fecaca",
      chipLabel: "OVERLOAD",
    };
  }
  return {
    border: "rgba(192,132,252,0.8)",
    text: "#f5e8ff",
    glow: "0 0 24px rgba(168,85,247,0.45)",
    chipBg: "rgba(168,85,247,0.2)",
    chipText: "#e9d5ff",
    chipLabel: "EFFICIENCY",
  };
}

function getNpcMismatchLine(npcName: string) {
  return `${npcName}：我是干这个的吗？这活你派错人了！`;
}

function getNpcWorkLine(taskTitle: string, reward: string) {
  return `收到委托「${taskTitle}」，执行完成。产出物资：${reward}。`;
}

function starLabel(difficulty: 1 | 2 | 3) {
  return "★".repeat(difficulty) + "☆".repeat(3 - difficulty);
}

type ToastType = "success" | "error" | "info";
type InventoryMap = Record<string, number>;
interface DailyStats {
  completed: number;
  failed: number;
  crystalsEarned: number;
  dataEarned: number;
}

export default function App() {
  const [targetCenter, setTargetCenter] = useState<{ x: number; y: number } | null>(null);
  const [targetZoom, setTargetZoom] = useState(1.1);
  const [activeTaskId, setActiveTaskId] = useState<TaskFlowId | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [powerConfirmed, setPowerConfirmed] = useState(false);
  const [selectedPowerNpcId, setSelectedPowerNpcId] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogNpc, setDialogNpc] = useState<NpcEntity | null>(null);
  const [dialogText, setDialogText] = useState("");
  const [taskFinished, setTaskFinished] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [activeHop, setActiveHop] = useState<FlowHopSignal | null>(null);
  const [screenOverload, setScreenOverload] = useState(false);
  const [shakePulse, setShakePulse] = useState(0);
  const [chapterBanner, setChapterBanner] = useState<{ key: number; text: string; tone: TaskTone } | null>(null);
  const [collectedTerms, setCollectedTerms] = useState<string[]>([]);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<"codex" | "lab">("codex");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [lootBursts, setLootBursts] = useState<Array<{ id: number; label: string; rarity: "common" | "rare" | "epic" }>>([]);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [inboxTasks, setInboxTasks] = useState<AvailableTask[]>(() => drawWeightedTaskBatchByDay(1, 3));
  const [activeInboxTask, setActiveInboxTask] = useState<AvailableTask | null>(null);
  const [assignMode, setAssignMode] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [rewardMultiplier, setRewardMultiplier] = useState(1);
  const [boardRefreshPulse, setBoardRefreshPulse] = useState(0);
  const [inventory, setInventory] = useState<InventoryMap>({
    "算力晶体": 0,
    "杂乱数据": 0,
    "联网凭证": 0,
    "高级像素": 0,
    "预训练大脑": 0,
    "RAG 外挂引擎": 0,
  });
  const [unlockedModules, setUnlockedModules] = useState<string[]>([]);
  const [craftPulseId, setCraftPulseId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; type: ToastType }>>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({ completed: 0, failed: 0, crystalsEarned: 0, dataEarned: 0 });
  const [dailyReportOpen, setDailyReportOpen] = useState(false);

  const runTokenRef = useRef(0);

  const activeFlow = activeTaskId ? TASK_FLOW_MAP[activeTaskId] : null;
  const currentStep = activeFlow?.steps[currentStepIndex] ?? null;
  const nextStep = activeFlow?.steps[currentStepIndex + 1] ?? null;
  const currentStepNpc = currentStep ? getNpcById(currentStep.npc) : null;

  const requiredRoom = !powerConfirmed ? "动力室" : currentStepNpc?.room ?? null;
  const roomPaused = !!activeRoom && !!requiredRoom && activeRoom !== requiredRoom;

  const allowedNpcIds = useMemo(() => {
    if (!activeFlow || taskFinished) return new Set<string>();
    if (!powerConfirmed) return new Set<string>(["cpu-old", "gpu-sailor"]);
    return currentStep ? new Set<string>([currentStep.npc]) : new Set<string>();
  }, [activeFlow, currentStep, powerConfirmed, taskFinished]);

  const roomNpcs = useMemo(() => (activeRoom ? NPC_LIST.filter((npc) => npc.room === activeRoom) : []), [activeRoom]);
  const selectedTerm = useMemo(
    () => GLOSSARY_TERMS.find((term: GlossaryTerm) => term.id === selectedTermId) ?? null,
    [selectedTermId],
  );
  const selectedTermVisual = selectedTerm ? getRarityVisual(selectedTerm.rarity) : null;
  const resourceCrystals = inventory["算力晶体"] ?? 0;
  const resourceRawData = inventory["杂乱数据"] ?? 0;

  const pushToast = useCallback((text: string, type: ToastType) => {
    setToasts((prev) => [...prev, { id: Date.now() + prev.length, text, type }]);
  }, []);

  const refreshBoard = useCallback(() => {
    setInboxTasks(drawWeightedTaskBatchByDay(currentDay, 3));
    setActiveInboxTask(null);
    setAssignMode(false);
    setBoardRefreshPulse((old) => old + 1);
    pushToast("委托板已刷新：新订单入港", "info");
  }, [currentDay, pushToast]);

  const handleNextDay = useCallback(() => {
    setDailyReportOpen(false);
    setCurrentDay((prev) => prev + 1);
    setDailyStats({ completed: 0, failed: 0, crystalsEarned: 0, dataEarned: 0 });
    setComboStreak(0);
    setRewardMultiplier(1);
    const nextDay = currentDay + 1;
    setInboxTasks(drawWeightedTaskBatchByDay(nextDay, 3));
    setActiveInboxTask(null);
    setAssignMode(false);
    pushToast(`进入 Day ${nextDay}：高难委托概率上升`, "info");
  }, [currentDay, pushToast]);

  useEffect(() => {
    if (inboxTasks.length === 0 && !assignMode && !activeInboxTask) {
      const timer = window.setTimeout(() => refreshBoard(), 1200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [activeInboxTask, assignMode, inboxTasks.length, refreshBoard]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CODEX_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const validIds = new Set(GLOSSARY_TERMS.map((term: GlossaryTerm) => term.id));
      const restored = parsed.filter((id): id is string => typeof id === "string" && validIds.has(id));
      if (restored.length > 0) {
        setCollectedTerms(restored);
        setSelectedTermId(restored[0]);
      }
    } catch {
      // Ignore corrupted storage and continue with empty progress.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(collectedTerms));
  }, [collectedTerms]);

  const dialogActionLabel = useMemo(() => {
    if (!dialogVisible || !activeFlow) return undefined;
    if (taskFinished) return "[关闭]";
    if (!powerConfirmed) return "[算力确认]";
    if (nextStep) {
      const targetNpc = getNpcById(nextStep.npc);
      return `[下一步：传给 ${targetNpc?.name ?? "下一节点"}]`;
    }
    return "[完成任务]";
  }, [activeFlow, dialogVisible, nextStep, powerConfirmed, taskFinished]);

  const hintText = useMemo(() => {
    if (!activeFlow) return "请选择任务，系统将强制先进行动力室算力授权。";
    if (!powerConfirmed) return "先点击动力室 CPU/GPU 完成算力校验，然后才能激活任务核心节点。";
    if (roomPaused) return `当前房间外任务已暂停。请切换到 ${requiredRoom}。`;
    if (taskFinished) return `任务完成，算力消耗 ${activeFlow.powerCost}。`;
    if (!currentStepNpc) return "正在同步当前核心节点...";
    return `当前核心节点：${currentStepNpc.name}（${currentStepNpc.room}）`;
  }, [activeFlow, currentStepNpc, powerConfirmed, requiredRoom, roomPaused, taskFinished]);

  const handleCenterReached = useCallback(() => {
    window.setTimeout(() => setTargetCenter(null), 600);
  }, []);

  const handleTaskSelect = useCallback((taskId: TaskFlowId) => {
    runTokenRef.current += 1;
    setActiveTaskId(taskId);
    setCurrentStepIndex(0);
    setTaskFinished(false);
    setPowerConfirmed(false);
    setSelectedPowerNpcId(null);
    setDialogVisible(false);
    setDialogNpc(null);
    setDialogText("");
    setIsAdvancing(false);
    setActiveHop(null);
    setScreenOverload(false);
    setChapterBanner({ key: Date.now(), text: `【任务开启】${TASK_FLOW_MAP[taskId].label}`, tone: TASK_FLOW_MAP[taskId].tone });
    window.setTimeout(() => setChapterBanner(null), 1200);

    const cpu = getNpcById("cpu-old");
    if (cpu) {
      setTargetCenter(getNpcCameraTarget(cpu));
      setTargetZoom(getZoomPreset(cpu));
    }
  }, []);

  const handleAcceptInboxTask = useCallback((task: AvailableTask) => {
    const flowId: TaskFlowId = task.targetNpc === "aji" ? "agent" : task.targetNpc === "rag" ? "rag" : "chat";
    handleTaskSelect(flowId);
    setActiveInboxTask(task);
    setAssignMode(true);
    pushToast(`已接取委托：${task.title}`, "info");
    const npc = getNpcById(task.targetNpc);
    if (npc) {
      setTargetCenter(getNpcCameraTarget(npc));
      setTargetZoom(getZoomPreset(npc));
    }
  }, [handleTaskSelect, pushToast]);

  const canCraft = useCallback((requires: Array<{ item: string; amount: number }>) => {
    return requires.every((req) => (inventory[req.item] ?? 0) >= req.amount);
  }, [inventory]);

  const handleCraft = useCallback((recipeId: string) => {
    const recipe = CRAFT_RECIPES.find((item) => item.id === recipeId);
    if (!recipe) return;
    if (!canCraft(recipe.requires)) return;

    setInventory((prev) => {
      const next: InventoryMap = { ...prev };
      for (const req of recipe.requires) {
        next[req.item] = Math.max(0, (next[req.item] ?? 0) - req.amount);
      }
      next[recipe.output.module] = (next[recipe.output.module] ?? 0) + recipe.output.amount;
      return next;
    });
    setUnlockedModules((prev) => (prev.includes(recipe.output.module) ? prev : [...prev, recipe.output.module]));
    setCraftPulseId(recipe.id);
    pushToast(`合成成功：${recipe.output.module}`, "success");
  }, [canCraft, pushToast]);

  const handleCollectTerm = useCallback((termId: string) => {
    setCollectedTerms((prev) => {
      if (prev.includes(termId)) return prev;
      const term = GLOSSARY_TERMS.find((item: GlossaryTerm) => item.id === termId);
      const rarity = term?.rarity ?? "common";
      const rarityVisual = getRarityVisual(rarity);
      const next = [...prev, termId];
      setLootBursts((old) => [...old, { id: Date.now() + old.length, label: rarityVisual.burst, rarity }]);
      setUnlockFlash(true);
      setShakePulse((old) => old + 1);
      if (!selectedTermId) setSelectedTermId(termId);
      return next;
    });
  }, [selectedTermId]);

  useEffect(() => {
    if (lootBursts.length === 0) return;
    const timer = window.setTimeout(() => {
      setLootBursts((prev) => prev.slice(1));
    }, 980);
    return () => window.clearTimeout(timer);
  }, [lootBursts]);

  useEffect(() => {
    if (!unlockFlash) return;
    const timer = window.setTimeout(() => setUnlockFlash(false), 260);
    return () => window.clearTimeout(timer);
  }, [unlockFlash]);

  useEffect(() => {
    if (!craftPulseId) return;
    const timer = window.setTimeout(() => setCraftPulseId(null), 520);
    return () => window.clearTimeout(timer);
  }, [craftPulseId]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const codexGrid = useMemo(() => {
    const fixed = [...GLOSSARY_TERMS];
    while (fixed.length < 9) {
      fixed.push({
        id: `locked-${fixed.length}`,
        keyword: "",
        title: "Locked",
        analogy: "",
        description: "",
        icon: "?",
        rarity: "common",
      });
    }
    return fixed.slice(0, 9);
  }, []);

  const openDialog = useCallback((npc: NpcEntity, text: string) => {
    setDialogNpc(npc);
    setDialogText(text);
    setDialogVisible(true);
  }, []);

  const handleNpcClick = useCallback(
    (npc: NpcEntity) => {
      if (assignMode && activeInboxTask) {
        setTargetCenter(getNpcCameraTarget(npc));
        setTargetZoom(getZoomPreset(npc));

        if (npc.id === activeInboxTask.targetNpc) {
          const nextStreak = comboStreak + 1;
          const nextMultiplier = nextStreak >= 5 ? 2 : nextStreak >= 3 ? 1.5 : 1;
          const finalRewardAmount = Math.max(1, Math.round(activeInboxTask.reward.amount * nextMultiplier));
          openDialog(npc, getNpcWorkLine(activeInboxTask.title, `${activeInboxTask.reward.item} x${finalRewardAmount}`));
          setActiveHop({
            key: Date.now(),
            fromNpcId: "xiaocha",
            toNpcId: activeInboxTask.targetNpc,
            color: "rgba(34,211,238,0.9)",
          });
          window.setTimeout(() => setActiveHop(null), HOP_ANIMATION_MS);

          setInventory((prev) => ({
            ...prev,
            [activeInboxTask.reward.item]: (prev[activeInboxTask.reward.item] ?? 0) + finalRewardAmount,
            "杂乱数据": (prev["杂乱数据"] ?? 0) + 1,
          }));

          setDailyStats((prev) => ({
            completed: prev.completed + 1,
            failed: prev.failed,
            crystalsEarned: prev.crystalsEarned + (activeInboxTask.reward.item === "算力晶体" ? finalRewardAmount : 0),
            dataEarned: prev.dataEarned + 1,
          }));

          setComboStreak(nextStreak);
          setRewardMultiplier(nextMultiplier);

          pushToast(`任务成功！获得 ${activeInboxTask.reward.item} x${finalRewardAmount}（x${nextMultiplier}）`, "success");
          setInboxTasks((prev) => prev.filter((task) => task.id !== activeInboxTask.id));
          setActiveInboxTask(null);
          setAssignMode(false);
          return;
        }

        openDialog(npc, getNpcMismatchLine(npc.name));
        setScreenOverload(true);
        window.setTimeout(() => setScreenOverload(false), 360);
        setComboStreak(0);
        setRewardMultiplier(1);
        setDailyStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
        pushToast(`任务失败：${activeInboxTask.title}`, "error");
        setActiveInboxTask(null);
        setAssignMode(false);
        return;
      }

      if (!activeFlow || isAdvancing || taskFinished) return;

      if (!powerConfirmed) {
        if (!POWER_NODES.has(npc.id)) {
          const cpu = getNpcById("cpu-old");
          if (cpu) openDialog(cpu, getDialog("cpu-old", "power-denied"));
          return;
        }
        setSelectedPowerNpcId(npc.id);
        setTargetCenter(getNpcCameraTarget(npc));
        setTargetZoom(getZoomPreset(npc));
        openDialog(npc, getDialog(npc.id, "power-confirm"));
        return;
      }

      if (!currentStep || npc.id !== currentStep.npc || roomPaused) {
        return;
      }

      setTargetCenter(getNpcCameraTarget(npc));
      setTargetZoom(getZoomPreset(npc));
      openDialog(npc, currentStep.line);

      if (activeTaskId === "agent" && npc.id === "gpu-sailor") {
        setShakePulse((prev) => prev + 1);
        setScreenOverload(true);
        window.setTimeout(() => setScreenOverload(false), 420);
      }
    },
    [activeFlow, activeInboxTask, activeTaskId, assignMode, comboStreak, currentStep, isAdvancing, openDialog, powerConfirmed, pushToast, roomPaused, taskFinished],
  );

  const handleDialogAdvance = useCallback(async () => {
    if (!activeFlow || !dialogVisible) return;

    if (taskFinished) {
      setDialogVisible(false);
      setDialogNpc(null);
      return;
    }

    if (!powerConfirmed) {
      const powerNpc = selectedPowerNpcId ? getNpcById(selectedPowerNpcId) : null;
      if (!powerNpc) return;

      const peer = powerNpc.id === "cpu-old" ? "gpu-sailor" : "cpu-old";
      const token = ++runTokenRef.current;
      setIsAdvancing(true);
      setDialogVisible(false);
      setActiveHop({ key: token, fromNpcId: powerNpc.id, toNpcId: peer, color: "rgba(34,211,238,0.9)" });

      await sleep(HOP_ANIMATION_MS);
      if (runTokenRef.current !== token) return;

      setActiveHop(null);
      setPowerConfirmed(true);
      setIsAdvancing(false);
      setDialogNpc(null);

      const nextNpc = currentStep ? getNpcById(currentStep.npc) : null;
      if (nextNpc) {
        setTargetCenter(getNpcCameraTarget(nextNpc));
        setTargetZoom(getZoomPreset(nextNpc));
      }
      return;
    }

    if (!currentStep) return;

    if (!nextStep) {
      setTaskFinished(true);
      setDialogText(`${getDialog(currentStep.npc, "task-complete")}\n任务完成！消耗算力: ${activeFlow.powerCost}`);
      return;
    }

    const token = ++runTokenRef.current;
    setIsAdvancing(true);
    setDialogVisible(false);
    setActiveHop({ key: token, fromNpcId: currentStep.npc, toNpcId: nextStep.npc, color: activeFlow.pathColor });

    await sleep(HOP_ANIMATION_MS);
    if (runTokenRef.current !== token) return;

    setCurrentStepIndex((prev) => prev + 1);
    setActiveHop(null);
    setIsAdvancing(false);
    setDialogNpc(null);

    const nextNpc = getNpcById(nextStep.npc);
    setChapterBanner({
      key: Date.now(),
      text: `第 ${currentStepIndex + 2} 幕：${nextNpc?.name ?? nextStep.npc} 登场`,
      tone: activeFlow.tone,
    });
    window.setTimeout(() => setChapterBanner(null), 1100);

    if (nextNpc) {
      setTargetCenter(getNpcCameraTarget(nextNpc));
      setTargetZoom(getZoomPreset(nextNpc));
    }
  }, [activeFlow, activeTaskId, currentStep, currentStepIndex, dialogVisible, nextStep, powerConfirmed, selectedPowerNpcId, taskFinished]);

  useEffect(() => {
    if (!activeRoom || roomNpcs.length === 0) return;
    setTargetZoom(2.05);
    const centerNpc = roomNpcs[Math.floor(roomNpcs.length / 2)];
    setTargetCenter(getNpcCameraTarget(centerNpc));
  }, [activeRoom, roomNpcs]);

  return (
    <div className="h-full w-full overflow-hidden" onClick={() => { if (activeRoom) setActiveRoom(null); }}>
      <Starfield />

      <motion.header
        className="fixed left-0 right-0 top-0 z-[66] border-b border-cyan-300/35 bg-black/80 px-4 py-2 backdrop-blur-md"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="mx-auto flex w-[min(1100px,96vw)] items-center justify-between">
          <p className="font-mono text-sm tracking-wider text-cyan-200">A+C 星际经营工坊 · Day {currentDay}</p>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded border border-teal-300/60 bg-teal-400/15 px-2 py-1 text-teal-100">算力晶体 x{resourceCrystals}</span>
            <span className="rounded border border-orange-300/60 bg-orange-400/15 px-2 py-1 text-orange-100">杂乱数据 x{resourceRawData}</span>
            <button
              type="button"
              onClick={() => setDailyReportOpen(true)}
              className="rounded border border-cyan-300/70 bg-cyan-500/15 px-2 py-1 text-cyan-100 hover:bg-cyan-500/25"
            >
              日结面板
            </button>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="fixed left-1/2 top-14 z-40 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-md border bg-black/80 px-4 py-2 backdrop-blur-md"
        style={{ borderColor: activeFlow ? `${activeFlow.orbColor}99` : "rgba(148,163,184,0.45)" }}
      >
        <p className="font-mono text-[11px] tracking-wide text-slate-400">STEP GUIDE</p>
        <p className="font-mono text-sm text-slate-100">{hintText}</p>
      </motion.div>

      <AnimatePresence>
        {chapterBanner ? (
          <motion.div
            key={chapterBanner.key}
            className="pointer-events-none fixed left-1/2 top-24 z-[55] -translate-x-1/2 rounded-md border bg-black/80 px-5 py-2"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              borderColor: getChapterVisual(chapterBanner.tone).border,
              boxShadow: getChapterVisual(chapterBanner.tone).glow,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="rounded px-2 py-0.5 font-mono text-[10px] tracking-wider"
                style={{
                  background: getChapterVisual(chapterBanner.tone).chipBg,
                  color: getChapterVisual(chapterBanner.tone).chipText,
                }}
              >
                {getChapterVisual(chapterBanner.tone).chipLabel}
              </span>
              <p className="font-mono text-sm tracking-wide" style={{ color: getChapterVisual(chapterBanner.tone).text }}>
                {chapterBanner.text}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="fixed inset-0"
        animate={activeRoom ? { scale: 0.3, x: -430, y: 280, opacity: 0.78 } : { scale: 1, x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ transformOrigin: "left bottom" }}
        onClick={(e) => e.stopPropagation()}
      >
        <DraggableMap targetCenter={targetCenter} targetZoom={targetZoom} shakePulse={shakePulse} onCenterReached={handleCenterReached}>
          <ShipMapCanvas
            onNpcClick={handleNpcClick}
            activeHop={activeHop}
            activeNpcIds={allowedNpcIds}
            interactionLocked={isAdvancing || roomPaused}
            onEnterRoom={setActiveRoom}
          />
        </DraggableMap>
      </motion.div>

      <AnimatePresence>
        {unlockFlash ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70] bg-yellow-300/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          />
        ) : null}

        {screenOverload ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[60] bg-red-500/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.25, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeRoom ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveRoom(null)}
          >
            <motion.div initial={{ y: 18, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <Room name={activeRoom} layer="房间聚焦模式" glow={getRoomGlow(activeRoom)}>
                {roomNpcs.map((npc) => {
                  const active = allowedNpcIds.size === 0 || allowedNpcIds.has(npc.id);
                  return (
                    <motion.button
                      key={npc.id}
                      type="button"
                      onClick={() => handleNpcClick(npc)}
                      className="w-[240px] rounded-md border border-cyan-300/55 bg-black/70 p-5 text-left"
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
              </Room>
              {roomPaused ? (
                <p className="mt-4 text-center font-mono text-xs text-amber-300">当前链路节点不在本房间，外部流程已暂停。</p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.aside
        className="fixed right-5 top-1/2 z-40 w-[240px] -translate-y-1/2 rounded-lg border border-cyan-400/55 bg-black/80 p-3 backdrop-blur-md"
        style={{ boxShadow: "0 0 22px rgba(34,211,238,0.35)" }}
        key={`board-${boardRefreshPulse}`}
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        <div className="mb-3 border-b border-cyan-400/30 pb-2">
          <p className="font-mono text-sm font-bold tracking-wide text-cyan-200">星际委托板 Task Board</p>
          <p className="font-mono text-[11px] text-slate-400">{assignMode ? "指派模式已开启" : "选择委托后进入指派模式"}</p>
          {activeInboxTask ? <p className="mt-1 font-mono text-[10px] text-amber-200">当前委托：{activeInboxTask.title}</p> : null}
          <p className="mt-1 font-mono text-[10px] text-emerald-200">连击: {comboStreak} | 奖励倍率: x{rewardMultiplier}</p>
          <p className="mt-1 font-mono text-[10px] text-cyan-300">当前天数: Day {currentDay}</p>
        </div>
        <div className="min-h-[268px] space-y-2">
          {inboxTasks.length === 0 ? (
            <p className="rounded border border-emerald-300/40 bg-emerald-500/10 p-2 font-mono text-xs text-emerald-200">今日委托已清空，港口正在自动派发新订单...</p>
          ) : (
            inboxTasks.map((task) => (
              <div key={task.id} className="rounded-md border border-cyan-300/45 bg-slate-900/70 p-2">
                <p className="font-mono text-xs text-cyan-100">{task.title}</p>
                <p className="mt-1 font-mono text-[10px] text-yellow-300">难度: {starLabel(task.difficulty)}</p>
                <p className="font-mono text-[10px] text-fuchsia-200">稀有系数: {task.difficulty === 3 ? "高风险高收益" : task.difficulty === 2 ? "均衡" : "稳妥"}</p>
                <p className="mt-1 font-mono text-[10px] text-slate-300">目标: {getNpcById(task.targetNpc)?.name ?? task.targetNpc}</p>
                <p className="font-mono text-[10px] text-emerald-300">奖励: {task.reward.item} x{task.reward.amount}</p>
                <button
                  type="button"
                  onClick={() => handleAcceptInboxTask(task)}
                  className="mt-2 w-full rounded border border-fuchsia-300/65 bg-fuchsia-500/15 px-2 py-1 font-mono text-[11px] text-fuchsia-100 hover:bg-fuchsia-500/25"
                >
                  接取任务
                </button>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={refreshBoard}
          className="mt-3 w-full rounded border border-cyan-300/70 bg-cyan-500/15 px-3 py-1.5 font-mono text-xs text-cyan-100 hover:bg-cyan-500/25"
        >
          刷新委托板
        </button>
      </motion.aside>

      <motion.button
        type="button"
        onClick={() => setInventoryOpen(true)}
        className="fixed right-5 top-4 z-[65] rounded-md border border-cyan-300/70 bg-black/85 px-3 py-2 font-mono text-sm text-cyan-100"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        animate={{ boxShadow: ["0 0 10px rgba(34,211,238,0.3)", "0 0 18px rgba(34,211,238,0.55)", "0 0 10px rgba(34,211,238,0.3)"] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        {`🎒 背包 ${collectedTerms.length}/${GLOSSARY_TERMS.length}`}
      </motion.button>

      <AnimatePresence>
        {dailyReportOpen ? (
          <motion.div
            className="fixed inset-0 z-[81] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDailyReportOpen(false)}
          >
            <motion.div
              className="mx-auto mt-[14vh] w-[min(620px,90vw)] rounded-xl border border-cyan-300/65 bg-slate-950/95 p-5"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: "0 0 24px rgba(34,211,238,0.35)" }}
            >
              <p className="font-mono text-lg text-cyan-100">今日经营结算</p>
              <p className="mt-1 font-mono text-xs text-cyan-300">结算日: Day {currentDay}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm">
                <div className="rounded border border-emerald-300/45 bg-emerald-500/10 p-3 text-emerald-100">完成委托: {dailyStats.completed}</div>
                <div className="rounded border border-rose-300/45 bg-rose-500/10 p-3 text-rose-100">失败委托: {dailyStats.failed}</div>
                <div className="rounded border border-cyan-300/45 bg-cyan-500/10 p-3 text-cyan-100">产出算力晶体: {dailyStats.crystalsEarned}</div>
                <div className="rounded border border-orange-300/45 bg-orange-500/10 p-3 text-orange-100">回收杂乱数据: {dailyStats.dataEarned}</div>
              </div>
              <p className="mt-4 font-mono text-xs text-slate-300">
                当前评分: {dailyStats.completed * 120 - dailyStats.failed * 80 + Math.round(rewardMultiplier * 40)}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded border border-cyan-300/70 bg-cyan-500/15 px-3 py-1 font-mono text-xs text-cyan-100 hover:bg-cyan-500/25"
                  onClick={() => setDailyReportOpen(false)}
                >
                  关闭
                </button>
                <button
                  type="button"
                  className="rounded border border-fuchsia-300/70 bg-fuchsia-500/15 px-3 py-1 font-mono text-xs text-fuchsia-100 hover:bg-fuchsia-500/25"
                  onClick={handleNextDay}
                >
                  进入下一天
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {inventoryOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInventoryOpen(false)}
          >
            <motion.div
              className="mx-auto mt-[8vh] grid w-[min(1100px,92vw)] grid-cols-2 gap-5 rounded-xl border border-cyan-300/60 bg-slate-950/95 p-5"
              initial={{ y: 22, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="col-span-2 mb-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInventoryTab("codex")}
                  className={`rounded border px-3 py-1 font-mono text-xs ${inventoryTab === "codex" ? "border-cyan-200 bg-cyan-400/20 text-cyan-100" : "border-slate-500 bg-slate-800/40 text-slate-300"}`}
                >
                  知识图鉴
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryTab("lab")}
                  className={`rounded border px-3 py-1 font-mono text-xs ${inventoryTab === "lab" ? "border-fuchsia-200 bg-fuchsia-400/20 text-fuchsia-100" : "border-slate-500 bg-slate-800/40 text-slate-300"}`}
                >
                  炼丹实验室
                </button>
              </div>

              {inventoryTab === "codex" ? (
                <>
                  <div>
                    <p className="mb-3 font-mono text-sm tracking-wider text-cyan-200">CODEX GRID</p>
                    <div className="grid grid-cols-3 gap-3">
                      {codexGrid.map((term) => {
                        const collected = collectedTerms.includes(term.id);
                        const placeholder = term.id.startsWith("locked-");
                        const selected = selectedTermId === term.id;
                        const rarityVisual = getRarityVisual(term.rarity);
                        return (
                          <button
                            key={term.id}
                            type="button"
                            disabled={!collected || placeholder}
                            onClick={() => setSelectedTermId(term.id)}
                            className="flex h-24 items-center justify-center rounded-md border font-mono text-2xl"
                            style={{
                              borderColor: selected ? rarityVisual.border : collected ? rarityVisual.border : "rgba(71,85,105,0.65)",
                              background: collected ? "rgba(2,132,199,0.15)" : "rgba(15,23,42,0.65)",
                              color: collected ? "#d1fae5" : "#64748b",
                              boxShadow: selected ? rarityVisual.glow : "none",
                              cursor: collected && !placeholder ? "pointer" : "not-allowed",
                            }}
                          >
                            {collected && !placeholder ? term.icon : "?"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-cyan-300/45 bg-black/55 p-4">
                    <p className="font-mono text-sm tracking-wider text-cyan-200">HOLO CARD</p>
                    {selectedTerm ? (
                      <motion.div
                        key={selectedTerm.id}
                        className="mt-3 rounded-md border bg-slate-900/80 p-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                          borderColor: selectedTermVisual?.border ?? "rgba(244,114,182,0.6)",
                          boxShadow: selectedTermVisual?.glow ?? "0 0 24px rgba(236,72,153,0.28)",
                        }}
                      >
                        <div
                          className="mb-2 inline-flex rounded px-2 py-0.5 font-mono text-[11px] tracking-wider"
                          style={{
                            background: selectedTermVisual?.badgeBg ?? "rgba(236,72,153,0.2)",
                            color: selectedTermVisual?.badgeText ?? "#fbcfe8",
                          }}
                        >
                          {selectedTermVisual?.label ?? "EPIC"}
                        </div>
                        <p className="font-mono text-lg" style={{ color: selectedTermVisual?.title ?? "#fdf2f8" }}>{selectedTerm.title}</p>
                        <p className="mt-2 font-mono text-xl" style={{ color: selectedTermVisual?.analogy ?? "#f9a8d4" }}>{selectedTerm.analogy}</p>
                        <p className="mt-3 font-mono text-sm leading-relaxed text-slate-200">{selectedTerm.description}</p>
                      </motion.div>
                    ) : (
                      <p className="mt-4 font-mono text-sm text-slate-400">选择左侧已收集图标，查看词汇解释卡片。</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="mb-3 font-mono text-sm tracking-wider text-fuchsia-200">LAB MATERIALS</p>
                    <div className="space-y-2">
                      {Object.entries(inventory)
                        .filter(([item]) => item !== "RAG 外挂引擎")
                        .map(([item, count]) => (
                          <div key={item} className="flex items-center justify-between rounded border border-slate-600 bg-slate-900/70 px-3 py-2 font-mono text-xs text-slate-200">
                            <span>{item}</span>
                            <span>x{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-fuchsia-300/45 bg-black/55 p-4">
                    <p className="font-mono text-sm tracking-wider text-fuchsia-200">CRAFT RECIPES</p>
                    <div className="mt-3 space-y-3">
                      {CRAFT_RECIPES.map((recipe) => {
                        const available = canCraft(recipe.requires);
                        return (
                          <div key={recipe.id} className="rounded border border-fuchsia-300/30 bg-slate-900/70 p-3">
                            <p className="font-mono text-xs text-fuchsia-100">{recipe.requires.map((req) => `${req.item} x${req.amount}`).join(" + ")} = {recipe.output.module}</p>
                            <button
                              type="button"
                              onClick={() => handleCraft(recipe.id)}
                              disabled={!available}
                              className="mt-2 rounded border px-2 py-1 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-45"
                              style={{
                                borderColor: available ? "rgba(244,114,182,0.85)" : "rgba(100,116,139,0.6)",
                                color: available ? "#fdf2f8" : "#94a3b8",
                                boxShadow: available ? "0 0 12px rgba(236,72,153,0.45)" : "none",
                              }}
                            >
                              合成
                            </button>
                            <AnimatePresence>
                              {craftPulseId === recipe.id ? (
                                <motion.div
                                  className="pointer-events-none mt-2 h-1 rounded bg-fuchsia-300/70"
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.48 }}
                                  style={{ transformOrigin: "left" }}
                                />
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 font-mono text-[11px] text-slate-400">已解锁模块：{unlockedModules.length > 0 ? unlockedModules.join(" / ") : "暂无"}</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {lootBursts.map((burst) => (
          <motion.div
            key={burst.id}
            className="pointer-events-none fixed right-8 top-20 z-[90] rounded border bg-black/80 px-3 py-1 font-mono text-xs"
            initial={{ opacity: 0, y: 10, x: -5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -36, x: 34 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: "easeOut" }}
            style={{
              borderColor: `${getRarityVisual(burst.rarity).border}`,
              color: getRarityVisual(burst.rarity).badgeText,
              boxShadow: getRarityVisual(burst.rarity).glow,
            }}
          >
            {burst.label}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="pointer-events-none fixed right-5 top-20 z-[92] flex w-72 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="rounded border bg-black/85 px-3 py-2 font-mono text-xs"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              style={{
                borderColor:
                  toast.type === "success"
                    ? "rgba(74,222,128,0.75)"
                    : toast.type === "error"
                      ? "rgba(248,113,113,0.78)"
                      : "rgba(56,189,248,0.75)",
                color: toast.type === "success" ? "#dcfce7" : toast.type === "error" ? "#fee2e2" : "#e0f2fe",
              }}
            >
              {toast.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <RPGDialog
        visible={dialogVisible}
        npcName={dialogNpc?.name ?? ""}
        npcRole={dialogNpc?.role ?? ""}
        npcAvatar={dialogNpc?.avatar ?? ""}
        text={dialogText}
        accentColor={activeFlow?.orbColor ?? "#22d3ee"}
        glossaryTerms={GLOSSARY_TERMS}
        collectedTerms={collectedTerms}
        onCollectTerm={handleCollectTerm}
        actionLabel={dialogActionLabel}
        actionDisabled={isAdvancing || roomPaused}
        onAction={() => {
          void handleDialogAdvance();
        }}
        onClose={() => {
          setDialogVisible(false);
          setDialogNpc(null);
        }}
      />
    </div>
  );
}
