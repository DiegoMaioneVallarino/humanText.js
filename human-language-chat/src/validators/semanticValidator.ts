import { hasIntactPlaceholders } from '../utils/protectText';

/**
 * Heuristic safety checks only: this is NOT a semantic equivalence model.
 * It protects exact literals and avoids accidentally removing explicit negations.
 */
export function validateTransformation(
  before: string,
  after: string,
  protectedCount: number,
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!hasIntactPlaceholders(after, protectedCount)) {
    warnings.push('La transformación alteró un dato protegido (URL, cifra, fecha, correo o código).');
  }
  const negation = /\b(?:no|nunca|jamás|not|never|without)\b/giu;
  const beforeCount = (before.match(negation) ?? []).length;
  const afterCount = (after.match(negation) ?? []).length;
  if (beforeCount !== afterCount) warnings.push('Cambió una negación del texto original.');
  return { valid: warnings.length === 0, warnings };
}
