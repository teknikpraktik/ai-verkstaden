import { useMemo } from 'react';
import { PlotFrame } from '../../components/lab/Charts';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import { datasets, DOMAIN, finalFrame, fmt, kmeans, partitionKey, type DatasetId, type Frame, type P } from './logic';

const SHAPES = ['●', '▲', '■', '◆', '★', '✚'];
const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

interface StepSetup {
  k: number;
  seed: number;
  run: boolean;
  seedControl: boolean;
  kControl: boolean;
}

const stepSetup: StepSetup[] = [
  { k: 3, seed: 1, run: false, seedControl: false, kControl: false },
  { k: 3, seed: 1, run: true, seedControl: false, kControl: false },
  { k: 3, seed: 1, run: true, seedControl: true, kControl: false },
  { k: 3, seed: 1, run: true, seedControl: false, kControl: true },
  { k: 3, seed: 1, run: true, seedControl: false, kControl: false },
];

function ClusterPlot({ points, frame }: { points: P[]; frame: Frame | null }) {
  const a = frame?.assignment ?? null;
  const desc = frame
    ? `${points.length} elever. ${frame.centroids.length} centrum markerade med kryss. ${frame.message} Tabellen visar vilka punkter som hör till varje grupp.`
    : `${points.length} elever som grå ringar. Ingen indelning ännu.`;
  return (
    <PlotFrame width={460} height={420} xDomain={DOMAIN} yDomain={DOMAIN} xLabel="Träning (timmar per vecka)" yLabel="Läsning (timmar per vecka)" title="Fritidsvanor" description={desc}>
      {(x, y) => (
        <g aria-hidden="true">
          {frame && a && frame.phase === 'assign' &&
            points.map((p, i) => {
              const c = frame.centroids[a[i]!]!;
              return <line key={`l${i}`} x1={x(p.x)} y1={y(p.y)} x2={x(c.x)} y2={y(c.y)} stroke={COLORS[a[i]! % 6]} strokeWidth={1} opacity={0.6} />;
            })}
          {points.map((p, i) => {
            const c = a ? a[i]! : -1;
            return (
              <g key={i}>
                <text x={x(p.x)} y={y(p.y) + 6} fontSize={18} textAnchor="middle" fill={c >= 0 ? COLORS[c % 6] : 'var(--text-muted)'}>
                  {c >= 0 ? SHAPES[c % 6] : '○'}
                </text>
                <text x={x(p.x) + 9} y={y(p.y) - 6} fontSize={10} fill="var(--text-muted)">
                  {i + 1}
                </text>
              </g>
            );
          })}
          {frame?.centroids.map((c, j) => (
            <g key={`c${j}`}>
              <circle cx={x(c.x)} cy={y(c.y)} r={13} fill="var(--surface)" stroke={COLORS[j % 6]} strokeWidth={3} opacity={0.9} />
              <text x={x(c.x)} y={y(c.y) + 4} fontSize={11} fontWeight={700} textAnchor="middle" fill="var(--text)">
                C{j + 1}
              </text>
            </g>
          ))}
        </g>
      )}
    </PlotFrame>
  );
}

