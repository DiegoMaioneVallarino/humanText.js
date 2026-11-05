import type { TextTransform } from '../core/types';

export const transformPunctuation: TextTransform = (text, context) => {
  const probability = context.options.intensity * context.options.settings.punctuation;
  if (probability === 0) return text;
  let result = text;
  result = result.replace(/;/g, (found) => context.rng.chance(probability * 0.8) ? ',' : found);
  result = result.replace(/\s+—\s+/g, (found) => context.rng.chance(probability * 0.55) ? ', ' : found);
  // Occasional missing comma in a casual message. Never remove sentence-ending punctuation.
  result = result.replace(/([\p{L}]),\s+(?=[\p{L}])/gu, (found, letter: string) =>
    context.rng.chance(probability * 0.18) ? `${letter} ` : found,
  );
  return result;
};
