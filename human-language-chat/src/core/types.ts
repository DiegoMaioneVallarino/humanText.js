export type Locale = 'es-MX' | 'es-CO' | 'es-AR' | 'es-CL' | 'es-ES' | 'en-US';
export type ProfileName = 'neutral' | 'casual' | 'chat' | 'simple';
export type TransformName =
  | 'vocabulary'
  | 'grammar'
  | 'dialect'
  | 'discourse'
  | 'punctuation'
  | 'spelling';

/** Values range from 0 (off) to 1 (maximum). */
export interface TransformSettings {
  vocabulary: number;
  grammar: number;
  dialect: number;
  discourse: number;
  punctuation: number;
  spelling: number;
}

export interface HumanTextOptions {
  locale?: Locale;
  profile?: ProfileName;
  intensity?: number;
  seed?: number;
  settings?: Partial<TransformSettings>;
  preserveMeaning?: boolean;
}

export interface ResolvedOptions {
  locale: Locale;
  profile: ProfileName;
  intensity: number;
  seed: number;
  settings: TransformSettings;
  preserveMeaning: boolean;
}

export interface TextAnalysis {
  characters: number;
  words: number;
  sentences: number;
  averageWordsPerSentence: number;
  uniqueWordRatio: number;
}

export interface TransformChange {
  step: TransformName;
  before: string;
  after: string;
}

export interface TransformResult {
  original: string;
  text: string;
  changes: TransformChange[];
  analysis: TextAnalysis;
  options: ResolvedOptions;
  warnings: string[];
  dialectAnalysis: import('../dialects/types').DialectAnalysis;
}

export interface RandomSource {
  next(): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
}

export interface TransformContext {
  options: ResolvedOptions;
  rng: RandomSource;
}

export type TextTransform = (text: string, context: TransformContext) => string;
