/** Unicode-aware tokenizer for basic statistics. */
export function tokenizeWords(text: string): string[] {
  return text.match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) ?? [];
}

export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?¡¿])\s+/u).map((part) => part.trim()).filter(Boolean);
}
