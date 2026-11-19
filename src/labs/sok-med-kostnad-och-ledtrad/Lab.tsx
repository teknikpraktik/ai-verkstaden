import { useId, useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, SelectField } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import type { Frame } from '../../lib/search';
import {
  admissible,
  algLabel,
  heuristic,
  heuristicLabel,
  isConsistent,
  isCostAlg,
  isHeuristicMode,
  isScenarioId,
  optimalCost,
  placeName,
  run,
  scenarioIds,
  scenarios,
  summarize,
  type CostAlgorithm,
  type HeuristicMode,
  type MapScenario,
  type ScenarioId,
} from './logic';
import './lab.css';

interface Setup {
  alg: CostAlgorithm;
  compare: boolean;
}
const stepSetup: Setup[] = [
  { alg: 'greedy', compare: false },
  { alg: 'ucs', compare: false },
  { alg: 'greedy', compare: false },
  { alg: 'astar', compare: false },
  { alg: 'astar', compare: true },
  { alg: 'astar', compare: true },
  { alg: 'astar', compare: true },
];

const priorityName: Record<CostAlgorithm, string> = { ucs: 'g', greedy: 'h', astar: 'f = g + h' };


/** Flyttade h-etiketter där standardläget (under noden) krockar med en väg. */
const hLabelOffset: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' }> = {
  bjorkas: { dx: 20, dy: 16, anchor: 'start' },
  ekeby: { dx: 0, dy: -37, anchor: 'middle' },
};

function MapView({ s, frame, mode, showSearch }: { s: MapScenario; frame: Frame; mode: HeuristicMode; showSearch: boolean }) {
  const titleId = useId();
  const h = heuristic(s, mode);
  const order = new Map(frame.explored.map((id, i) => [id, i + 1]));
  const frontier = new Set(frame.frontier.map((f) => f.id));
  const path = frame.path ?? [];
  const onPath = (a: string, b: string) => path.some((p, i) => i + 1 < path.length && ((p === a && path[i + 1] === b) || (p === b && path[i + 1] === a)));
  const pos = (id: string) => s.places.find((p) => p.id === id)!;
  return (
    <svg className="karta-svg" viewBox="0 0 470 300" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{`Karta: ${s.description} Vägarnas kostnader står på vägarna och h-värdet under varje ort. Tabellerna intill beskriver samma sak i text.`}</title>
      <g transform="translate(30 0)">
      {s.lake && (
        <g aria-hidden="true">
          <ellipse className="karta-lake" cx={s.lake.cx} cy={s.lake.cy} rx={s.lake.rx} ry={s.lake.ry} />
          <text x={s.lake.cx} y={s.lake.cy + 4} textAnchor="middle" fontSize={12} fontStyle="italic">
            {s.lake.name}
          </text>
        </g>
      )}
      {s.roads.map((r) => {
        const a = pos(r.a);
        const b = pos(r.b);
        // Vägen runt sjön ritas som en båge.
        const curved = r.note === 'runt sjön' && s.lake;
        const cx = curved ? s.lake!.cx + 15 : (a.x + b.x) / 2;
        const cy = curved ? 0 : (a.y + b.y) / 2;
        const lx = curved ? 0.25 * a.x + 0.5 * cx + 0.25 * b.x : cx;
        const ly = curved ? 0.25 * a.y + 0.5 * cy + 0.25 * b.y : cy;
        return (
          <g key={`${r.a}-${r.b}`}>
            {curved ? (
              <path className={`karta-road ${onPath(r.a, r.b) ? 'is-path' : ''}`} d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`} fill="none" />
            ) : (
              <line className={`karta-road ${onPath(r.a, r.b) ? 'is-path' : ''}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            )}
            <rect className="karta-cost-bg" x={lx - 18} y={ly - 11} width={36} height={22} rx={4} />
            <text x={lx} y={ly + 5} textAnchor="middle" fontSize={14} fontWeight={700}>
              {r.cost}
            </text>
          </g>
        );
      })}
      {s.places.map((p) => {
        const cls = [
          'karta-node',
          showSearch && path.includes(p.id) ? 'is-path' : showSearch && order.has(p.id) ? 'is-visited' : showSearch && frontier.has(p.id) ? 'is-frontier' : '',
          showSearch && frame.current === p.id ? 'is-current' : '',
        ].join(' ');
        const symbol = !showSearch ? '' : order.has(p.id) ? String(order.get(p.id)) : frontier.has(p.id) ? '○' : '';
        const role = p.id === s.start ? 'START' : p.id === s.goal ? 'MÅL' : '';
        return (
          <g key={p.id}>
            <circle className={cls} cx={p.x} cy={p.y} r={15} />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={14} fontWeight={700}>
              {symbol}
            </text>
            <text className="karta-halo" x={p.x} y={p.y - 21} textAnchor="middle" fontSize={14} fontWeight={700}>
              {p.name}
            </text>
            <text
              className="karta-halo"
              x={p.x + (hLabelOffset[p.id]?.dx ?? 0)}
              y={p.y + (hLabelOffset[p.id]?.dy ?? 31)}
              textAnchor={hLabelOffset[p.id]?.anchor ?? 'middle'}
              fontSize={12}
            >
              h = {h(p.id)}
            </text>
            {role && (
              <text className="karta-halo" x={p.x} y={p.y + 46} textAnchor="middle" fontSize={12} fontWeight={800}>
                {role}
              </text>
            )}
          </g>
        );
      })}
      </g>
    </svg>
  );
}

