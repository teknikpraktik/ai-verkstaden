import { useMemo } from 'react';
import { Grid } from '../../components/lab/Grid';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, NumberField, Panel, Segmented, SelectField, Slider } from '../../components/lab/Controls';
import { Question, usePrediction } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import {
  actionNames,
  arrows,
  cellName,
  consequenceText,
  DEFAULT_SEED,
  headingNames,
  isController,
  isSensor,
  isWorld,
  measure,
  measuredText,
  noiseNames,
  parseWorld,
  presets,
  simulate,
  toggleObstacle,
  worlds,
  type CloseAction,
  type Controller,
  type NoiseLevel,
  type PresetId,
  type SensorSetup,
  type SimFrame,
  type StepRecord,
  type World,
  type WorldId,
} from './logic';
import './robotik.css';

/** Vilka inställningar som går att välja mellan i varje genomgångssteg (en parameter ändras åt gången). */
const stepVariants: PresetId[][] = [
  ['grund'],
  ['grund'],
  ['hinder', 'nollgrans'],
  ['snabb', 'snabbMarginal'],
  ['snabbMarginal', 'kortSikt'],
  ['brus', 'brusMarginal'],
  ['brus', 'brusMarginal'],
];

const dr = [-1, 0, 1, 0];
const dc = [0, 1, 0, -1];

function beamCells(world: World, frame: SimFrame, range: number): Set<string> {
  const out = new Set<string>();
  for (let k = 1; k <= range; k++) {
    const r = frame.r + dr[frame.heading]! * k;
    const c = frame.c + dc[frame.heading]! * k;
    if (r < 0 || c < 0 || r >= world.rows || c >= world.cols) break;
    out.add(`${r},${c}`);
    if (world.walls[r]![c]) break;
  }
  return out;
}

function WorldView({ world, frame, range, editable, onEdit }: { world: World; frame: SimFrame; range: number; editable: boolean; onEdit: (r: number, c: number) => void }) {
  const beam = beamCells(world, frame, range);
  const visited = new Set(frame.visited);
  return (
    <Grid
      label={`Klassrummet sett uppifrån, ${world.rows} rader och ${world.cols} kolumner. Roboten står i ${cellName(frame.r, frame.c)} och tittar ${headingNames[frame.heading]}.`}
      rows={world.rows}
      cols={world.cols}
      cellSize={40}
      coordinates
      onActivate={editable ? onEdit : undefined}
      cell={(r, c) => {
        const id = `${r},${c}`;
        const name = cellName(r, c);
        const parts = [name];
        const classes: string[] = [];
        let content = '';
        if (world.walls[r]![c]) {
          parts.push('hinder');
          classes.push('cell-wall');
        } else if (visited.has(id)) {
          parts.push('besökt');
          classes.push('cell-visited');
        }
        if (beam.has(id)) {
          parts.push('inom sensorns sikt');
          classes.push('rb-beam');
          if (!world.walls[r]![c]) content = '·';
        }
        if (frame.crashAt && frame.crashAt[0] === r && frame.crashAt[1] === c) {
          parts.push('roboten krockade här');
          classes.push('rb-crash');
          content = '✱';
        }
        if (frame.r === r && frame.c === c) {
          parts.push(`roboten, tittar ${headingNames[frame.heading]}`);
          classes.push('rb-robot');
          content = arrows[frame.heading];
        }
        return { content, label: parts.join(', '), className: classes.join(' ') };
      }}
    />
  );
}

