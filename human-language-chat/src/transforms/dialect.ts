import type { TextTransform } from '../core/types';
import { rewriteDialect } from '../dialects/rewrite';

/** Regional rewriting is opt-in through intensity/settings and only applies to Spanish locales. */
export const transformDialect: TextTransform = (text, context) => {
  const target = context.options.locale;
  if (target === 'en-US') return text;
  return rewriteDialect(text, target, context.options.intensity * context.options.settings.dialect, context.rng).text;
};
