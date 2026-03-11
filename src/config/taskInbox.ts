export interface AvailableTask {
  id: string;
  title: string;
  targetNpc: string;
  reward: { item: string; amount: number };
  difficulty: 1 | 2 | 3;
}

export const AVAILABLE_TASKS: AvailableTask[] = [
  {
    id: "t1",
    title: "写一首赛博朋克诗",
    targetNpc: "trans",
    reward: { item: "算力晶体", amount: 1 },
    difficulty: 1,
  },
  {
    id: "t2",
    title: "画一张机器猫海报",
    targetNpc: "aji",
    reward: { item: "高级像素", amount: 1 },
    difficulty: 2,
  },
  {
    id: "t3",
    title: "查今天的星际天气",
    targetNpc: "rag",
    reward: { item: "联网凭证", amount: 1 },
    difficulty: 2,
  },
  {
    id: "t4",
    title: "清理损坏语料",
    targetNpc: "shredder",
    reward: { item: "杂乱数据", amount: 2 },
    difficulty: 1,
  },
  {
    id: "t5",
    title: "校验安全护栏",
    targetNpc: "cpu-old",
    reward: { item: "算力晶体", amount: 1 },
    difficulty: 3,
  },
];

export function drawTaskBatch(size = 3): AvailableTask[] {
  const pool = [...AVAILABLE_TASKS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(size, pool.length));
}

export function drawWeightedTaskBatch(size = 3): AvailableTask[] {
  const picked: AvailableTask[] = [];
  const pool = [...AVAILABLE_TASKS];
  const weightByDifficulty: Record<1 | 2 | 3, number> = {
    1: 5,
    2: 3,
    3: 1,
  };

  while (picked.length < size && pool.length > 0) {
    const weights = pool.map((task) => weightByDifficulty[task.difficulty]);
    const total = weights.reduce((sum, current) => sum + current, 0);
    let roll = Math.random() * total;
    let index = 0;

    for (let i = 0; i < pool.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) {
        index = i;
        break;
      }
    }

    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}

export function drawWeightedTaskBatchByDay(day: number, size = 3): AvailableTask[] {
  const picked: AvailableTask[] = [];
  const pool = [...AVAILABLE_TASKS];
  const lateGameBoost = Math.max(0, day - 1);

  while (picked.length < size && pool.length > 0) {
    const weights = pool.map((task) => {
      if (task.difficulty === 1) return Math.max(1, 5 - Math.floor(lateGameBoost / 2));
      if (task.difficulty === 2) return 3 + Math.floor(lateGameBoost / 3);
      return 1 + Math.floor(lateGameBoost / 2);
    });

    const total = weights.reduce((sum, current) => sum + current, 0);
    let roll = Math.random() * total;
    let index = 0;

    for (let i = 0; i < pool.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) {
        index = i;
        break;
      }
    }

    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}

export interface CraftRecipe {
  id: string;
  name: string;
  requires: Array<{ item: string; amount: number }>;
  output: { module: string; amount: number };
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "r1",
    name: "预训练大脑",
    requires: [
      { item: "杂乱数据", amount: 1 },
      { item: "算力晶体", amount: 1 },
    ],
    output: { module: "预训练大脑", amount: 1 },
  },
  {
    id: "r2",
    name: "RAG 外挂引擎",
    requires: [
      { item: "预训练大脑", amount: 1 },
      { item: "联网凭证", amount: 1 },
    ],
    output: { module: "RAG 外挂引擎", amount: 1 },
  },
];
