/** Protect literal data before applying stylistic rules. */
export interface MaskedText {
  masked: string;
  originals: string[];
  restore(text: string): string;
}

// URLs, e-mails, inline code, numbers, percentages and dates are left untouched.
export const PROTECTED = /`[^`\n]+`|https?:\/\/[^\s<>]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d+(?:[.,:/-]\d+)*(?:\s?%)?/giu;
const START = '\uE000';
const END = '\uE001';

export function maskProtected(text: string): MaskedText {
  const originals: string[] = [];
  const masked = text.replace(PROTECTED, (match) => {
    const index = originals.push(match) - 1;
    return `${START}${index}${END}`;
  });
  return {
    masked,
    originals,
    restore(value: string) {
      return value.replace(/\uE000(\d+)\uE001/g, (placeholder, rawIndex: string) => {
        const index = Number(rawIndex);
        return originals[index] ?? placeholder;
      });
    },
  };
}

export function hasIntactPlaceholders(text: string, total: number): boolean {
  for (let index = 0; index < total; index += 1) {
    if (!text.includes(`${START}${index}${END}`)) return false;
  }
  return true;
}

/** Exact spans that regional rewriting/detection must not inspect. */
export function protectedSpans(text: string): Array<{ start: number; end: number }> {
  return Array.from(text.matchAll(PROTECTED), (match) => ({ start: match.index, end: match.index + match[0].length }));
}
