import { useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, Slider, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { KnnPlot } from './KnnPlot';
import {
  addPoint,
  boundaryGrid,
  classInfo,
  clamp,
  fmt,
  isPointList,
  OUTLIER_ID,
  predict,
  removePoint,
  round1,
  startPoints,
  startQuery,
  updatePoint,
  X_DOMAIN,
  Y_DOMAIN,
  type ClassId,
  type Point,
} from './logic';

type ClickTool = 'query' | 'a' | 'b';

interface StepSetup {
  k: number;
  boundary: boolean;
  result: boolean;
  /** Vilka reglage som visas i genomgångsläget. */
  kControl: 'none' | 'slider' | 'choice';
  outlierToggle: boolean;
  moveQuery: boolean;
}

const stepSetup: StepSetup[] = [
  { k: 1, boundary: false, result: false, kControl: 'none', outlierToggle: false, moveQuery: false },
  { k: 1, boundary: true, result: true, kControl: 'slider', outlierToggle: false, moveQuery: false },
  { k: 2, boundary: true, result: true, kControl: 'none', outlierToggle: false, moveQuery: false },
  { k: 1, boundary: true, result: true, kControl: 'choice', outlierToggle: true, moveQuery: false },
  { k: 14, boundary: true, result: true, kControl: 'slider', outlierToggle: false, moveQuery: false },
  { k: 3, boundary: true, result: true, kControl: 'slider', outlierToggle: false, moveQuery: true },
];

const isQuery = (v: unknown): v is { x: number; y: number } =>
  typeof v === 'object' && v !== null && Number.isFinite((v as { x: number }).x) && Number.isFinite((v as { y: number }).y);

function ClassName({ label }: { label: ClassId }) {
  return (
    <>
      <span aria-hidden="true" style={{ color: classInfo[label].color }}>
        {classInfo[label].symbol}{' '}
      </span>
      {classInfo[label].name}
    </>
  );
}

function QueryMover({ query, onChange }: { query: { x: number; y: number }; onChange: (q: { x: number; y: number }) => void }) {
  const move = (dx: number, dy: number) => onChange({ x: round1(clamp(query.x + dx, X_DOMAIN)), y: round1(clamp(query.y + dy, Y_DOMAIN)) });
  return (
    <div>
      <p style={{ margin: '0 0 0.3rem' }}>
        <strong>Flytta ★</strong> (0,5 cm per tryck)
      </p>
      <div className="row" role="group" aria-label="Flytta den nya frukten">
        <button type="button" className="btn" onClick={() => move(-0.5, 0)}>
          ← Smalare
        </button>
        <button type="button" className="btn" onClick={() => move(0.5, 0)}>
          Bredare →
        </button>
        <button type="button" className="btn" onClick={() => move(0, 0.5)}>
          ↑ Högre
        </button>
        <button type="button" className="btn" onClick={() => move(0, -0.5)}>
          ↓ Lägre
        </button>
      </div>
      <div className="row" style={{ marginTop: '0.4rem' }}>
        <label>
          Bredd (cm){' '}
          <input
            type="number"
            step={0.1}
            min={X_DOMAIN[0]}
            max={X_DOMAIN[1]}
            value={query.x}
            style={{ width: '5.5em' }}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (e.target.value !== '' && Number.isFinite(v)) onChange({ x: round1(clamp(v, X_DOMAIN)), y: query.y });
            }}
          />
        </label>
        <label>
          Höjd (cm){' '}
          <input
            type="number"
            step={0.1}
            min={Y_DOMAIN[0]}
            max={Y_DOMAIN[1]}
            value={query.y}
            style={{ width: '5.5em' }}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (e.target.value !== '' && Number.isFinite(v)) onChange({ x: query.x, y: round1(clamp(v, Y_DOMAIN)) });
            }}
          />
        </label>
      </div>
    </div>
  );
}

