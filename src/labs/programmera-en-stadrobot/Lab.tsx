import { useMemo } from 'react';
import { Grid } from '../../components/lab/Grid';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, NumberField, Panel, Segmented, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import {
  actionText,
  dirNames,
  isRoomId,
  isStrategy,
  key,
  MAX_STEPS,
  parseRoom,
  posName,
  programs,
  randomSummary,
  roomIds,
  rooms,
  simulate,
  strategyNames,
  cellsInSight,
  type RoomId,
  type SimFrame,
  type Strategy,
} from './logic';
import './lab.css';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

interface Setup {
  room: RoomId;
  strategy: Strategy;
  /** null = eleven väljer själv i steget */
  sight: number | null;
  seed: number | null;
  compare: boolean;
}

const stepSetup: Setup[] = [
  { room: 'tomt', strategy: 'slump', sight: 0, seed: 1, compare: false },
  { room: 'tomt', strategy: 'slump', sight: 0, seed: 1, compare: false },
  { room: 'tomt', strategy: 'regler', sight: 0, seed: 1, compare: false },
  { room: 'tomt', strategy: 'slump', sight: 0, seed: null, compare: true },
  { room: 'tomt', strategy: 'regler', sight: null, seed: 1, compare: true },
  { room: 'moblerat', strategy: 'regler', sight: 0, seed: 1, compare: true },
  { room: 'moblerat', strategy: 'regler', sight: 0, seed: 1, compare: true },
];

function RoomView({ roomId, frame, sight }: { roomId: RoomId; frame: SimFrame; sight: number }) {
  const room = useMemo(() => parseRoom(rooms[roomId].lines), [roomId]);
  const dirt = new Set(frame.dirt);
  const trail = new Set(frame.trail);
  const checked = new Set(frame.checked);
  const sightSet = new Set(cellsInSight(room, frame.pos, sight).map(key));
  return (
    <Grid
      label={`${rooms[roomId].name} med ${room.rows} rader och ${room.cols} kolumner. Använd piltangenterna för att läsa rutorna.`}
      rows={room.rows}
      cols={room.cols}
      cellSize={48}
      coordinates
      cell={(r, c) => {
        const k = key([r, c]);
        const name = posName([r, c]);
        if (room.blocked[r]![c]) return { content: '■', label: `${name}: möbel`, className: 'cell-wall' };
        const parts = [name];
        const classes: string[] = [];
        let content = '';
        if (trail.has(k)) {
          parts.push('roboten har varit här');
          classes.push('cell-visited');
        }
        if (checked.has(k)) {
          parts.push('kontrollerad');
          content = '✓';
        }
        if (dirt.has(k)) {
          parts.push('smutsig');
          content = '✱';
          classes.push('robot-dirt');
        } else parts.push('ren');
        if (sightSet.has(k) && sight > 0) {
          parts.push('inom sikten');
          classes.push('robot-sight');
        }
        if (frame.pos[0] === r && frame.pos[1] === c) {
          parts.push('roboten står här');
          content = 'R';
          classes.push('robot-robot');
        }
        return { content, label: parts.join(', '), className: classes.join(' ') };
      }}
    />
  );
}

