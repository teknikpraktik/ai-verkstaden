import { useId, useMemo, useState, type ReactNode } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, SelectField, Slider, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import type { Frame, TreeNode } from '../../lib/search';
import {
  addEdge,
  addNode,
  clampWeight,
  emptyGraph,
  exampleGraph,
  hasCycle,
  isGraphModel,
  nodeName,
  pathText,
  problemOf,
  problemText,
  removeEdge,
  removeNode,
  runSearch,
  setWeight,
  slotById,
  slots,
  treeStats,
  MAX_WEIGHT,
  MIN_WEIGHT,
  type GraphModel,
} from './logic';
import './lab.css';

interface View {
  custom: boolean;
  weighted: boolean | null;
  tree: boolean;
  search: boolean;
  editor: boolean;
}

const stepView: View[] = [
  { custom: false, weighted: true, tree: false, search: false, editor: false },
  { custom: false, weighted: true, tree: true, search: false, editor: false },
  { custom: false, weighted: false, tree: true, search: true, editor: false },
  { custom: false, weighted: true, tree: false, search: true, editor: false },
  { custom: true, weighted: null, tree: false, search: true, editor: true },
  { custom: true, weighted: null, tree: true, search: true, editor: false },
];

function GraphView({ g, frame }: { g: GraphModel; frame: Frame | null }) {
  const titleId = useId();
  const order = new Map(frame?.explored.map((id, i) => [id, i + 1]) ?? []);
  const frontier = new Set(frame?.frontier.map((f) => f.id) ?? []);
  const path = frame?.path ?? [];
  const onPath = (a: string, b: string) => path.some((p, i) => i + 1 < path.length && ((p === a && path[i + 1] === b) || (p === b && path[i + 1] === a)));
  const desc = `Graf med ${g.nodes.length} noder och ${g.edges.length} kanter. Start: ${g.start ? nodeName(g.start) : 'ingen'}. Mål: ${g.goal ? nodeName(g.goal) : 'inget'}. Grannlistan under bilden beskriver samma graf i text.`;
  return (
    <svg className="graf-svg" viewBox="0 0 420 300" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{desc}</title>
      {slots
        .filter((s) => !g.nodes.includes(s.id))
        .map((s) => (
          <g key={s.id} aria-hidden="true">
            <circle className="graf-node is-empty" cx={s.x} cy={s.y} r={14} />
            <text x={s.x} y={s.y + 30} textAnchor="middle" fontSize={11} opacity={0.6}>
              {s.name}
            </text>
          </g>
        ))}
      {g.edges.map((e) => {
        const a = slotById.get(e.a)!;
        const b = slotById.get(e.b)!;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={`${e.a}-${e.b}`}>
            <line className={`graf-edge ${onPath(e.a, e.b) ? 'is-path' : ''}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            {g.weighted && (
              <>
                <rect className="graf-weight-bg" x={mx - 17} y={my - 11} width={34} height={22} rx={4} />
                <text x={mx} y={my + 5} textAnchor="middle" fontSize={15} fontWeight={700}>
                  {e.w}
                </text>
              </>
            )}
          </g>
        );
      })}
      {g.nodes.map((id) => {
        const s = slotById.get(id)!;
        const cls = [
          'graf-node',
          path.includes(id) ? 'is-path' : order.has(id) ? 'is-visited' : frontier.has(id) ? 'is-frontier' : '',
          frame?.current === id ? 'is-current' : '',
        ].join(' ');
        const symbol = order.has(id) ? String(order.get(id)) : frontier.has(id) ? '○' : '';
        const tag = [id === g.start ? 'START' : '', id === g.goal ? 'MÅL' : ''].filter(Boolean).join(' · ');
        return (
          <g key={id}>
            <circle className={cls} cx={s.x} cy={s.y} r={16} />
            <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize={14} fontWeight={700}>
              {symbol}
            </text>
            <text className="graf-label" x={s.x} y={s.y - 22} textAnchor="middle" fontSize={15} fontWeight={700}>
              {s.name}
            </text>
            {tag && (
              <text className="graf-label" x={s.x} y={s.y + 33} textAnchor="middle" fontSize={12} fontWeight={800}>
                {tag}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function AdjacencyList({ g }: { g: GraphModel }) {
  if (g.nodes.length === 0) return <p>Grafen är tom.</p>;
  return (
    <ul className="graf-adj" aria-label="Grannlista">
      {g.nodes.map((id) => {
        const nb = g.edges.filter((e) => e.a === id || e.b === id).map((e) => `${nodeName(e.a === id ? e.b : e.a)}${g.weighted ? ` (${e.w})` : ''}`);
        return (
          <li key={id}>
            <strong>{nodeName(id)}</strong>
            {id === g.start ? ' [start]' : ''}
            {id === g.goal ? ' [mål]' : ''}: {nb.length ? nb.join(', ') : 'inga grannar'}
          </li>
        );
      })}
    </ul>
  );
}

const TREE_LIMIT = 120;

function TreeView({ g, depth }: { g: GraphModel; depth: number }) {
  const stats = useMemo(() => treeStats(g, depth), [g, depth]);
  if (!stats) return <p>{problemText[problemOf(g) === 'tom' ? 'tom' : 'ingen-start']}</p>;
  let shown = 0;
  const render = (t: TreeNode): ReactNode => {
    if (shown >= TREE_LIMIT) return null;
    shown++;
    const isGoal = t.id === g.goal;
    const repeated = (stats.counts[t.id] ?? 0) > 1;
    return (
      <li key={`${t.id}-${shown}`}>
        <span className={isGoal ? 'graf-tree-goal' : undefined}>
          {nodeName(t.id)}
          {isGoal && ' ★ mål'}
        </span>
        {g.weighted && t.depth > 0 && <span> (kostnad {t.cost})</span>}
        {t.repeatsAncestor && <span className="graf-tree-cycle"> ↺ finns redan högre upp på grenen (cykel)</span>}
        {!t.repeatsAncestor && repeated && t.depth > 0 && <span> ◆ dubblett</span>}
        {t.children.length > 0 && <ul>{t.children.map(render)}</ul>}
      </li>
    );
  };
  const list = render(stats.tree);
  return (
    <>
      <p data-testid="tradfakta">
        Sökträdet till djup {depth} har <strong>{stats.size} noder</strong>, men grafen har bara {g.nodes.length}. {stats.duplicates} trädnoder är dubbletter, och {stats.cycleRepeats} av dem går tillbaka till en nod som redan finns högre upp på samma gren.
        {g.goal ? ` Målet ${nodeName(g.goal)} finns ${stats.goalCount} gånger.` : ''}
      </p>
      <ul className="graf-tree" tabIndex={0} aria-label={`Sökträd från ${nodeName(g.start!)} till djup ${depth}`}>
        {list}
      </ul>
      {stats.size > TREE_LIMIT && <p className="hint">Trädet är för stort för att visas helt – de första {TREE_LIMIT} noderna visas.</p>}
    </>
  );
}

function Editor({ g, onChange }: { g: GraphModel; onChange: (g: GraphModel) => void }) {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [weight, setWeightField] = useState('10');
  const [message, setMessage] = useState('');
  const nodeOptions = [{ value: '', label: '(välj)' }, ...g.nodes.map((n) => ({ value: n, label: nodeName(n) }))];
  const a = g.nodes.includes(from) ? from : '';
  const b = g.nodes.includes(to) ? to : '';
  return (
    <Panel title="Ändra grafen">
      <fieldset className="graf-nodes">
        <legend>Noder (platserna är fasta)</legend>
        {slots.map((s) => (
          <Toggle
            key={s.id}
            label={s.name}
            checked={g.nodes.includes(s.id)}
            onChange={(on) => {
              onChange(on ? addNode(g, s.id) : removeNode(g, s.id));
              setMessage(on ? `${s.name} lades till.` : `${s.name} och dess kanter togs bort.`);
            }}
          />
        ))}
      </fieldset>
      <div className="graf-form">
        <SelectField label="Från" value={a} options={nodeOptions} onChange={setFrom} />
        <SelectField label="Till" value={b} options={nodeOptions} onChange={setTo} />
        {g.weighted && (
          <div className="field">
            <label htmlFor="graf-vikt">Vikt (minuter)</label>
            <input id="graf-vikt" type="number" inputMode="numeric" min={MIN_WEIGHT} max={MAX_WEIGHT} value={weight} onChange={(e) => setWeightField(e.target.value)} />
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!a || !b) {
              setMessage('Välj två noder först.');
              return;
            }
            const r = addEdge(g, a, b, g.weighted ? clampWeight(Number(weight)) : 1);
            setMessage(r.message);
            if (r.ok) onChange(r.graph);
          }}
        >
          Lägg till kant
        </button>
      </div>
      {g.edges.length > 0 && (
        <table className="table graf-edge-table">
          <caption>Kanter</caption>
          <thead>
            <tr>
              <th scope="col">Kant</th>
              {g.weighted && <th scope="col">Vikt</th>}
              <th scope="col">
                <span className="visually-hidden">Ta bort</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {g.edges.map((e) => {
              const label = `${nodeName(e.a)}–${nodeName(e.b)}`;
              return (
                <tr key={`${e.a}-${e.b}`}>
                  <th scope="row">{label}</th>
                  {g.weighted && (
                    <td>
                      <input
                        type="number"
                        aria-label={`Vikt för ${label}`}
                        min={MIN_WEIGHT}
                        max={MAX_WEIGHT}
                        value={e.w}
                        onChange={(ev) => {
                          const v = Number(ev.target.value);
                          if (Number.isFinite(v) && ev.target.value !== '') onChange(setWeight(g, e.a, e.b, v));
                        }}
                      />
                    </td>
                  )}
                  <td>
                    <button
                      type="button"
                      className="btn"
                      aria-label={`Ta bort kanten ${label}`}
                      onClick={() => {
                        onChange(removeEdge(g, e.a, e.b));
                        setMessage(`Kanten ${label} togs bort.`);
                      }}
                    >
                      Ta bort
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="graf-form">
        <SelectField label="Start" value={g.start ?? ''} options={[{ value: '', label: '(ingen)' }, ...g.nodes.map((n) => ({ value: n, label: nodeName(n) }))]} onChange={(v) => onChange({ ...g, start: v || null })} />
        <SelectField label="Mål" value={g.goal ?? ''} options={[{ value: '', label: '(inget)' }, ...g.nodes.map((n) => ({ value: n, label: nodeName(n) }))]} onChange={(v) => onChange({ ...g, goal: v || null })} />
      </div>
      <Toggle label="Viktade kanter (restid i minuter)" checked={g.weighted} onChange={(w) => onChange({ ...g, weighted: w })} />
      <div className="row">
        <button
          type="button"
          className="btn"
          onClick={() => {
            onChange(exampleGraph);
            setMessage('Exempelgrafen är laddad.');
          }}
        >
          Ladda exemplet
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            onChange(emptyGraph);
            setMessage('Grafen är tömd.');
          }}
        >
          Töm grafen
        </button>
      </div>
      <p className="hint" role="status" aria-live="polite">
        {message}
      </p>
    </Panel>
  );
}

function SearchPanel({ g }: { g: GraphModel }) {
  const result = useMemo(() => runSearch(g), [g]);
  const stepper = useStepper(result?.frames.length ?? 1);
  const problem = problemOf(g);
  const frame = result ? result.frames[Math.min(stepper.index, result.frames.length - 1)]! : null;
  return (
    <Panel title={`Grafsökning med besökta noder: ${g.weighted ? 'uniformkostnadssökning (billigaste väg)' : 'bredden först (minst antal steg)'}`}>
      <div className="graf-map-wrap" tabIndex={0} role="group" aria-label="Grafen (rulla i sidled på smala skärmar)"><GraphView g={g} frame={frame} /></div>
      {problem ? (
        <p className="callout callout-tips" data-testid="resultat">
          {problemText[problem]}
        </p>
      ) : (
        result &&
        frame && (
          <>
            <StepperControls stepper={stepper} label="Stega grafsökningen" />
            <LiveStatus>{frame.message}</LiveStatus>
            <p>
              <strong>Besökta ({frame.explored.length}):</strong> {frame.explored.length ? frame.explored.map(nodeName).join(', ') : '–'}
              <br />
              <strong>Väntar:</strong> {frame.frontier.length ? frame.frontier.map((f) => `${nodeName(f.id)}${g.weighted ? ` (g = ${f.g})` : ''}`).join(', ') : '–'}
            </p>
            {stepper.atEnd && (
              <p data-testid="resultat">
                <strong>Resultat:</strong>{' '}
                {result.path
                  ? `${pathText(result.path)}: ${result.path.length - 1} steg${g.weighted ? `, kostnad ${result.cost}` : ''}. Sökningen besökte ${result.expanded} noder – varje nod högst en gång.`
                  : `det finns ingen väg från ${nodeName(g.start!)} till ${nodeName(g.goal!)}. Sökningen besökte ${result.expanded} noder och sedan var listan med väntande noder tom.`}
              </p>
            )}
          </>
        )
      )}
      <Legend
        items={[
          { swatch: 'var(--visited)', symbol: '2', text: 'Besökt (siffran = ordning)' },
          { swatch: 'var(--frontier)', symbol: '○', text: 'Väntar' },
          { swatch: 'var(--path)', symbol: '', text: 'Funnen väg (tjock linje)' },
        ]}
      />
      <h4>Grafen i text</h4>
      <AdjacencyList g={g} />
      <p>{g.nodes.length > 0 && (hasCycle(g) ? 'Grafen innehåller minst en cykel.' : 'Grafen har inga cykler.')}</p>
    </Panel>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [custom, setCustom] = useStoredState<GraphModel>('graph', exampleGraph, isGraphModel);
  const [depth, setDepth] = useStoredState<number>('depth', 3, (v): v is number => typeof v === 'number' && v >= 1 && v <= 4);

  const view: View = guided ? stepView[Math.min(step, stepView.length - 1)]! : { custom: true, weighted: null, tree: true, search: true, editor: true };
  const g: GraphModel = view.custom ? custom : { ...exampleGraph, weighted: view.weighted ?? exampleGraph.weighted };
  const treeDepth = guided ? 3 : depth;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Hur många gånger dyker målet upp?',
      body: (
        <>
          <p>
            Grafen visar fem orter. Varje kant är en väg med en påhittad restid i minuter. Vi vill från <strong>Västerås</strong> (start) till <strong>Stockholm</strong> (mål).
          </p>
          <p>En sökning som inte minns var den varit ritar upp alla vägar som ett träd: från start, till grannarna, till grannarnas grannar …</p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-trad',
              prompt: 'Hur många gånger tror du Stockholm finns med i ett sådant sökträd som går tre steg ut från Västerås?',
              options: [
                { id: '1', text: 'En gång – det finns ju bara ett Stockholm' },
                { id: '2-3', text: 'Två eller tre gånger' },
                { id: 'fler', text: 'Fler än fem gånger' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'trad',
      phase: 'prova',
      title: 'Sökträdet har dubbletter',
      body: (
        <>
          <p>
            Sökträdet visar alla vägar från Västerås som är högst tre steg långa. ↺ betyder att vägen går tillbaka till en ort den redan passerat – en cykel.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'trad-storlek',
              prompt: 'Hur många noder har sökträdet till djup 3?',
              answer: 20,
              wrong: [
                { value: 5, feedback: '5 är antalet noder i grafen. Sökträdet har fler eftersom samma ort kan nås på flera sätt och därför ritas flera gånger.' },
                { value: 12, feedback: '12 är bara noderna på djup 3. Räkna också med start och djup 1 och 2.' },
              ],
              hint: 'Läs meningen ovanför trädet, eller räkna alla rader i trädet.',
              explanation: 'Trädet har 20 noder fast grafen bara har 5. Stockholm finns 3 gånger, och 7 trädnoder går tillbaka längs en cykel.',
            }}
          />
        </>
      ),
    },
    {
      id: 'graf',
      phase: 'prova',
      title: 'Samma problem som graf med besökta noder',
      body: (
        <>
          <p>
            Nu söker vi i stället i grafen och för en lista över besökta noder. Kanterna räknas här som ett steg var (inga vikter). Stega igenom sökningen och jämför med trädet.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'besokta-varfor',
              prompt: 'Varför besöker grafsökningen bara 5 noder när trädet hade 20?',
              options: [
                { id: 'a', text: 'Den hoppar över noder som redan är besökta, så varje ort undersöks högst en gång', correct: true },
                { id: 'b', text: 'Den slutar så fort den ser Stockholm som granne', feedback: 'Sökningen kontrollerar målet först när noden tas ut ur listan med väntande noder, inte när den läggs till. Skillnaden beror på listan över besökta noder.' },
                { id: 'c', text: 'Den har en karta som visar var Stockholm ligger', feedback: 'Bredden först använder ingen information om var målet ligger. Den provar grannarna i tur och ordning.' },
              ],
              explanation: 'Listan över besökta noder tar bort dubbletterna. Det skyddar också mot cykler: utan den kan en sökning gå runt i en slinga för evigt.',
            }}
          />
        </>
      ),
    },
    {
      id: 'kostnad',
      phase: 'jamfor',
      title: 'Med vikter: kostnad i stället för steg',
      body: (
        <>
          <p>
            Nu räknas restiden. Sökningen väljer alltid den väntande väg som hittills är billigast (uniformkostnadssökning). Kör till slutet.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'billigaste-kostnad',
              prompt: 'Vad kostar den billigaste vägen från Västerås till Stockholm (minuter)?',
              answer: 100,
              wrong: [
                { value: 110, feedback: '110 är restiden för vägen med minst antal steg (Västerås → Enköping → Stockholm). Den har färre steg men är inte billigast.' },
                { value: 3, feedback: '3 är antalet steg i den billigaste vägen. Frågan gäller kostnaden: summan av kanternas vikter.' },
              ],
              hint: 'En vägs kostnad är summan av vikterna på kanterna längs vägen.',
              explanation: 'Västerås → Enköping → Uppsala → Stockholm kostar 30 + 30 + 40 = 100 minuter. Vägen med minst antal steg kostar 110.',
            }}
          />
        </>
      ),
    },
    {
      id: 'bygg',
      phase: 'prova',
      title: 'Bygg om grafen',
      body: (
        <>
          <p>
            Nu kan du ändra grafen i panelen <strong>Ändra grafen</strong> under grafen. Prova att ta bort <strong>båda</strong> kanterna till Stockholm och kör sökningen till slutet. Prova också att lägga till nya orter och kanter.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'ingen-vag',
              prompt: 'Vad händer när målet inte går att nå?',
              options: [
                { id: 'a', text: 'Sökningen besöker alla noder den kan nå, listan med väntande noder blir tom och den rapporterar att ingen väg finns', correct: true },
                { id: 'b', text: 'Sökningen fortsätter för evigt', feedback: 'Med en lista över besökta noder kan varje nod bara besökas en gång. En ändlig graf tar därför slut.' },
                { id: 'c', text: 'Sökningen väljer den nod som ligger närmast målet', feedback: 'Sökningen ger inget halvbra svar. Antingen hittar den en väg till exakt målnoden, eller så rapporterar den att ingen väg finns.' },
              ],
              explanation: 'Att kunna säga ”det finns ingen väg” är också ett svar. Det fungerar tack vare att varje nod bara besöks en gång.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara begreppen',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'graf-begrepp',
            prompt: 'Förklara med exempel från din graf vad start, mål, kostnad och cykel betyder, och varför en sökning behöver komma ihåg besökta noder.',
            criteria: [
              'start och mål förklaras som noder där sökningen börjar och slutar',
              'kostnad förklaras som summan av kanternas vikter längs en väg',
              'en cykel beskrivs som en väg tillbaka till en nod man redan passerat',
              'kopplar besökta noder till att undvika dubbletter och slingor',
            ],
          }}
        />
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps
          steps={steps}
          index={step}
          onStepChange={(i) => {
            setStep(i);
          }}
        />
      </div>
      <div className="lab-stack">
        {view.search ? (
          <SearchPanel key={JSON.stringify(g)} g={g} />
        ) : (
          <Panel title="Grafen">
            <div className="graf-map-wrap" tabIndex={0} role="group" aria-label="Grafen (rulla i sidled på smala skärmar)"><GraphView g={g} frame={null} /></div>
            <h4>Grafen i text</h4>
            <AdjacencyList g={g} />
          </Panel>
        )}
        {view.editor && <Editor g={custom} onChange={setCustom} />}
        {view.tree && (
          <Panel title="Sökträd utan minne">
            {!guided && <Slider label="Djup" value={depth} min={1} max={4} onChange={setDepth} />}
            <TreeView g={g} depth={treeDepth} />
          </Panel>
        )}
      </div>
    </div>
  );
}
