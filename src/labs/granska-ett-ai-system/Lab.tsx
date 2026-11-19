import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, Panel } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { chapters } from '../../course/chapters';
import { routes } from '../../course/routes';
import {
  MIN_EVIDENCE,
  buildReport,
  checklist,
  completeness,
  completenessText,
  emptyProject,
  evidenceLabs,
  getProblem,
  isProject,
  methods,
  oversightLevels,
  problems,
  recommendations,
  reportFileName,
  reportToText,
  selfChecks,
  wordCount,
  type Project,
} from './logic';
import './project.css';

const stepTitles = [
  'Välj problem',
  'Mål och data',
  'Metod',
  'Belägg från kursen',
  'Fel, risker och insyn',
  'Slutsats och granskningslista',
  'Rapport',
] as const;
const LAST = stepTitles.length - 1;
const REPORT_STEP = LAST;

const isStep = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= LAST;

function TextField({
  label,
  value,
  onChange,
  hint,
  rows = 3,
  minWords,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  minWords?: number;
  testId?: string;
}) {
  const id = useId();
  const words = wordCount(value);
  return (
    <div className="field project-field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        data-testid={testId}
        aria-describedby={[hint ? `${id}-hint` : '', `${id}-count`].filter(Boolean).join(' ')}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="hint word-count" id={`${id}-count`}>
        {words} ord
        {minWords ? (words >= minWords ? ' – ✓ tillräckligt för granskningslistan' : ` – minst ${minWords} ord behövs för granskningslistan`) : ''}
      </p>
    </div>
  );
}