function AgentLoop({ frame, strategy, sight, total }: { frame: SimFrame; strategy: Strategy; sight: number; total: number }) {
  const p = frame.percept;
  return (
    <dl className="robot-loop" data-testid="agentloop">
      <dt>Mål</dt>
      <dd>Alla rutor ska bli rena ({frame.dirt.length} av {total} smutsiga kvar).</dd>
      <dt>Sensorer</dt>
      <dd>
        {p ? (
          <>
            Egen ruta: {p.here ? 'smutsig' : 'ren'}.{' '}
            {sight > 0 ? `Smuts inom sikten ${sight}: ${p.seen.length ? p.seen.map(posName).join(', ') : 'ingen'}.` : 'Sikt 0: ser bara den egna rutan.'}{' '}
            Hinder: {p.blocked.length ? p.blocked.map((d) => dirNames[d].split(' ')[0]).join(', ') : 'inga'}.
          </>
        ) : (
          'Inget avläst än – tryck på Steg framåt.'
        )}
      </dd>
      <dt>Tillstånd</dt>
      <dd>
        Står i {posName(frame.pos)}.{' '}
        {strategy === 'regler'
          ? `Minne: ${frame.checked.length} kontrollerade rutor, känd smuts: ${frame.knownDirt.length ? frame.knownDirt.map(posName).join(', ') : 'ingen'}.`
          : 'Slumproboten har inget minne.'}
      </dd>
      <dt>Handling</dt>
      <dd>{actionText(frame.action)}</dd>
      <dt>Resultat</dt>
      <dd>{frame.result}</dd>
    </dl>
  );
}

function Program({ strategy, rule }: { strategy: Strategy; rule: number | null }) {
  return (
    <ol className="robot-program" aria-label={`Program för ${strategyNames[strategy].toLowerCase()}`}>
      {programs[strategy].map((line, i) => (
        <li key={line} className={i === rule ? 'is-active' : undefined}>
          {line}
          {i === rule && <strong> ◀ används nu</strong>}
        </li>
      ))}
    </ol>
  );
}

