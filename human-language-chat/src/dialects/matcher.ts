import { getAllTerms } from '../lexicon/store';
import type { DialectTerm } from './types';

export interface LexicalMatch {
  start: number;
  end: number;
  matched: string;
  entry: DialectTerm;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function contextIsCompatible(text: string, start: number, end: number, entry: DialectTerm): boolean {
  const before = text.slice(Math.max(0, start - 65), start);
  const after = text.slice(end, Math.min(text.length, end + 36));
  const word = text.slice(start, end).toLocaleLowerCase('es');
  const firstInClause = /(?:^|[.!?;\n])\s*$/u.test(before);
  if (entry.role === 'vocativo') {
    // We distinguish 'este wey' and 'mi tío' (ordinary nouns) from an address.
    if (/^(?:el|la|un|una|mi|mis|tu|tus|su|sus|este|ese|aquel|al)\s*$/iu.test(before.slice(Math.max(0, before.length - 10)))) return false;
    return firstInClause || /[,¡¿:]\s*$/u.test(before) || /^\s*[,!?.;:]/u.test(after) || /^\s*$/u.test(after);
  }
  if (entry.id === 'parce-noun') return /\b(?:mi|un|el|ese|este|su|tu)\s*$/iu.test(before);
  if (word === 'colega' || word === 'colegas') return /\b(?:mi|mis|un|unos|el|los|este|estos|ese|esos|su|sus)\s*$/iu.test(before) && !/^\s+de\s+(?:trabajo|oficina|universidad)/iu.test(after);
  if (entry.id === 'po') return /[,!?.;:]\s*$/u.test(before) || /^\s*[,!?.;:]|^\s*$/u.test(after);
  if (entry.id === 'viste') return /^\s*[,!?.;:]|^\s*$/u.test(after);
  if (entry.id === 'vale') return /^\s*[,!?.;:]|^\s*$/u.test(after);
  if (word === 'pega') return /\b(?:la|una|mi|su|esa|busco|buscando|tengo|conseguir|encontrar)\s*$/iu.test(before);
  if (word === 'trabajo') {
    // No convertir automáticamente el verbo 'trabajo' en 'chamba'.
    return /\b(?:el|un|mi|su|este|ese|del|al|para|sin|con|necesito|busco|buscar|tengo|conseguí|encontré)\s*$/iu.test(before);
  }
  if (['lana', 'plata', 'pasta'].includes(word)) {
    return /\b(?:tengo|necesito|ganar|gastar|cobrar|pagar|mucha|poca|sin)\s*$/iu.test(before) && !/\b(?:joya|tejido|oveja|comer|plato)\b/iu.test(after);
  }
  if (word === 'carnal') {
    return /\b(?:mi|un|ese|este|su|el)\s*$/iu.test(before) || /^\s*[,!?.;:]|^\s*$/u.test(after);
  }
  if (word === 'bronca') {
    // 'bronca' también puede significar regaño, rabia o enfado.
    return /\b(?:una|la|esa|aquella|tuvimos|hubo|armó)\s*$/iu.test(before);
  }
  if (word === 'curro') return /\b(?:el|un|mi|su|del|al|tener|tengo|busco|buscar)\s*$/iu.test(before);
  if (word === 'pleito' || word === 'pelea') return !/\b(?:él|ella|yo)\s*$/iu.test(before);
  return true;
}

function buildPatterns() { return getAllTerms().map((entry) => {
  const variants = [entry.form, ...(entry.variants ?? [])];
  return {
    entry,
    regex: new RegExp(`(?<![\\p{L}\\p{N}])(?:${variants.map(escapeRegex).sort((a, b) => b.length - a.length).join('|')})(?![\\p{L}\\p{N}])`, 'giu'),
  };
}); }

export function findDialectMatches(text: string): LexicalMatch[] {
  const candidates: LexicalMatch[] = [];
  for (const { entry, regex } of buildPatterns()) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      const start = match.index;
      const end = start + match[0].length;
      if (contextIsCompatible(text, start, end, entry)) {
        candidates.push({ start, end, matched: match[0], entry });
      }
    }
  }
  candidates.sort((a, b) => a.start - b.start || b.end - a.end || b.entry.evidence - a.entry.evidence);
  const selected: LexicalMatch[] = [];
  for (const candidate of candidates) {
    if (selected.some((item) => candidate.start < item.end && candidate.end > item.start)) continue;
    selected.push(candidate);
  }
  return selected;
}
