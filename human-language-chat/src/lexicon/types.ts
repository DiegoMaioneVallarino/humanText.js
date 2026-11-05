export type WordType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "interjection"
  | "filler"
  | "vocative"
  | "phrase";

export type RegisterLevel =
  | "neutral"
  | "informal"
  | "educated"
  | "slang"
  | "vulgar"
  | "formal";

export type RegionCode =
  | "global"
  | "mx"
  | "mx-north"
  | "mx-cdmx"
  | "co"
  | "ar"
  | "cl"
  | "es"
  | "latam";

export type SemanticCategory =
  | "friend"
  | "girlfriend"
  | "boyfriend"
  | "fight"
  | "job"
  | "money"
  | "police"
  | "party"
  | "insult"
  | "greeting"
  | "farewell"
  | "work"
  | "person"
  | "other";

export interface LexiconEntry {
  id: string;
  term: string;
  lemma?: string;
  type: WordType;
  category: SemanticCategory;
  meaning: string;
  regions: RegionCode[];
  register: RegisterLevel[];
  tags?: string[];
  notes?: string;
  vulgarity?: number; // 0 a 1
  politeness?: number; // 0 a 1
  frequency?: number; // 0 a 1
  examples?: string[];
}