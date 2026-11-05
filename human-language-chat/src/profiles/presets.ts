import type { ProfileName, TransformSettings } from '../core/types';

export const presets: Record<ProfileName, TransformSettings> = {
  neutral: { vocabulary: 0.25, grammar: 0.1, dialect: 0, discourse: 0, punctuation: 0, spelling: 0 },
  casual: { vocabulary: 0.7, grammar: 0.5, dialect: 0.6, discourse: 0.35, punctuation: 0.3, spelling: 0.18 },
  chat: { vocabulary: 0.7, grammar: 0.55, dialect: 0.85, discourse: 0.65, punctuation: 0.65, spelling: 0.55 },
  simple: { vocabulary: 0.9, grammar: 0.75, dialect: 0.25, discourse: 0.3, punctuation: 0.4, spelling: 0.35 },
};

export const profileLabels: Record<ProfileName, string> = {
  neutral: 'Neutral',
  casual: 'Casual',
  chat: 'Chat informal',
  simple: 'Vocabulario sencillo',
};
