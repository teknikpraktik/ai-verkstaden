import { useMemo } from 'react';
import { useScrollLog } from '../styr-en-robot/useScrollLog';
import { Grid } from '../../components/lab/Grid';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, SelectField, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import { cellId } from '../../lib/search';
import { cellName, isWorld, parseScenario, scenarioIds, scenarios, simulateRoute, toggleActual, type RouteFrame, type ScenarioId, type World } from './logic';
import '../styr-en-robot/robotik.css';

const arrows = ['▲', '▶', '▼', '◀'] as const;

/** Genomgångens steg: scenario och vilka räckvidder som går att välja (en parameter i taget). */
const stepSetup: { scenario: ScenarioId; ranges: number[] }[] = [
  { scenario: 'pall', ranges: [2] },
  { scenario: 'pall', ranges: [2] },
  { scenario: 'pall', ranges: [1, 2, 3] },
  { scenario: 'stangd', ranges: [2] },
  { scenario: 'oppnad', ranges: [2] },
  { scenario: 'ingenVag', ranges: [2] },
  { scenario: 'ingenVag', ranges: [2] },
];

const kindLabel: Record<RouteFrame['kind'], string> = {
  start: 'Planerar',
  flytt: 'Kör',
  upptackt: 'Stopp',
  omplanering: 'Planerar om',
  framme: 'Framme',
  'ingen-vag': 'Ingen väg',
  avbruten: 'Avbryter',
};

function MapView({ world, frame, which, onEdit }: { world: World; frame: RouteFrame; which: 'karta' | 'verklighet'; onEdit?: (r: number, c: number) => void }) {
  const isMap = which === 'karta';
  const walls = isMap ? frame.belief : world.actual;
  const plan = new Set(frame.plan ?? []);
  const trail = new Set(frame.trail);
  const sensed = new Set(frame.sensed);
  const fresh = new Set(frame.newChanges.map((c) => c.cell));
  const discovered = new Map(frame.changes.map((c) => [c.cell, c.kind]));
  return (
    <Grid
      label={isMap ? 'Robotens karta: det roboten tror om miljön just nu' : `Verkligheten: hur miljön faktiskt ser ut${onEdit ? ' (går att ändra med Enter)' : ''}`}
      onActivate={onEdit}
      rows={world.rows}
      cols={world.cols}
      cellSize={world.cols > 11 ? 26 : 30}
      className={`rb-fit-${world.cols}`}
      coordinates
      cell={(r, c) => {
        const id = cellId(r, c);
        const parts = [cellName(id)];
        const classes: string[] = [];
        let content = '';
        const wall = walls[r]![c]!;
        const mapDiff = world.map[r]![c] !== world.actual[r]![c];
        if (wall) {
          parts.push(isMap ? 'hinder enligt kartan' : 'hinder');
          classes.push('cell-wall');
        }
        if (isMap) {
          const d = discovered.get(id);
          if (d === 'nytt') {
            parts.push('upptäckt hinder som inte fanns på kartan');
            classes.push('rb-new');
            content = '!';
          } else if (d === 'borta') {
            parts.push('upptäckt att hindret på kartan är borta');
            classes.push('rb-gone');
            content = '✓';
          }
        } else if (mapDiff) {
          const known = discovered.has(id);
          if (world.actual[r]![c]) {
            parts.push(`saknas på kartan${known ? ', upptäckt av roboten' : ', roboten vet inte om det'}`);
            classes.push('rb-new');
            content = 'X';
          } else {
            parts.push(`står på kartan men finns inte${known ? ', upptäckt av roboten' : ', roboten vet inte om det'}`);
            classes.push('rb-gone');
            content = 'O';
          }
        }
        if (!wall && trail.has(id)) {
          parts.push('har kört här');
          classes.push('cell-visited');
          if (!content) content = '·';
        }
        if (isMap && !wall && plan.has(id) && id !== frame.pos) {
          parts.push('planerad väg');
          classes.push('cell-path');
          content = '●';
        }
        if (sensed.has(id)) {
          parts.push('sensorn ser rutan');
          classes.push('rb-beam');
        }
        if (fresh.has(id)) classes.push('cell-current');
        if (id === world.start) {
          parts.push('start');
          if (!content || content === '·') content = 'S';
        }
        if (id === world.goal) {
          parts.push('mål');
          content = 'M';
        }
        if (id === frame.pos) {
          parts.push(`roboten, riktning ${['uppåt', 'åt höger', 'nedåt', 'åt vänster'][frame.heading]}`);
          classes.push('rb-robot');
          content = arrows[frame.heading];
        }
        return { content, label: parts.join(', '), className: classes.join(' ') };
      }}
    />
  );
}

