import type { DialectRegion, DialectTerm } from './types';

export const regionNames: Record<DialectRegion, string> = {
  'es-MX': 'México',
  'es-CO': 'Colombia',
  'es-AR': 'Argentina',
  'es-CL': 'Chile',
  'es-ES': 'España',
};
export const regions = Object.keys(regionNames) as DialectRegion[];

/**
 * Editorial seed dictionary, not a claim of exclusivity or completeness.
 * Keep examples/definitions brief and link to sources; do not bulk-copy dictionaries.
 * `replaceable` entries use SAME concept and same grammatical function.
 */
export const dialectLexicon: readonly DialectTerm[] = [
  { id: 'amigo', form: 'amigo', concept: 'friend.sg', meaning: 'amigo (singular)', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'm' },
  { id: 'amigos', form: 'amigos', concept: 'friend.pl', meaning: 'amigos (plural)', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'm' },
  { id: 'carnal', form: 'carnal', concept: 'friend.sg', meaning: 'amigo muy cercano', region: 'es-MX', role: 'sustantivo', register: 'jerga', evidence: 3, replaceable: true, gender: 'm', ambiguous: true, source: 'https://www.asale.org/damer/carnal', note: 'También aparece en otras regiones y tiene otras acepciones.' },
  { id: 'carnales', form: 'carnales', concept: 'friend.pl', meaning: 'amigos muy cercanos', region: 'es-MX', role: 'sustantivo', register: 'jerga', evidence: 3, replaceable: true, gender: 'm', source: 'https://www.asale.org/damer/carnal' },
  { id: 'parcero', form: 'parcero', concept: 'friend.sg', meaning: 'amigo cercano', region: 'es-CO', role: 'sustantivo', register: 'jerga', evidence: 4, replaceable: true, gender: 'm', source: 'https://www.asale.org/damer/parcero' },
  { id: 'parce-noun', form: 'parce', concept: 'friend.sg', meaning: 'amigo cercano (como sustantivo)', region: 'es-CO', role: 'sustantivo', register: 'jerga', evidence: 4, replaceable: true, gender: 'm', source: 'https://www.asale.org/damer/parce/' },
  { id: 'parceros', form: 'parceros', concept: 'friend.pl', meaning: 'amigos cercanos', region: 'es-CO', role: 'sustantivo', register: 'jerga', evidence: 4, replaceable: true, gender: 'm', source: 'https://www.asale.org/damer/parcero' },
  { id: 'colega', form: 'colega', concept: 'friend.sg', meaning: 'amigo o compañero', region: 'es-ES', role: 'sustantivo', register: 'coloquial', evidence: 1.5, replaceable: true, gender: 'm', ambiguous: true },
  { id: 'colegas', form: 'colegas', concept: 'friend.pl', meaning: 'amigos o compañeros', region: 'es-ES', role: 'sustantivo', register: 'coloquial', evidence: 1.5, replaceable: true, gender: 'm', ambiguous: true },

  { id: 'novia', form: 'novia', concept: 'girlfriend', meaning: 'pareja femenina', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'f' },
  { id: 'jaina', form: 'jaina', concept: 'girlfriend', meaning: 'novia; especialmente norte de México', region: 'es-MX', role: 'sustantivo', register: 'jerga', evidence: 5, replaceable: true, gender: 'f', source: 'https://www.asale.org/damer/jaina', note: 'Regionalismo especialmente asociado al norte de México y zonas fronterizas.' },
  { id: 'polola', form: 'polola', concept: 'girlfriend', meaning: 'novia', region: 'es-CL', role: 'sustantivo', register: 'coloquial', evidence: 4, replaceable: true, gender: 'f' },

  { id: 'pelea', form: 'pelea', concept: 'fight', meaning: 'enfrentamiento o discusión', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'f' },
  { id: 'bronca', form: 'bronca', concept: 'fight', meaning: 'pelea o discusión', region: 'es-MX', role: 'sustantivo', register: 'coloquial', evidence: 1.7, replaceable: true, gender: 'f', ambiguous: true, note: 'Usado en diversos países; no es prueba exclusiva de México.' },
  { id: 'pleito', form: 'pleito', concept: 'fight', meaning: 'pelea o disputa', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'm' },

  { id: 'trabajo', form: 'trabajo', concept: 'job', meaning: 'empleo o trabajo', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'm', ambiguous: true },
  { id: 'chamba', form: 'chamba', concept: 'job', meaning: 'trabajo, empleo', region: 'es-MX', role: 'sustantivo', register: 'coloquial', evidence: 3, replaceable: true, gender: 'f', note: 'También se usa en otros países.' },
  { id: 'laburo', form: 'laburo', concept: 'job', meaning: 'trabajo, empleo', region: 'es-AR', role: 'sustantivo', register: 'coloquial', evidence: 3.5, replaceable: true, gender: 'm', source: 'https://www.asale.org/damer/laburo', note: 'También se usa en Uruguay, Paraguay y otros países.' },
  { id: 'pega', form: 'pega', concept: 'job', meaning: 'trabajo, empleo', region: 'es-CL', role: 'sustantivo', register: 'coloquial', evidence: 2, replaceable: false, gender: 'f', ambiguous: true, note: 'Se confunde con la forma verbal «pega»; requiere contexto.' },
  { id: 'curro', form: 'curro', concept: 'job', meaning: 'trabajo, empleo (España)', region: 'es-ES', role: 'sustantivo', register: 'coloquial', evidence: 2, replaceable: true, gender: 'm', ambiguous: true, note: 'Tiene significados distintos en otros países.' },

  { id: 'dinero', form: 'dinero', concept: 'money', meaning: 'dinero', region: 'general', role: 'sustantivo', register: 'estándar', evidence: 0, replaceable: true, gender: 'm' },
  { id: 'lana', form: 'lana', concept: 'money', meaning: 'dinero (no fibra textil)', region: 'es-MX', role: 'sustantivo', register: 'coloquial', evidence: 1.5, replaceable: false, gender: 'f', ambiguous: true },
  { id: 'plata', form: 'plata', concept: 'money', meaning: 'dinero (no metal)', region: 'es-CO', role: 'sustantivo', register: 'coloquial', evidence: 0.6, replaceable: false, gender: 'f', ambiguous: true, note: 'Frecuente en muchos países; escasa fuerza geográfica.' },
  { id: 'pasta', form: 'pasta', concept: 'money', meaning: 'dinero (no comida)', region: 'es-ES', role: 'sustantivo', register: 'coloquial', evidence: 0.8, replaceable: false, gender: 'f', ambiguous: true },

  { id: 'wey', form: 'wey', concept: 'address.friend', meaning: 'vocativo coloquial entre amigos', region: 'es-MX', role: 'vocativo', register: 'jerga', evidence: 4.5, replaceable: true, variants: ['güey', 'guey'], source: 'https://www.asale.org/damer/%C2%A1g%C3%BCey%21', note: 'También puede ser insulto o referirse a una tercera persona.' },
  { id: 'parce', form: 'parce', concept: 'address.friend', meaning: 'vocativo amistoso', region: 'es-CO', role: 'vocativo', register: 'jerga', evidence: 4.5, replaceable: true, source: 'https://www.asale.org/damer/parce/', note: 'También se documenta en Ecuador.' },
  { id: 'che', form: 'che', concept: 'address.friend', meaning: 'llamada de atención informal', region: 'es-AR', role: 'vocativo', register: 'coloquial', evidence: 3, replaceable: true, ambiguous: true },
  { id: 'tío', form: 'tío', concept: 'address.friend', meaning: 'vocativo informal', region: 'es-ES', role: 'vocativo', register: 'coloquial', evidence: 2.5, replaceable: true, ambiguous: true, note: 'Fuera de vocativo también significa familiar.' },
  { id: 'weon', form: 'weón', concept: 'address.friend', meaning: 'vocativo informal chileno', region: 'es-CL', role: 'vocativo', register: 'jerga', evidence: 3.5, replaceable: true, variants: ['hueón', 'hueon'], note: 'Puede resultar ofensivo según el contexto.' },

  { id: 'orale', form: 'órale', concept: 'filler.agreement', meaning: 'asombro o asentimiento', region: 'es-MX', role: 'muletilla', register: 'coloquial', evidence: 3, source: 'https://www.asale.org/damer/%C2%A1%C3%A1ndale%21' },
  { id: 'andale', form: 'ándale', concept: 'filler.agreement', meaning: 'asentimiento o exhortación', region: 'es-MX', role: 'muletilla', register: 'coloquial', evidence: 3, source: 'https://www.asale.org/damer/%C2%A1%C3%A1ndale%21' },
  { id: 'cachai', form: 'cachái', concept: 'filler.check', meaning: '¿entiendes?', region: 'es-CL', role: 'muletilla', register: 'coloquial', evidence: 4, variants: ['cachai'] },
  { id: 'po', form: 'po', concept: 'filler.emphasis', meaning: 'partícula coloquial de énfasis', region: 'es-CL', role: 'muletilla', register: 'coloquial', evidence: 1.5, ambiguous: true },
  { id: 'viste', form: 'viste', concept: 'filler.check', meaning: '¿entiendes? (al final de la frase)', region: 'es-AR', role: 'muletilla', register: 'coloquial', evidence: 0.8, ambiguous: true },
  { id: 'vale', form: 'vale', concept: 'filler.agreement', meaning: 'asentimiento', region: 'es-ES', role: 'muletilla', register: 'coloquial', evidence: 1.3, ambiguous: true },
  { id: 'bacano', form: 'bacano', concept: 'positive', meaning: 'estupendo, genial', region: 'es-CO', role: 'expresión', register: 'coloquial', evidence: 2.5, variants: ['bacana'] },
  { id: 'fome', form: 'fome', concept: 'negative', meaning: 'aburrido', region: 'es-CL', role: 'expresión', register: 'coloquial', evidence: 3.5 },
];

