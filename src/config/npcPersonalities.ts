export type DialogueEventType =
  | "task-step"
  | "power-confirm"
  | "power-denied"
  | "conflict-rag-to-trans"
  | "task-complete";

export type DialogueEmotion = "calm" | "annoyed" | "excited";

interface NpcPersonality {
  mbti: string;
  traits: string[];
  fillers: string[];
  templates: Partial<Record<DialogueEventType, string[]>>;
  emotionSuffix: Record<DialogueEmotion, string[]>;
}

export const NPC_PERSONALITIES: Record<string, NpcPersonality> = {
  xiaocha: {
    mbti: "ENFP",
    traits: ["热情", "引导型"],
    fillers: ["欸", "好耶", "安排上"],
    templates: {
      "task-step": [
        "{fill}，流程我给你排好了，别慌。",
        "{fill}，你的问题我已经送进协作通道。",
      ],
      "task-complete": ["{fill}，这趟流程顺利落地，体验不错吧？"],
    },
    emotionSuffix: {
      calm: ["别急，节奏稳住。"],
      annoyed: ["我知道你急，但流程不能跳。"],
      excited: ["这波协作很丝滑！"],
    },
  },
  trans: {
    mbti: "INTJ",
    traits: ["理性", "系统化"],
    fillers: ["结论如下", "请注意", "校准完成"],
    templates: {
      "task-step": [
        "{fill}，当前存在计算偏差，我正在重排注意力。",
        "{fill}，若继续低效输入，会造成推理效率低下。",
      ],
      "conflict-rag-to-trans": [
        "虽然结果正确，但你带回来的数据格式太乱了。",
      ],
    },
    emotionSuffix: {
      calm: ["继续按序推进。"],
      annoyed: ["格式再乱一次我就报错。"],
      excited: ["推理路径已最优化。"],
    },
  },
  rag: {
    mbti: "ISTP",
    traits: ["务实", "现场派"],
    fillers: ["行", "收到", "捞到了"],
    templates: {
      "task-step": [
        "{fill}，证据我捞上来了，别再说我只会潜水。",
        "{fill}，检索命中了，今天幻觉休想上岸。",
      ],
    },
    emotionSuffix: {
      calm: ["证据链稳定。"],
      annoyed: ["别催，我又不是瞬移检索。"],
      excited: ["命中率拉满，爽。"],
    },
  },
  "gpu-sailor": {
    mbti: "ESTP",
    traits: ["激进", "执行派"],
    fillers: ["搞快点", "爽", "干"],
    templates: {
      "task-step": [
        "{fill}！线程都拉满了，直接冲。",
        "{fill}，矩阵运算起飞，别磨叽。",
      ],
      "power-confirm": [
        "{fill}，动力许可已点亮，干！",
        "{fill}，算力栈就绪，爽。",
      ],
    },
    emotionSuffix: {
      calm: ["算力分配正常。"],
      annoyed: ["别卡我 IO，搞快点。"],
      excited: ["并发起飞，干！"],
    },
  },
  "cpu-old": {
    mbti: "ISTJ",
    traits: ["保守", "稳定"],
    fillers: ["慢点", "规矩点", "听好了"],
    templates: {
      "power-confirm": [
        "{fill}，动力审批通过，流程继续。",
        "{fill}，基础时钟稳定，准许放行。",
      ],
      "power-denied": [
        "没获得动力许可，你以为这飞船是靠爱发电吗？",
      ],
    },
    emotionSuffix: {
      calm: ["供能稳定。"],
      annoyed: ["审批没过就别瞎点。"],
      excited: ["动力批准，马上上强度。"],
    },
  },
  openclaw: {
    mbti: "ENTP",
    traits: ["工具流", "实验派"],
    fillers: ["开工", "上工具", "走你"],
    templates: {
      "task-step": [
        "{fill}，工具链已上线，出问题我来背一半锅。",
      ],
    },
    emotionSuffix: {
      calm: ["工具状态良好。"],
      annoyed: ["参数再乱填我也救不回来。"],
      excited: ["链路就绪，开工！"],
    },
  },
};

export function getDialogue(npcId: string, eventType: DialogueEventType): string {
  const profile = NPC_PERSONALITIES[npcId];
  if (!profile) {
    if (eventType === "power-denied") {
      return "没获得动力许可，你以为这飞船是靠爱发电吗？";
    }
    return "信号已收到，正在处理。";
  }

  const lines = profile.templates[eventType] ?? profile.templates["task-step"] ?? ["{fill}，流程继续推进。"];
  const line = lines[Math.floor(Math.random() * lines.length)];
  const filler = profile.fillers[Math.floor(Math.random() * profile.fillers.length)] ?? "收到";
  return line.replace("{fill}", filler);
}

export function getDialogueWithEmotion(
  npcId: string,
  eventType: DialogueEventType,
  emotion: DialogueEmotion,
): string {
  const base = getDialogue(npcId, eventType);
  const profile = NPC_PERSONALITIES[npcId];
  if (!profile) return base;
  const suffixes = profile.emotionSuffix[emotion] ?? profile.emotionSuffix.calm;
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)] ?? "";
  return `${base} ${suffix}`.trim();
}