function GroupTable({ points, frame }: { points: P[]; frame: Frame }) {
  return (
    <div className="table-wrap">
      <table className="table" data-testid="grupper">
        <caption>Grupperna just nu</caption>
        <thead>
          <tr>
            <th scope="col">Grupp</th>
            <th scope="col">Centrum (träning; läsning)</th>
            <th scope="col">Punkter</th>
          </tr>
        </thead>
        <tbody>
          {frame.centroids.map((c, j) => {
            const members = frame.assignment ? points.map((_, i) => i).filter((i) => frame.assignment![i] === j) : [];
            return (
              <tr key={j}>
                <th scope="row">
                  <span aria-hidden="true" style={{ color: COLORS[j % 6] }}>
                    {SHAPES[j % 6]}{' '}
                  </span>
                  C{j + 1}
                </th>
                <td>
                  {fmt(c.x)}; {fmt(c.y)}
                </td>
                <td>{frame.assignment ? (members.length ? `${members.length} st: ${members.map((i) => i + 1).join(', ')}` : 'tomt kluster') : 'ingen tilldelning ännu'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Runner({ points, k, seed }: { points: P[]; k: number; seed: number }) {
  const frames = useMemo(() => kmeans(points, k, seed), [points, k, seed]);
  const stepper = useStepper(frames.length);
  const frame = frames[Math.min(stepper.index, frames.length - 1)]!;
  const phaseName: Record<Frame['phase'], string> = { init: '', assign: 'Tilldelning.', update: 'Uppdatering.', done: 'Klar.' };
  return (
    <Panel title={`k-means med k = ${k} och startvärde ${seed}`}>
      <StepperControls stepper={stepper} label="Stega k-means" />
      <LiveStatus>
        <strong>{phaseName[frame.phase]}</strong> <span data-testid="kmeans-status">{frame.message}</span> {frame.inertia !== null && <>Summa av kvadratavstånd: <strong data-testid="summa">{fmt(frame.inertia)}</strong>.</>}
      </LiveStatus>
      <ClusterPlot points={points} frame={frame} />
      <Legend
        items={[
          ...frame.centroids.slice(0, 6).map((_, j) => ({ swatch: COLORS[j % 6]!, symbol: SHAPES[j % 6], text: `Grupp C${j + 1}` })),
          { swatch: 'var(--surface)', symbol: 'C1', text: 'Centrum' },
        ]}
      />
      {points.length > 0 && <GroupTable points={points} frame={frame} />}
    </Panel>
  );
}

function SeedTable({ points, k }: { points: P[]; k: number }) {
  const rows = useMemo(() => {
    const ref = partitionKey(finalFrame(points, k, 1).assignment ?? []);
    return SEEDS.map((s) => {
      const f = finalFrame(points, k, s);
      return { s, inertia: f.inertia, same: partitionKey(f.assignment ?? []) === ref };
    });
  }, [points, k]);
  return (
    <div className="table-wrap">
      <table className="table" data-testid="startvarden">
        <caption>Slutresultat för olika startvärden (k = {k})</caption>
        <thead>
          <tr>
            <th scope="col">Startvärde</th>
            <th scope="col">Summa av kvadratavstånd</th>
            <th scope="col">Samma grupper som startvärde 1?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.s}>
              <th scope="row">{r.s}</th>
              <td>{fmt(r.inertia)}</td>
              <td>{r.same ? '✓ ja' : '✗ nej'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KTable({ points, seed }: { points: P[]; seed: number }) {
  return (
    <div className="table-wrap">
      <table className="table" data-testid="k-tabell">
        <caption>Summa av kvadratavstånd för olika k (startvärde {seed})</caption>
        <thead>
          <tr>
            <th scope="col">k</th>
            <th scope="col">Summa</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{fmt(finalFrame(points, k, seed).inertia)}</td>
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
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const [gSeed, setGSeed] = useStoredState<number>('guided-seed', 1, (v): v is number => typeof v === 'number' && SEEDS.includes(v));
  const [gK, setGK] = useStoredState<number>('guided-k', 3, (v): v is number => typeof v === 'number' && v >= 1 && v <= 6);
  const [eSeed, setESeed] = useStoredState<number>('seed', 1, (v): v is number => typeof v === 'number' && v >= 1 && v <= 99);
  const [eK, setEK] = useStoredState<number>('k', 3, (v): v is number => typeof v === 'number' && v >= 1 && v <= 6);
  const [dataset, setDataset] = useStoredState<DatasetId>('dataset', 'klassen', (v): v is DatasetId => v === 'klassen' || v === 'liten');

  const points = guided ? datasets.klassen.points : datasets[dataset].points;
  const k = guided ? (setup.kControl ? gK : setup.k) : eK;
  const seed = guided ? (setup.seedControl ? gSeed : setup.seed) : eSeed;
  const run = guided ? setup.run : true;

  const onStepChange = (i: number) => {
    setStep(i);
    setGSeed(1);
    setGK(3);
  };

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Hur många grupper finns det?',
      body: (
        <>
          <p>
            21 påhittade elever har svarat på hur många timmar per vecka de tränar och läser. Det finns <strong>inget facit</strong> – ingen har sagt vilka grupper som finns. Kan en algoritm hitta grupper ändå?
          </p>
          <Question key="gissa-grupper"
            spec={{
              kind: 'predict',
              id: 'gissa-grupper',
              prompt: 'Hur många grupper ser du i diagrammet?',
              options: [
                { id: '2', text: 'Två' },
                { id: '3', text: 'Tre' },
                { id: '4', text: 'Fyra' },
                { id: 'oklart', text: 'Det går inte att säga säkert' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'stega',
      phase: 'prova',
      title: 'Stega k-means',
      body: (
        <>
          <p>
            k-means med <strong>k = 3</strong> börjar med tre centrum på slumpvalda punkter. Sedan växlar den mellan två steg: <strong>tilldelning</strong> (varje punkt går till närmaste centrum) och <strong>uppdatering</strong> (varje centrum flyttas till medelpunkten av sina punkter). Tryck på Steg framåt.
          </p>
          <Question key="uppdatering"
            spec={{
              kind: 'choice',
              id: 'uppdatering',
              prompt: 'Vad händer i ett uppdateringssteg?',
              options: [
                { id: 'a', text: 'Varje centrum flyttas till medelpunkten av punkterna i sin grupp', correct: true },
                { id: 'b', text: 'Varje punkt byter till närmaste centrum', feedback: 'Det är tilldelningssteget. I uppdateringen står punkterna still och centrumen flyttas.' },
                { id: 'c', text: 'Algoritmen lägger till ett nytt centrum', feedback: 'Antalet centrum är alltid k. Det är du som väljer k innan algoritmen startar.' },
              ],
              explanation: 'Tilldelning och uppdatering upprepas tills ingen punkt byter grupp. Summan av kvadratavstånd kan aldrig öka under tiden.',
            }}
          />
        </>
      ),
    },
    {
      id: 'startvarde',
      phase: 'jamfor',
      title: 'Byt startvärde',
      body: (
        <>
          <p>
            Startvärdet bestämmer vilka punkter som blir startcentrum. Behåll k = 3 och byt <strong>bara</strong> startvärde. Stega igenom och jämför med tabellen.
          </p>
          <Question key="annat-startvarde"
            spec={{
              kind: 'numeric',
              id: 'annat-startvarde',
              prompt: 'Vilket av startvärdena 1–8 ger en annan indelning än de andra?',
              answer: 8,
              wrong: [{ value: 1, feedback: 'Startvärde 1 är det som de andra jämförs med. Leta i tabellen efter raden med ✗.' }],
              hint: 'Titta i kolumnen ”Samma grupper som startvärde 1?”.',
              explanation: 'Med startvärde 8 hamnar två startcentrum bland idrottarna. Algoritmen fastnar då i en sämre lösning: summan blir 143,4 i stället för 49,3.',
            }}
          />
        </>
      ),
    },
    {
      id: 'valj-k',
      phase: 'jamfor',
      title: 'Ändra k',
      body: (
        <>
          <p>Behåll startvärde 1 och ändra bara k. Titta på summan av kvadratavstånd i tabellen.</p>
          <Question key="storre-k"
            spec={{
              kind: 'choice',
              id: 'storre-k',
              prompt: 'Summan blir mindre ju större k är. Betyder det att större k alltid är bättre?',
              options: [
                { id: 'a', text: 'Nej – med lika många grupper som elever blir summan 0, men då säger grupperna ingenting', correct: true },
                { id: 'b', text: 'Ja, lägre summa betyder alltid bättre grupper', feedback: 'Summan blir automatiskt lägre när det finns fler centrum att vara nära. Med 21 grupper blir den 0 – men det är inga användbara grupper.' },
                { id: 'c', text: 'Ja, eftersom algoritmen då hittar de verkliga grupperna', feedback: 'Det finns inga ”verkliga” grupper i facit. Fler grupper delar bara upp de befintliga i mindre bitar.' },
              ],
              explanation: 'Valet av k är ett mänskligt beslut: hur många grupper är användbara för det vi vill göra?',
            }}
          />
        </>
      ),
    },
    {
      id: 'tolka',
      phase: 'forklara',
      title: 'Tolka grupperna',
      body: (
        <Question key="tolka-grupper"
          spec={{
            kind: 'open',
            id: 'tolka-grupper',
            prompt: 'Ge de tre grupperna namn och beskriv dem. Vad kan algoritmen inte säga om grupperna?',
            criteria: [
              'ger varje grupp ett namn som bygger på centrumets värden (t.ex. mycket träning, lite läsning)',
              'nämner att algoritmen bara räknar avstånd och inte vet vad grupperna betyder',
              'nämner att elever mittemellan (t.ex. punkt 20 och 21) inte passar perfekt i någon grupp',
              'nämner att resultatet beror på k och startvärde',
            ],
          }}
        />
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={onStepChange} />
        {guided && setup.seedControl && (
          <Panel title="Jämför startvärden">
            <Segmented legend="Startvärde" value={String(gSeed)} options={SEEDS.map((s) => ({ value: String(s), label: String(s) }))} onChange={(v) => setGSeed(Number(v))} />
            <SeedTable points={points} k={k} />
          </Panel>
        )}
        {guided && setup.kControl && (
          <Panel title="Antal grupper">
            <Slider label="Antal grupper k" value={gK} min={1} max={6} onChange={setGK} />
            <KTable points={points} seed={seed} />
          </Panel>
        )}
        {!guided && (
          <Panel title="Inställningar">
            <Segmented
              legend="Data"
              value={dataset}
              options={(Object.keys(datasets) as DatasetId[]).map((d) => ({ value: d, label: datasets[d].name }))}
              onChange={setDataset}
            />
            <Slider label="Antal grupper k" value={eK} min={1} max={6} onChange={setEK} hint={eK > points.length ? 'k är större än antalet punkter – vissa grupper blir tomma.' : undefined} />
            <Slider label="Startvärde" value={eSeed} min={1} max={20} onChange={setESeed} />
            <SeedTable points={points} k={k} />
            <KTable points={points} seed={seed} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        {run ? (
          <Runner key={`${guided ? 'g' : dataset}-${k}-${seed}`} points={points} k={k} seed={seed} />
        ) : (
          <Panel title="Fritidsvanor (inga grupper ännu)">
            <ClusterPlot points={points} frame={null} />
          </Panel>
        )}
      </div>
    </div>
  );
}