function PointEditor({ points, onChange }: { points: Point[]; onChange: (p: Point[]) => void }) {
  const num = (p: Point, key: 'x' | 'y', label: string) => (
    <input
      type="number"
      step={0.1}
      aria-label={`${label} för punkt ${p.id}`}
      value={p[key]}
      style={{ width: '5em' }}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (e.target.value !== '' && Number.isFinite(v)) onChange(updatePoint(points, p.id, { [key]: v }));
      }}
    />
  );
  return (
    <details>
      <summary>Ändra punkterna i en tabell ({points.length} punkter)</summary>
      <div className="table-wrap">
        <table className="table" data-testid="punkttabell">
          <caption>Alla punkter. Ändra värdena med siffror – ingen dragning behövs.</caption>
          <thead>
            <tr>
              <th scope="col">Nr</th>
              <th scope="col">Bredd</th>
              <th scope="col">Höjd</th>
              <th scope="col">Klass</th>
              <th scope="col">
                <span className="visually-hidden">Ta bort</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id}>
                <th scope="row">{p.id}</th>
                <td>{num(p, 'x', 'Bredd')}</td>
                <td>{num(p, 'y', 'Höjd')}</td>
                <td>
                  <select aria-label={`Klass för punkt ${p.id}`} value={p.label} onChange={(e) => onChange(updatePoint(points, p.id, { label: e.target.value as ClassId }))}>
                    <option value="a">● äpple</option>
                    <option value="b">▲ päron</option>
                  </select>
                </td>
                <td>
                  <button type="button" className="btn btn-quiet" onClick={() => onChange(removePoint(points, p.id))}>
                    Ta bort {p.id}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={() => onChange(addPoint(points, 5, 8, 'a'))}>
          + Lägg till äpple
        </button>
        <button type="button" className="btn" onClick={() => onChange(addPoint(points, 5, 8, 'b'))}>
          + Lägg till päron
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => onChange([])}>
          Ta bort alla
        </button>
      </div>
      <p className="hint">Nya punkter hamnar på bredd 5 och höjd 8. Ändra sedan värdena i tabellen.</p>
    </details>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;

  const [guidedK, setGuidedK] = useStoredState<number>('guided-k', setup.k, (v): v is number => typeof v === 'number' && v >= 1 && v <= 30);
  const [expK, setExpK] = useStoredState<number>('k', 3, (v): v is number => typeof v === 'number' && v >= 1 && v <= 30);
  const [hideOutlier, setHideOutlier] = useStoredState<boolean>('hide-outlier', false, (v): v is boolean => typeof v === 'boolean');
  const [guidedQuery, setGuidedQuery] = useStoredState('guided-query', startQuery, isQuery);
  const [expQuery, setExpQuery] = useStoredState('query', startQuery, isQuery);
  const [custom, setCustom] = useStoredState<Point[]>('points', startPoints, isPointList);
  const [tool, setTool] = useStoredState<ClickTool>('tool', 'query', (v): v is ClickTool => v === 'query' || v === 'a' || v === 'b');
  const [showBoundary, setShowBoundary] = useStoredState<boolean>('boundary', true, (v): v is boolean => typeof v === 'boolean');

  const k = guided ? (setup.kControl === 'none' ? setup.k : guidedK) : expK;
  const points = guided ? (setup.outlierToggle && hideOutlier ? removePoint(startPoints, OUTLIER_ID) : startPoints) : custom;
  const query = guided ? (setup.moveQuery ? guidedQuery : startQuery) : expQuery;
  const boundaryOn = guided ? setup.boundary : showBoundary;
  const resultOn = guided ? setup.result : true;

  const prediction = useMemo(() => predict(points, query, k), [points, query, k]);
  const grid = useMemo(() => (boundaryOn ? boundaryGrid(points, k) : null), [points, k, boundaryOn]);

  const onStepChange = (i: number) => {
    setStep(i);
    const s = stepSetup[Math.min(i, stepSetup.length - 1)]!;
    setGuidedK(s.k);
    setHideOutlier(false);
    setGuidedQuery(startQuery);
  };

  const kChoice = (
    <Segmented
      legend="Antal grannar k"
      value={String(k) as '1' | '3' | '5'}
      options={[
        { value: '1', label: 'k = 1' },
        { value: '3', label: 'k = 3' },
        { value: '5', label: 'k = 5' },
      ]}
      onChange={(v) => setGuidedK(Number(v))}
    />
  );
  const kSlider = (
    <Slider label="Antal grannar k" value={k} min={1} max={Math.max(14, points.length)} onChange={guided ? setGuidedK : setExpK} format={(v) => (v === 1 ? '1 granne' : `${v} grannar`)} />
  );

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad är den nya frukten?',
      body: (
        <>
          <p>
            Fruktlådan innehåller äpplen <span aria-hidden="true">●</span> och päron <span aria-hidden="true">▲</span> som någon redan har sorterat. Varje frukt är mätt på bredd och höjd. Nu kommer en ny frukt <strong>★</strong> som ingen har sorterat.
          </p>
          <p>
            Med <strong>k = 1</strong> ger modellen den nya frukten samma klass som den <em>enda närmaste</em> frukten.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-k1',
              prompt: 'Vilken klass tror du att ★ får med k = 1?',
              options: [
                { id: 'a', text: 'Äpple' },
                { id: 'b', text: 'Päron' },
                { id: 'vet-ej', text: 'Det går inte att avgöra' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'prova-k',
      phase: 'prova',
      title: 'Ändra antalet grannar',
      body: (
        <>
          <p>
            Nu syns svaret och bakgrunden visar vad modellen skulle svara för en frukt på varje plats. Den svarta linjen är <strong>klassificeringsgränsen</strong>. Streckade linjer går från ★ till de grannar som röstar.
          </p>
          <p>Dra reglaget eller använd piltangenterna för att ändra k. Titta på ★ och på punkt 8.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'k3-svar',
              prompt: 'Sätt k = 3. Vilken klass får ★ då, och varför?',
              options: [
                { id: 'a', text: 'Äpple, eftersom den allra närmaste frukten är ett äpple', feedback: 'Det gäller för k = 1. Med k = 3 röstar de tre närmaste, och då räcker inte en enda äppelröst.' },
                { id: 'b', text: 'Päron, eftersom två av de tre närmaste är päron', correct: true },
                { id: 'c', text: 'Päron, eftersom det finns fler päron än äpplen i lådan', feedback: 'Det finns faktiskt fler äpplen (8) än päron (6). Det är bara de k närmaste frukterna som röstar, inte hela lådan.' },
              ],
              explanation: 'De tre närmaste är punkt 8 (äpple), punkt 9 (päron) och punkt 10 (päron). Två röster mot en ger päron.',
            }}
          />
        </>
      ),
    },
    {
      id: 'lika',
      phase: 'prova',
      title: 'När rösterna blir lika',
      body: (
        <>
          <p>
            Nu är <strong>k = 2</strong>. Då kan det bli en röst för varje klass. Labben har en fast regel för det: <strong>vid lika röster vinner klassen hos den närmaste grannen</strong>. Om två grannar ligger exakt lika långt bort räknas den med lägst nummer som närmast.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'lika-roster',
              prompt: 'Med k = 2 röstar punkt 8 (äpple) och punkt 9 (päron). Vilken klass får ★?',
              options: [
                { id: 'a', text: 'Äpple', correct: true },
                { id: 'b', text: 'Päron', feedback: 'Punkt 9 är ett päron, men den ligger längre bort (0,71 cm) än punkt 8 (0,32 cm). Vid lika röster avgör den närmaste grannen.' },
                { id: 'c', text: 'Ingen klass – modellen kan inte svara', feedback: 'En klassificerare måste ge ett svar. Därför behövs en regel för lika röster. Här avgör den närmaste grannen.' },
              ],
              explanation: 'Punkt 8 ligger närmast, så äpple vinner. Därför väljer man ofta ett udda k när det finns två klasser – då kan rösterna inte bli lika.',
            }}
          />
        </>
      ),
    },
    {
      id: 'avvikande',
      phase: 'jamfor',
      title: 'Den avvikande punkten',
      body: (
        <>
          <p>
            Punkt 8 är ett äpple som är ovanligt högt – det ligger mitt bland päronen. Kanske är det ett udda äpple, kanske har någon sorterat fel. Jämför <strong>en sak i taget</strong>: byt k, eller ta bort punkt 8.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'k5-paron',
              prompt: 'Sätt k = 5. Hur många av de fem närmaste grannarna till ★ är päron?',
              answer: 4,
              wrong: [
                { value: 5, feedback: 'Titta i grannlistan: punkt 8 är ett äpple och är fortfarande med bland de fem närmaste.' },
                { value: 1, feedback: '1 är antalet äpplen bland de fem närmaste. Frågan gäller päronen.' },
              ],
              hint: 'Läs av tabellen ”De närmaste grannarna” när k = 5.',
              explanation: 'Fyra päron och ett äpple. Med större k väger en ensam avvikande punkt mindre.',
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'avvikande-o',
              prompt: 'Med k = 1 bildar punkt 8 en egen ”ö” av äppelområde bland päronen. Vad stämmer?',
              options: [
                { id: 'a', text: 'Ön försvinner med k = 3, eftersom punkt 8 då röstas ned av sina päron-grannar', correct: true },
                { id: 'b', text: 'Ön blir större med större k', feedback: 'Med större k röstar fler grannar. Punkt 8 är omgiven av päron, så den blir nedröstad och ön krymper i stället.' },
                { id: 'c', text: 'Ön finns kvar oavsett k så länge punkt 8 finns', feedback: 'Prova k = 3 eller 5. Ön försvinner trots att punkt 8 finns kvar, eftersom fler grannar röstar.' },
              ],
              explanation: 'Litet k gör modellen känslig för enstaka avvikande eller felmärkta punkter. Större k jämnar ut gränsen.',
            }}
          />
        </>
      ),
    },
    {
      id: 'stort-k',
      phase: 'jamfor',
      title: 'Kan k bli för stort?',
      body: (
        <>
          <p>
            Nu är <strong>k = 14</strong>, alltså lika många som alla frukter i lådan.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'stort-k-varfor',
              prompt: 'Varför blir hela bakgrunden äpple när k = 14?',
              options: [
                { id: 'a', text: 'Alla 14 frukter röstar varje gång, och det finns 8 äpplen men bara 6 päron', correct: true },
                { id: 'b', text: 'Äpplen är större än päron', feedback: 'Storleken spelar ingen roll för rösterna. När alla röstar vinner den klass som har flest frukter.' },
                { id: 'c', text: 'Modellen har lärt sig mer när k är stort', feedback: 'Modellen tittar inte längre på var frukten ligger – alla svar blir samma. Det är tvärtom för enkelt.' },
              ],
              explanation: 'För stort k gör modellen för enkel: den svarar bara med den vanligaste klassen. För litet k gör den känslig för enstaka punkter.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Välj k och förklara',
      body: (
        <>
          <p>Nu kan du både ändra k och flytta ★ med knapparna eller sifferfälten. Prova några platser nära gränsen.</p>
          <Question
            spec={{
              kind: 'open',
              id: 'valj-k',
              prompt: 'Vilket k skulle du välja för fruktlådan? Förklara vad som händer om k är för litet och om k är för stort.',
              criteria: [
                'nämner att litet k gör modellen känslig för enstaka avvikande eller felmärkta punkter',
                'nämner att stort k gör att den vanligaste klassen tar över',
                'motiverar sitt val med något du såg i diagrammet',
                'föreslår hur man skulle kunna testa valet på nya frukter (det gör du i labb 12)',
              ],
            }}
          />
        </>
      ),
    },
  ];

  const clickPlot = (x: number, y: number) => {
    if (x < X_DOMAIN[0] || x > X_DOMAIN[1] || y < Y_DOMAIN[0] || y > Y_DOMAIN[1]) return;
    if (tool === 'query') setExpQuery({ x: round1(x), y: round1(y) });
    else setCustom(addPoint(custom, x, y, tool));
  };

  const resultText = (() => {
    if (!resultOn) return 'Svaret visas när du har gjort din förutsägelse och gått vidare.';
    if (!prediction) return 'Det finns inga punkter att jämföra med, så modellen kan inte förutsäga något. Lägg till punkter.';
    const usedK = prediction.neighbours.length;
    const note = usedK < k ? ` (k = ${k} men det finns bara ${usedK} punkter, så alla röstar)` : '';
    const tie = prediction.tie ? ' Lika röster – den närmaste grannen avgör.' : '';
    return `Med k = ${k}${note}: ${prediction.votes.a} röst${prediction.votes.a === 1 ? '' : 'er'} för äpple och ${prediction.votes.b} för päron.${tie} ★ blir ${classInfo[prediction.label].name}.`;
  })();

  const showKSlider = guided ? setup.kControl === 'slider' : true;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={onStepChange} />
        {guided && (setup.kControl !== 'none' || setup.outlierToggle || setup.moveQuery) && (
          <Panel title="Reglage">
            {setup.kControl === 'choice' ? kChoice : showKSlider ? kSlider : null}
            {setup.outlierToggle && <Toggle label="Ta bort punkt 8 (den avvikande)" checked={hideOutlier} onChange={setHideOutlier} />}
            {setup.moveQuery && <QueryMover query={guidedQuery} onChange={setGuidedQuery} />}
          </Panel>
        )}
        {!guided && (
          <Panel title="Inställningar">
            {kSlider}
            <Toggle label="Visa klassificeringsgränsen" checked={showBoundary} onChange={setShowBoundary} />
            <QueryMover query={expQuery} onChange={setExpQuery} />
            <Segmented
              legend="Klick i diagrammet"
              value={tool}
              options={[
                { value: 'query', label: 'Flytta ★' },
                { value: 'a', label: '+ ● äpple' },
                { value: 'b', label: '+ ▲ päron' },
              ]}
              onChange={setTool}
            />
            <PointEditor points={custom} onChange={setCustom} />
            <button type="button" className="btn" onClick={() => setCustom(startPoints)}>
              Återställ fruktlådan
            </button>
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title={`Fruktlådan med k = ${k}`}>
          <LiveStatus>
            <span data-testid="knn-resultat">{resultText}</span>
          </LiveStatus>
          <KnnPlot points={points} query={query} prediction={resultOn ? prediction : null} grid={grid} k={k} showNeighbours={resultOn} highlightId={OUTLIER_ID} onClickPlot={guided ? undefined : clickPlot} />
          <Legend
            items={[
              { swatch: 'var(--c1)', symbol: '●', text: 'Äpple' },
              { swatch: 'var(--c2)', symbol: '▲', text: 'Päron' },
              { swatch: 'var(--surface)', symbol: '★', text: 'Ny frukt att klassificera' },
              { swatch: 'var(--text)', symbol: '', text: 'Svart linje: klassificeringsgräns' },
            ]}
          />
          {!guided && <p className="hint">Klick i diagrammet {tool === 'query' ? 'flyttar ★' : `lägger till ett ${classInfo[tool].name}`}. Allt går också med knapparna och tabellen.</p>}
        </Panel>
        {resultOn && prediction && (
          <Panel title="De närmaste grannarna">
            <div className="table-wrap">
              <table className="table" data-testid="grannar">
                <caption>
                  {prediction.neighbours.length === 1 ? 'Den närmaste frukten' : `De ${prediction.neighbours.length} närmaste frukterna`} till ★ (bredd {fmt(query.x)}, höjd {fmt(query.y)})
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Ordning</th>
                    <th scope="col">Punkt</th>
                    <th scope="col">Klass</th>
                    <th scope="col">Avstånd (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.neighbours.map((n, i) => (
                    <tr key={n.point.id}>
                      <td>{i + 1}</td>
                      <td>{n.point.id}</td>
                      <td>
                        <ClassName label={n.point.label} />
                      </td>
                      <td>{fmt(n.distance, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
