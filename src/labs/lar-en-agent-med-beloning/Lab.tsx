import { useMemo, useState } from 'react';
import { Grid } from '../../components/lab/Grid';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import {
  ACTIONS,
  ARROWS,
  badRewards,
  cellAt,
  cellName,
  COLS,
  defaultConfig,
  episodeStarts,
  fmt,
  frozenTest,
  goodRewards,
  greedy,
  isConfigPart,
  N_STATES,
  qAfter,
  ROWS,
  START,
  stateOf,
  train,
  type Config,
  type Rewards,
} from './logic';

type Scenario = 'bra' | 'dalig' | 'egen';

const sign = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');

function Trainer({ cfg, scenarioName }: { cfg: Config; scenarioName: string }) {
  const log = useMemo(() => train(cfg), [cfg]);
  const starts = useMemo(() => episodeStarts(log), [log]);
  const stepper = useStepper(log.length + 1);
  const [frozenAt, setFrozenAt] = useState<number | null>(null);
  const index = frozenAt ?? stepper.index;
  const Q = useMemo(() => qAfter(log, index), [log, index]);
  const rec = index > 0 ? log[index - 1]! : null;
  const test = useMemo(() => (frozenAt !== null ? frozenTest(Q, cfg.rewards, cfg.maxSteps) : null), [frozenAt, Q, cfg]);
  const agent = rec ? rec.s2 : START;
  const episode = rec ? rec.episode : 0;
  const pathOrder = new Map<number, number>();
  test?.path.forEach((s, i) => {
    if (!pathOrder.has(s)) pathOrder.set(s, i);
  });

  const jumpEpisodes = (n: number) => {
    const next = starts.find((s) => s >= index && log[s]!.episode >= episode + n);
    stepper.setPlaying(false);
    stepper.setIndex(next ?? log.length);
  };

  const status = (() => {
    if (!rec) return 'Ingen träning ännu. Alla Q-värden är 0.';
    const how = rec.explored ? 'utforskning – slumpvald handling' : 'bästa kända handling';
    const end = rec.done ? (cellAt(Math.floor(rec.s2 / COLS), rec.s2 % COLS) === 'G' ? ' Laddstationen nådd – episoden slutar.' : ' Ramlade i trappan – episoden slutar.') : rec.timeout ? ' Tiden tog slut – episoden avbryts.' : '';
    return `Episod ${rec.episode}, steg ${rec.t}: tillstånd ${cellName(rec.s)}, handling ${ACTIONS[rec.a]} (${how}), belöning ${sign(rec.r)}, nytt tillstånd ${cellName(rec.s2)}. Q(${cellName(rec.s)}, ${ACTIONS[rec.a]}): ${fmt(rec.oldQ)} → ${fmt(rec.newQ)}.${end}`;
  })();

  const shownState = rec ? rec.s : START;

  return (
    <>
      <Panel title={`Träning: ${scenarioName}`}>
        <p className="hint" style={{ marginTop: 0 }}>
          Belöning: {sign(cfg.rewards.step)} per steg, {sign(cfg.rewards.goal)} vid laddstationen, {sign(cfg.rewards.trap)} i trappan. α = {fmt(cfg.alpha, 1)}, γ = {fmt(cfg.gamma)}, utforskning ε = {fmt(cfg.epsilon, 2)}. {cfg.episodes} episoder, högst {cfg.maxSteps} steg per episod, startvärde {cfg.seed}.
        </p>
        {frozenAt === null ? (
          <>
            <StepperControls stepper={stepper} label="Stega träningen" />
            <div className="row" style={{ marginTop: '0.4rem' }}>
              <button type="button" className="btn" onClick={() => jumpEpisodes(1)} disabled={stepper.atEnd}>
                Till nästa episod
              </button>
              <button type="button" className="btn" onClick={() => jumpEpisodes(10)} disabled={stepper.atEnd}>
                +10 episoder
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  stepper.setPlaying(false);
                  setFrozenAt(stepper.index);
                }}
              >
                Frys modellen och kör provet
              </button>
            </div>
          </>
        ) : (
          <div className="row">
            <button type="button" className="btn" onClick={() => setFrozenAt(null)}>
              Tina upp och fortsätt träna
            </button>
          </div>
        )}
        <LiveStatus>
          <span data-testid="q-status">{frozenAt === null ? status : `Modellen är fryst efter ${index} träningssteg (${episode} episoder). Ingen inlärning och ingen utforskning under provet.`}</span>
        </LiveStatus>
        {test && (
          <p data-testid="prov-resultat" className={`callout ${test.outcome === 'goal' ? 'callout-tips' : 'callout-varning'}`}>
            <strong>Provet:</strong>{' '}
            {test.outcome === 'goal'
              ? `roboten nådde laddstationen på ${test.actions.length} steg.`
              : test.outcome === 'trap'
                ? `roboten ramlade i trappan efter ${test.actions.length} steg.`
                : `roboten nådde aldrig laddstationen – provet avbröts efter ${test.actions.length} steg.`}{' '}
            Summa belöning: {test.total}. Väg: {test.path.slice(0, 12).map(cellName).join(' → ')}
            {test.path.length > 12 ? ' → …' : ''}
          </p>
        )}
        <Grid
          label={`Rutvärlden, ${ROWS} rader och ${COLS} kolumner. Pilen i varje ruta är den handling som har högst Q-värde. Använd piltangenterna för att läsa rutorna.`}
          rows={ROWS}
          cols={COLS}
          cellSize={56}
          coordinates
          cell={(r, c) => {
            const s = stateOf(r, c);
            const t = cellAt(r, c);
            const name = cellName(s);
            if (t === '#') return { content: '', label: `${name}: vägg`, className: 'cell-wall' };
            const parts = [name];
            let content = '';
            const classes: string[] = [];
            if (t === 'G') {
              parts.push(`laddstation, belöning ${sign(cfg.rewards.goal)}`);
              content = '⚡';
            } else if (t === 'T') {
              parts.push(`trappa, belöning ${sign(cfg.rewards.trap)}`);
              content = 'T';
              classes.push('cell-mud');
            } else {
              const g = greedy(Q[s]!);
              if (g !== null) {
                parts.push(`bästa handling ${ACTIONS[g]} (Q ${fmt(Q[s]![g]!)})`);
                content = ARROWS[g];
              } else parts.push('ingen inlärd handling än');
              if (t === 'S') parts.push('start');
            }
            if (test && pathOrder.has(s)) {
              classes.push('cell-path');
              parts.push(`provets väg, steg ${pathOrder.get(s)}`);
            }
            if (frozenAt === null && s === agent) {
              classes.push('cell-current');
              parts.push('roboten är här');
              content = `◉${t === 'G' ? '⚡' : ''}`;
            }
            return { content, label: parts.join(', '), className: classes.join(' ') };
          }}
        />
        <Legend
          items={[
            { swatch: 'var(--surface)', symbol: '◉', text: 'Roboten' },
            { swatch: 'var(--surface)', symbol: '⚡', text: 'Laddstation' },
            { swatch: 'var(--surface)', symbol: 'T', text: 'Trappa' },
            { swatch: 'var(--wall)', symbol: '', text: 'Vägg' },
            { swatch: 'var(--surface)', symbol: '→', text: 'Bästa kända handling' },
            { swatch: 'var(--path)', symbol: '', text: 'Provets väg' },
          ]}
        />
      </Panel>
      <Panel title={`Q-värden i ${cellName(shownState)}`}>
        <div className="table-wrap">
          <table className="table" data-testid="q-rad">
            <caption>Hur bra varje handling verkar i {cellName(shownState)} just nu</caption>
            <thead>
              <tr>
                <th scope="col">Handling</th>
                <th scope="col">Q-värde</th>
              </tr>
            </thead>
            <tbody>
              {ACTIONS.map((a, i) => (
                <tr key={a} style={rec && rec.a === i && frozenAt === null ? { fontWeight: 700 } : undefined}>
                  <th scope="row">
                    {ARROWS[i]} {a}
                    {rec && rec.a === i && frozenAt === null ? ' (uppdaterades nyss)' : ''}
                  </th>
                  <td>{fmt(Q[shownState]![i]!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details>
          <summary>Hela Q-tabellen</summary>
          <div className="table-wrap">
            <table className="table">
              <caption>Q-värden för alla rutor (väggar, laddstation och trappa utelämnade)</caption>
              <thead>
                <tr>
                  <th scope="col">Ruta</th>
                  {ACTIONS.map((a, i) => (
                    <th scope="col" key={a}>
                      {ARROWS[i]} {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: N_STATES }, (_, s) => s)
                  .filter((s) => ['S', '.'].includes(cellAt(Math.floor(s / COLS), s % COLS)))
                  .map((s) => (
                    <tr key={s}>
                      <th scope="row">{cellName(s)}</th>
                      {Q[s]!.map((v, i) => (
                        <td key={i}>{fmt(v)}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      </Panel>
    </>
  );
}

const stepScenario: Scenario[] = ['bra', 'bra', 'bra', 'bra', 'dalig', 'bra'];

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [expScenario, setExpScenario] = useStoredState<Scenario>('scenario', 'bra', (v): v is Scenario => v === 'bra' || v === 'dalig' || v === 'egen');
  const [custom, setCustom] = useStoredState<Rewards>('rewards', goodRewards, isConfigPart);
  const [epsilon, setEpsilon] = useStoredState<number>('epsilon', defaultConfig.epsilon, (v): v is number => typeof v === 'number' && v >= 0 && v <= 1);
  const [alpha, setAlpha] = useStoredState<number>('alpha', defaultConfig.alpha, (v): v is number => typeof v === 'number' && v > 0 && v <= 1);
  const [seed, setSeed] = useStoredState<number>('seed', defaultConfig.seed, (v): v is number => typeof v === 'number' && v >= 1 && v <= 99);

  const scenario: Scenario = guided ? stepScenario[Math.min(step, stepScenario.length - 1)]! : expScenario;
  const rewards = scenario === 'bra' ? goodRewards : scenario === 'dalig' ? badRewards : custom;
  const cfg = useMemo<Config>(
    () => (guided ? { ...defaultConfig, rewards } : { ...defaultConfig, rewards, epsilon, alpha, seed }),
    [guided, rewards, epsilon, alpha, seed],
  );
  const scenarioName = scenario === 'bra' ? 'genomtänkt belöning' : scenario === 'dalig' ? 'belöning för varje steg' : 'egna regler';

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad gör en robot som inte vet något?',
      body: (
        <>
          <p>
            En robotdammsugare ska lära sig hitta från <strong>S</strong> (A1) till laddstationen <strong>⚡</strong> (E4) utan att ramla i trappan <strong>T</strong>. Ingen har programmerat vägen. Roboten får bara en <strong>belöning</strong>: −1 för varje steg, +10 vid laddstationen och −10 i trappan.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'forsta-episoden',
              prompt: 'Vad tror du att roboten gör i sin allra första episod?',
              options: [
                { id: 'rakt', text: 'Kör ganska rakt till laddstationen' },
                { id: 'irrar', text: 'Irrar runt länge innan den råkar hitta laddstationen eller trappan' },
                { id: 'stilla', text: 'Står still' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'stega',
      phase: 'prova',
      title: 'Stega de första stegen',
      body: (
        <>
          <p>
            Tryck på <strong>Steg framåt</strong>. Rutan ovanför rutnätet visar <strong>tillstånd</strong> (var roboten är), <strong>handling</strong>, <strong>belöning</strong> och hur Q-värdet ändras. Q-värdet är robotens uppskattning av hur bra en handling är i en ruta.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'forsta-q',
              prompt: 'I första steget är Q = 0, belöningen −1 och bästa Q i nästa ruta 0. Med α = 0,5 blir det nya Q-värdet Q + α · (belöning + γ · bästa nästa − Q). Vad blir det?',
              answer: -0.5,
              tolerance: 0.001,
              wrong: [
                { value: -1, feedback: '−1 är belöningen. Uppdateringen tar bara ett halvt steg (α = 0,5) mot det nya målet: 0 + 0,5 · (−1 + 0 − 0).' },
                { value: 0.5, feedback: 'Tecknet blev fel. Belöningen är −1, så Q-värdet sjunker: 0 + 0,5 · (−1) = −0,5.' },
              ],
              hint: 'Sätt in talen: 0 + 0,5 · (−1 + 0,95 · 0 − 0).',
              explanation: '0 + 0,5 · (−1) = −0,5. Det står också i rutan efter första steget.',
            }}
          />
        </>
      ),
    },
    {
      id: 'trana',
      phase: 'prova',
      title: 'Träna färdigt',
      body: (
        <>
          <p>
            Använd <strong>Till nästa episod</strong>, <strong>+10 episoder</strong> eller <strong>Till slutet</strong>. Första episoden tar 34 steg. Titta hur pilarna i rutnätet växer fram när belöningen sprider sig bakåt från laddstationen.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'utforskning',
              prompt: 'Även sent i träningen tar roboten ibland en konstig väg. Varför?',
              options: [
                { id: 'a', text: 'Utforskning: i 20 % av stegen väljer den en slumpvald handling för att kunna upptäcka bättre vägar', correct: true },
                { id: 'b', text: 'Den har glömt vad den lärt sig', feedback: 'Q-tabellen finns kvar. Det är ett avsiktligt val: lite slump gör att roboten inte fastnar i den första väg den hittade.' },
                { id: 'c', text: 'Belöningen är slumpvis', feedback: 'Belöningsreglerna är fasta. Slumpen kommer från utforskningen (ε = 0,2).' },
              ],
              explanation: 'Utan utforskning kan agenten fastna i en dålig vana. För mycket utforskning gör att den aldrig använder det den lärt sig.',
            }}
          />
        </>
      ),
    },
    {
      id: 'prov',
      phase: 'jamfor',
      title: 'Frys modellen och gör ett prov',
      body: (
        <>
          <p>
            Träna till slutet och tryck sedan på <strong>Frys modellen och kör provet</strong>. Under provet lär sig roboten inget och utforskar inte – den följer bara pilarna. Det visar vad den faktiskt har lärt sig.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'prov-steg',
              prompt: 'Hur många steg behöver den frysta roboten för att nå laddstationen?',
              answer: 7,
              wrong: [
                { value: 4, feedback: '4 är summan av belöningarna: sex steg à −1 och +10 vid laddstationen. Frågan gäller antalet steg.' },
                { value: 34, feedback: '34 steg tog den första träningsepisoden. Frys modellen efter hela träningen och läs av provet.' },
              ],
              hint: 'Läs av rutan ”Provet” efter att du har tränat till slutet och fryst modellen.',
              explanation: 'Sju steg, vilket är den kortaste möjliga vägen. Summan blir 6 · (−1) + 10 = 4.',
            }}
          />
        </>
      ),
    },
    {
      id: 'dalig',
      phase: 'jamfor',
      title: 'En dåligt formulerad belöning',
      body: (
        <>
          <p>
            Någon tycker att roboten ska ”jobba flitigt” och ändrar <strong>en enda regel</strong>: nu ger varje steg <strong>+1</strong> i stället för −1. Allt annat är som förut. Träna till slutet, frys och kör provet.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'dalig-foljd',
              prompt: 'Vad har roboten lärt sig?',
              options: [
                { id: 'a', text: 'Att köra in i en vägg om och om igen, eftersom varje steg ger poäng och laddstationen avslutar poängjakten', correct: true },
                { id: 'b', text: 'Att dammsuga hela rummet noga', feedback: 'Belöningen säger inget om var roboten har dammsugit. Den får lika mycket för att stå och stöta i en vägg som för att köra över smuts.' },
                { id: 'c', text: 'Samma sak som förut, bara snabbare', feedback: 'Kör provet: roboten når aldrig laddstationen. Ändringen av en enda regel ändrade hela beteendet.' },
              ],
              explanation: 'Agenten optimerar exakt det belöningen mäter – inte det vi menade. Det kallas ibland belöningshackning.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Formulera en bättre belöning',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'battre-beloning',
            prompt: 'Varför fick ”+1 per steg” en oavsiktlig följd? Föreslå en belöning som får roboten att dammsuga ordentligt och ändå komma hem till laddstationen.',
            criteria: [
              'förklarar att agenten maximerar summan av belöningar, inte vår avsikt',
              'pekar på att episoden slutar vid laddstationen, så att stanna ute ger mer poäng',
              'föreslår en belöning som är kopplad till det vi faktiskt vill (t.ex. poäng för nya smutsiga rutor, inte för steg)',
              'nämner att förslaget behöver testas på ett prov med fryst modell',
            ],
          }}
        />
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Belöningsregler och inställningar">
            <Segmented
              legend="Belöning"
              value={expScenario}
              options={[
                { value: 'bra', label: 'Genomtänkt' },
                { value: 'dalig', label: '+1 per steg' },
                { value: 'egen', label: 'Egna regler' },
              ]}
              onChange={setExpScenario}
            />
            {expScenario === 'egen' && (
              <>
                <Slider label="Belöning per steg" value={custom.step} min={-3} max={3} onChange={(v) => setCustom({ ...custom, step: v })} format={sign} />
                <Slider label="Belöning vid laddstationen" value={custom.goal} min={-10} max={30} onChange={(v) => setCustom({ ...custom, goal: v })} format={sign} />
                <Slider label="Belöning i trappan" value={custom.trap} min={-30} max={10} onChange={(v) => setCustom({ ...custom, trap: v })} format={sign} />
              </>
            )}
            <Slider label="Utforskning ε" value={epsilon} min={0} max={0.6} step={0.05} onChange={setEpsilon} format={(v) => `${Math.round(v * 100)} %`} />
            <Slider label="Inlärningstakt α" value={alpha} min={0.1} max={1} step={0.1} onChange={setAlpha} format={(v) => fmt(v, 1)} />
            <Slider label="Startvärde" value={seed} min={1} max={30} onChange={setSeed} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Trainer key={JSON.stringify(cfg)} cfg={cfg} scenarioName={scenarioName} />
      </div>
    </div>
  );
}