function FrontierTable({ s, frame, alg }: { s: MapScenario; frame: Frame; alg: CostAlgorithm }) {
  return (
    <div className="karta-table-wrap">
      <table className="table" data-testid="gransen">
        <caption>
          Väntande orter (gränsen), sorterade efter {priorityName[alg]}. g = kostnad hittills, h = uppskattning kvar.
        </caption>
        <thead>
          <tr>
            <th scope="col">Ort</th>
            <th scope="col">g</th>
            <th scope="col">h</th>
            <th scope="col">f = g + h</th>
          </tr>
        </thead>
        <tbody>
          {frame.frontier.length === 0 ? (
            <tr>
              <td colSpan={4}>(tom)</td>
            </tr>
          ) : (
            frame.frontier.map((f, i) => (
              <tr key={f.id} className={i === 0 ? 'karta-next' : undefined}>
                <th scope="row">
                  {placeName(s, f.id)}
                  {i === 0 ? ' ◀ nästa' : ''}
                </th>
                <td>{f.g}</td>
                <td>{f.h}</td>
                <td>{f.f}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p>
        <strong>Expanderade ({frame.explored.length}):</strong> {frame.explored.length ? frame.explored.map((id) => placeName(s, id)).join(', ') : '–'}
      </p>
    </div>
  );
}

function CompareTable({ s, mode }: { s: MapScenario; mode: HeuristicMode }) {
  const rows = useMemo(() => summarize(s, mode), [s, mode]);
  const best = optimalCost(s);
  return (
    <div className="karta-table-wrap">
      <table className="table" data-testid="jamforelse">
        <caption>Samma karta, tre sökningar (h: {heuristicLabel[mode].toLowerCase()})</caption>
        <thead>
          <tr>
            <th scope="col">Sökning</th>
            <th scope="col">Väg</th>
            <th scope="col">Vägkostnad</th>
            <th scope="col">Expanderade orter</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.alg}>
              <th scope="row">{algLabel[r.alg]}</th>
              <td>{r.path}</td>
              <td>
                {r.cost ?? '–'}
                {r.cost !== null && best !== null && (r.cost === best ? ' ✓ billigast' : ` ✗ (${r.cost - best} dyrare)`)}
              </td>
              <td>{r.expanded}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [expScenario, setExpScenario] = useStoredState<ScenarioId>('scenario', 'karta', isScenarioId);
  const [expAlg, setExpAlg] = useStoredState<CostAlgorithm>('alg', 'astar', isCostAlg);
  const [expH, setExpH] = useStoredState<HeuristicMode>('heuristic', 'standard', isHeuristicMode);

  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const scenarioId: ScenarioId = guided ? 'karta' : expScenario;
  const alg: CostAlgorithm = guided ? setup.alg : expAlg;
  const hMode: HeuristicMode = guided ? 'standard' : expH;
  const showCompare = guided ? setup.compare : true;
  const showSearch = !guided || step > 0;
  const s: MapScenario = scenarios[scenarioId];

  const result = useMemo(() => run(s, alg, hMode), [s, alg, hMode]);
  const stepper = useStepper(result.frames.length);
  const frame = result.frames[Math.min(stepper.index, result.frames.length - 1)]!;
  const consistent = isConsistent(s, hMode);
  const okH = admissible(s, hMode);

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vilken väg väljer den giriga sökningen?',
      body: (
        <>
          <p>
            Du ska från <strong>Ekeby</strong> till <strong>Lindvik</strong>. Talen på vägarna är kostnader (km). Under varje ort står <strong>h</strong>: fågelvägen till Lindvik. Det är sökningens ledtråd – en uppskattning av hur långt det är kvar.
          </p>
          <p>Den giriga sökningen fortsätter alltid från den ort som har lägst h, alltså den som verkar ligga närmast målet.</p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-girig',
              prompt: 'Vilken väg tror du att den giriga sökningen hittar?',
              options: [
                { id: 'norr', text: 'Norra vägen: Ekeby → Björkås → Sjövik → Lindvik' },
                { id: 'syd', text: 'Södra vägen: Ekeby → Hagby → Granberga → Lindvik' },
                { id: 'vet-ej', text: 'Det går inte att säga i förväg' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'ucs',
      phase: 'prova',
      title: 'Uniformkostnadssökning: lägst g först',
      body: (
        <>
          <p>
            Uniformkostnadssökningen bryr sig inte om h. Den tar alltid ut den väntande ort som har lägst <strong>g</strong> – kostnaden från start dit. Stega och titta på tabellen över väntande orter.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'ucs-fel-hall',
              prompt: 'Varför expanderar uniformkostnadssökningen Tallmo och Åsa, som ligger åt fel håll?',
              options: [
                { id: 'a', text: 'Vägarna dit är korta (g = 90 och 95), och sökningen väljer alltid lägst g utan att veta var målet ligger', correct: true },
                { id: 'b', text: 'Den tror att målet ligger där', feedback: 'Uniformkostnadssökningen har ingen aning om var målet ligger. Den använder bara g, kostnaden hittills.' },
                { id: 'c', text: 'Den gör ett misstag', feedback: 'Det är inget misstag: att alltid ta lägst g är precis det som garanterar billigaste väg. Priset är att den undersöker åt alla håll.' },
              ],
              explanation: 'Uniformkostnadssökningen sprider sig som ringar efter kostnad. Den hittar billigaste vägen men slösar arbete på orter åt fel håll.',
            }}
          />
        </>
      ),
    },
    {
      id: 'girig',
      phase: 'prova',
      title: 'Girig bäst-först: lägst h först',
      body: (
        <>
          <p>
            Nu används bara ledtråden <strong>h</strong>. Stega till slutet och jämför med din förutsägelse.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'girig-kostnad',
              prompt: 'Vad kostar vägen som den giriga sökningen hittar?',
              answer: 450,
              wrong: [
                { value: 375, feedback: '375 kostar den billigaste vägen, söderut. Den giriga sökningen tog norra vägen.' },
                { value: 3, feedback: '3 är antalet vägsträckor. Lägg ihop kostnaderna: 100 + 110 + 240.' },
                { value: 4, feedback: '4 är antalet expanderade orter. Frågan gäller vägens kostnad.' },
              ],
              hint: 'Lägg ihop kostnaderna längs den gröna vägen.',
              explanation: 'Ekeby → Björkås → Sjövik → Lindvik kostar 100 + 110 + 240 = 450. Sjövik ligger nära Lindvik fågelvägen (h = 158), men vägen måste gå runt Långsjön.',
            }}
          />
        </>
      ),
    },
    {
      id: 'astar',
      phase: 'prova',
      title: 'A*: lägst f = g + h först',
      body: (
        <>
          <p>
            A* kombinerar båda: <strong>f = g + h</strong> är kostnaden hittills plus uppskattningen av vad som är kvar. Stega tills Sjövik läggs till i gränsen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'astar-f',
              prompt: 'Vilket f-värde får Sjövik när A* lägger till den?',
              answer: 368,
              wrong: [
                { value: 158, feedback: '158 är bara h för Sjövik. f är g + h, och g är kostnaden från Ekeby via Björkås: 100 + 110.' },
                { value: 210, feedback: '210 är g, kostnaden hittills. Lägg till h = 158 för att få f.' },
              ],
              hint: 'g = 100 + 110 (Ekeby → Björkås → Sjövik). h står under Sjövik.',
              explanation: 'f = 210 + 158 = 368. Hagbys väg till Granberga får f = 225 + 144 = 369, nästan lika. När Lindvik nås via Sjövik blir f = 450, och då är Granberga (369) billigare att undersöka först.',
            }}
          />
        </>
      ),
    },
    {
      id: 'jamfor',
      phase: 'jamfor',
      title: 'Jämför de tre sökningarna',
      body: (
        <>
          <p>Tabellen visar alla tre sökningarna på samma karta med samma h.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'basta-sokning',
              prompt: 'Vilken sökning hittade billigaste vägen och expanderade samtidigt minst antal orter?',
              options: [
                { id: 'astar', text: 'A* (6 expanderade orter, kostnad 375)', correct: true },
                { id: 'ucs', text: 'Uniformkostnadssökning (8 expanderade, kostnad 375)', feedback: 'Den hittade också billigaste vägen, men undersökte även Tallmo och Åsa. A* behövde färre.' },
                { id: 'greedy', text: 'Girig bäst-först (4 expanderade, kostnad 450)', feedback: 'Den expanderade minst, men vägen kostar 75 mer än den billigaste. Snabb men inte pålitlig.' },
              ],
              explanation: 'A* använder h för att slippa orter som uppenbart ligger åt fel håll, men g gör att den inte luras av en väg som bara ser kort ut.',
            }}
          />
        </>
      ),
    },
    {
      id: 'villkor',
      phase: 'forklara',
      title: 'När hittar A* billigaste vägen?',
      body: (
        <>
          <p>
            Labbens A* minns besökta orter och öppnar aldrig en besökt ort igen, även om den senare hittar en billigare väg dit. Det påverkar vilket krav som måste ställas på h.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'astar-villkor',
              prompt: 'Under vilka villkor hittar A* i den här labben alltid en billigaste väg?',
              options: [
                {
                  id: 'a',
                  text: 'Alla vägar har positiv kostnad och h är konsistent: h(mål) = 0 och h(n) ≤ kostnad(n, m) + h(m) för varje väg mellan n och m',
                  correct: true,
                },
                { id: 'b', text: 'Alltid, oavsett h', feedback: 'Nej. Prova experimentläget med ”Överskattad: 3 × h” – då hittar A* vägen som kostar 450.' },
                { id: 'c', text: 'Bara om h = 0', feedback: 'Med h = 0 blir A* samma sak som uniformkostnadssökning och hittar billigaste vägen, men det är inte nödvändigt. Fågelvägen fungerar också och sparar arbete.' },
                {
                  id: 'd',
                  text: 'Det räcker att h aldrig överskattar den verkliga kostnaden',
                  feedback: 'Det räcker för varianter av A* som kan öppna besökta noder igen. Labbens A* gör inte det. I scenariot ”Lurig ledtråd” överskattar h aldrig, men A* hittar ändå en väg som kostar 9 i stället för 7.',
                },
              ],
              explanation: 'En konsistent h överskattar aldrig och gör dessutom att f aldrig minskar längs en väg. Då är första vägen A* hittar till en ort alltid den billigaste dit, så det gör inget att besökta orter aldrig öppnas igen. Fågelvägen är konsistent eftersom ingen väg är kortare än fågelvägen.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara med egna ord',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'girig-forklaring',
            prompt: 'Förklara varför den giriga sökningen valde en dyrare väg, och varför A* inte gjorde det. Använd g, h och f.',
            criteria: [
              'säger att den giriga sökningen bara tittar på h, uppskattningen kvar',
              'förklarar att Sjövik ligger nära fågelvägen men att vägen måste gå runt sjön (kostnad 240)',
              'förklarar att A* också räknar med g och därför märker att vägen via Sjövik blir dyr (f = 450)',
              'nämner att h är en uppskattning och inte den verkliga kostnaden',
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
            stepper.reset();
          }}
        />
        {!guided && (
          <Panel title="Inställningar">
            <Segmented
              legend="Karta"
              value={expScenario}
              options={scenarioIds.map((id) => ({ value: id, label: scenarios[id].name }))}
              onChange={(v) => {
                setExpScenario(v);
                stepper.reset();
              }}
            />
            <Segmented
              legend="Sökning"
              value={expAlg}
              options={[
                { value: 'ucs', label: 'Uniformkostnad' },
                { value: 'greedy', label: 'Girig' },
                { value: 'astar', label: 'A*' },
              ]}
              onChange={(v) => {
                setExpAlg(v);
                stepper.reset();
              }}
            />
            <SelectField
              label="Ledtråd h"
              value={expH}
              options={(['standard', 'noll', 'tredubbel'] as HeuristicMode[]).map((m) => ({ value: m, label: heuristicLabel[m] }))}
              onChange={(v) => {
                setExpH(v);
                stepper.reset();
              }}
            />
            <p data-testid="h-egenskaper">
              Ledtråden är {okH ? 'tillåten (överskattar aldrig)' : 'inte tillåten (överskattar ibland)'} och {consistent ? 'konsistent' : 'inte konsistent'}.{' '}
              {consistent ? 'A* hittar därför en billigaste väg.' : 'A* kan därför missa billigaste vägen.'}
            </p>
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={showSearch ? `${algLabel[alg]} – ${s.name.toLowerCase()}` : s.name}>
          {showSearch && <StepperControls stepper={stepper} label="Stega sökningen" />}
          {showSearch && <LiveStatus>{frame.message}</LiveStatus>}
          <div className="karta-map-wrap" tabIndex={0} role="group" aria-label="Kartan (rulla i sidled på smala skärmar)">
            <MapView s={s} frame={frame} mode={hMode} showSearch={showSearch} />
          </div>
          {showSearch && (
            <>
              <Legend
                items={[
                  { swatch: 'var(--visited)', symbol: '2', text: 'Expanderad (siffran = ordning)' },
                  { swatch: 'var(--frontier)', symbol: '○', text: 'Väntar i gränsen' },
                  { swatch: 'var(--path)', symbol: '', text: 'Funnen väg (tjock linje)' },
                  { swatch: 'var(--accent-soft)', symbol: '', text: 'Sjö' },
                ]}
              />
              <FrontierTable s={s} frame={frame} alg={alg} />
              {stepper.atEnd && (
                <p data-testid="resultat">
                  <strong>Resultat:</strong>{' '}
                  {result.path
                    ? `${result.path.map((id) => placeName(s, id)).join(' → ')} kostar ${result.cost}. ${result.expanded} orter expanderades.`
                    : 'ingen väg hittades.'}
                </p>
              )}
            </>
          )}
        </Panel>
        {showCompare && (
          <Panel title="Jämförelse">
            <CompareTable s={s} mode={hMode} />
          </Panel>
        )}
      </div>
    </div>
  );
}
