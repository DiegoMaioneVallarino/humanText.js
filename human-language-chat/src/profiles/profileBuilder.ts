import type { Locale, TransformSettings } from '../core/types';
import { analyzeText } from '../analyzers/textAnalyzer';
import { analyzeDialect } from '../dialects/detect';
import type { DialectRegion } from '../dialects/types';

/** A first-pass statistical preset, not an identity classifier or handwriting fingerprint. */
export function buildProfileFromSamples(samples: string[], locale: Locale = 'es-MX'): {
  locale: Locale;
  sampleCount: number;
  settings: Partial<TransformSettings>;
  averageWordsPerSentence: number;
  suggestedRegion: DialectRegion | null;
  regionalEvidence: string;
} {
  const valid = samples.map((sample) => sample.trim()).filter(Boolean);
  const combined = valid.join(' ');
  const analysis = analyzeText(combined);
  const regionalAnalysis = analyzeDialect(combined);
  const repeatedFillers = (combined.match(/\b(?:pues|osea|o sea|bueno|tipo|well|like)\b/giu) ?? []).length;
  const punctuationCount = (combined.match(/[.,;:!?]/g) ?? []).length;
  const sentences = Math.max(1, analysis.sentences);
  return {
    locale,
    sampleCount: valid.length,
    settings: {
      grammar: analysis.averageWordsPerSentence <= 12 ? 0.65 : 0.3,
      discourse: Math.min(0.9, repeatedFillers / Math.max(1, analysis.words) * 12),
      punctuation: punctuationCount / sentences < 0.8 ? 0.6 : 0.2,
    },
    averageWordsPerSentence: analysis.averageWordsPerSentence,
    suggestedRegion: regionalAnalysis.detected,
    regionalEvidence: regionalAnalysis.strength,
  };
}
