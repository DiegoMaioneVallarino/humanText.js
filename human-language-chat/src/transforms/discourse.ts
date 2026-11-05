import type { TextTransform } from '../core/types';
import { esMX } from '../locales/es-MX';
import { esES } from '../locales/es-ES';
import { esCO } from '../locales/es-CO';
import { esAR } from '../locales/es-AR';
import { esCL } from '../locales/es-CL';
import { enUS } from '../locales/en-US';

const lowerableBeginnings = /^(?:Es|Hay|Se|Para|En|El|La|Una|Un|Visita|Escribe|It|There|The|This|We|I)\b/u;

export const transformDiscourse: TextTransform = (text, context) => {
  const probability = context.options.intensity * context.options.settings.discourse;
  if (!text.trim() || probability === 0) return text;
  if (text.trimStart().startsWith('\uE000')) return text;
  const locale = context.options.locale === 'en-US' ? enUS : context.options.locale === 'es-ES' ? esES : context.options.locale === 'es-CO' ? esCO : context.options.locale === 'es-AR' ? esAR : context.options.locale === 'es-CL' ? esCL : esMX;
  if (!context.rng.chance(probability * 0.65)) return text;
  if (/^(?:Pues|Bueno|O sea|Mira|A ver|Oye|Che|Mirá|Pucha|Oiga|Well|So|I mean|Look)[,\s]/iu.test(text)) return text;
  const filler = context.rng.pick(locale.fillers);
  const body = lowerableBeginnings.test(text) ? text[0].toLowerCase() + text.slice(1) : text;
  return filler + body;
};
