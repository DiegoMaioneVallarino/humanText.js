import { useMemo, useState } from 'react';
import { HumanText, profileLabels, presets, dialectLexicon, regionNames } from './index';
import type { Locale, ProfileName, TransformSettings, DialectRegion } from './index';
import './App.css';
import logo from "./assets/logo.png";

const demoText = 'Es fundamental considerar diferentes alternativas antes de tomar una decisión definitiva, ya que cada una presenta sus propias ventajas e inconvenientes. Sin embargo, es importante analizar la situación detenidamente.';

const examples = [
  {
    name: 'Formal',
    text: demoText,
    locale: 'es-MX',
  },
  {
    name: 'Explicación',
    text: 'Para obtener buenos resultados, es necesario tener en cuenta que existen diferentes métodos. Adicionalmente, se recomienda utilizar las herramientas adecuadas.',
    locale: 'es-MX',
  },
  {
    name: 'English',
    text: 'It is important to note that there are numerous additional advantages and disadvantages. However, it is recommended to utilize the available resources.',
    locale: 'en-US',
  },
  { name: 'México', locale: 'es-MX', text: 'Wey, mi jaina salió con mis carnales. Luego tuvimos una bronca y ahora necesito chamba.' },
  { name: 'Colombia', locale: 'es-CO', text: 'Parce, mi parcero consiguió trabajo, pero ahora tenemos una pelea.' },
  { name: 'Argentina', locale: 'es-AR', text: 'Che, vos tenés laburo? Mis amigos dicen que ya se arregló todo.' },
  { name: 'Chile', locale: 'es-CL', text: 'Oye, mi polola tiene pega. ¿Cachái? Igual está fome la situación, po.' },
  { name: 'España', locale: 'es-ES', text: 'Tío, mis colegas consiguieron un curro. Vosotros estáis contentos, vale.' },
] as const;

const settingsLabels: Array<{ key: keyof TransformSettings; label: string; description: string }> = [
  { key: 'vocabulary', label: 'Vocabulario', description: 'Sustituye palabras por alternativas más sencillas.' },
  { key: 'grammar', label: 'Sintaxis', description: 'Reduce algunas construcciones demasiado formales.' },
  { key: 'dialect', label: 'Regionalismos', description: 'Adapta sustantivos y vocativos al país elegido con reglas de contexto.' },
  { key: 'discourse', label: 'Muletillas', description: 'Añade marcadores conversacionales ocasionales.' },
  { key: 'punctuation', label: 'Puntuación', description: 'Reproduce puntuación más relajada.' },
  { key: 'spelling', label: 'Ortografía', description: 'Omite algunas tildes y, raramente, intercambia letras.' },
];

const stepNames: Record<string, string> = {
  vocabulary: 'Vocabulario',
  grammar: 'Sintaxis',
  dialect: 'Regionalismos',
  discourse: 'Muletillas',
  punctuation: 'Puntuación',
  spelling: 'Ortografía',
};

