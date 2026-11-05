import type { TextTransform } from '../core/types';

type Rule = readonly [RegExp, string];
const spanishRules: Rule[] = [
  [/\bes fundamental\b/giu, 'es importante'],
  [/\bdiferentes alternativas\b/giu, 'otras opciones'],
  [/\bventajas e inconvenientes\b/giu, 'cosas buenas y malas'],
  [/\bantes de tomar una decisión definitiva\b/giu, 'antes de decidir'],
  [/\bsin embargo,\s*/giu, 'pero '],
  [/\bsin embargo\b/giu, 'pero'],
  [/\bdebido a que\b/giu, 'porque'],
  [/\bpor consiguiente\b/giu, 'entonces'],
  [/\ben consecuencia\b/giu, 'por eso'],
  [/\bcon el objetivo de\b/giu, 'para'],
  [/\badicionalmente\b/giu, 'además'],
  [/\baproximadamente\b/giu, 'más o menos'],
  [/\bconsiderar\b/giu, 'ver'],
  [/\butilizar\b/giu, 'usar'],
  [/\brealizar\b/giu, 'hacer'],
  [/\bobtener\b/giu, 'conseguir'],
  [/\bimplementar\b/giu, 'poner en práctica'],
  [/\bfinalizar\b/giu, 'terminar'],
];
const englishRules: Rule[] = [
  [/\bnevertheless\b/giu, 'still'],
  [/\bhowever\b/giu, 'but'],
  [/\bconsequently\b/giu, 'so'],
  [/\bapproximately\b/giu, 'about'],
  [/\butilize\b/giu, 'use'],
  [/\bpurchase\b/giu, 'buy'],
  [/\bcommence\b/giu, 'start'],
  [/\badditional\b/giu, 'extra'],
  [/\badvantages and disadvantages\b/giu, 'good and bad sides'],
];

function keepInitialCapital(original: string, replacement: string): string {
  return /^\p{Lu}/u.test(original)
    ? replacement[0].toLocaleUpperCase() + replacement.slice(1)
    : replacement;
}

export const transformVocabulary: TextTransform = (text, context) => {
  const probability = context.options.intensity * context.options.settings.vocabulary;
  if (probability === 0) return text;
  let result = text;
  const rules = context.options.locale === 'en-US' ? englishRules : spanishRules;
  for (const [pattern, replacement] of rules) {
    result = result.replace(pattern, (found) =>
      context.rng.chance(probability) ? keepInitialCapital(found, replacement) : found,
    );
  }
  return result;
};
