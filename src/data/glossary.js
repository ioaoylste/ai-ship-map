export const GLOSSARY_TERMS = [
  {
    id: "attention",
    keyword: "注意力机制 (Attention)",
    title: "Attention (注意力机制)",
    analogy: "一目十行的超级阅读术",
    description:
      "让模型在看一长串句子时，知道哪些词才是重点。就像你在一群人中瞬间锁定那个喊你名字的人。",
    icon: "👁️",
    rarity: "common",
  },
  {
    id: "hallucination",
    keyword: "幻觉 (Hallucination)",
    title: "Hallucination (模型幻觉)",
    analogy: "一本正经地瞎编",
    description:
      "模型根据概率续写时，看起来很自信，但内容可能完全不真实。需要检索、护栏和校验机制兜底。",
    icon: "🌀",
    rarity: "epic",
  },
  {
    id: "rag",
    keyword: "RAG (检索增强生成)",
    title: "RAG (检索增强生成)",
    analogy: "先翻资料再回答",
    description:
      "先去外部知识库检索相关内容，再把结果喂给模型作答，能显著降低过时和胡编的概率。",
    icon: "🪝",
    rarity: "rare",
  },
  {
    id: "context_window",
    keyword: "上下文窗口 (Context Window)",
    title: "Context Window (上下文窗口)",
    analogy: "一次能摊开的草稿纸大小",
    description:
      "模型单次能看到的文本长度有限，超出后旧信息会被截断或遗忘，需要分块、摘要和检索策略配合。",
    icon: "📚",
    rarity: "common",
  },
  {
    id: "prompt_injection",
    keyword: "提示词注入 (Prompt Injection)",
    title: "Prompt Injection (提示词注入)",
    analogy: "在命令里偷偷夹带私货",
    description:
      "恶意输入会诱导模型忽略系统规则，输出越权内容。常见防护包括指令分层、过滤器和策略护栏。",
    icon: "🛡️",
    rarity: "epic",
  },
];