export default function App() {
  const [text, setText] = useState<string>(demoText);
  const [profile, setProfile] = useState<ProfileName>('casual');
  const [locale, setLocale] = useState<Locale>('es-MX');
  const [intensity, setIntensity] = useState(0.85);
  const [seed, setSeed] = useState(4231);
  const [settings, setSettings] = useState<TransformSettings>({ ...presets.casual });
  const [copied, setCopied] = useState(false);
  const [dictionaryQuery, setDictionaryQuery] = useState('');
  const [dictionaryRegion, setDictionaryRegion] = useState<DialectRegion | 'all'>('all');

  const result = useMemo(() => new HumanText({
    profile, locale, intensity, seed, settings, preserveMeaning: true,
  }).transform(text), [text, profile, locale, intensity, seed, settings]);

  const dialect = result.dialectAnalysis;
  const dictionaryItems = useMemo(() => dialectLexicon.filter((item) => {
    const query = dictionaryQuery.trim().toLocaleLowerCase('es');
    return (dictionaryRegion === 'all' || item.region === dictionaryRegion)
      && (!query || [item.form, item.concept, item.meaning, ...(item.variants ?? [])].join(' ').toLocaleLowerCase('es').includes(query));
  }).slice(0, 40), [dictionaryQuery, dictionaryRegion]);

  function chooseProfile(value: ProfileName) {
    setProfile(value);
    setSettings({ ...presets[value] });
  }

  function chooseExample(index: number) {
    const example = examples[index];
    setText(example.text);
    setLocale(example.locale);
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="app-shell">
       <header className="app-header">
        <div className="brand">
          <img src={logo} alt="humanText.js logo" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-title">humanText.js</span>
            <span className="brand-subtitle">Humanize, regionalize and stylize text</span>
          </div>
        </div>
      </header>

      <section className="intro">
        <div className="eyebrow"><span className="status-dot"/> MOTOR LINGÜÍSTICO + ANÁLISIS DIALECTAL</div>
        <h1>Cada región tiene su propia <em>forma de hablar.</em></h1>
        <p>Identifica pistas dialectales, explora regionalismos y transforma frases con reglas que tienen en cuenta la función de cada palabra. Procesamiento local, sin enviar el texto a un servidor.</p>
      </section>

      <div className="workspace">
        <section className="editor-card" aria-label="Editor de texto">
          <div className="section-heading">
            <div><span className="section-kicker">01 / ENTRADA</span><h2>Texto original</h2></div>
            <span className="small-meta">{text.length.toLocaleString('es-MX')} caracteres</span>
          </div>
          <textarea
            className="text-editor"
            aria-label="Texto que se va a transformar"
            spellCheck={false}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribe o pega aquí cualquier texto..."
            maxLength={20000}
          />
          <div className="examples">
            <span>Probar con:</span>
            {examples.map((example, index) => (
              <button key={example.name} type="button" className="chip" onClick={() => chooseExample(index)}>{example.name}</button>
            ))}
          </div>
        </section>

        <section className="editor-card output-card" aria-label="Resultado de transformación">
          <div className="section-heading">
            <div><span className="section-kicker">02 / SALIDA</span><h2>Texto transformado</h2></div>
            <button className="copy-button" type="button" disabled={!result.text} onClick={copyResult}>{copied ? '✓ Copiado' : 'Copiar texto'}</button>
          </div>
          <div className="output-body" aria-live="polite" key={`${seed}-${profile}`}>
            {result.text || <span className="placeholder">El resultado aparecerá aquí.</span>}
          </div>
          <div className="result-footer">
            <span><span className="status-dot"/> {result.changes.length} etapas con cambios</span>
            <span>{result.analysis.words} palabras</span>
          </div>
        </section>
      </div>

      <div className="lower-grid">
        <section className="control-card" aria-label="Controles de transformación">
          <div className="section-heading settings-heading">
            <div><span className="section-kicker">03 / CONFIGURACIÓN</span><h2>Perfil de escritura</h2></div>
            <button className="ghost-button" type="button" onClick={() => setSeed((value) => value + 1)} title="Genera otra variación con la siguiente semilla">↻ Otra variante</button>
          </div>
          <div className="selector-grid">
            <label className="field-label">Estilo
              <select value={profile} onChange={(event) => chooseProfile(event.target.value as ProfileName)}>
                {(Object.keys(profileLabels) as ProfileName[]).map((key) => <option key={key} value={key}>{profileLabels[key]}</option>)}
              </select>
            </label>
            <label className="field-label">Idioma / región
              <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
                <option value="es-MX">Español · México</option>
                <option value="es-CO">Español · Colombia</option>
                <option value="es-AR">Español · Argentina</option>
                <option value="es-CL">Español · Chile</option>
                <option value="es-ES">Español · España</option>
                <option value="en-US">English · US</option>
              </select>
            </label>
          </div>
          <div className="slider-field intensity-field">
            <div className="slider-label"><div><strong>Intensidad global</strong><small>Multiplicador de todos los efectos</small></div><span>{Math.round(intensity * 100)}%</span></div>
            <input type="range" min="0" max="1" step="0.05" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} aria-label="Intensidad global"/>
          </div>
          <div className="sliders-grid">
            {settingsLabels.map(({ key, label, description }) => (
              <div className="slider-field" key={key}>
                <div className="slider-label"><div><strong>{label}</strong><small>{description}</small></div><span>{Math.round(settings[key] * 100)}%</span></div>
                <input type="range" min="0" max="1" step="0.05" value={settings[key]} onChange={(event) => setSettings((prev) => ({ ...prev, [key]: Number(event.target.value) }))} aria-label={label}/>
              </div>
            ))}
          </div>
          <label className="seed-field">Semilla reproducible
            <input type="number" min="0" max="2147483647" step="1" value={seed} onChange={(event) => setSeed(Number(event.target.value) || 0)}/>
          </label>
        </section>

        <aside className="info-stack">
          <section className="info-card">
            <span className="section-kicker">ANÁLISIS</span>
            <h3>Detalles del resultado</h3>
            <div className="metrics"><div><strong>{result.analysis.words}</strong><span>Palabras</span></div><div><strong>{result.analysis.sentences}</strong><span>Oraciones</span></div><div><strong>{result.analysis.averageWordsPerSentence}</strong><span>Palabras / oración</span></div></div>
            <div className="changes-title">Etapas modificadas</div>
            <div className="change-tags">{result.changes.length ? result.changes.map((change) => <span className="change-tag" key={change.step}>{stepNames[change.step]}</span>) : <span className="muted">Sin transformaciones para esta semilla.</span>}</div>
            {result.warnings.map((warning) => <p className="warning" key={warning}>⚠ {warning}</p>)}
          </section>
          <section className="info-card tip-card">
            <span className="section-kicker">NOTA TÉCNICA</span>
            <h3>Errores consistentes, no ruido aleatorio</h3>
            <p>El diccionario conserva el concepto, el rol y las formas regionales. La detección usa indicios léxicos y algunas construcciones; no identifica la nacionalidad de la persona. La equivalencia semántica sigue siendo heurística.</p>
          </section>
        </aside>
      </div>
      <div className="dialect-grid">
        <section className="control-card dialect-panel" aria-label="Analizador dialectal">
          <div className="section-heading"><div><span className="section-kicker">04 / ANÁLISIS REGIONAL</span><h2>Pistas del texto original</h2></div><span className="small-meta">{dialect.cues.length} señales</span></div>
          <div className="dialect-guess">
            <span className="guess-country">{dialect.detected ? regionNames[dialect.detected] : 'Región indeterminada'}</span>
            <span className="guess-strength">Evidencia {dialect.strength}</span>
          </div>
          {dialect.mixed && <p className="warning">Se detectaron rasgos de varias regiones: podría ser un texto mezclado, citado o estilizado.</p>}
          <div className="candidate-list">
            {dialect.candidates.length ? dialect.candidates.map((candidate) => (
              <div className="candidate-row" key={candidate.region}>
                <span>{regionNames[candidate.region]}</span><div className="candidate-track"><div style={{ width: `${Math.round(candidate.score / (dialect.candidates[0]?.score || 1) * 100)}%` }}/></div>
                <span>{candidate.score.toFixed(1)} pts</span>
              </div>
            )) : <p className="muted">No se encontraron indicadores específicos en esta muestra.</p>}
          </div>
          <div className="changes-title">Palabras y construcciones encontradas</div>
          <div className="cue-list">
            {dialect.cues.length ? dialect.cues.map((cue, index) => (
              <div className="cue" key={`${cue.start}-${cue.term}-${index}`} title={cue.note ?? cue.meaning}>
                <strong>{cue.term}</strong><span>{regionNames[cue.region]} · {cue.role} · {cue.meaning}</span>
              </div>
            )) : <span className="muted">Prueba escribiendo «wey», «parce», «jaina», «vos tenés» o «vosotros estáis».</span>}
          </div>
          <p className="disclaimer">{dialect.disclaimer} Los puntajes son heurísticos, no probabilidades calibradas.</p>
        </section>
        <section className="control-card dictionary-panel" aria-label="Diccionario regional">
          <div className="section-heading"><div><span className="section-kicker">05 / LÉXICO SEMÁNTICO</span><h2>Diccionario de regionalismos</h2></div><span className="small-meta">{dialectLexicon.length} entradas iniciales</span></div>
          <div className="dictionary-filters">
            <input value={dictionaryQuery} onChange={(e) => setDictionaryQuery(e.target.value)} placeholder="Buscar palabra o significado" aria-label="Buscar en diccionario" />
            <select value={dictionaryRegion} onChange={(e) => setDictionaryRegion(e.target.value as DialectRegion | 'all')} aria-label="Filtrar región">
              <option value="all">Todas las regiones</option>
              <option value="es-MX">México</option><option value="es-CO">Colombia</option><option value="es-AR">Argentina</option><option value="es-CL">Chile</option><option value="es-ES">España</option>
            </select>
          </div>
          <div className="dictionary-list">
            {dictionaryItems.map((entry) => (
              <div className="dictionary-entry" key={entry.id}>
                <div><strong>{entry.form}</strong><small>{entry.role} · {entry.register} · {entry.region === 'general' ? 'general' : regionNames[entry.region]}</small></div>
                <p>{entry.meaning}{entry.note ? <span className="dictionary-note"> · {entry.note}</span> : null}</p>
                {entry.source && <a href={entry.source} target="_blank" rel="noopener noreferrer">Referencia</a>}
              </div>
            ))}
            {!dictionaryItems.length && <p className="muted">Sin entradas para este filtro.</p>}
          </div>
          <p className="disclaimer">Diccionario de demostración, curado manualmente: no todas las palabras son exclusivas de una región. Se ampliará con acepciones y metadatos.</p>
        </section>
      </div>
      <footer>HumanText.js · Motor experimental basado en reglas. No certifica autoría humana ni resultados frente a detectores de IA.</footer>
    </main>
  );
}
