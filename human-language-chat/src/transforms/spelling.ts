import type { TextTransform } from '../core/types';

// Short ambiguous words (e.g. sí/si, él/el) are intentionally excluded.
const ambiguous = new Set(['sí', 'sé', 'tú', 'él', 'té', 'qué', 'cómo', 'cuándo', 'dónde', 'quién', 'cuál', 'aún', 'dé', 'mí']);

function stripAccents(word: string): string {
  const map: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };
  return word.replace(/[áéíóúÁÉÍÓÚ]/g, (letter) => map[letter]);
}

export const transformSpelling: TextTransform = (text, context) => {
  const probability = context.options.intensity * context.options.settings.spelling;
  if (probability === 0) return text;
  return text.replace(/\p{L}+/gu, (word, offset: number, whole: string) => {
    const lower = word.toLocaleLowerCase();
    if (word.length < 4 || ambiguous.has(lower) || /^[A-ZÁÉÍÓÚÑ]{2,}$/.test(word)) return word;
    // Avoid mutating proper nouns and text immediately following a placeholder.
    if (/^\p{Lu}/u.test(word)) {
      const sentenceStart = offset === 0 || /[.!?]\s*$/u.test(whole.slice(0, offset));
      const commonStart = /^(?:Es|Hay|Se|Para|En|El|La|Una|Un|Visita|Escribe|Pues|Bueno|O|Mira|A|It|There|The|This|We|Well|So)$/u.test(word);
      if (!sentenceStart || !commonStart) return word;
    }
    let changed = word;
    if (/[áéíóúÁÉÍÓÚ]/u.test(changed) && context.rng.chance(probability * 0.85)) {
      changed = stripAccents(changed);
    }
    // Rare adjacent-key style transposition, only at high spelling settings.
    if (changed.length >= 7 && context.rng.chance(Math.max(0, probability - 0.45) * 0.06)) {
      const at = 1 + Math.floor(context.rng.next() * (changed.length - 3));
      if (changed[at] !== changed[at + 1]) {
        changed = changed.slice(0, at) + changed[at + 1] + changed[at] + changed.slice(at + 2);
      }
    }
    return changed;
  });
};
