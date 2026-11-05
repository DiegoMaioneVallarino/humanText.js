import { findDialectMatches } from './matcher';
import type { LexicalMatch } from './matcher';
import { preferredByRegion } from './lexicon';
import { getCustomTerms } from '../lexicon/store';
import type { DialectRegion, DialectRewriteResult, DialectRewriteChange } from './types';
import type { RandomSource } from '../core/types';
import { clamp01 } from '../utils/random';
import { protectedSpans } from '../utils/protectText';

const genders: Record<string, 'm' | 'f'> = {
  carnal: 'm', carnales: 'm', parcero: 'm', parceros: 'm', amigo: 'm', amigos: 'm', colega: 'm', colegas: 'm',
  novia: 'f', jaina: 'f', polola: 'f', bronca: 'f', pelea: 'f', pleito: 'm',
  chamba: 'f', laburo: 'm', curro: 'm', pega: 'f', trabajo: 'm', dinero: 'm', lana: 'f', plata: 'f', pasta: 'f',
};

function caseLike(value: string, original: string): string {
  if (original === original.toLocaleUpperCase('es') && original !== original.toLocaleLowerCase('es')) return value.toLocaleUpperCase('es');
  if (/^\p{Lu}/u.test(original)) return value[0].toLocaleUpperCase('es') + value.slice(1);
  return value;
}

function adaptArticle(article: string, target: string): string {
  const gender = getCustomTerms().find((entry) => entry.form === target)?.gender ?? genders[target];
  if (!gender || !article) return article;
  const lower = article.toLocaleLowerCase('es');
  const equivalent: Record<string, [string, string]> = {
    el: ['el', 'la'], la: ['el', 'la'], un: ['un', 'una'], una: ['un', 'una'],
    los: ['los', 'las'], las: ['los', 'las'], unos: ['unos', 'unas'], unas: ['unos', 'unas'],
  };
  const pair = equivalent[lower];
  return pair ? caseLike(pair[gender === 'm' ? 0 : 1], article) : article;
}


function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** User-defined substitutions take priority over the curated legacy lexicon. */
function directMatches(input: string, target: DialectRegion): Array<LexicalMatch & { directTarget: string }> {
  const found: Array<LexicalMatch & { directTarget: string }> = [];
  for (const entry of getCustomTerms()) {
    if (entry.region !== target || !entry.replaceable) continue;
    for (const source of entry.replaces ?? []) {
      const value = source.trim();
      if (!value) continue;
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(value)}(?![\\p{L}\\p{N}])`, 'giu');
      for (const match of input.matchAll(pattern)) {
        found.push({ start: match.index, end: match.index + match[0].length, matched: match[0], entry, directTarget: entry.form });
      }
    }
  }
  return found.sort((a, b) => a.start - b.start || b.end - a.end);
}

/** Changes only curated meaning-equivalent lexical items; preserves unrecognized text. */
export function rewriteDialect(input: string, target: DialectRegion, intensity = 1, rng?: RandomSource): DialectRewriteResult {
  const spans = protectedSpans(input);
  const protectedMatch = (match: LexicalMatch) => spans.some((span) => match.start < span.end && match.end > span.start);
  const direct = directMatches(input, target).filter((match) => !protectedMatch(match));
  const matches: Array<LexicalMatch & { directTarget?: string }> = [];
  // Direct substitutions win on overlap. Apply the same non-overlap rule to legacy matches.
  for (const match of [...direct, ...findDialectMatches(input).filter((match) => !protectedMatch(match))]) {
    if (!matches.some((item) => match.start < item.end && match.end > item.start)) matches.push(match);
  }
  matches.sort((a, b) => a.start - b.start);
  const changes: DialectRewriteChange[] = [];
  const probability = clamp01(intensity);
  let text = input;
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { entry, matched, start, end, directTarget } = matches[i];
    if (!entry.replaceable || !probability || (rng && !rng.chance(probability))) continue;
    // Avoid edits that require complex agreement not modeled in the MVP.
    const chosen = directTarget ?? getCustomTerms().find((term) => term.region === target && term.concept === entry.concept && term.replaceable && term.role === entry.role)?.form ?? preferredByRegion[target][entry.concept];
    if (!chosen || chosen.toLocaleLowerCase('es') === matched.toLocaleLowerCase('es')) continue;
    if (!directTarget && entry.concept === 'address.friend' && target === 'es-CL') continue; // risk of inadvertently offensive terms
    const replacement = caseLike(chosen, matched);
    let replacementStart = start;
    let replacementEnd = end;
    let updated = replacement;
    // Masculine/feminine article agreement, including 'un trabajo' -> 'una chamba'.
    // Do not change possessives or non-adjacent words.
    if (entry.role === 'sustantivo') {
      const before = text.slice(0, start);
      const article = /\b(el|la|un|una|los|las|unos|unas)(\s+)$/iu.exec(before);
      if (article) {
        replacementStart = start - article[0].length;
        updated = adaptArticle(article[1], chosen) + article[2] + replacement;
      }
    }
    const oldGender = directTarget ? undefined : entry.gender;
    const newGender = getCustomTerms().find((term) => term.form === chosen)?.gender ?? genders[chosen];
    if (oldGender && newGender && oldGender !== newGender) {
      const following = /^(\s+)(remot[oa]|nuev[oa]|larg[oa]|dur[oa]|pesad[oa]|buen[oa]|mal[oa]|complicad[oa]|fij[oa])\b/iu.exec(text.slice(end));
      if (following) {
        const adjective = following[2];
        const changedAdjective = adjective.slice(0, -1) + (newGender === 'f' ? 'a' : 'o');
        updated += following[1] + caseLike(changedAdjective, adjective);
        replacementEnd += following[0].length;
      }
    }
    const from = text.slice(replacementStart, replacementEnd);
    text = text.slice(0, replacementStart) + updated + text.slice(replacementEnd);
    changes.push({ concept: entry.concept, from, to: updated, start: replacementStart, end: replacementEnd });
  }
  return { text, changes: changes.reverse() };
}
