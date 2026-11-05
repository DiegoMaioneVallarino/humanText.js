import { findDialectMatches } from './matcher';
import { findSyntacticCues } from './syntax';
import { protectedSpans } from '../utils/protectText';
import { regions } from './lexicon';
import type { DialectAnalysis, DialectCandidate, DialectRegion } from './types';

const disclaimer = 'Detecta rasgos regionales del texto, no la nacionalidad, identidad ni ubicación real de quien escribe.';

/** Lexical/sociolinguistic heuristics, not a trained geographic identity classifier. */
export function analyzeDialect(text: string): DialectAnalysis {
  const spans = protectedSpans(text);
  const allowed = (start: number, end: number) => !spans.some((span) => start < span.end && end > span.start);
  const matches = findDialectMatches(text).filter((match) => allowed(match.start, match.end));
  const scores = Object.fromEntries(regions.map((region) => [region, 0])) as Record<DialectRegion, number>;
  const counts = Object.fromEntries(regions.map((region) => [region, 0])) as Record<DialectRegion, number>;
  const frequencies = new Map<string, number>();
  const cues: DialectAnalysis['cues'] = [];
  for (const match of matches) {
    const entry = match.entry;
    if (entry.region === 'general' || entry.evidence <= 0) continue;
    const tokenKey = `${entry.region}:${entry.id}`;
    const frequency = frequencies.get(tokenKey) ?? 0;
    frequencies.set(tokenKey, frequency + 1);
    // Repetition of one word should not outweigh several independent cues.
    const weight = entry.evidence * (entry.ambiguous ? 0.45 : 1) * (frequency === 0 ? 1 : 0.18);
    scores[entry.region] += weight;
    counts[entry.region] += 1;
    cues.push({ term: match.matched, form: entry.form, region: entry.region, meaning: entry.meaning,
      role: entry.role, start: match.start, end: match.end, weight: Number(weight.toFixed(2)), note: entry.note });
  }
  for (const cue of findSyntacticCues(text).filter((item) => allowed(item.start, item.end))) {
    scores[cue.region] += cue.weight;
    counts[cue.region] += 1;
    cues.push(cue);
  }
  cues.sort((a, b) => a.start - b.start || b.weight - a.weight);
  const candidates: DialectCandidate[] = regions
    .map((region) => ({ region, score: Number(scores[region].toFixed(2)), cues: counts[region] }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);
  const top = candidates[0];
  const mixed = Boolean(top && candidates.some((candidate, index) => index > 0 && candidate.score >= Math.max(1.5, top.score * 0.55)));
  const uniqueTopCues = new Set(cues.filter((cue) => cue.region === top?.region).map((cue) => cue.form)).size;
  let strength: DialectAnalysis['strength'] = 'sin pistas';
  if (top) strength = top.score >= 7 && uniqueTopCues >= 2 && !mixed ? 'fuerte' : top.score >= 3 && !mixed ? 'moderada' : 'débil';
  return { detected: top?.region ?? null, strength, candidates, cues, mixed, disclaimer };
}
