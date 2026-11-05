import type { TextAnalysis } from '../core/types';
import { splitSentences, tokenizeWords } from './tokenizer';

export function analyzeText(text: string): TextAnalysis {
  const words = tokenizeWords(text);
  const sentences = splitSentences(text);
  const uniqueWords = new Set(words.map((word) => word.toLocaleLowerCase()));
  return {
    characters: text.length,
    words: words.length,
    sentences: sentences.length,
    averageWordsPerSentence: sentences.length ? Number((words.length / sentences.length).toFixed(1)) : 0,
    uniqueWordRatio: words.length ? Number((uniqueWords.size / words.length).toFixed(2)) : 0,
  };
}
