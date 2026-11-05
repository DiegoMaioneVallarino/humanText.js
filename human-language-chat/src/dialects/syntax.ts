import type { DialectCue, DialectRegion } from './types';

interface SyntacticPattern {
  regex: RegExp;
  region: DialectRegion;
  description: string;
  weight: number;
  note: string;
}

/** Shallow construction recognizer. Not a dependency parser, and not proof of geographic origin. */
const patterns: readonly SyntacticPattern[] = [
  {
    regex: /\bvos\s+(?:sos|tenés|querés|podés|sabés|hablás|tenias|venís)\b/giu,
    region: 'es-AR', description: 'voseo con conjugación característica', weight: 3.8,
    note: 'El voseo también existe en Uruguay, Centroamérica y otras zonas.',
  },
  {
    regex: /\b(?:vosotros|vosotras)\s+(?:sois|tenéis|queréis|podéis|habláis|estáis|vivís)\b/giu,
    region: 'es-ES', description: 'pronombre vosotros con conjugación plural', weight: 4,
    note: 'Es una pista del español peninsular; también puede aparecer citado o enseñado.',
  },
  {
    regex: /(?:¿\s*)?a\s+poco\s+(?:no\s+)?(?:crees|sabías|sabes|te|que|sí)/giu,
    region: 'es-MX', description: 'construcción interrogativa «¿a poco...?»', weight: 2.6,
    note: 'Uso conversacional asociado a México, no exclusivo.',
  },
  {
    regex: /(?<![\p{L}])sumercé(?![\p{L}])/giu,
    region: 'es-CO', description: 'tratamiento «sumercé»', weight: 3.5,
    note: 'Especialmente asociado con ciertas regiones de Colombia.',
  },
];

export function findSyntacticCues(input: string): DialectCue[] {
  const result: DialectCue[] = [];
  for (const pattern of patterns) {
    for (const match of input.matchAll(pattern.regex)) {
      result.push({ term: match[0], form: pattern.description, region: pattern.region,
        meaning: pattern.description, role: 'construcción', start: match.index,
        end: match.index + match[0].length, weight: pattern.weight, note: pattern.note });
    }
  }
  return result;
}
