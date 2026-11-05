import type { RandomSource } from '../core/types';

export const clamp01 = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

/** Mulberry32: reproducible non-cryptographic random generator. */
export function createRandom(seed: number): RandomSource {
  let state = (Number.isFinite(seed) ? seed : 12345) >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    chance(probability) {
      return this.next() < clamp01(probability);
    },
    pick<T>(items: readonly T[]): T {
      if (!items.length) throw new Error('Cannot choose from an empty array');
      return items[Math.floor(this.next() * items.length)];
    },
  };
}
