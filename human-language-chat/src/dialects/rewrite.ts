import { findDialectMatches } from './matcher';
import { preferredByRegion } from './lexicon';
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
  const gender = genders[target];
  if (!gender || !article) return article;
  const lower = article.toLocaleLowerCase('es');
  const equivalent: Record<string, [string, string]> = {
    el: ['el', 'la'], la: ['el', 'la'], un: ['un', 'una'], una: ['un', 'una'],
    los: ['los', 'las'], las: ['los', 'las'], unos: ['unos', 'unas'], unas: ['unos', 'unas'],
  };
  const pair = equivalent[lower];
  return pair ? caseLike(pair[gender === 'm' ? 0 : 1], article) : article;
}

/** Changes only curated meaning-equivalent lexical items; preserves unrecognized text. */
export function rewriteDialect(input: string, target: DialectRegion, intensity = 1, rng?: RandomSource): DialectRewriteResult {
  const spans = protectedSpans(input);
  const matches = findDialectMatches(input).filter((match) => !spans.some((span) => match.start < span.end && match.end > span.start));
  const changes: DialectRewriteChange[] = [];
  const probability = clamp01(intensity);
  let text = input;
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { entry, matched, start, end } = matches[i];
    if (!entry.replaceable || !probability || (rng && !rng.chance(probability))) continue;
    // Avoid edits that require complex agreement not modeled in the MVP.
    const chosen = preferredByRegion[target][entry.concept];
    if (!chosen || chosen.toLocaleLowerCase('es') === matched.toLocaleLowerCase('es')) continue;
    if (entry.concept === 'address.friend' && target === 'es-CL') continue; // risk of inadvertently offensive terms
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
    const oldGender = entry.gender;
    const newGender = genders[chosen];
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