function CompareTable({ roomId, sight, seed }: { roomId: RoomId; sight: number; seed: number }) {
  const room = useMemo(() => parseRoom(rooms[roomId].lines), [roomId]);
  const rules = useMemo(() => simulate(room, { strategy: 'regler', sight, seed }), [room, sight, seed]);
  const rnd = useMemo(() => simulate(room, { strategy: 'slump', sight, seed }), [room, sight, seed]);
  const many = useMemo(() => randomSummary(roomId, sight, SEEDS), [roomId, sight]);
  const sights = useMemo(() => [0, 1, 2].map((s) => simulate(room, { strategy: 'regler', sight: s, seed })), [room, seed]);
  const fmt = (v: number | null) => (v === null ? `inte rent efter ${MAX_STEPS}` : String(v));
  return (
    <>
      <table className="table" data-testid="jamforelse">
        <caption>
          Strategier i samma rum ({rooms[roomId].name.toLowerCase()}, sikt {sight})
        </caption>
        <thead>
          <tr>
            <th scope="col">Strategi</th>
            <th scope="col">Handlingar tills rummet var rent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Regelstyrd</th>
            <td>{fmt(rules.stepsToClean)}</td>
          </tr>
          <tr>
            <th scope="row">Slump, startvärde {seed}</th>
            <td>{fmt(rnd.stepsToClean)}</td>
          </tr>
          <tr>
            <th scope="row">Slump, startvärde 1–20</th>
            <td>
              rent inom {MAX_STEPS} steg i {many.finished} av {many.runs} körningar
              {many.min !== null && `; snabbast ${many.min}, långsammast ${many.max}`}
            </td>
          </tr>
        </tbody>
      </table>
      <table className="table" data-testid="jamforelse-sikt">
        <caption>Bara sikten ändras: regelstyrd robot i {rooms[roomId].name.toLowerCase()}</caption>
        <thead>
          <tr>
            <th scope="col">Sikt</th>
            <th scope="col">Handlingar tills rent</th>
            <th scope="col">Handlingar tills roboten stannade</th>
          </tr>
        </thead>
        <tbody>
          {sights.map((r, s) => (
            <tr key={s}>
              <th scope="row">{s}</th>
              <td>{fmt(r.stepsToClean)}</td>
              <td>{r.frames.length - 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [expRoom, setExpRoom] = useStoredState<RoomId>('room', 'tomt', isRoomId);
  const [expStrategy, setExpStrategy] = useStoredState<Strategy>('strategy', 'slump', isStrategy);
  const isSight = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3;
  const isSeed = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 999;
  const [sightChoice, setSightChoice] = useStoredState<number>('sight', 0, isSight);
  const [seedChoice, setSeedChoice] = useStoredState<number>('seed', 1, isSeed);

  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const roomId = guided ? setup.room : expRoom;
  const strategy = guided ? setup.strategy : expStrategy;
  const sight = guided && setup.sight !== null ? setup.sight : sightChoice;
  const seed = guided && setup.seed !== null ? setup.seed : seedChoice;
  const showCompare = guided ? setup.compare : true;

  const room = useMemo(() => parseRoom(rooms[roomId].lines), [roomId]);
  const result = useMemo(() => simulate(room, { strategy, sight, seed }), [room, strategy, sight, seed]);
  const stepper = useStepper(result.frames.length);
  const frame = result.frames[Math.min(stepper.index, result.frames.length - 1)]!;

  const seedField = (
    <NumberField
      label="Startvärde för slumpen (1–999)"
      value={seedChoice}
      min={1}
      max={999}
      onChange={(v) => {
        const n = Math.round(v);
        if (n >= 1 && n <= 999) {
          setSeedChoice(n);
          stepper.reset();
        }
      }}
    />
  );
  const sightSlider = (
    <Slider
      label="Sikt"
      value={sightChoice}
      min={0}
      max={3}
      format={(v) => (v === 0 ? '0 (bara egna rutan)' : `${v} ${v === 1 ? 'steg' : 'steg bort'}`)}
      onChange={(v) => {
        setSightChoice(v);
        stepper.reset();
      }}
    />
  );

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Slump eller regler?',
      body: (
        <>
          <p>
            En städrobot ska göra rent ett rum med fem smutsiga rutor (<strong>✱</strong>). Varje handling – ett steg eller en sugning – tar lika lång tid. Du ska jämföra två program: ett som väljer håll på måfå och ett som följer regler.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-snabbast',
              prompt: 'Vilken robot tror du gör rent rummet med minst antal handlingar?',
              options: [
                { id: 'slump', text: 'Roboten som väljer håll slumpmässigt' },
                { id: 'regler', text: 'Roboten som följer regler' },
                { id: 'lika', text: 'Ungefär lika – det beror på tur' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'slump',
      phase: 'prova',
      title: 'Stega slumproboten',
      body: (
        <>
          <p>
            Tryck på <strong>Steg framåt</strong> några gånger. Programmet till höger visar vilken instruktion roboten kör just nu. Under rummet ser du robotens mål, vad sensorerna visar, dess tillstånd, handlingen och resultatet.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'sensor-eller-tillstand',
              prompt: 'Vilket av följande är sensorinformation – något roboten mäter just nu?',
              options: [
                { id: 'a', text: 'Rutan jag står på är ren', correct: true },
                { id: 'b', text: 'Alla rutor ska bli rena', feedback: 'Det är robotens mål. Målet mäts inte – det är bestämt i förväg av den som byggt roboten.' },
                { id: 'c', text: 'Jag har redan kontrollerat A1 och B1', feedback: 'Det är något roboten minns, alltså en del av dess tillstånd. Sensorerna visar bara hur det ser ut just nu.' },
              ],
              explanation: 'Sensorerna mäter omgivningen här och nu. Mål är bestämt i förväg och minnet är en del av robotens tillstånd.',
            }}
          />
        </>
      ),
    },
    {
      id: 'regler',
      phase: 'prova',
      title: 'Stega den regelstyrda roboten',
      body: (
        <>
          <p>
            Den regelstyrda roboten har en karta över möblerna och <strong>minns</strong> vilka rutor den har kontrollerat (✓). Den prövar reglerna uppifrån och ned och kör den första som passar. Kör till slutet och läs av resultatet.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'regler-steg',
              prompt: 'Efter hur många handlingar är rummet rent med den regelstyrda roboten (sikt 0)?',
              answer: 32,
              wrong: [
                { value: 35, feedback: '35 är antalet handlingar tills roboten stannade. Rummet blev rent tidigare – roboten fortsatte för att den inte kan veta att rummet är rent förrän den har kontrollerat alla rutor.' },
                { value: 88, feedback: '88 är vad slumproboten behövde med startvärde 1. Titta på den regelstyrda roboten.' },
              ],
              hint: 'Titta i resultatraden eller gå bakåt tills sista smutsen sögs upp.',
              explanation: 'Rummet var rent efter 32 handlingar. Roboten stannade först efter 35, eftersom den med sikt 0 måste besöka de sista rutorna för att veta att de är rena.',
            }}
          />
        </>
      ),
    },
    {
      id: 'startvarde',
      phase: 'jamfor',
      title: 'Byt startvärde för slumpen',
      body: (
        <>
          <p>
            Slumpen styrs av ett startvärde: samma startvärde ger exakt samma körning igen. Prova några olika startvärden och jämför med tabellen.
          </p>
          {seedField}
          <Question
            spec={{
              kind: 'choice',
              id: 'slump-varierar',
              prompt: 'Vad visar tabellen om slumpstrategin med startvärde 1–20?',
              options: [
                { id: 'a', text: 'Antalet handlingar varierar mycket, och ibland blir rummet inte ens rent på 300 steg', correct: true },
                { id: 'b', text: 'Slumpen är alltid sämst', feedback: 'Inte alltid lika illa – med tur kan slumproboten hitta smutsen ganska snabbt. Men i genomsnitt behöver den många fler handlingar, och resultatet går inte att lita på.' },
                { id: 'c', text: 'Ett högre startvärde ger en snabbare robot', feedback: 'Startvärdet är bara ett nummer som väljer vilken slumpföljd som används. Ett större tal betyder inte bättre slump.' },
              ],
              explanation: 'I det tomma rummet var slumproboten klar efter mellan 60 och 236 handlingar, och 2 av 20 körningar blev inte klara. Den regelstyrda roboten behöver alltid 32.',
            }}
          />
        </>
      ),
    },
    {
      id: 'sikt',
      phase: 'jamfor',
      title: 'Ändra bara sikten',
      body: (
        <>
          <p>Nu ändrar du en sak i taget: robotens sikt. Rummet och reglerna är desamma. Med större sikt ser roboten smuts på rutor längre bort.</p>
          {sightSlider}
          <Question
            spec={{
              kind: 'numeric',
              id: 'sikt-skillnad',
              prompt: 'Hur många färre handlingar behöver den regelstyrda roboten för att göra rent med sikt 2 jämfört med sikt 0?',
              answer: 10,
              wrong: [
                { value: 12, feedback: '12 är skillnaden i när roboten stannade (35 − 23). Frågan gäller när rummet blev rent.' },
                { value: 22, feedback: '22 är antalet handlingar med sikt 2. Frågan gäller skillnaden mot sikt 0.' },
              ],
              hint: 'Använd kolumnen ”Handlingar tills rent” i tabellen över sikt.',
              explanation: 'Med sikt 0 behövs 32 handlingar, med sikt 2 bara 22. Bättre sensorer ger roboten mer information, så den kan gå direkt mot smutsen.',
            }}
          />
        </>
      ),
    },
    {
      id: 'moblerat',
      phase: 'prova',
      title: 'Ändra miljön: möbler',
      body: (
        <>
          <p>Nu står det en soffa och ett bord (■) i rummet. Stega den regelstyrda roboten och jämför med slumproboten i tabellen.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'mobler-varfor',
              prompt: 'Den regelstyrda roboten klarar möblerna bra (31 handlingar). Varför?',
              options: [
                { id: 'a', text: 'Den har en karta över möblerna och minns vilka rutor den kontrollerat, så den går runt hindren mot närmaste okontrollerade ruta', correct: true },
                { id: 'b', text: 'Den ser hela rummet hela tiden', feedback: 'Med sikt 0 ser den bara den egna rutan. Det är kartan och minnet som hjälper den.' },
                { id: 'c', text: 'Den har tur', feedback: 'Den regelstyrda roboten använder ingen slump. Samma rum ger alltid samma körning.' },
              ],
              explanation: 'Reglerna, kartan och minnet gör roboten systematisk. Slumproboten kör fast i hörn bakom möblerna – med startvärde 1 behöver den 201 handlingar.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara med agentbegreppen',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'agent-beskrivning',
            prompt: 'Beskriv den regelstyrda roboten som en agent. Vad är dess mål, sensorer, tillstånd och handlingar? När kan en slumpstrategi ändå vara användbar?',
            criteria: [
              'nämner målet (rent rum) och minst en sensor (smuts på egna rutan, sikt eller hinder)',
              'skiljer på vad roboten mäter just nu och vad den minns (tillstånd)',
              'nämner handlingarna suga och gå',
              'ger ett skäl för slump, till exempel när roboten saknar karta eller miljön ändras',
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
              legend="Rum"
              value={expRoom}
              options={roomIds.map((r) => ({ value: r, label: rooms[r].name }))}
              onChange={(v) => {
                setExpRoom(v);
                stepper.reset();
              }}
            />
            <Segmented
              legend="Strategi"
              value={expStrategy}
              options={[
                { value: 'slump', label: 'Slump' },
                { value: 'regler', label: 'Regelstyrd' },
              ]}
              onChange={(v) => {
                setExpStrategy(v);
                stepper.reset();
              }}
            />
            {sightSlider}
            {seedField}
            <p className="hint">Slumproboten använder inte sikten – den väljer håll på måfå oavsett vad den ser.</p>
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={`${strategyNames[strategy]} i ${rooms[roomId].name.toLowerCase()} (sikt ${sight}${strategy === 'slump' ? `, startvärde ${seed}` : ''})`}>
          <StepperControls stepper={stepper} label="Stega roboten" />
          <LiveStatus>
            {frame.action ? `Handling ${frame.step}: ${actionText(frame.action)}. ` : ''}
            {frame.result}
          </LiveStatus>
          <div className="robot-room-and-loop">
            <RoomView roomId={roomId} frame={frame} sight={sight} />
            <div>
              <h4>Programmet</h4>
              <Program strategy={strategy} rule={frame.rule} />
            </div>
          </div>
          <AgentLoop frame={frame} strategy={strategy} sight={sight} total={result.totalDirt} />
          <Legend
            items={[
              { swatch: 'var(--accent-soft)', symbol: 'R', text: 'Roboten' },
              { swatch: 'var(--surface)', symbol: '✱', text: 'Smuts' },
              { swatch: 'var(--wall)', symbol: '', text: 'Möbel' },
              { swatch: 'var(--visited)', symbol: '', text: 'Roboten har varit här' },
              { swatch: 'var(--surface)', symbol: '✓', text: 'Kontrollerad (i minnet)' },
              { swatch: 'var(--surface)', symbol: '┆', text: 'Inom sikten (streckad ram)' },
            ]}
          />
          {frame.done || stepper.atEnd ? (
            <p data-testid="resultat">
              <strong>Resultat:</strong>{' '}
              {result.stepsToClean !== null
                ? `rummet var rent efter ${result.stepsToClean} handlingar`
                : `rummet var inte rent efter ${MAX_STEPS} handlingar (${result.cleaned} av ${result.totalDirt} smutsiga rutor rengjorda)`}
              {result.stoppedBy === 'stannade' ? `; roboten stannade efter ${result.frames.length - 1} handlingar.` : '.'}
            </p>
          ) : null}
        </Panel>
        {showCompare && (
          <Panel title="Jämförelse">
            <CompareTable roomId={roomId} sight={sight} seed={seed} />
          </Panel>
        )}
      </div>
    </div>
  );
}
