export interface GlossaryTerm {
  id: string;
  keyword: string;
  title: string;
  analogy: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic";
}

export const GLOSSARY_TERMS: GlossaryTerm[];
