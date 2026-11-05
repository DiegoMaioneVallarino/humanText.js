import { dialectLexicon } from '../dialects/lexicon';
import type { DialectTerm, DialectRegion, LexicalRole, Register } from '../dialects/types';

const KEY = 'humantext.lexicon.custom.v1';
let custom: DialectTerm[] = [];
export const getCustomTerms = (): DialectTerm[] => [...custom];
export const getAllTerms = (): DialectTerm[] => [...dialectLexicon, ...custom];
export function loadCustomTerms(): DialectTerm[] {
  try {
    const raw = localStorage.getItem(KEY);
    custom = raw ? validateCollection(JSON.parse(raw)) : [];
  } catch { custom = []; }
  return getCustomTerms();
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(custom)); } catch { throw new Error('No se pudo guardar en este navegador.'); } }
const roles: LexicalRole[] = ['sustantivo','verbo','adjetivo','adverbio','vocativo','muletilla','expresión','construcción'];
const registers: Register[] = ['estándar','coloquial','jerga','culto','formal','vulgar'];
const regions: Array<DialectRegion | 'general'> = ['general','es-MX','es-CO','es-AR','es-CL','es-ES'];
function valid(value: unknown): value is DialectTerm {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<DialectTerm>;
  return typeof e.id === 'string' && e.id.length <= 120 && typeof e.form === 'string' && e.form.trim().length > 0 && e.form.length <= 80 && typeof e.concept === 'string' && e.concept.length <= 100 && typeof e.meaning === 'string' && e.meaning.length <= 300 && roles.includes(e.role as LexicalRole) && registers.includes(e.register as Register) && regions.includes(e.region as DialectRegion) && typeof e.evidence === 'number' && Number.isFinite(e.evidence) && e.evidence >= 0 && e.evidence <= 5 && (!e.gender || ['m','f'].includes(e.gender)) && (e.replaces === undefined || (Array.isArray(e.replaces) && e.replaces.length <= 100 && e.replaces.every((word) => typeof word === 'string' && word.trim().length > 0 && word.length <= 80)));
}
function validateCollection(data: unknown): DialectTerm[] {
  if (!Array.isArray(data) || data.length > 5000 || !data.every(valid)) throw new Error('Formato de diccionario inválido');
  return data;
}
export function saveCustomTerm(entry: DialectTerm) {
  if (!valid(entry)) throw new Error('Completa los campos obligatorios correctamente.');
  if (dialectLexicon.some((e) => e.id === entry.id)) throw new Error('No puedes sobrescribir una entrada base.');
  const old = custom;
  custom = [...custom.filter((e) => e.id !== entry.id), entry];
  try { persist(); } catch (error) { custom = old; throw error; }
}
export function deleteCustomTerm(id: string) {
  const old = custom;
  custom = custom.filter((e) => e.id !== id);
  try { persist(); } catch (error) { custom = old; throw error; }
}
export function importCustomTerms(data: unknown) {
  const entries = validateCollection(data);
  const ids = new Set<string>();
  for (const e of entries) {
    if (ids.has(e.id) || dialectLexicon.some((base) => base.id === e.id)) throw new Error('Hay identificadores repetidos o reservados.');
    ids.add(e.id);
  }
  const old = custom; custom = entries;
  try { persist(); } catch (error) { custom = old; throw error; }
}
export function exportCustomTerms() { return JSON.stringify(custom, null, 2); }
