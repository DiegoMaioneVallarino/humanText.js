import { LEXICON } from "./dictionary";
import type { LexiconEntry, RegionCode, RegisterLevel, SemanticCategory, WordType } from "./types";

export interface LexiconSearchOptions {
  term?: string;
  type?: WordType;
  region?: RegionCode;
  register?: RegisterLevel;
  category?: SemanticCategory;
  vulgarOnly?: boolean;
}

export function searchLexicon(options: LexiconSearchOptions = {}): LexiconEntry[] {
  return LEXICON.filter((entry) => {
    if (options.term) {
      const q = options.term.toLowerCase();
      const matchesTerm =
        entry.term.toLowerCase().includes(q) ||
        entry.meaning.toLowerCase().includes(q) ||
        entry.lemma?.toLowerCase().includes(q);
      if (!matchesTerm) return false;
    }

    if (options.type && entry.type !== options.type) return false;
    if (options.region && !entry.regions.includes(options.region)) return false;
    if (options.register && !entry.register.includes(options.register)) return false;
    if (options.category && entry.category !== options.category) return false;
    if (options.vulgarOnly && !(entry.vulgarity && entry.vulgarity >= 0.4)) return false;

    return true;
  });
}

export function getRegionalVariant(
  category: SemanticCategory,
  region: RegionCode,
  preferredRegister?: RegisterLevel
): LexiconEntry | undefined {
  const matches = LEXICON.filter((entry) => {
    const sameCategory = entry.category === category;
    const sameRegion = entry.regions.includes(region) || entry.regions.includes("global");
    const sameRegister = preferredRegister ? entry.register.includes(preferredRegister) : true;
    return sameCategory && sameRegion && sameRegister;
  });

  return matches.sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0))[0];
}