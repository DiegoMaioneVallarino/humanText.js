export type DialectRegion = 'es-MX' | 'es-CO' | 'es-AR' | 'es-CL' | 'es-ES';
export type LexicalRole = 'sustantivo' | 'verbo' | 'adjetivo' | 'adverbio' | 'vocativo' | 'muletilla' | 'expresión' | 'construcción';
export type Register = 'estándar' | 'coloquial' | 'jerga' | 'culto' | 'formal' | 'vulgar';

export interface DialectTerm {
  id: string;
  form: string;
  concept: string;
  meaning: string;
  region: DialectRegion | 'general';
  role: LexicalRole;
  register: Register;
  /** Max 5. Not a population frequency or a statistically calibrated weight. */
  evidence: number;
  /** True only if an unambiguous substitution is supported by the MVP rules. */
  replaceable?: boolean;
  gender?: 'm' | 'f';
  variants?: readonly string[];
  /** Direct source expressions that this term can replace, without a semantic concept. */
  replaces?: string[];
  /** If true, score as weak evidence outside a contextual pattern. */
  ambiguous?: boolean;
  note?: string;
  source?: string;
  vulgarity?: number;
  politeness?: number;
  tags?: string[];
  example?: string;
}

export interface DialectCue {
  term: string;
  form: string;
  region: DialectRegion;
  meaning: string;
  role: LexicalRole;
  start: number;
  end: number;
  weight: number;
  note?: string;
}

export interface DialectCandidate {
  region: DialectRegion;
  score: number;
  cues: number;
}

export interface DialectAnalysis {
  detected: DialectRegion | null;
  strength: 'sin pistas' | 'débil' | 'moderada' | 'fuerte';
  candidates: DialectCandidate[];
  cues: DialectCue[];
  mixed: boolean;
  disclaimer: string;
}

export interface DialectRewriteChange {
  concept: string;
  from: string;
  to: string;
  start: number;
  end: number;
}

export interface DialectRewriteResult {
  text: string;
  changes: DialectRewriteChange[];
}
