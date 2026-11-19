import { useMemo, useState } from 'react';
import { Grid } from '../../components/lab/Grid';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import { cellId, type Algorithm, type Frame } from '../../lib/search';
import { cellName, isMaze, moveEndpoint, parseMaze, runMaze, scenarios, summarize, toggleMud, toggleWall, type Maze, type ScenarioId } from './logic';

type SearchAlg = Extract<Algorithm, 'bfs' | 'dfs'>;
type EditTool = 'wall' | 'mud' | 'start' | 'goal';

const algLabel: Record<SearchAlg, string> = { bfs: 'Bredden först (BFS)', dfs: 'Djupet först (DFS)' };

/** Arbetsytans läge i varje genomgångssteg: en sak i taget. */
const stepSetup: { scenario: ScenarioId; alg: SearchAlg; compare: boolean }[] = [
  { scenario: 'labyrint', alg: 'bfs', compare: false },
  { scenario: 'labyrint', alg: 'bfs', compare: false },
  { scenario: 'labyrint', alg: 'dfs', compare: false },
  { scenario: 'labyrint', alg: 'dfs', compare: true },
  { scenario: 'labyrint', alg: 'bfs', compare: true },
  { scenario: 'lera', alg: 'bfs', compare: true },
  { scenario: 'lera', alg: 'bfs', compare: true },
];

function MazeView({ maze, frame, editable, onEdit }: { maze: Maze; frame: Frame; editable: boolean; onEdit: (r: number, c: number) => void }) {
  const order = new Map(frame.explored.map((id, i) => [id, i + 1]));
  const frontier = new Set(frame.frontier.map((f) => f.id));
  const path = new Set(frame.path ?? []);
  return (
    <Grid
      label={`Labyrint med ${maze.rows} rader och ${maze.cols} kolumner. Använd piltangenterna för att gå mellan rutorna.`}
      rows={maze.rows}
      cols={maze.cols}
      cellSize={maze.cols > 8 ? 44 : 52}
      coordinates
      onActivate={editable ? onEdit : undefined}
      cell={(r, c) => {
        const id = cellId(r, c);
        const name = cellName(id);
        if (maze.walls[r]![c]) return { content: '', label: `${name}: vägg`, className: 'cell-wall' };
        const parts: string[] = [name];
        const classes: string[] = [];
        let content: string = '';
        const mud = maze.costs[r]![c]! > 1;
        if (mud) {
          parts.push(`lera, kostnad ${maze.costs[r]![c]}`);
          content = '~';
          classes.push('cell-mud');
        }
        if (order.has(id)) {
          parts.push(`besökt som nummer ${order.get(id)}`);
          classes.push('cell-visited');
          content = String(order.get(id));
        }
        if (frontier.has(id)) {
          parts.push(frame.frontier[0]?.id === id ? 'tas ut härnäst' : 'väntar i listan');
          classes.push('cell-frontier');
          content = frame.frontier[0]?.id === id ? '◎' : '○';
        }
        if (path.has(id)) {
          parts.push('del av vägen');
          classes.push('cell-path');
          content = '●';
        }
        if (frame.current === id) classes.push('cell-current');
        if (id === maze.start) {
          parts.push('start');
          content = 'S';
        }
        if (id === maze.goal) {
          parts.push('mål');
          content = 'M';
        }
        return { content, label: parts.join(', '), className: classes.join(' ') };
      }}
    />
  );
}

function DataStructure({ alg, frame }: { alg: SearchAlg; frame: Frame }) {
  const items = frame.frontier.map((f) => cellName(f.id));
  return (
    <div>
      <p>
        <strong>{alg === 'bfs' ? 'Kö' : 'Stack'}</strong>{' '}
        <span className="hint">{alg === 'bfs' ? '(först in, först ut – nästa tas ut från vänster)' : '(sist in, först ut – nästa tas ut från vänster, där det senast tillagda ligger)'}</span>
      </p>
      <ol className="datastructure" aria-label={alg === 'bfs' ? 'Kön, första först' : 'Stacken, översta först'}>
        {items.length === 0 ? <li>(tom)</li> : items.map((n) => <li key={n}>{n}</li>)}
      </ol>
      <p>
        <strong>Besökta ({frame.explored.length}):</strong> {frame.explored.length ? frame.explored.map(cellName).join(', ') : '–'}
      </p>
    </div>
  );
}

