import type { TransformChange, TransformContext, TransformName, TextTransform } from './types';
import { transformVocabulary } from '../transforms/vocabulary';
import { transformGrammar } from '../transforms/grammar';
import { transformDialect } from '../transforms/dialect';
import { transformDiscourse } from '../transforms/discourse';
import { transformPunctuation } from '../transforms/punctuation';
import { transformSpelling } from '../transforms/spelling';

const steps: ReadonlyArray<readonly [TransformName, TextTransform]> = [
  ['vocabulary', transformVocabulary],
  ['grammar', transformGrammar],
  ['dialect', transformDialect],
  ['discourse', transformDiscourse],
  ['punctuation', transformPunctuation],
  ['spelling', transformSpelling],
];

export function runPipeline(input: string, context: TransformContext): {
  text: string;
  changes: TransformChange[];
} {
  let text = input;
  const changes: TransformChange[] = [];
  for (const [step, transform] of steps) {
    const updated = transform(text, context);
    if (updated !== text) changes.push({ step, before: text, after: updated });
    text = updated;
  }
  return { text, changes };
}