export const preferredByRegion: Readonly<Record<DialectRegion, Readonly<Record<string, string>>>> = {
  'es-MX': { 'friend.sg': 'carnal', 'friend.pl': 'carnales', girlfriend: 'jaina', fight: 'bronca', job: 'chamba', money: 'lana', 'address.friend': 'wey' },
  'es-CO': { 'friend.sg': 'parcero', 'friend.pl': 'parceros', girlfriend: 'novia', fight: 'pelea', job: 'trabajo', money: 'plata', 'address.friend': 'parce' },
  'es-AR': { 'friend.sg': 'amigo', 'friend.pl': 'amigos', girlfriend: 'novia', fight: 'pelea', job: 'laburo', money: 'plata', 'address.friend': 'che' },
  'es-CL': { 'friend.sg': 'amigo', 'friend.pl': 'amigos', girlfriend: 'polola', fight: 'pelea', job: 'pega', money: 'dinero', 'address.friend': 'weón' },
  'es-ES': { 'friend.sg': 'colega', 'friend.pl': 'colegas', girlfriend: 'novia', fight: 'pelea', job: 'curro', money: 'pasta', 'address.friend': 'tío' },
};

export function findLexeme(form: string): DialectTerm | undefined {
  const normalized = form.toLocaleLowerCase('es').normalize('NFC');
  return dialectLexicon.find((item) => [item.form, ...(item.variants ?? [])].some((variant) => variant.toLocaleLowerCase('es') === normalized));
}
