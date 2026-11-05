import { HumanText } from '../core/engine';
import type { HumanTextOptions } from '../core/types';
import { analyzeDialect } from '../dialects/detect';
import { rewriteDialect } from '../dialects/rewrite';
import { dialectLexicon, regionNames } from '../dialects/lexicon';
import type { DialectRegion } from '../dialects/types';

const engine = new HumanText();

/** Fetch-compatible route handler, ready to mount in a future HTTP adapter. */
export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '/health' && request.method === 'GET') {
    return Response.json({ ok: true, service: 'humantext' });
  }
  if (url.pathname === '/v1/dialect/lexicon' && request.method === 'GET') {
    const query = (url.searchParams.get('q') ?? '').toLocaleLowerCase('es');
    const region = url.searchParams.get('region');
    return Response.json(dialectLexicon.filter((entry) =>
      (!region || region === entry.region) && (!query || `${entry.form} ${entry.meaning} ${entry.concept}`.toLocaleLowerCase('es').includes(query)),
    ));
  }
  if ((url.pathname === '/v1/dialect/detect' || url.pathname === '/v1/dialect/rewrite') && request.method === 'POST') {
    try {
      const body: unknown = await request.json();
      if (!body || typeof body !== 'object') return Response.json({ error: 'JSON inválido' }, { status: 400 });
      const payload = body as Record<string, unknown>;
      if (typeof payload.text !== 'string' || payload.text.length > 20000) {
        return Response.json({ error: 'text debe ser texto de máximo 20,000 caracteres' }, { status: 400 });
      }
      if (url.pathname.endsWith('/detect')) return Response.json(analyzeDialect(payload.text));
      const target = payload.target;
      if (typeof target !== 'string' || !(target in regionNames)) {
        return Response.json({ error: 'target debe ser es-MX, es-CO, es-AR, es-CL o es-ES' }, { status: 400 });
      }
      if (payload.intensity !== undefined && (typeof payload.intensity !== 'number' || !Number.isFinite(payload.intensity))) {
        return Response.json({ error: 'intensity debe ser un número de 0 a 1' }, { status: 400 });
      }
      return Response.json(rewriteDialect(payload.text, target as DialectRegion, payload.intensity as number | undefined));
    } catch {
      return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
    }
  }
  if (url.pathname === '/v1/transform' && request.method === 'POST') {
    try {
      const body: unknown = await request.json();
      if (!body || typeof body !== 'object') return Response.json({ error: 'JSON inválido' }, { status: 400 });
      const payload = body as Record<string, unknown>;
      if (typeof payload.text !== 'string' || payload.text.length > 20000) {
        return Response.json({ error: 'text debe ser texto de máximo 20,000 caracteres' }, { status: 400 });
      }
      const options = (payload.options && typeof payload.options === 'object'
        ? payload.options : {}) as HumanTextOptions;
      return Response.json(engine.transform(payload.text, options));
    } catch {
      return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
    }
  }
  return Response.json({ error: 'Ruta no encontrada' }, { status: 404 });
}