function LineField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="field project-field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <input id={id} type="text" value={value} aria-describedby={hint ? `${id}-hint` : undefined} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RadioCards<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T | '';
  options: { value: T; label: string; detail?: ReactNode; tag?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="radio-cards">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className={`radio-card${o.value === value ? ' is-selected' : ''}`}>
          <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
          <span>
            <strong>{o.label}</strong>
            {o.tag && <span className="suggest-tag"> ★ {o.tag}</span>}
            {o.detail && <span className="radio-detail">{o.detail}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function ReportView({ project, date, className }: { project: Project; date: string; className?: string }) {
  const report = useMemo(() => buildReport(project), [project]);
  return (
    <article className={`project-report ${className ?? ''}`} aria-labelledby="rapport-titel" data-testid="rapport">
      <header>
        <p className="report-eyebrow">AI-verkstaden · Slutprojekt · Påhittat scenario</p>
        <h3 id="rapport-titel" className="report-title">
          {report.title}
        </h3>
        <p className="report-subtitle">{report.subtitle}</p>
        <p className="report-subtitle">Datum: {date}</p>
        <p className="report-status">
          <strong>Status:</strong> {report.status}
        </p>
      </header>
      {report.sections.map((s) => (
        <section key={s.heading} className="report-section">
          <h4>{s.heading}</h4>
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}

export default function Lab() {
  const { mode, labId } = useLab();
  const [project, setProject] = useStoredState<Project>('project', emptyProject, isProject);
  const [step, setStep] = useStoredState<number>('step', 0, isStep);
  const [announce, setAnnounce] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const showAll = mode === 'experiment';
  const date = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const set = (patch: Partial<Project>) => setProject((prev) => ({ ...prev, ...patch }));
  const items = useMemo(() => checklist(project), [project]);
  const status = useMemo(() => completeness(project), [project]);
  const problem = getProblem(project.problem);
  const suggested = useMemo(() => {
    const s = new Set(problem?.suggestedLabs ?? []);
    for (const id of methods.find((m) => m.id === project.method)?.labs ?? []) s.add(id);
    return s;
  }, [problem, project.method]);

  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  const go = (i: number) => {
    const target = Math.min(Math.max(i, 0), LAST);
    if (showAll) {
      document.getElementById(`projekt-del-${target}`)?.focus();
      return;
    }
    moved.current = true;
    setStep(target);
  };

  const stepDone = (i: number) => {
    const forStep = items.filter((it) => it.step === i);
    return forStep.length > 0 && forStep.every((it) => it.done);
  };

  const download = () => {
    const text = reportToText(buildReport(project), date);
    const name = reportFileName(project);
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 2000);
      setAnnounce(`Rapporten laddades ner som ${name}.`);
    } catch {
      setAnnounce('Det gick inte att ladda ner filen i den här webbläsaren. Använd Skriv ut rapport i stället.');
    }
  };

  const print = () => {
    setAnnounce('Utskriftsdialogen öppnas. Välj "Spara som PDF" om du vill spara rapporten som fil.');
    window.print();
  };

  const evidenceCount = Object.keys(project.evidence).length;

  const bodies: ReactNode[] = [
    // 0 – problem
    <>
      <p>
        Välj ett AI-system att granska. Alla problem och organisationer är <strong>påhittade</strong>. Du kan också hitta på ett eget – men använd inga verkliga
        personer eller personuppgifter.
      </p>
      <RadioCards
        legend="Vilket system vill du granska?"
        name={`${labId}-problem`}
        value={project.problem}
        onChange={(v) => set({ problem: v, method: project.method || (getProblem(v)?.suggestedMethod ?? '') })}
        options={problems.map((p) => ({
          value: p.id,
          label: p.title,
          detail: (
            <>
              <em>{p.organisation}.</em> {p.description}
            </>
          ),
        }))}
      />
      {project.problem === 'eget' && (
        <div className="custom-problem">
          <LineField label="Rubrik för ditt egna problem" value={project.customTitle} onChange={(v) => set({ customTitle: v })} />
          <TextField
            label="Beskriv systemet: vad ska det göra, var och för vem?"
            value={project.customDescription}
            onChange={(v) => set({ customDescription: v })}
            minWords={8}
            hint="Skriv att organisationen är påhittad."
          />
        </div>
      )}
      <LineField
        label="Namn eller initialer (frivilligt)"
        value={project.authors}
        onChange={(v) => set({ authors: v })}
        hint="Visas bara i din rapport. Arbetar ni i par kan ni skriva båda. Skriv inga andra personuppgifter."
      />
    </>,
    // 1 – mål och data
    <>
      {!problem && <p className="callout callout-tips">Välj först ett problem i steg 1 så får du stödfrågor här.</p>}
      <TextField label="Mål: vad ska systemet åstadkomma och hur mäts det?" value={project.goal} onChange={(v) => set({ goal: v })} hint={problem?.prompts.goal} minWords={8} testId="falt-mal" />
      <TextField label="Vilka påverkas av systemet?" value={project.affected} onChange={(v) => set({ affected: v })} hint="Tänk på både dem som använder systemet och dem som systemet fattar beslut om." rows={2} minWords={3} />
      <TextField label="Data: vilka uppgifter behövs, varifrån kommer de och om vem är de?" value={project.data} onChange={(v) => set({ data: v })} hint={problem?.prompts.data} minWords={8} testId="falt-data" />
    </>,
    // 2 – metod
    <>
      {problem && <p className="hint">{problem.prompts.method}</p>}
      <RadioCards
        legend="Vilken metod ska systemet bygga på?"
        name={`${labId}-metod`}
        value={project.method}
        onChange={(v) => set({ method: v })}
        options={methods.map((m) => ({ value: m.id, label: m.label, tag: problem?.suggestedMethod === m.id ? 'vanligt val för ditt problem' : undefined }))}
      />
      <TextField label="Varför passar metoden? Vad skulle ett enklare alternativ vara?" value={project.methodWhy} onChange={(v) => set({ methodWhy: v })} minWords={5} testId="falt-metod" />
    </>,
    // 3 – belägg
    <>
      <p>
        Kryssa i minst {MIN_EVIDENCE} labbar som kan ge <strong>belägg</strong> i din granskning, och skriv vad labben visar om just ditt system. Labbar markerade med ★ passar
        ofta för ditt problem eller din metod – men du väljer själv.
      </p>
      <LiveStatus>
        Du har valt {evidenceCount} {evidenceCount === 1 ? 'labb' : 'labbar'}
        {evidenceCount >= MIN_EVIDENCE ? '.' : ` – minst ${MIN_EVIDENCE} behövs.`}
      </LiveStatus>
      {chapters.map((c) => (
        <fieldset key={c.id} className="evidence-group">
          <legend>
            Kapitel {c.number}: {c.title}
          </legend>
          {evidenceLabs
            .filter((l) => l.part === c.id)
            .map((l) => {
              const checked = l.id in project.evidence;
              return (
                <div key={l.id} className={`evidence-item${checked ? ' is-selected' : ''}`}>
                  <label className="option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = { ...project.evidence };
                        if (e.target.checked) next[l.id] = '';
                        else delete next[l.id];
                        set({ evidence: next });
                      }}
                    />
                    <span>
                      <strong>
                        Labb {l.number}. {l.title}
                      </strong>
                      {suggested.has(l.id) && <span className="suggest-tag"> ★ förslag</span>}
                      <span className="radio-detail">Kan visa {l.shows}</span>
                    </span>
                  </label>
                  {checked && (
                    <div className="evidence-note">
                      <TextField
                        label={`Vad visar labb ${l.number} om ditt system?`}
                        value={project.evidence[l.id] ?? ''}
                        onChange={(v) => set({ evidence: { ...project.evidence, [l.id]: v } })}
                        rows={2}
                        minWords={3}
                      />
                      <a href={routes.lab(l.id)} className="hint">
                        Öppna labb {l.number} (i samma flik – ditt projekt är sparat)
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
        </fieldset>
      ))}
    </>,
    // 4 – fel, risker, insyn
    <>
      <TextField
        label="Vilka fel kan systemet göra, och vem drabbas av dem?"
        value={project.errors}
        onChange={(v) => set({ errors: v })}
        hint="Tänk på falskt positiva och falskt negativa utfall, och om felen är vanligare för någon grupp."
        minWords={8}
        testId="falt-fel"
      />
      <TextField
        label="Vilka risker finns för integritet, rättvisa, säkerhet eller ansvar?"
        value={project.risks}
        onChange={(v) => set({ risks: v })}
        hint="Vilka personuppgifter behandlas? Kan systemet räknas som högrisk enligt EU:s AI-förordning? Vem ansvarar när något går fel?"
        minWords={8}
      />
      <RadioCards
        legend="Hur mycket mänsklig insyn behövs?"
        name={`${labId}-insyn`}
        value={project.oversight}
        onChange={(v) => set({ oversight: v })}
        options={oversightLevels.map((o) => ({ value: o.id, label: o.label, detail: o.explanation }))}
      />
      <TextField label="Motivera nivån av mänsklig insyn" value={project.oversightWhy} onChange={(v) => set({ oversightWhy: v })} minWords={5} />
      <Question
        spec={{
          kind: 'choice',
          id: 'insyn-kontroll',
          prompt: 'Kontrollfråga: Ett system föreslår vilka ansökningar som ska kallas till intervju, och en handläggare fattar varje beslut. Vilken nivå av insyn är det?',
          options: [
            { id: 'beslutar', text: 'Människa beslutar', correct: true },
            {
              id: 'overvakar',
              text: 'Människa övervakar',
              feedback: 'Vid övervakning fattar systemet besluten och människan ingriper vid behov. Här fattar handläggaren varje beslut själv – systemet ger bara förslag.',
            },
            {
              id: 'automatiskt',
              text: 'Helt automatiskt',
              feedback: 'Det vore automatiskt om systemet kallade till intervju utan att någon tittade. Här finns en människa som beslutar i varje enskilt fall.',
            },
          ],
          explanation:
            'Systemet ger förslag och en människa fattar beslutet. Tänk ändå på att människor ofta litar för mycket på förslag från datorn – insynen fungerar bara om handläggaren har tid, kunskap och rätt att säga nej.',
        }}
      />
    </>,
    // 5 – slutsats och granskningslista
    <>
      <RadioCards
        legend="Vad rekommenderar du?"
        name={`${labId}-rek`}
        value={project.recommendation}
        onChange={(v) => set({ recommendation: v })}
        options={recommendations.map((r) => ({ value: r.id, label: r.label }))}
      />
      <TextField
        label="Motivera rekommendationen. Vilka villkor eller vilket mer underlag behövs?"
        value={project.conclusion}
        onChange={(v) => set({ conclusion: v })}
        minWords={8}
        testId="falt-slutsats"
      />
      <section className="checklist" aria-labelledby="granskningslista-rubrik">
        <h4 id="granskningslista-rubrik">Granskningslista</h4>
        <LiveStatus className={status.complete ? 'is-complete' : undefined}>
          <span data-testid="fullstandighet">{completenessText(status)}</span>
        </LiveStatus>
        <ul className="check-items">
          {items.map((it) => (
            <li key={it.id} className={it.done ? 'is-done' : 'is-missing'} data-check={it.id}>
              <span className="check-mark" aria-hidden="true">
                {it.done ? '✓' : '✗'}
              </span>
              <span>
                <strong>{it.label}</strong>
                <span className="visually-hidden">{it.done ? ': klar' : ': saknas'}</span>
                {!it.done && (
                  <>
                    {' – '}
                    {it.missing}{' '}
                    <button type="button" className="btn btn-quiet btn-small" onClick={() => go(it.step)}>
                      Gå till steg {it.step + 1}
                      <span className="visually-hidden">: {stepTitles[it.step]}</span>
                    </button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        <fieldset className="criteria">
          <legend>Självkontroll (frivillig) – stämmer det här på din granskning?</legend>
          {selfChecks.map((s) => (
            <label key={s.id} className="option">
              <input
                type="checkbox"
                checked={project.selfCheck.includes(s.id)}
                onChange={(e) => set({ selfCheck: e.target.checked ? [...project.selfCheck, s.id] : project.selfCheck.filter((x) => x !== s.id) })}
              />
              <span>{s.text}</span>
            </label>
          ))}
        </fieldset>
      </section>
    </>,
    // 6 – rapport (själva rapporten renderas nedanför)
    <>
      <p>
        Här är din rapport. Den byggs av allt du har skrivit. <strong>Skriv ut rapport</strong> ger en ren utskrift (välj ”Spara som PDF” för att få en fil).{' '}
        <strong>Ladda ner som textfil</strong> sparar rapporten som vanlig text.
      </p>
      {!status.complete && (
        <p className="callout callout-varning">
          Rapporten är inte komplett: {status.missing.map((m) => m.label.toLowerCase()).join(', ')} saknas. Se granskningslistan i steg 6.
        </p>
      )}
      <div className="row report-actions">
        <button type="button" className="btn btn-primary" onClick={print}>
          <span aria-hidden="true">🖶 </span>Skriv ut rapport
        </button>
        <button type="button" className="btn" onClick={download}>
          <span aria-hidden="true">⤓ </span>Ladda ner som textfil
        </button>
      </div>
    </>,
  ];

  const stepNav = (
    <nav className="project-nav" aria-label="Projektets delar">
      <ol>
        {stepTitles.map((t, i) => {
          const done = i < REPORT_STEP && stepDone(i);
          return (
            <li key={t}>
              <button
                type="button"
                className={`project-nav-btn${i === step ? ' is-current' : ''}`}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => go(i)}
              >
                <span className="nav-num" aria-hidden="true">
                  {done ? '✓' : i + 1}
                </span>
                <span>
                  {i + 1}. {t}
                  {done && <span className="visually-hidden"> (klart)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <div className="project">
      <div className="no-print">
        <p className="project-progress" data-testid="projekt-status">
          <strong>Granskningslista:</strong> {status.done} av {status.total} delar klara. Allt sparas automatiskt i den här webbläsaren.
        </p>
        {!showAll && stepNav}
        {showAll ? (
          stepTitles.map((t, i) => (
            <div key={t} id={`projekt-del-${i}`} tabIndex={-1} className="project-part">
              <Panel title={`Steg ${i + 1}: ${t}`}>{bodies[i]}</Panel>
            </div>
          ))
        ) : (
          <section className="panel project-step" aria-labelledby="projekt-steg-rubrik" data-step={step}>
            <h3 id="projekt-steg-rubrik" className="guided-title" tabIndex={-1} ref={headingRef}>
              Steg {step + 1} av {stepTitles.length}: {stepTitles[step]}
            </h3>
            {bodies[step]}
            <div className="guided-nav">
              <button type="button" className="btn" onClick={() => go(step - 1)} disabled={step === 0}>
                <span aria-hidden="true">← </span>Tillbaka
              </button>
              <button type="button" className="btn btn-primary" onClick={() => go(step + 1)} disabled={step === LAST}>
                {step === LAST - 1 ? 'Visa rapporten' : 'Gå vidare'}
                <span aria-hidden="true"> →</span>
              </button>
            </div>
          </section>
        )}
        <p className="visually-hidden" role="status" aria-live="polite">
          {announce}
        </p>
      </div>
      <ReportView project={project} date={date} className={showAll || step === REPORT_STEP ? undefined : 'print-only'} />
    </div>
  );
}
