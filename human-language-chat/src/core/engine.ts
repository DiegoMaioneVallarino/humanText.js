import type { HumanTextOptions, ResolvedOptions, TransformResult } from './types';
import { presets } from '../profiles/presets';
import { clamp01, createRandom } from '../utils/random';
import { maskProtected } from '../utils/protectText';
import { validateTransformation } from '../validators/semanticValidator';
import { analyzeText } from '../analyzers/textAnalyzer';
import { runPipeline } from './pipeline';
import { analyzeDialect } from '../dialects/detect';

export class HumanText {
  private readonly defaults: HumanTextOptions;

  constructor(defaults: HumanTextOptions = {}) {
    this.defaults = defaults;
  }

  transform(input: string, overrides: HumanTextOptions = {}): TransformResult {
    const merged: HumanTextOptions = { ...this.defaults, ...overrides };
    const profile = merged.profile ?? 'casual';
    if (!(profile in presets)) throw new Error(`Perfil desconocido: ${profile}`);
    const base = presets[profile];
    const options: ResolvedOptions = {
      locale: merged.locale ?? 'es-MX',
      profile,
      intensity: clamp01(merged.intensity ?? 0.75),
      seed: merged.seed ?? 4231,
      settings: {
        vocabulary: clamp01(merged.settings?.vocabulary ?? base.vocabulary),
        grammar: clamp01(merged.settings?.grammar ?? base.grammar),
        dialect: clamp01(merged.settings?.dialect ?? base.dialect),
        discourse: clamp01(merged.settings?.discourse ?? base.discourse),
        punctuation: clamp01(merged.settings?.punctuation ?? base.punctuation),
        spelling: clamp01(merged.settings?.spelling ?? base.spelling),
      },
      preserveMeaning: merged.preserveMeaning ?? true,
    };
    if (typeof input !== 'string') throw new TypeError('El texto debe ser una cadena.');
    const dialectAnalysis = analyzeDialect(input);
    if (!input || options.intensity === 0) {
      return { original: input, text: input, changes: [], analysis: analyzeText(input), options, warnings: [], dialectAnalysis };
    }
    const masked = maskProtected(input);
    const pipeline = runPipeline(masked.masked, { options, rng: createRandom(options.seed) });
    const validation = validateTransformation(masked.masked, pipeline.text, masked.originals.length);
    const reverted = options.preserveMeaning && !validation.valid;
    const output = reverted ? input : masked.restore(pipeline.text);
    return {
      original: input,
      text: output,
      changes: reverted ? [] : pipeline.changes.map((change) => ({
        ...change,
        before: masked.restore(change.before),
        after: masked.restore(change.after),
      })),
      analysis: analyzeText(output),
      options,
      warnings: validation.warnings,
      dialectAnalysis,
    };
  }
}