function ChainView({ record, range }: { record: StepRecord | null; range: number }) {
  if (!record) {
    return <p className="hint">Kedjan visas här när du har stegat fram ett steg.</p>;
  }
  return (
    <ol className="rb-chain" aria-label={`Kedjan i steg ${record.step}`} data-testid="kedja">
      <li>
        <span className="rb-chain-head">Sensor</span>
        Mäter: <strong>{measuredText(record.measured, range)}</strong>
        <br />
        <small>Verkligt: {record.trueDistance} fria</small>
      </li>
      <li>
        <span className="rb-chain-head">Styrprogram</span>
        {record.reason}
      </li>
      <li>
        <span className="rb-chain-head">Motor</span>
        {record.decision === 'framat' ? `kör framåt` : actionNames[record.decision]}
      </li>
      <li className={record.consequence === 'krock' ? 'rb-is-crash' : undefined}>
        <span className="rb-chain-head">Konsekvens</span>
        {record.consequence === 'krock' && <span aria-hidden="true">✱ </span>}
        {consequenceText(record)}
      </li>
    </ol>
  );
}

function LogTable({ records, current, range }: { records: StepRecord[]; current: number; range: number }) {
  const shown = records.slice(0, current);
  return (
    <div className="rb-log" tabIndex={0} role="region" aria-label="Logg över alla steg">
      <table className="table" data-testid="logg">
        <caption className="visually-hidden">Mätvärde, beslut och konsekvens i varje steg</caption>
        <thead>
          <tr>
            <th scope="col">Steg</th>
            <th scope="col">Läge</th>
            <th scope="col">Verkligt avstånd</th>
            <th scope="col">Mätvärde</th>
            <th scope="col">Beslut</th>
            <th scope="col">Konsekvens</th>
          </tr>
        </thead>
        <tbody>
          {shown.length === 0 && (
            <tr>
              <td colSpan={6}>Inga steg än.</td>
            </tr>
          )}
          {shown.map((rec) => (
            <tr key={rec.step} className={rec.step === current ? 'rb-current' : undefined}>
              <th scope="row">{rec.step}</th>
              <td>
                {cellName(rec.r, rec.c)} {arrows[rec.heading]}
              </td>
              <td>{rec.trueDistance}</td>
              <td>
                {measuredText(rec.measured, range)}
                {rec.measured !== measure(rec.trueDistance, 0, range) && <span title="Mätvärdet stämmer inte"> (fel)</span>}
              </td>
              <td>{actionNames[rec.decision]}</td>
              <td>{rec.consequence === 'krock' ? <strong>✱ {consequenceText(rec)}</strong> : consequenceText(rec)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function programText(ctrl: Controller) {
  return `OM mätvärde < ${ctrl.threshold} SÅ ${actionNames[ctrl.closeAction]}, ANNARS kör framåt ${ctrl.speed} ${ctrl.speed === 1 ? 'ruta' : 'rutor'}`;
}
function sensorText(s: SensorSetup) {
  return `Avståndssensor rakt fram · sikt ${s.range} ${s.range === 1 ? 'ruta' : 'rutor'} · ${noiseNames[s.noise].toLowerCase()}${s.noise !== 'inget' ? ` (startvärde ${s.seed})` : ''}`;
}

function CompareTable({ variants }: { variants: PresetId[] }) {
  const rows = useMemo(
    () =>
      variants.map((id) => {
        const p = presets[id];
        const s = simulate(parseWorld(worlds[p.world].lines), p.ctrl, p.sensor);
        return { id, p, s };
      }),
    [variants],
  );
  return (
    <table className="table" data-testid="jamforelse">
      <caption>Efter 30 steg – bara en inställning skiljer</caption>
      <thead>
        <tr>
          <th scope="col">Inställning</th>
          <th scope="col">Krockar</th>
          <th scope="col">Besökta rutor</th>
          <th scope="col">Felaktiga mätvärden</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ id, p, s }) => (
          <tr key={id}>
            <th scope="row">{p.name}</th>
            <td>{s.collisions}</td>
            <td>{s.visitedCount}</td>
            <td>{s.wrongReadings}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const defaultCtrl: Controller = presets.grund.ctrl;
const defaultSensor: SensorSetup = presets.grund.sensor;
const isWorldId = (v: unknown): v is WorldId => v === 'klassrum' || v === 'vaska';

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [variantIdx, setVariantIdx] = useStoredState<number>('variant', 0, (v): v is number => typeof v === 'number');
  const [expCtrl, setExpCtrl] = useStoredState<Controller>('exp-ctrl', defaultCtrl, isController);
  const [expSensor, setExpSensor] = useStoredState<SensorSetup>('exp-sensor', defaultSensor, isSensor);
  const [expWorldId, setExpWorldId] = useStoredState<WorldId>('exp-world', 'klassrum', isWorldId);
  const [custom, setCustom] = useStoredState<World | null>('custom-world', null, (v): v is World | null => v === null || isWorld(v));
  const [prediction] = usePrediction('gissa-krockar');

  const variants = stepVariants[Math.min(step, stepVariants.length - 1)]!;
  const presetId = variants[Math.min(variantIdx, variants.length - 1)] ?? variants[0]!;
  const preset = presets[presetId];
  const ctrl: Controller = guided ? preset.ctrl : expCtrl;
  const sensor: SensorSetup = guided ? preset.sensor : expSensor;
  const worldId: WorldId = guided ? preset.world : expWorldId;
  const baseWorld = useMemo(() => parseWorld(worlds[worldId].lines), [worldId]);
  const world = !guided && custom ? custom : baseWorld;

  const result = useMemo(() => simulate(world, ctrl, sensor), [world, ctrl, sensor]);
  const stepper = useStepper(result.frames.length);
  const frame = result.frames[Math.min(stepper.index, result.frames.length - 1)]!;
  const soFar = result.records.slice(0, frame.step);
  const wrongSoFar = soFar.filter((r) => r.measured !== measure(r.trueDistance, 0, sensor.range)).length;

  const edit = (r: number, c: number) => {
    setCustom(toggleObstacle(custom ?? baseWorld, r, c));
  };

  const variantPicker =
    guided && variants.length > 1 ? (
      <Segmented
        legend="Inställning att prova"
        value={presetId}
        options={variants.map((v) => ({ value: v, label: presets[v].name }))}
        onChange={(v) => setVariantIdx(variants.indexOf(v))}
      />
    ) : null;

  const predictionText: Record<string, string> = { ingen: 'inga krockar', nagra: 'några krockar', manga: 'många krockar' };

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Kommer städroboten att krocka?',
      body: (
        <>
          <p>
            Städroboten står i <strong>B2</strong> och tittar åt höger <span aria-hidden="true">▶</span>. Den har en avståndssensor som mäter hur många fria rutor det finns rakt fram. Styrprogrammet har en enda regel:
          </p>
          <p className="rb-program">{programText(presets.grund.ctrl)}</p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-krockar',
              prompt: 'Roboten kör 30 steg. Hur många gånger tror du att den krockar?',
              options: [
                { id: 'ingen', text: 'Inte en enda gång' },
                { id: 'nagra', text: 'Några gånger' },
                { id: 'manga', text: 'Många gånger' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'kedjan',
      phase: 'prova',
      title: 'Följ kedjan steg för steg',
      body: (
        <>
          <p>
            Tryck på <strong>Steg framåt</strong>. I varje steg ser du kedjan: vad <strong>sensorn</strong> mätte, vad <strong>styrprogrammet</strong> bestämde och vad <strong>motorn</strong> gjorde – och vad som hände i rummet. Loggen sparar alla steg.
          </p>
          {prediction && (
            <p>
              Du trodde: <strong>{predictionText[prediction] ?? prediction}</strong>. Kör till slutet och jämför med resultatet.
            </p>
          )}
          <Question
            spec={{
              kind: 'choice',
              id: 'kedja-steg8',
              prompt: 'Titta på steg 8 i loggen. Sensorn mätte 0 rutor. Vad hände då?',
              options: [
                { id: 'a', text: 'Programmet jämförde 0 < 1, villkoret var sant, så motorn vände roboten nedåt', correct: true },
                { id: 'b', text: 'Sensorn vände roboten när den såg väggen', feedback: 'Sensorn mäter bara. Den kan inte röra roboten – det är motorn som gör det, och bara när programmet säger till.' },
                { id: 'c', text: 'Roboten krockade och studsade nedåt', feedback: 'Titta i kolumnen Konsekvens: roboten krockade inte. Den svängde innan, eftersom mätvärdet 0 var mindre än gränsen 1.' },
              ],
              explanation: 'Kedjan är alltid densamma: sensorn mäter, programmet jämför mätvärdet med regeln och motorn utför beslutet. Roboten ”vet” inget om väggen utöver mätvärdet.',
            }}
          />
        </>
      ),
    },
    {
      id: 'hinder',
      phase: 'prova',
      title: 'Ett hinder och en felaktig regel',
      body: (
        <>
          <p>
            Någon har ställt en väska i <strong>G2</strong>. Kör först med gränsen 1 och se var roboten svänger. Byt sedan till <strong>gränsen 0</strong> och kör igen. Bara gränsen ändras.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'grans-noll',
              prompt: 'Med gränsen 0 krockar roboten med väskan om och om igen. Var i kedjan ligger felet?',
              options: [
                { id: 'a', text: 'I styrprogrammet: villkoret ”mätvärde < 0” kan aldrig bli sant, så roboten svänger aldrig', correct: true },
                { id: 'b', text: 'I sensorn: den ser inte väggen', feedback: 'Titta i loggen: sensorn mäter 0 rutor, vilket är helt rätt. Felet är vad programmet gör med mätvärdet.' },
                { id: 'c', text: 'I motorn: den svarar inte', feedback: 'Motorn gör precis det programmet säger, alltså kör framåt. Det är regeln som är fel.' },
              ],
              explanation: 'Ett mätvärde kan aldrig vara mindre än 0. Därför väljer programmet alltid ”kör framåt”. Roboten krockar 26 gånger, första gången i steg 5. En korrekt sensor räcker inte om regeln är fel.',
            }}
          />
        </>
      ),
    },
    {
      id: 'fart',
      phase: 'prova',
      title: 'Snabbare robot',
      body: (
        <>
          <p>
            Nu kör roboten <strong>2 rutor</strong> per steg. Kör först med gränsen 1 och sedan med gränsen 2. Jämförelsetabellen visar resultatet av båda.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'fart-krockar',
              prompt: 'Hur många gånger krockar roboten på 30 steg med fart 2 och gränsen 1?',
              answer: 4,
              wrong: [
                { value: 0, feedback: '0 krockar blir det med gränsen 2. Välj ”Fart 2, gräns 1” och kör till slutet.' },
                { value: 2, feedback: 'Räkna raderna med ✱ i loggen när du har kört alla 30 steg.' },
              ],
              hint: 'Kör till slutet med inställningen ”Fart 2, gräns 1” och läs av krockarna.',
              explanation: 'Fyra krockar. När det finns 1 fri ruta kvar är 1 inte < 1, så roboten kör 2 rutor och krockar. Med gränsen 2 svänger den i tid – 0 krockar. En snabbare robot behöver större säkerhetsmarginal.',
            }}
          />
        </>
      ),
    },
    {
      id: 'sikt',
      phase: 'prova',
      title: 'Begränsad sikt',
      body: (
        <>
          <p>
            Behåll fart 2 och gränsen 2, men byt till en sensor som bara ser <strong>1 ruta</strong> fram. Ett hinder längre bort syns inte alls – sensorn rapporterar ”inget hinder”.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'kort-sikt',
              prompt: 'Varför krockar roboten igen trots gränsen 2?',
              options: [
                { id: 'a', text: 'När väggen är 2 rutor bort ser sensorn den inte, så programmet får ”inget hinder” och kör 2 rutor', correct: true },
                { id: 'b', text: 'Gränsen 2 är för liten', feedback: 'Med sikt 3 gav gränsen 2 noll krockar. Det är sensorn som ändrats, inte regeln.' },
                { id: 'c', text: 'Sensorn har brus', feedback: 'I det här steget finns inget brus. Mätvärdet är ”inget hinder” för att hindret ligger utanför sikten.' },
              ],
              explanation: 'Programmet kan bara reagera på det sensorn ser. Gränsen 2 hjälper inte om sensorn aldrig kan rapportera värdet 1. Sikten måste vara minst lika lång som den sträcka roboten behöver för att hinna reagera.',
            }}
          />
        </>
      ),
    },
    {
      id: 'brus',
      phase: 'jamfor',
      title: 'Brus i sensorn',
      body: (
        <>
          <p>
            Nu har sensorn <strong>lågt brus</strong>: mätvärdet kan ibland bli en ruta för högt eller för lågt. Bruset är samma i båda försöken (startvärde {DEFAULT_SEED}), så bara gränsen skiljer. Rader märkta ”(fel)” i loggen är felaktiga mätvärden.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'brus-krockar',
              prompt: 'Hur många krockar blir det med lågt brus och gränsen 1?',
              answer: 3,
              wrong: [
                { value: 7, feedback: '7 är antalet felaktiga mätvärden. Alla fel leder inte till krock – bara de där sensorn säger 1 när det egentligen är 0.' },
                { value: 0, feedback: '0 krockar blir det med gränsen 2. Välj ”Brus, gräns 1”.' },
              ],
              hint: 'Välj ”Brus, gräns 1”, kör till slutet och läs av antalet krockar.',
              explanation: 'Tre krockar, första gången i steg 13: roboten står vid väggen (0 fria rutor) men sensorn säger 1. Programmet tror att det finns plats och kör. Med gränsen 2 blir det 0 krockar med samma brus.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Säkerhetsmarginal har ett pris',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'marginal',
            prompt:
              'Gränsen 2 gav 0 krockar med brus, men roboten besökte bara 19 rutor i stället för 21. Förklara varför – och vilken gräns du skulle välja för en städrobot i ett klassrum där elever rör sig.',
            criteria: [
              'beskriver hela kedjan: brus i sensorn → fel mätvärde → fel beslut → krock',
              'förklarar att en större gräns gör att roboten svänger tidigare och därför städar mindre nära väggarna',
              'motiverar sitt val med vad som står på spel (säkerhet för människor jämfört med hur rent det blir)',
            ],
          }}
        />
      ),
    },
  ];

  const statusText = (() => {
    const rec = frame.record;
    if (!rec) return `Roboten står i ${cellName(frame.r, frame.c)} och tittar ${headingNames[frame.heading]} ${arrows[frame.heading]}. Tryck på Steg framåt.`;
    const head = `Steg ${rec.step}: sensorn mätte ${measuredText(rec.measured, sensor.range)}. Programmet: ${rec.reason}. Följd: ${consequenceText(rec)}.`;
    return stepper.atEnd ? `${head} Klart efter ${rec.step} steg: ${result.collisions} krockar.` : head;
  })();

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps
          steps={steps}
          index={step}
          onStepChange={(i) => {
            setStep(i);
            setVariantIdx(0);
            stepper.reset();
          }}
        />
        {!guided && (
          <Panel title="Bygg din robot">
            <SelectField
              label="Rum"
              value={expWorldId}
              options={(Object.keys(worlds) as WorldId[]).map((k) => ({ value: k, label: worlds[k].name }))}
              onChange={(v) => {
                setExpWorldId(v);
                setCustom(null);
              }}
            />
            <h4>Sensor</h4>
            <Slider label="Sikt" min={1} max={5} value={expSensor.range} format={(v) => `${v} ${v === 1 ? 'ruta' : 'rutor'}`} onChange={(v) => setExpSensor({ ...expSensor, range: v })} />
            <Segmented
              legend="Brus"
              value={expSensor.noise}
              options={(Object.keys(noiseNames) as NoiseLevel[]).map((k) => ({ value: k, label: noiseNames[k] }))}
              onChange={(v) => setExpSensor({ ...expSensor, noise: v })}
            />
            <div className="row">
              <NumberField label="Startvärde för bruset" min={1} max={999} value={expSensor.seed} onChange={(v) => setExpSensor({ ...expSensor, seed: Math.max(1, Math.round(v)) })} />
              <button type="button" className="btn" onClick={() => setExpSensor({ ...expSensor, seed: (expSensor.seed % 999) + 1 })}>
                Ny slumpföljd
              </button>
            </div>
            <h4>Styrprogram</h4>
            <NumberField label="Gräns: reagera om mätvärdet är mindre än" min={0} max={6} value={expCtrl.threshold} onChange={(v) => setExpCtrl({ ...expCtrl, threshold: Math.max(0, Math.min(6, Math.round(v))) })} />
            <SelectField<CloseAction>
              label="Handling när villkoret är sant"
              value={expCtrl.closeAction}
              options={[
                { value: 'hoger', label: 'Sväng höger' },
                { value: 'vanster', label: 'Sväng vänster' },
                { value: 'stanna', label: 'Stanna' },
              ]}
              onChange={(v) => setExpCtrl({ ...expCtrl, closeAction: v })}
            />
            <h4>Motor</h4>
            <Segmented
              legend="Fart framåt"
              value={String(expCtrl.speed) as '1' | '2'}
              options={[
                { value: '1', label: '1 ruta per steg' },
                { value: '2', label: '2 rutor per steg' },
              ]}
              onChange={(v) => setExpCtrl({ ...expCtrl, speed: v === '2' ? 2 : 1 })}
            />
            <p className="hint">Klicka på en ruta, eller gå dit med piltangenterna och tryck Enter, för att ställa ut eller ta bort ett hinder.</p>
            {custom && (
              <button type="button" className="btn" onClick={() => setCustom(null)}>
                Återställ rummet
              </button>
            )}
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title={guided ? `Städroboten – ${preset.name.toLowerCase()}` : 'Städroboten – din inställning'}>
          {variantPicker}
          <p className="rb-program" aria-label="Robotens styrprogram">
            {programText(ctrl)}
          </p>
          <p className="hint">{sensorText(sensor)}</p>
          <StepperControls stepper={stepper} label="Stega roboten" />
          <LiveStatus>{statusText}</LiveStatus>
          <ChainView record={frame.record} range={sensor.range} />
          <WorldView world={world} frame={frame} range={sensor.range} editable={!guided} onEdit={edit} />
          <Legend
            items={[
              { swatch: 'var(--surface)', symbol: arrows[frame.heading], text: 'Roboten (pilen visar riktningen)' },
              { swatch: 'var(--warn-soft)', symbol: '·', text: 'Sensorns sikt' },
              { swatch: 'var(--wall)', symbol: '', text: 'Vägg, bänk eller väska' },
              { swatch: 'var(--visited)', symbol: '', text: 'Besökt (städad)' },
              { swatch: 'var(--bad-soft)', symbol: '✱', text: 'Krock' },
            ]}
          />
          <ul className="rb-stats" data-testid="resultat" aria-label="Resultat hittills">
            <li>
              Steg: <strong>{frame.step}</strong> av {result.records.length}
            </li>
            <li>
              Krockar: <strong>{frame.collisions}</strong>
            </li>
            <li>
              Besökta rutor: <strong>{frame.visited.length}</strong>
            </li>
            <li>
              Felaktiga mätvärden: <strong>{wrongSoFar}</strong>
            </li>
          </ul>
          <LogTable records={result.records} current={frame.step} range={sensor.range} />
        </Panel>
        {guided && variants.length > 1 && (
          <Panel title="Jämförelse">
            <CompareTable variants={variants} />
          </Panel>
        )}
      </div>
    </div>
  );
}
