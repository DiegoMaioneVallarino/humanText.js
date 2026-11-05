
import { getCustomTerms } from '../lexicon/store';
import type { DialectRegion } from './types';

export interface DirectReplacement {
  from: string;
  to: string;
  start: number;
  end: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function caseLike(value: string, original: string): string {
  if (original === original.toLocaleUpperCase('es')) {
    return value.toLocaleUpperCase('es');
  }

  if (/^\p{Lu}/u.test(original)) {
    return value[0].toLocaleUpperCase('es') + value.slice(1);
  }

  return value;
}

export function rewriteDirect(
  input: string,
  region: DialectRegion
): {
  text: string;
  changes: DirectReplacement[];
} {
  const entries = getCustomTerms().filter(
    entry =>
      entry.region === region &&
      entry.replaceable &&
      entry.replaces?.length
  );

  const candidates: Array<{
    start: number;
    end: number;
    from: string;
    to: string;
  }> = [];

  for (const entry of entries) {
    for (const original of entry.replaces ?? []) {
      if (!original.trim()) continue;

      const regex = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapeRegex(original)}(?![\\p{L}\\p{N}])`,
        'giu'
      );

      for (const match of input.matchAll(regex)) {
        candidates.push({
          start: match.index,
          end: match.index + match[0].length,
          from: match[0],
          to: caseLike(entry.form, match[0])
        });
      }
    }
  }

  candidates.sort(
    (a, b) => a.start - b.start || b.end - a.end
  );

  const selected: typeof candidates = [];

  for (const candidate of candidates) {
    if (
      selected.some(
        item =>
          candidate.start < item.end &&
          candidate.end > item.start
      )
    ) continue;

    selected.push(candidate);
  }

  let text = input;

  for (const change of [...selected].reverse()) {
    text =
      text.slice(0, change.start) +
      change.to +
      text.slice(change.end);
  }

  return {
    text,
    changes: selected
  };
}
