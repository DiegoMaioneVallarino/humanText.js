import { useRef, useState } from 'react';
import { deleteCustomTerm, exportCustomTerms, getAllTerms, getCustomTerms, importCustomTerms, saveCustomTerm } from './store';
import type { DialectTerm, DialectRegion, LexicalRole, Register } from '../dialects/types';
import { regionNames } from '../dialects/lexicon';
import './LexiconManager.css';

const empty = () => ({ form: '', meaning: '', concept: '', replaces: '', role: 'sustantivo' as LexicalRole, region: 'es-MX' as DialectRegion | 'general', register: 'coloquial' as Register, gender: 'm' as 'm' | 'f', evidence: 2, vulgarity: 0, politeness: 0.5, example: '', tags: '', replaceable: false });
const roleOptions: LexicalRole[] = ['sustantivo','verbo','adjetivo','adverbio','vocativo','muletilla','expresión','construcción'];
const registerOptions: Register[] = ['estándar','coloquial','jerga','culto','formal','vulgar'];
const regionOptions: Array<DialectRegion | 'general'> = ['general','es-MX','es-CO','es-AR','es-CL','es-ES'];
type Draft = ReturnType<typeof empty>;
export default function LexiconManager({ onUpdate }: { onUpdate: () => void }) {
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }));
  const entries = (showAll ? getAllTerms() : getCustomTerms()).filter((e) => (region === 'all' || e.region === region) && `${e.form} ${e.meaning} ${e.concept} ${(e.replaces ?? []).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const notify = () => { onUpdate(); setError(''); };
  function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      const form = draft.form.trim();
      const concept = draft.concept.trim();
      if (!form || !draft.meaning.trim()) throw new Error('Palabra y significado son obligatorios.');
      const duplicate = getAllTerms().find((e) => e.form.toLowerCase() === form.toLowerCase() && e.region === draft.region && e.concept === concept && e.id !== editing);
      if (duplicate) throw new Error('Ya existe esa palabra con la misma región y concepto.');
      const entry: DialectTerm = { id: editing ?? `user-${crypto.randomUUID()}`, form, meaning: draft.meaning.trim(), concept, replaces: draft.replaces.split(',').map((w) => w.trim()).filter(Boolean), role: draft.role, region: draft.region, register: draft.register, evidence: draft.evidence, gender: draft.role === 'sustantivo' ? draft.gender : undefined, replaceable: draft.replaceable, vulgarity: draft.vulgarity, politeness: draft.politeness, example: draft.example.trim(), tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      saveCustomTerm(entry); notify(); setMessage('Palabra guardada en este navegador.'); setEditing(null); setDraft(empty());
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.'); }
  }
  function edit(entry: DialectTerm) {
    setEditing(entry.id); setDraft({ form: entry.form, meaning: entry.meaning, concept: entry.concept, replaces: (entry.replaces ?? []).join(', '), role: entry.role, region: entry.region, register: entry.register, gender: entry.gender ?? 'm', evidence: entry.evidence, vulgarity: entry.vulgarity ?? 0, politeness: entry.politeness ?? 0.5, example: entry.example ?? '', tags: entry.tags?.join(', ') ?? '', replaceable: !!entry.replaceable }); setError(''); setMessage('');
  }
  function remove(id: string) { if (!window.confirm('¿Eliminar esta palabra personalizada?')) return; try { deleteCustomTerm(id); notify(); setMessage('Entrada eliminada.'); } catch (err) { setError(String(err)); } }
  function download() { const blob = new Blob([exportCustomTerms()], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'humantext-lexicon.json'; a.click(); URL.revokeObjectURL(url); }
  async function upload(file?: File) { if (!file) return; try { if (file.size > 1_000_000) throw new Error('El archivo supera 1 MB.'); const data = JSON.parse(await file.text()); if (!window.confirm('La importación reemplazará tus palabras personalizadas actuales. ¿Continuar?')) return; importCustomTerms(data); notify(); setMessage('Diccionario importado correctamente.'); } catch (err) { setError(err instanceof Error ? err.message : 'Error de importación.'); } finally { if (fileRef.current) fileRef.current.value = ''; } }
  return <section className="lex-manager" aria-label="Administrador de diccionario">
    <div className="section-heading"><div><span className="section-kicker">06 / EDITOR DE LÉXICO</span><h2>Administrador de palabras</h2></div><span className="small-meta">{getCustomTerms().length} personalizadas</span></div>
    <p className="lex-description">Añade acepciones regionales, define su categoría y úsalas en el análisis. Para sustituir una palabra, escríbela en «Sustituye a». No necesitas crear un concepto en inglés.</p>
    <div className="lex-layout">
      <form className="lex-form" onSubmit={save}>
        <h3>{editing ? 'Editar entrada' : 'Nueva palabra'}</h3>
        <label>Palabra o expresión<input maxLength={80} required value={draft.form} onChange={(e) => update('form',e.target.value)} placeholder="jaina" /></label>
        <label>Significado<input maxLength={300} required value={draft.meaning} onChange={(e) => update('meaning',e.target.value)} placeholder="novia" /></label>
        <label>Concepto semántico (opcional, compatibilidad)<input maxLength={100} value={draft.concept} onChange={(e) => update('concept',e.target.value)} placeholder="girlfriend" /><small>Solo se utiliza para compatibilidad con las reglas anteriores.</small></label>
        <label>Sustituye a (separa con comas)<input value={draft.replaces} onChange={(e)=>update('replaces',e.target.value)} placeholder="mamá, madre, amá" /><small>Relaciones directas: no necesitas registrar las palabras originales ni asignarles conceptos.</small></label>
        <div className="lex-pair"><label>Tipo de palabra<select value={draft.role} onChange={(e) => update('role',e.target.value as LexicalRole)}>{roleOptions.map((x)=><option key={x}>{x}</option>)}</select></label><label>Región<select value={draft.region} onChange={(e)=>update('region',e.target.value as DialectRegion | 'general')}>{regionOptions.map((x)=><option value={x} key={x}>{x === 'general' ? 'General' : regionNames[x]}</option>)}</select></label></div>
        <div className="lex-pair"><label>Registro<select value={draft.register} onChange={(e)=>update('register',e.target.value as Register)}>{registerOptions.map((x)=><option key={x}>{x}</option>)}</select></label><label>Género<select disabled={draft.role !== 'sustantivo'} value={draft.gender} onChange={(e)=>update('gender',e.target.value as 'm'|'f')}><option value="m">Masculino</option><option value="f">Femenino</option></select></label></div>
        <label>Ejemplo<input value={draft.example} onChange={(e)=>update('example',e.target.value)} placeholder="Mi jaina llegó temprano" /></label>
        <label>Etiquetas (separadas por coma)<input value={draft.tags} onChange={(e)=>update('tags',e.target.value)} placeholder="norte, juvenil" /></label>
        <div className="lex-pair"><label>Vulgaridad: {Math.round(draft.vulgarity*100)}%<input type="range" min="0" max="1" step="0.05" value={draft.vulgarity} onChange={(e)=>update('vulgarity',Number(e.target.value))} /></label><label>Cortesía: {Math.round(draft.politeness*100)}%<input type="range" min="0" max="1" step="0.05" value={draft.politeness} onChange={(e)=>update('politeness',Number(e.target.value))} /></label></div>
        <label>Fuerza de pista regional: {draft.evidence.toFixed(1)} / 5<input type="range" min="0" max="5" step="0.5" value={draft.evidence} onChange={(e)=>update('evidence',Number(e.target.value))} /></label>
        <label className="lex-checkbox"><input type="checkbox" checked={draft.replaceable} onChange={(e)=>update('replaceable',e.target.checked)}/> Permitir sustitución automática (experimental)</label>
        {error && <p className="lex-error" role="alert">{error}</p>}{message && <p className="lex-success" role="status">{message}</p>}
        <div className="lex-actions"><button className="lex-primary" type="submit">{editing ? 'Guardar cambios' : '+ Añadir palabra'}</button>{editing && <button type="button" onClick={()=>{setEditing(null);setDraft(empty());}}>Cancelar</button>}</div>
      </form>
      <div className="lex-browser"><div className="lex-toolbar"><input placeholder="Buscar término, significado o concepto" value={query} onChange={(e)=>setQuery(e.target.value)} /><select value={region} onChange={(e)=>setRegion(e.target.value)}><option value="all">Todas las regiones</option>{regionOptions.map((x)=><option key={x} value={x}>{x === 'general' ? 'General' : regionNames[x]}</option>)}</select></div>
        <label className="lex-checkbox"><input type="checkbox" checked={showAll} onChange={(e)=>setShowAll(e.target.checked)}/> Mostrar también diccionario base (solo lectura)</label>
        <div className="lex-results">{entries.map((entry)=><div className="lex-result" key={entry.id}><div><strong>{entry.form}</strong><span>{entry.role} · {entry.register} · {entry.region === 'general' ? 'General' : regionNames[entry.region]}</span><p>{entry.meaning} <small>{entry.replaces?.length ? `· sustituye: ${entry.replaces.join(', ')}` : entry.concept ? `· ${entry.concept}` : ''}</small></p></div>{entry.id.startsWith('user-') && <div className="lex-result-actions"><button type="button" onClick={()=>edit(entry)}>Editar</button><button type="button" onClick={()=>remove(entry.id)}>Eliminar</button></div>}</div>)}{!entries.length && <p className="muted">No hay palabras para estos filtros. Añade la primera.</p>}</div>
        <div className="lex-actions"><button type="button" onClick={download}>Exportar JSON</button><button type="button" onClick={()=>fileRef.current?.click()}>Importar JSON</button><input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={(e)=>void upload(e.target.files?.[0])}/></div>
        <p className="disclaimer">Guardado local en este navegador. Exporta JSON para hacer copias de seguridad; no se sincroniza automáticamente con GitHub.</p>
      </div>
    </div>
  </section>;
}
