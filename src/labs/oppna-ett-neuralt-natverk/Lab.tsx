import { useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import { LossChart, NetDiagram, NeuronMap } from './Views';
import { classify, correctCount, defaultSettings, fmt, forward, isNeuron, netCorrect, neuron, tasks, trainBoth, type Neuron, type TaskId, type TrainSettings } from './logic';

const startNeuron: Neuron = { w1: 1, w2: 1, b: 0 };
const isTask = (v: unknown): v is TaskId => v === 'och' || v === 'eller' || v === 'xor';
const INPUTS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

function NeuronPanel({ n, setN, task }: { n: Neuron; setN: (n: Neuron) => void; task: TaskId }) {
  const examples = tasks[task].examples;
  const ok = correctCount(n, examples);
  return (
    <Panel title={`En neuron – uppgift: ${tasks[task].name}`}>
      <Slider label="Vikt w1" value={n.w1} min={-10} max={10} step={0.5} onChange={(v) => setN({ ...n, w1: v })} format={(v) => fmt(v, 1)} />
      <Slider label="Vikt w2" value={n.w2} min={-10} max={10} step={0.5} onChange={(v) => setN({ ...n, w2: v })} format={(v) => fmt(v, 1)} />
      <Slider label="Bias b" value={n.b} min={-10} max={10} step={0.5} onChange={(v) => setN({ ...n, b: v })} format={(v) => fmt(v, 1)} />
      <button type="button" className="btn" onClick={() => setN(startNeuron)}>
        Återställ neuronen
      </button>
      <LiveStatus>
        <span data-testid="neuron-resultat">
          z = {fmt(n.w1, 1)}·x1 + {fmt(n.w2, 1)}·x2 + ({fmt(n.b, 1)}). {ok} av 4 rätt för {tasks[task].name}.{ok === 4 ? ' ✓ Neuronen löser uppgiften!' : ''}
        </span>
      </LiveStatus>
      <div className="table-wrap">
        <table className="table" data-testid="neuron-tabell">
          <caption>Neuronens beräkning: z före aktivering, σ(z) efter</caption>
          <thead>
            <tr>
              <th scope="col">x1</th>
              <th scope="col">x2</th>
              <th scope="col">z</th>
              <th scope="col">σ(z)</th>
              <th scope="col">Svar (önskat)</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((e) => {
              const r = neuron(n, e.x);
              const right = classify(r.out) === e.y;
              return (
                <tr key={e.x.join()}>
                  <td>{e.x[0]}</td>
                  <td>{e.x[1]}</td>
                  <td>{fmt(r.z)}</td>
                  <td>{fmt(r.out)}</td>
                  <td>
                    {classify(r.out)} ({e.y}) {right ? '✓' : '✗'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <NeuronMap n={n} examples={examples} />
      <Legend
        items={[
          { swatch: 'var(--surface)', symbol: '○', text: 'Önskat svar 0' },
          { swatch: 'var(--c2)', symbol: '▲', text: 'Önskat svar 1' },
          { swatch: 'var(--c1)', symbol: '', text: 'Blått = utdata nära 1' },
          { swatch: 'var(--text)', symbol: '', text: 'Linje: z = 0' },
        ]}
      />
    </Panel>
  );
}

function NetRunner({ settings, task }: { settings: TrainSettings; task: TaskId }) {
  const examples = tasks[task].examples;
  const snaps = useMemo(() => trainBoth(examples, settings), [examples, settings]);
  const stepper = useStepper(snaps.length);
  const [inputIdx, setInputIdx] = useStoredState<string>('net-input', '1', (v): v is string => v === '0' || v === '1' || v === '2' || v === '3');
  const snap = snaps[Math.min(stepper.index, snaps.length - 1)]!;
  return (
    <Panel title={`Nätverk med ${settings.hidden} dolda neuroner – uppgift: ${tasks[task].name}`}>
      <p className="hint" style={{ marginTop: 0 }}>
        Startvärde {settings.seed}, inlärningstakt {fmt(settings.lr, 1)}. Varje steg = {settings.every} epoker gradientnedstigning.
      </p>
      <StepperControls stepper={stepper} label="Stega träningen" />
      <LiveStatus>
        <span data-testid="natverk-status">
          Epok {snap.epoch}: förlust {fmt(snap.netLoss, 3)} för nätverket ({netCorrect(snap.net, examples)} av 4 rätt), {fmt(snap.singleLoss, 3)} för en ensam neuron ({correctCount(snap.single, examples)} av 4 rätt).
        </span>
      </LiveStatus>
      <LossChart snaps={snaps} index={stepper.index} epochs={settings.epochs} />
      <Legend
        items={[
          { swatch: 'var(--c1)', symbol: '●', text: 'Nätverk med dolt lager (heldragen)' },
          { swatch: 'var(--c2)', symbol: '■', text: 'Ensam neuron (streckad)' },
        ]}
      />
      <div className="table-wrap">
        <table className="table" data-testid="prediktioner">
          <caption>Prediktioner efter {snap.epoch} epoker</caption>
          <thead>
            <tr>
              <th scope="col">Indata</th>
              <th scope="col">Önskat</th>
              <th scope="col">Nätverket</th>
              <th scope="col">Ensam neuron</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((e) => {
              const o = forward(snap.net, e.x).out;
              const s = neuron(snap.single, e.x).out;
              return (
                <tr key={e.x.join()}>
                  <th scope="row">({e.x.join(', ')})</th>
                  <td>{e.y}</td>
                  <td>
                    {fmt(o)} {classify(o) === e.y ? '✓' : '✗'}
                  </td>
                  <td>
                    {fmt(s)} {classify(s) === e.y ? '✓' : '✗'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Segmented
        legend="Visa beräkningen i nätverket för indata"
        value={inputIdx}
        options={INPUTS.map((x, i) => ({ value: String(i), label: `(${x.join(', ')})` }))}
        onChange={setInputIdx}
      />
      <NetDiagram net={snap.net} input={INPUTS[Number(inputIdx)]!} />
      <p className="hint">Tjock linje = stor vikt. Heldragen blå = positiv vikt, streckad orange = negativ vikt. Siffran i varje cirkel är neuronens utdata.</p>
    </Panel>
  );
}

interface StepSetup {
  task: TaskId;
  neuron: boolean;
  net: boolean;
}

const stepSetup: StepSetup[] = [
  { task: 'och', neuron: true, net: false },
  { task: 'och', neuron: true, net: false },
  { task: 'eller', neuron: true, net: false },
  { task: 'xor', neuron: true, net: false },
  { task: 'xor', neuron: false, net: true },
  { task: 'xor', neuron: false, net: true },
];

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const [n, setN] = useStoredState<Neuron>('neuron', startNeuron, isNeuron);
  const [expTask, setExpTask] = useStoredState<TaskId>('task', 'xor', isTask);
  const [hidden, setHidden] = useStoredState<number>('hidden', defaultSettings.hidden, (v): v is number => typeof v === 'number' && v >= 1 && v <= 4);
  const [seed, setSeed] = useStoredState<number>('seed', defaultSettings.seed, (v): v is number => typeof v === 'number' && v >= 1 && v <= 50);
  const [lr, setLr] = useStoredState<number>('lr', defaultSettings.lr, (v): v is number => typeof v === 'number' && v > 0 && v <= 10);

  const task = guided ? setup.task : expTask;
  const settings = useMemo<TrainSettings>(() => (guided ? defaultSettings : { ...defaultSettings, hidden, seed, lr }), [guided, hidden, seed, lr]);

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad kan en enda neuron?',
      body: (
        <>
          <p>
            En artificiell neuron tar emot två tal, x1 och x2. Den multiplicerar dem med varsin <strong>vikt</strong>, lägger till en <strong>bias</strong> och får summan <strong>z</strong>. Sedan skickas z genom en <strong>aktiveringsfunktion</strong> (en S-kurva) som ger ett tal mellan 0 och 1.
          </p>
          <p>
            Uppgiften <strong>XOR</strong> (”antingen eller”) ska ge 1 när exakt en av x1 och x2 är 1, och 0 annars.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-xor',
              prompt: 'Tror du att en enda neuron kan lära sig XOR om man bara hittar rätt vikter och bias?',
              options: [
                { id: 'ja', text: 'Ja, med rätt vikter går det' },
                { id: 'nej', text: 'Nej, det går inte hur man än ställer in den' },
                { id: 'vet-ej', text: 'Vet inte' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'och',
      phase: 'prova',
      title: 'Ställ in en neuron för OCH',
      body: (
        <>
          <p>
            OCH ska ge 1 bara när <em>både</em> x1 och x2 är 1. Prova vikterna 1 och 1 och ändra bara bias tills alla fyra blir rätt.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'z-och',
              prompt: 'Med w1 = 1, w2 = 1 och b = −1,5: vad blir z för indata (1, 1)?',
              answer: 0.5,
              tolerance: 0.001,
              wrong: [
                { value: 2, feedback: '2 är summan av vikterna gånger indata. Glöm inte att lägga till biasen −1,5.' },
                { value: 0.62, feedback: '0,62 är utdata efter aktiveringsfunktionen. Frågan gäller z, alltså summan före aktivering.' },
              ],
              hint: 'z = 1 · 1 + 1 · 1 + (−1,5).',
              explanation: 'z = 1 + 1 − 1,5 = 0,5. Efter S-kurvan blir utdata ungefär 0,62, alltså svar 1. För (1, 0) blir z = −0,5 och svaret 0.',
            }}
          />
        </>
      ),
    },
    {
      id: 'eller',
      phase: 'prova',
      title: 'Från OCH till ELLER',
      body: (
        <>
          <p>Nu är uppgiften ELLER: svaret ska vara 1 om minst en av x1 och x2 är 1. Behåll vikterna 1 och 1 och ändra bara bias.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'bias-eller',
              prompt: 'Vilken bias gör neuronen till ELLER när w1 = w2 = 1?',
              options: [
                { id: 'a', text: '−1,5', feedback: 'Med −1,5 behövs båda indata för att z ska bli positivt. Det är OCH.' },
                { id: 'b', text: '−0,5', correct: true },
                { id: 'c', text: '0,5', feedback: 'Med +0,5 blir z positivt även för (0, 0), så neuronen svarar 1 på allt.' },
              ],
              explanation: 'Med b = −0,5 räcker det att en indata är 1 för att z ska bli positivt. Biasen flyttar gränsen utan att ändra vikterna.',
            }}
          />
        </>
      ),
    },
    {
      id: 'xor',
      phase: 'prova',
      title: 'Försök med XOR',
      body: (
        <>
          <p>Nu är uppgiften XOR. Prova så många inställningar du vill. Titta på den svarta linjen i kartan.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'xor-omojlig',
              prompt: 'Varför klarar du aldrig mer än 3 av 4?',
              options: [
                { id: 'a', text: 'En neuron delar ytan med en rak linje, och ingen rak linje kan skilja trianglarna från cirklarna i XOR', correct: true },
                { id: 'b', text: 'Reglagen går inte tillräckligt långt', feedback: 'Större vikter gör bara S-kurvan brantare. Gränsen är fortfarande en rak linje, och XOR-hörnen ligger i kors.' },
                { id: 'c', text: 'Aktiveringsfunktionen är fel', feedback: 'Aktiveringsfunktionen är densamma i nätverket som klarar XOR. Problemet är att en ensam neuron bara kan dra en rak gräns.' },
              ],
              explanation: 'Trianglarna (0,1) och (1,0) ligger diagonalt mot varandra. Det behövs två linjer – och det är vad ett dolt lager kan ge.',
            }}
          />
        </>
      ),
    },
    {
      id: 'natverk',
      phase: 'jamfor',
      title: 'Träna ett nätverk med dolt lager',
      body: (
        <>
          <p>
            Nätverket har två <strong>dolda neuroner</strong> mellan indata och utdata. Vikterna börjar slumpvis (startvärde 3). Varje steg kör 50 varv <strong>gradientnedstigning</strong>: alla vikter justeras en liten bit åt det håll som minskar förlusten. Samtidigt tränas en ensam neuron på samma sätt.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'forlust-ensam',
              prompt: 'Träna till slutet (2000 epoker). Vilken förlust har den ensamma neuronen då? Svara med två decimaler.',
              answer: 0.25,
              tolerance: 0.006,
              wrong: [{ value: 0, feedback: 'Det är nätverket med dolt lager som kommer nära 0. Läs av siffran för den ensamma neuronen.' }],
              hint: 'Läs av statusrutan eller den streckade linjen.',
              explanation: 'Den ensamma neuronen fastnar på 0,25: den svarar ungefär 0,5 på allt. Nätverket når under 0,01 och får alla fyra rätt.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Vad bidrar det dolda lagret med?',
      body: (
        <>
          <p>Titta på nätverksdiagrammet för de fyra indata. Vad svarar de dolda neuronerna h1 och h2 på?</p>
          <Question
            spec={{
              kind: 'open',
              id: 'dolt-lager',
              prompt: 'Förklara med egna ord vad det dolda lagret gör som en ensam neuron inte klarar, och vad förlusten visar under träningen.',
              criteria: [
                'nämner att en ensam neuron bara kan dra en rak gräns',
                'beskriver att de dolda neuronerna bildar nya ”mellansteg” (t.ex. ELLER och INTE-OCH) som utdataneuronen kombinerar',
                'förklarar att förlusten mäter hur fel nätverket har och att träningen sänker den',
                'nämner att resultatet kan bero på startvärdet (vissa start fastnar)',
              ],
            }}
          />
        </>
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Inställningar">
            <Segmented legend="Uppgift" value={expTask} options={(Object.keys(tasks) as TaskId[]).map((t) => ({ value: t, label: tasks[t].name }))} onChange={setExpTask} />
            <Slider label="Dolda neuroner" value={hidden} min={1} max={4} onChange={setHidden} />
            <Slider label="Startvärde" value={seed} min={1} max={30} onChange={setSeed} hint="Prova startvärde 4 med två dolda neuroner." />
            <Slider label="Inlärningstakt" value={lr} min={0.5} max={8} step={0.5} onChange={setLr} format={(v) => fmt(v, 1)} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        {(!guided || setup.neuron) && <NeuronPanel n={n} setN={setN} task={task} />}
        {(!guided || setup.net) && <NetRunner key={`${task}-${JSON.stringify(settings)}`} settings={settings} task={task} />}
      </div>
    </div>
  );
}
