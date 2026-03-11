export type DialogueEvent =
  | "task-step"
  | "power-confirm"
  | "power-denied"
  | "conflict-rag-to-trans"
  | "task-complete";

interface NpcProfile {
  name: string;
  mbti: string;
  personality: string;
  catchphrases: string[];
  dialogs: Partial<Record<DialogueEvent, string[]>>;
}

export const NPC_PERSONALITIES: Record<string, NpcProfile> = {
  "cpu-old": {
    name: "西皮优",
    mbti: "ISTJ",
    personality: "稳健守规矩，厌恶跳流程",
    catchphrases: ["听好了", "规矩点", "慢着"],
    dialogs: {
      "power-confirm": [
        "动力授权通过，时钟稳定，准许放行。",
        "基础算力已对齐，继续执行。",
      ],
      "power-denied": [
        "没获得动力许可，你以为这飞船是靠爱发电吗？",
      ],
    },
  },
  "gpu-sailor": {
    name: "吉皮优",
    mbti: "ESTP",
    personality: "执行冲锋型，偏好高并发",
    catchphrases: ["搞快点", "爽", "干"],
    dialogs: {
      "power-confirm": [
        "算力满载就绪，直接开干！",
        "并发通道点亮，爽，冲起来。",
      ],
      "task-step": ["线程拉满，矩阵开算，干！"],
    },
  },
  trans: {
    name: "特兰斯",
    mbti: "INTJ",
    personality: "系统规划型，对低质量输入不屑",
    catchphrases: ["请注意", "结论如下", "校准完成"],
    dialogs: {
      "task-step": [
        "当前语义噪声偏高，我会强制收敛推理路径。",
        "如果输入继续低效，我会重排注意力优先级。",
      ],
      "conflict-rag-to-trans": [
        "虽然结果正确，但你带回来的数据格式太乱了。",
        "命中是命中了，可这格式让我浪费了解析预算。",
      ],
    },
  },
  openclaw: {
    name: "OpenClaw",
    mbti: "ENTP",
    personality: "实验驱动，喜欢跳跃式尝试",
    catchphrases: ["走你", "上工具", "开工"],
    dialogs: {
      "task-step": [
        "工具链我先上，出事了我们再一起修。",
      ],
    },
  },
  rag: {
    name: "拉格",
    mbti: "ISTP",
    personality: "现场检索派，结果导向",
    catchphrases: ["捞到了", "行", "收到"],
    dialogs: {
      "task-step": [
        "证据捞回来了，这回别说我只会潜水。",
      ],
    },
  },
  xiaocha: {
    name: "小查",
    mbti: "ENFP",
    personality: "引导型沟通者，偏情绪激励",
    catchphrases: ["安排上", "好耶", "别慌"],
    dialogs: {
      "task-step": ["流程我来带，你负责提问就行。"],
      "task-complete": ["链路跑通，今天这船开得真顺。"],
    },
  },
};

function fallbackLine(event: DialogueEvent) {
  if (event === "power-denied") return "没获得动力许可，你以为这飞船是靠爱发电吗？";
  if (event === "task-complete") return "任务完成，流程闭环。";
  return "收到，继续推进。";
}

export function getDialog(npcId: string, event: DialogueEvent): string {
  const profile = NPC_PERSONALITIES[npcId];
  if (!profile) return fallbackLine(event);

  const linePool = profile.dialogs[event] ?? profile.dialogs["task-step"] ?? [fallbackLine(event)];
  const phrasePool = profile.catchphrases.length ? profile.catchphrases : ["收到"];
  const line = linePool[Math.floor(Math.random() * linePool.length)] ?? fallbackLine(event);
  const phrase = phrasePool[Math.floor(Math.random() * phrasePool.length)] ?? "收到";

  if (event === "conflict-rag-to-trans" && npcId === "trans") {
    return `${phrase}，${line}`;
  }
  if (event === "task-step" && npcId === "trans") {
    return `${phrase}，${line} 另外，别把低质量上下文再塞给我。`;
  }
  if (event === "task-step" && npcId === "cpu-old") {
    return `${phrase}，${line} OpenClaw 的野路子我盯着呢。`;
  }
  if (event === "task-step" && npcId === "openclaw") {
    return `${phrase}，${line} 不过西皮优总说我不按章法。`;
  }

  return `${phrase}，${line}`;
}
