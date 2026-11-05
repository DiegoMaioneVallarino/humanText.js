export { HumanText } from './core/engine';
export { analyzeDialect } from './dialects/detect';
export { rewriteDialect } from './dialects/rewrite';
export { dialectLexicon, regionNames, regions } from './dialects/lexicon';
export type { DialectAnalysis, DialectCue, DialectCandidate, DialectRegion, DialectTerm, DialectRewriteResult } from './dialects/types';
export { analyzeText } from './analyzers/textAnalyzer';
export { buildProfileFromSamples } from './profiles/profileBuilder';
export { presets, profileLabels } from './profiles/presets';
export type {
  Locale, ProfileName, TransformSettings, HumanTextOptions, ResolvedOptions,
  TextAnalysis, TransformChange, TransformResult,
} from './core/types';