function EventLog({ frames, current }: { frames: RouteFrame[]; current: number }) {
  const logRef = useScrollLog<HTMLDivElement>(current);
  const events = frames.slice(0, current + 1).filter((f) => f.kind !== 'flytt');
  return (
    <div ref={logRef} className="rb-log" tabIndex={0} role="region" aria-label="Händelser">
      <table className="table" data-testid="handelser">
        <caption className="visually-hidden">Viktiga händelser hittills</caption>
        <thead>
          <tr>
            <th scope="col">Steg</th>
            <th scope="col">Händelse</th>
            <th scope="col">Vad roboten gör</th>
          </tr>
        </thead>
        <tbody>
          {events.map((f) => (
            <tr key={f.step} className={f.step === current ? 'rb-current' : undefined}>
              <th scope="row">{f.step}</th>
              <td>{kindLabel[f.kind]}</td>
              <td>{f.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RangeCompare({ scenario, ranges }: { scenario: ScenarioId; ranges: number[] }) {
  const rows = useMemo(() => ranges.map((k) => ({ k, r: simulateRoute(parseScenario(scenarios[scenario].lines), k) })), [scenario, ranges]);
  return (
    <table className="table" data-testid="jamforelse">
      <caption>Samma lager – bara sensorns räckvidd skiljer</caption>
      <thead>
        <tr>
          <th scope="col">Räckvidd</th>
          <th scope="col">Första plan (steg)</th>
          <th scope="col">Körda steg totalt</th>
          <th scope="col">Med rätt karta</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ k, r }) => (
          <tr key={k}>
            <th scope="row">
              {k} {k === 1 ? 'ruta' : 'rutor'}
            </th>
            <td>{r.firstPlan ?? '–'}</td>
            <td>{r.outcome === 'framme' ? r.moves : `${r.moves} (kom inte fram)`}</td>
            <td>{r.optimal ?? 'ingen väg'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const isScenario = (v: unknown): v is ScenarioId => typeof v === 'string' && (scenarioIds as string[]).includes(v);

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [rangeChoice, setRangeChoice] = useStoredState<number>('range-choice', 2, (v): v is number => typeof v === 'number');
  const [expScenario, setExpScenario] = useStoredState<ScenarioId>('exp-scenario', 'pall', isScenario);
  const [expRange, setExpRange] = useStoredState<number>('exp-range', 2, (v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
  const [custom, setCustom] = useStoredState<World | null>('custom-world', null, (v): v is World | null => v === null || isWorld(v));

  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const scenarioId: ScenarioId = guided ? setup.scenario : expScenario;
  const range = guided ? (setup.ranges.includes(rangeChoice) ? rangeChoice : setup.ranges[0]!) : expRange;
  const scenario = scenarios[scenarioId];
  const baseWorld = useMemo(() => parseScenario(scenario.lines), [scenario]);
  const world = !guided && custom ? custom : baseWorld;
  const result = useMemo(() => simulateRoute(world, range), [world, range]);
  const stepper = useStepper(result.frames.length);
  const frame = result.frames[Math.min(stepper.index, result.frames.length - 1)]!;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad gör roboten när kartan är fel?',
      body: (
        <>
          <p>
            Lagerroboten ska från <strong>F2</strong> till <strong>M</strong> i F7. Enligt <em>kartan</em> är mittgången fri, så den planerar en väg på 5 steg rakt ned. Men i <em>verkligheten</em> står en lastpall i F5 (X). Robotens sensor ser 2 rutor rakt fram, bakåt och åt sidorna.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-pall',
              prompt: 'Vad tror du att roboten gör när den ser pallen?',
              options: [
                { id: 'krock', text: 'Den kör på pallen, eftersom den följer kartan' },
                { id: 'runt', text: 'Den kör runt pallen direkt, precis bredvid' },
                { id: 'omplanera', text: 'Den stannar, ritar in pallen på kartan och planerar en ny väg från där den står' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'prova',
      phase: 'prova',
      title: 'Stega roboten genom lagret',
      body: (
        <>
          <p>
            Stega fram. Jämför de två kartorna: <strong>Robotens karta</strong> visar det roboten tror, <strong>Verkligheten</strong> visar hur det faktiskt ser ut. Följ när roboten stannar och planerar om i händelseloggen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'pall-steg',
              prompt: 'Hur många steg kör roboten totalt innan den är framme?',
              answer: 15,
              wrong: [
                { value: 5, feedback: '5 steg var den första planen, när roboten trodde att mittgången var fri. Kör till slutet och läs av antalet körda steg.' },
                { value: 14, feedback: '14 steg är den nya vägen från F3. Roboten hade redan kört 1 steg innan den stannade.' },
                { value: 13, feedback: '13 steg hade roboten kört om den haft en korrekt karta från början. Den körde först in i gången och fick vända.' },
              ],
              hint: 'Kör till slutet och läs av ”Körda steg”.',
              explanation: 'Roboten körde 1 steg till F3, såg pallen två rutor bort och stannade. Den nya vägen från F3 var 14 steg: 1 + 14 = 15. Med rätt karta hade det räckt med 13.',
            }}
          />
        </>
      ),
    },
    {
      id: 'rackvidd',
      phase: 'jamfor',
      title: 'Hur långt ser sensorn?',
      body: (
        <>
          <p>Byt räckvidd och kör igen. Bara räckvidden ändras – kartan, pallen och målet är desamma.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'rackvidd-varfor',
              prompt: 'Varför kör roboten färre steg totalt när sensorn ser längre?',
              options: [
                { id: 'a', text: 'Den upptäcker pallen tidigare och behöver inte köra in i gången och sedan vända', correct: true },
                { id: 'b', text: 'A* hittar kortare vägar med en bättre sensor', feedback: 'A* räknar på kartan och hittar alltid kortaste vägen på den. Det som ändras är NÄR kartan blir rätt.' },
                { id: 'c', text: 'Roboten kör fortare', feedback: 'Roboten kör en ruta per steg oavsett sensor. Skillnaden är var den står när den upptäcker pallen.' },
              ],
              explanation: 'Med räckvidd 1 ser roboten pallen först från F4 (17 steg totalt), med räckvidd 2 från F3 (15 steg) och med räckvidd 3 redan från start (13 steg – lika bra som med rätt karta).',
            }}
          />
        </>
      ),
    },
    {
      id: 'stangd',
      phase: 'prova',
      title: 'Den stängda dörren',
      body: (
        <>
          <p>
            Nu är vi i en skolkorridor. Roboten ska leverera post till <strong>M</strong>. Enligt kartan är dörren i F3 öppen, men i dag är den stängd. Stega och följ när roboten stannar.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'stangd-varfor',
              prompt: 'Varför planerade roboten en väg genom en stängd dörr?',
              options: [
                { id: 'a', text: 'Kartan visar bara att det finns en dörröppning – inte om dörren är stängd just nu', correct: true },
                { id: 'b', text: 'A* gjorde ett räknefel', feedback: 'A* räknade rätt på kartan: genom dörren är 11 steg. Felet är att kartan inte stämmer med verkligheten.' },
                { id: 'c', text: 'Sensorn var trasig', feedback: 'Sensorn fungerade. Den såg den stängda dörren så fort roboten stod i F2, och då planerade roboten om.' },
              ],
              explanation: 'En karta är en ögonblicksbild. Dörrar, pallar och människor ändrar sig hela tiden. Därför måste roboten kombinera kartan med det sensorerna ser just nu.',
            }}
          />
        </>
      ),
    },
    {
      id: 'oppnad',
      phase: 'prova',
      title: 'Hindret som inte längre finns',
      body: (
        <>
          <p>
            Samma korridor, men tvärtom: enligt kartan är dörren i F3 stängd (O), men någon har öppnat den. Roboten planerar därför en lång omväg.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'oppnad-kortare',
              prompt: 'Hur många steg kortare blev den totala resan än den första planen?',
              answer: 12,
              wrong: [
                { value: 11, feedback: '11 är antalet steg roboten faktiskt körde. Jämför med den första planen.' },
                { value: 23, feedback: '23 steg var den första planen. Frågan gäller skillnaden mellan planen och det roboten faktiskt körde.' },
              ],
              hint: 'Första planen minus körda steg.',
              explanation: 'Den första planen var 23 steg. Roboten såg den öppna dörren när den passerade F2 och planerade om: totalt 11 steg, alltså 12 steg kortare.',
            }}
          />
        </>
      ),
    },
    {
      id: 'ingen-vag',
      phase: 'prova',
      title: 'När det inte finns någon väg',
      body: (
        <>
          <p>
            Dörren i F3 är låst, och den enda andra vägen vid L3 blockeras av en städvagn som inte finns på kartan. Kör till slutet.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'ingen-vag-gora',
              prompt: 'Vad är det bästa roboten kan göra när den inte hittar någon väg?',
              options: [
                { id: 'a', text: 'Stanna och larma en människa, och tala om var den står och vad som blockerar', correct: true },
                { id: 'b', text: 'Köra åt ett slumpmässigt håll tills den hittar en väg', feedback: 'Att köra på måfå i en miljö med människor är riskabelt och slösar energi. Med det roboten vet finns ingen väg – att gissa ändrar inte det.' },
                { id: 'c', text: 'Försöka knuffa undan städvagnen', feedback: 'Roboten vet inte vad hindret är. Det kan vara en människa, ett barn eller något ömtåligt. Den ska inte flytta saker den inte känner igen.' },
              ],
              explanation: 'Att stanna och be om hjälp är ett tydligt och säkert beteende. En människa kan flytta städvagnen eller låsa upp dörren – och roboten kan sedan planera om.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Karta och verklighet',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'karta-verklighet',
            prompt:
              'Förklara skillnaden mellan robotens karta och den faktiska miljön med ett eget exempel, till exempel från skolan, en matbutik eller ett sjukhus. Vad måste roboten göra för att klara sig när de skiljer sig åt?',
            criteria: [
              'ger ett konkret exempel på något som ändras men inte syns på kartan',
              'beskriver kedjan: sensorn upptäcker skillnaden → kartan uppdateras → roboten planerar om från där den står',
              'tar upp vad som händer om ingen väg finns (stanna och be om hjälp)',
            ],
          }}
        />
      ),
    },
  ];

  const last = result.frames.length - 1;
  const remaining = frame.plan ? frame.plan.length - 1 : null;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps
          steps={steps}
          index={step}
          onStepChange={(i) => {
            setStep(i);
            setRangeChoice(2);
            stepper.reset();
          }}
        />
        {!guided && (
          <Panel title="Inställningar">
            <SelectField
              label="Scenario"
              value={expScenario}
              options={scenarioIds.map((k) => ({ value: k, label: `${scenarios[k].place}: ${scenarios[k].name}` }))}
              onChange={(v) => {
                setExpScenario(v);
                setCustom(null);
                stepper.reset();
              }}
            />
            <Slider label="Sensorns räckvidd" min={1} max={5} value={expRange} format={(v) => `${v} ${v === 1 ? 'ruta' : 'rutor'}`} onChange={(v) => setExpRange(v)} />
            <p className="hint">
              Ändra <strong>verkligheten</strong>: klicka på en ruta i den högra kartan, eller gå dit med piltangenterna och tryck Enter, för att ställa ut eller ta bort ett hinder. Robotens karta ändras inte – den får roboten upptäcka själv.
            </p>
            {custom && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setCustom(null);
                  stepper.reset();
                }}
              >
                Återställ verkligheten
              </button>
            )}
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title={`${scenario.place}: ${scenario.name}${!guided && custom ? ' (ändrad)' : ''}`}>
          <p>{scenario.description}</p>
          {guided && setup.ranges.length > 1 && (
            <Segmented
              legend="Sensorns räckvidd"
              value={String(range)}
              options={setup.ranges.map((k) => ({ value: String(k), label: `${k} ${k === 1 ? 'ruta' : 'rutor'}` }))}
              onChange={(v) => {
                setRangeChoice(Number(v));
                stepper.reset();
              }}
            />
          )}
          <StepperControls stepper={stepper} label="Stega roboten" />
          <LiveStatus className={frame.kind === 'upptackt' || frame.kind === 'ingen-vag' ? 'rb-alert' : undefined}>
            <strong>{kindLabel[frame.kind]}:</strong> {frame.message}
          </LiveStatus>
          <div className="rb-maps">
            <div>
              <h4>Robotens karta</h4>
              <MapView world={world} frame={frame} which="karta" />
            </div>
            <div>
              <h4>Verkligheten</h4>
              <MapView
                world={world}
                frame={frame}
                which="verklighet"
                onEdit={
                  guided
                    ? undefined
                    : (r, c) => {
                        setCustom(toggleActual(world, r, c));
                        stepper.reset();
                      }
                }
              />
            </div>
          </div>
          <Legend
            items={[
              { swatch: 'var(--surface)', symbol: arrows[frame.heading], text: 'Roboten' },
              { swatch: 'var(--surface)', symbol: 'M', text: 'Mål' },
              { swatch: 'var(--path)', symbol: '●', text: 'Planerad väg' },
              { swatch: 'var(--visited)', symbol: '·', text: 'Redan körd' },
              { swatch: 'var(--warn-soft)', symbol: '', text: 'Sensorn ser' },
              { swatch: 'var(--bad-soft)', symbol: 'X', text: 'Hinder som saknas på kartan' },
              { swatch: 'var(--ok-soft)', symbol: 'O', text: 'Hinder på kartan som inte finns' },
              { swatch: 'var(--bad-soft)', symbol: '!', text: 'Upptäckt nytt hinder' },
              { swatch: 'var(--ok-soft)', symbol: '✓', text: 'Upptäckt: fri väg' },
            ]}
          />
          <ul className="rb-stats" data-testid="resultat" aria-label="Resultat hittills">
            <li>
              Körda steg: <strong>{frame.moves}</strong>
            </li>
            <li>
              Omplaneringar: <strong>{frame.replans}</strong>
            </li>
            <li>
              Kvar enligt planen: <strong>{remaining === null ? 'ingen väg' : `${remaining} steg`}</strong>
            </li>
            <li>
              Första plan: <strong>{result.firstPlan ?? '–'}</strong> steg
            </li>
          </ul>
          {stepper.index === last && (
            <p data-testid="slutsats">
              <strong>Resultat:</strong>{' '}
              {result.outcome === 'framme'
                ? `Roboten kom fram efter ${result.moves} steg och ${result.replans} ${result.replans === 1 ? 'omplanering' : 'omplaneringar'}. Med en korrekt karta från början hade det räckt med ${result.optimal} steg.`
                : result.outcome === 'ingen-vag'
                  ? `Roboten kom inte fram. Den stannade efter ${result.moves} steg och larmade. ${result.optimal === null ? 'Det finns heller ingen väg i verkligheten.' : `I verkligheten finns en väg på ${result.optimal} steg från start, men roboten vet inte om den.`}`
                  : 'Roboten avbröt efter för många steg.'}
            </p>
          )}
          <EventLog frames={result.frames} current={stepper.index} />
        </Panel>
        {guided && setup.ranges.length > 1 && (
          <Panel title="Jämförelse">
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Jämförelsetabell"><RangeCompare scenario={setup.scenario} ranges={setup.ranges} /></div>
          </Panel>
        )}
      </div>
    </div>
  );
}
