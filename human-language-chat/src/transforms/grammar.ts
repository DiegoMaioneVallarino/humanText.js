import type { TextTransform } from '../core/types';

type Rule = readonly [RegExp, string];
const spanishRules: Rule[] = [
  [/\bcabe destacar que\b/giu, 'lo que pasa es que'],
  [/\bes necesario tener en cuenta que\b/giu, 'hay que tener en cuenta que'],
  [/\bes posible que\b/giu, 'puede que'],
  [/\bexisten diversas\b/giu, 'hay varias'],
  [/\bexisten diferentes\b/giu, 'hay varias'],
  [/\bse recomienda\b/giu, 'conviene'],
  [/\bde esta manera\b/giu, 'así'],
];
const englishRules: Rule[] = [
  [/\bit is important to note that\b/giu, 'the thing is,'],
  [/\bit is possible that\b/giu, 'maybe'],
  [/\bthere are numerous\b/giu, 'there are a lot of'],
  [/\bit is recommended to\b/giu, 'it helps to'],
];

export const transformGrammar: TextTransform = (text, context) => {
  const probability = context.options.intensity * context.options.settings.grammar;
  if (probability === 0) return text;
  const rules = context.options.locale === 'en-US' ? englishRules : spanishRules;
  let result = text;
  for (const [regex, replacement] of rules) {
    result = result.replace(regex, (found) => {
      if (!context.rng.chance(probability)) return found;
      return /^\p{Lu}/u.test(found)
        ? replacement[0].toLocaleUpperCase() + replacement.slice(1)
        : replacement;
    });
  }
  return result;
};