function CompareTable({ maze }: { maze: Maze }) {
  const s = useMemo(() => summarize(maze), [maze]);
  const fmt = (v: number | null) => (v === null ? 'ingen väg' : String(v));
  return (
    <table className="table" data-testid="jamforelse">
      <caption>Jämförelse i samma labyrint</caption>
      <thead>
        <tr>
          <th scope="col">Sökning</th>
          <th scope="col">Besökta rutor</th>
          <th scope="col">Vägens längd (steg)</th>
          <th scope="col">Vägens kostnad</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">BFS</th>
          <td>{s.bfs.expanded}</td>
          <td>{fmt(s.bfs.steps)}</td>
          <td>{fmt(s.bfs.cost)}</td>
        </tr>
        <tr>
          <th scope="row">DFS</th>
          <td>{s.dfs.expanded}</td>
          <td>{fmt(s.dfs.steps)}</td>
          <td>{fmt(s.dfs.cost)}</td>
        </tr>
        <tr>
          <th scope="row">Billigaste möjliga väg</th>
          <td>–</td>
          <td>{fmt(s.cheapest.steps)}</td>
          <td>{fmt(s.cheapest.cost)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const [step, setStep] = useGuidedStep();
  const [expScenario, setExpScenario] = useStoredState<ScenarioId>('scenario', 'labyrint', (v): v is ScenarioId => v === 'labyrint' || v === 'lera');
  const [expAlg, setExpAlg] = useStoredState<SearchAlg>('alg', 'bfs', (v): v is SearchAlg => v === 'bfs' || v === 'dfs');
  const [custom, setCustom] = useStoredState<Maze | null>('custom-maze', null, (v): v is Maze | null => v === null || isMaze(v));
  const [tool, setTool] = useState<EditTool>('wall');

  const guided = mode === 'guided';
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const scenario: ScenarioId = guided ? setup.scenario : expScenario;
  const alg: SearchAlg = guided ? setup.alg : expAlg;
  const showCompare = guided ? setup.compare : true;

  const baseMaze = useMemo(() => parseMaze([...scenarios[scenario].lines]), [scenario]);
  const maze = !guided && custom ? custom : baseMaze;
  const result = useMemo(() => runMaze(maze, alg), [maze, alg]);
  const stepper = useStepper(result.frames.length);
  const frame = result.frames[Math.min(stepper.index, result.frames.length - 1)]!;

  const edit = (r: number, c: number) => {
    const m = custom ?? baseMaze;
    const next = tool === 'wall' ? toggleWall(m, r, c) : tool === 'mud' ? toggleMud(m, r, c) : moveEndpoint(m, tool, r, c);
    setCustom(next);
    stepper.reset();
  };

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vilken sökning hittar kortast väg?',
      body: (
        <>
          <p>
            Roboten ska från <strong>S</strong> (ruta A1) till <strong>M</strong> (ruta E5). Den kan gå upp, höger, ned eller vänster, i den ordningen. Du ska köra två sökningar som provar rutorna i olika ordning.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-kortast',
              prompt: 'Vilken sökning tror du hittar den kortaste vägen till målet?',
              options: [
                { id: 'bfs', text: 'Bredden först (BFS)' },
                { id: 'dfs', text: 'Djupet först (DFS)' },
                { id: 'lika', text: 'De hittar lika långa vägar' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'bfs',
      phase: 'prova',
      title: 'Kör bredden först',
      body: (
        <>
          <p>
            Tryck på <strong>Steg framåt</strong> några gånger. BFS tar alltid ut den ruta som legat <em>längst</em> i kön och lägger dess grannar sist i kön. Siffrorna i rutorna visar i vilken ordning de besöktes.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'bfs-ordning',
              prompt: 'Gå fram till steg 3. I vilken ordning ligger rutorna som BFS besöker först, sett från start?',
              options: [
                { id: 'a', text: 'Alla rutor på avstånd 1 besöks före rutorna på avstånd 2', correct: true },
                { id: 'b', text: 'BFS följer en korridor tills det tar stopp', feedback: 'Det är djupet först. BFS sprider sig som ringar på vattnet: först allt på avstånd 1, sedan allt på avstånd 2.' },
                { id: 'c', text: 'BFS går alltid mot målet', feedback: 'BFS vet inte var målet ligger. Den tittar inte på riktningen alls, bara på i vilken ordning rutorna lades i kön.' },
              ],
              explanation: 'Kön gör att rutor som upptäcktes tidigt också besöks tidigt. Därför besöks rutorna i ordning efter avstånd från start.',
            }}
          />
        </>
      ),
    },
    {
      id: 'dfs',
      phase: 'prova',
      title: 'Kör djupet först',
      body: (
        <>
          <p>
            Nu används en <strong>stack</strong>. DFS tar alltid ut den ruta som lades till <em>senast</em>. Stega igenom och se hur sökningen följer en korridor så långt det går innan den backar.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'dfs-stack',
              prompt: 'Vad händer när DFS kommer till en återvändsgränd?',
              options: [
                { id: 'a', text: 'Den tar ut nästa ruta från stacken, alltså den senast tillagda som inte är besökt', correct: true },
                { id: 'b', text: 'Den börjar om från start', feedback: 'Den börjar inte om. Rutorna som väntar i stacken finns kvar och den fortsätter med den översta.' },
                { id: 'c', text: 'Den fastnar och hittar aldrig målet', feedback: 'Eftersom DFS minns vilka rutor som är besökta kan den inte fastna i en slinga. I en ändlig labyrint hittar den målet om det går att nå.' },
              ],
              explanation: 'Stacken fungerar som ett minne av ställen att backa till. Det senast tillagda ligger överst.',
            }}
          />
        </>
      ),
    },
    {
      id: 'jamfor',
      phase: 'jamfor',
      title: 'Jämför resultaten',
      body: (
        <>
          <p>Tabellen visar resultatet av båda sökningarna i samma labyrint. Jämför med din förutsägelse.</p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'dfs-langre',
              prompt: 'Hur många steg längre är vägen som DFS hittade jämfört med vägen BFS hittade?',
              answer: 12,
              wrong: [
                { value: 24, feedback: '24 är hela DFS-vägens längd. Frågan gäller skillnaden mellan DFS-vägen och BFS-vägen.' },
                { value: 9, feedback: '9 är skillnaden i antal besökta rutor. Frågan gäller vägens längd i steg.' },
              ],
              hint: 'Ta DFS-vägens längd minus BFS-vägens längd i tabellen.',
              explanation: 'DFS-vägen är 24 steg och BFS-vägen 12 steg. DFS besökte ändå färre rutor (27 mot 36) – den hade tur med riktningen men hittade en omväg.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Varför hittar BFS kortast väg?',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'bfs-varfor',
            prompt: 'Varför hittar BFS alltid en väg med så få steg som möjligt?',
            options: [
              { id: 'a', text: 'Den besöker alla rutor på avstånd n innan den besöker någon på avstånd n + 1, så första gången målet tas ut finns ingen kortare väg', correct: true },
              { id: 'b', text: 'Den besöker färre rutor än DFS', feedback: 'Här besökte BFS faktiskt fler rutor (36 mot 27). Att hitta kortast väg handlar om i vilken ordning rutorna besöks, inte hur många.' },
              { id: 'c', text: 'Den räknar ut avståndet till målet i förväg', feedback: 'BFS har ingen uppskattning av avståndet till målet. Det är sökningar med ledtråd, som A*, som använder en sådan (labb 8).' },
            ],
            explanation: 'Kön ger en ordning efter avstånd. Det gäller bara när varje steg räknas lika – det prövar du i nästa steg.',
          }}
        />
      ),
    },
    {
      id: 'lera',
      phase: 'prova',
      title: 'När steg kostar olika',
      body: (
        <>
          <p>
            Nu finns lera (<strong>~</strong>) som kostar 5 att gå in i, medan vanliga rutor kostar 1. Kör BFS till slutet och titta på vägens <strong>kostnad</strong> i tabellen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'lera-kostnad',
              prompt: 'Vad kostar vägen som BFS hittar?',
              answer: 26,
              wrong: [
                { value: 6, feedback: '6 är antalet steg. Kostnaden får du genom att lägga ihop vad varje ruta kostar att gå in i: fem lerrutor à 5 och målrutan à 1.' },
                { value: 8, feedback: '8 är kostnaden för den billigaste vägen, runt leran. BFS valde inte den.' },
              ],
              hint: 'Räkna 5 för varje lerruta och 1 för varje vanlig ruta längs vägen (start räknas inte).',
              explanation: 'BFS väljer vägen rakt genom leran: 6 steg men kostnad 5 · 5 + 1 = 26. Omvägen är 8 steg men kostar bara 8.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara-lera',
      phase: 'forklara',
      title: 'Färre steg är inte alltid billigast',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'lera-varfor',
            prompt: 'Vilket påstående stämmer efter försöket med leran?',
            options: [
              { id: 'a', text: 'BFS hittar kortast väg räknat i antal steg, men när stegen kostar olika kan en längre väg vara billigare', correct: true },
              { id: 'b', text: 'BFS fungerar inte när det finns lera', feedback: 'BFS fungerar – den hittar fortfarande en väg med så få steg som möjligt. Den bryr sig bara inte om kostnaden.' },
              { id: 'c', text: 'DFS hade alltid hittat den billigare vägen', feedback: 'DFS bryr sig inte heller om kostnader. Vilken väg den hittar beror på i vilken ordning grannarna provas.' },
            ],
            explanation: 'För att hitta billigaste väg behövs en sökning som räknar kostnad, till exempel uniformkostnadssökning eller A*. Det gör du i nästa labb.',
          }}
        />
      ),
    },
  ];

  const statusText = (() => {
    if (frame.kind === 'found') return `${frame.message} Vägen visas med ●.`;
    return frame.message;
  })();

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
              legend="Bana"
              value={expScenario}
              options={(Object.keys(scenarios) as ScenarioId[]).map((k) => ({ value: k, label: scenarios[k].name }))}
              onChange={(v) => {
                setExpScenario(v);
                setCustom(null);
                stepper.reset();
              }}
            />
            <Segmented
              legend="Sökning"
              value={expAlg}
              options={[
                { value: 'bfs', label: 'BFS' },
                { value: 'dfs', label: 'DFS' },
              ]}
              onChange={(v) => {
                setExpAlg(v);
                stepper.reset();
              }}
            />
            <Segmented
              legend="Klick på en ruta"
              value={tool}
              options={[
                { value: 'wall', label: 'Vägg av/på' },
                { value: 'mud', label: 'Lera av/på' },
                { value: 'start', label: 'Flytta start' },
                { value: 'goal', label: 'Flytta mål' },
              ]}
              onChange={setTool}
            />
            <p className="hint">Gå till en ruta med piltangenterna och tryck Enter för att ändra den.</p>
            {custom && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setCustom(null);
                  stepper.reset();
                }}
              >
                Återställ banan
              </button>
            )}
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title={`${algLabel[alg]} i ${scenarios[scenario].name.toLowerCase()}${custom && !guided ? ' (ändrad)' : ''}`}>
          <StepperControls stepper={stepper} label="Stega sökningen" />
          <LiveStatus>{statusText}</LiveStatus>
          <div className="maze-and-data">
            <MazeView maze={maze} frame={frame} editable={!guided} onEdit={edit} />
            <DataStructure alg={alg} frame={frame} />
          </div>
          <Legend
            items={[
              { swatch: 'var(--surface)', symbol: 'S', text: 'Start' },
              { swatch: 'var(--surface)', symbol: 'M', text: 'Mål' },
              { swatch: 'var(--wall)', symbol: '', text: 'Vägg' },
              { swatch: 'var(--visited)', symbol: '3', text: 'Besökt (siffran = ordning)' },
              { swatch: 'var(--frontier)', symbol: '◎', text: 'Tas ut härnäst' },
              { swatch: 'var(--frontier)', symbol: '○', text: 'Väntar i kö/stack' },
              { swatch: 'var(--path)', symbol: '●', text: 'Funnen väg' },
              { swatch: 'var(--surface)', symbol: '~', text: 'Lera (kostnad 5)' },
            ]}
          />
          {frame.kind === 'found' && frame.path && (
            <p data-testid="resultat">
              <strong>Resultat:</strong> vägen {frame.path.map(cellName).join(' → ')} har {frame.path.length - 1} steg och kostar {frame.pathCost}.
            </p>
          )}
          {frame.kind === 'fail' && (
            <p data-testid="resultat">
              <strong>Resultat:</strong> det finns ingen väg till målet.
            </p>
          )}
        </Panel>
        {showCompare && (
          <Panel title="Jämförelse">
            <CompareTable maze={maze} />
          </Panel>
        )}
      </div>
    </div>
  );
}
