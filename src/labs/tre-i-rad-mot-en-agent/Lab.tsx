import { useMemo, useState } from 'react';
import { Grid } from '../../components/lab/Grid';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, NumberField, Panel, Segmented, SelectField } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import {
  agentKinds,
  agentNames,
  cellName,
  describeBoard,
  emptyBoard,
  isBoard,
  legalMoves,
  minimax,
  minimaxMove,
  other,
  parseBoard,
  play,
  positionIds,
  positions,
  scoreMoves,
  seededChoice,
  series,
  toMove,
  valueText,
  winner,
  winningLine,
  type AgentKind,
  type Board,
  type Player,
  type PositionId,
} from './logic';
import './lab.css';

interface Setup {
  position: PositionId | null;
  compare: boolean;
  tree: boolean;
  series: boolean;
}
const stepSetup: Setup[] = [
  { position: 'blockera', compare: false, tree: false, series: false },
  { position: 'blockera', compare: true, tree: false, series: false },
  { position: 'vinst', compare: true, tree: false, series: false },
  { position: 'gaffel', compare: true, tree: true, series: false },
  { position: null, compare: false, tree: false, series: true },
  { position: null, compare: false, tree: false, series: true },
];

const isAgent = (v: unknown): v is AgentKind => v === 'slump' || v === 'regler' || v === 'minimax';
const isPlayer = (v: unknown): v is Player => v === 'X' || v === 'O';

function MiniBoard({ b, highlight }: { b: Board; highlight?: number[] }) {
  return (
    <table className="ttt-mini" aria-label={describeBoard(b)}>
      <tbody>
        {[0, 1, 2].map((r) => (
          <tr key={r}>
            {[0, 1, 2].map((c) => {
              const i = r * 3 + c;
              return (
                <td key={c} className={highlight?.includes(i) ? 'is-new' : undefined}>
                  {b[i] ?? '·'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BoardView({ b, playable, onPlay, label }: { b: Board; playable: boolean; onPlay: (i: number) => void; label: string }) {
  const line = winningLine(b) ?? [];
  return (
    <Grid
      className="ttt-board"
      label={label}
      rows={3}
      cols={3}
      cellSize={72}
      coordinates
      onActivate={playable ? (r, c) => onPlay(r * 3 + c) : undefined}
      cell={(r, c) => {
        const i = r * 3 + c;
        const v = b[i];
        const parts = [cellName(i), v ?? 'tom'];
        if (line.includes(i)) parts.push('del av tre i rad');
        return {
          content: v ?? '',
          label: parts.join(': ').replace(/: (del av)/, ', $1'),
          className: [v === 'X' ? 'ttt-x' : v === 'O' ? 'ttt-o' : '', line.includes(i) ? 'cell-path' : ''].join(' '),
        };
      }}
    />
  );
}

function CompareAgents({ b, seed }: { b: Board; seed: number }) {
  const turn = toMove(b);
  if (winner(b)) return <p>Partiet är slut – det finns inga drag att jämföra.</p>;
  return (
    <table className="table" data-testid="jamforelse">
      <caption>Samma brädläge, olika motståndare ({turn} ska dra)</caption>
      <thead>
        <tr>
          <th scope="col">Motståndare</th>
          <th scope="col">Drag</th>
          <th scope="col">Varför</th>
        </tr>
      </thead>
      <tbody>
        {agentKinds.map((k) => {
          const c = seededChoice(k, b, turn, seed);
          return (
            <tr key={k}>
              <th scope="row">{agentNames[k]}</th>
              <td>{c ? cellName(c.move) : '–'}</td>
              <td>
                {c?.reason}
                {k === 'slump' ? ` (startvärde ${seed})` : ''}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DecisionTree({ b }: { b: Board }) {
  const turn = toMove(b);
  const [open, setOpen] = useState<number | null>(null);
  const scores = useMemo(() => scoreMoves(b, turn), [b, turn]);
  if (scores.length === 0) return <p>Partiet är slut. Beslutsträdet har bara ett löv: {winner(b) === 'oavgjort' ? 'oavgjort' : `${winner(b)} vann`}.</p>;
  const best = minimaxMove(b, turn);
  return (
    <>
      <p>
        Roten är brädläget ovan. Varje rad är ett möjligt drag för {turn} och värdet minimax räknar fram om båda spelar så bra som möjligt. Öppna ett drag för att se motståndarens svar.
      </p>
      <ul className="ttt-tree" aria-label={`Beslutsträd: ${scores.length} möjliga drag för ${turn}`}>
        {scores.map((s) => {
          const child = play(b, s.move, turn);
          const replies = legalMoves(child).map((r) => ({ r, v: minimax(play(child, r, other(turn)), turn, turn, 2) }));
          const worst = replies.length ? Math.min(...replies.map((x) => x.v)) : null;
          const isOpen = open === s.move;
          return (
            <li key={s.move} data-move={cellName(s.move)}>
              <div className="ttt-move-row">
                <MiniBoard b={child} highlight={[s.move]} />
                <span className={s.move === best ? 'ttt-best' : s.value < 0 ? 'ttt-bad' : undefined}>
                  {turn} i {cellName(s.move)}: {valueText(s.value)}
                  {s.move === best ? ' ★ minimax väljer detta' : ''}
                </span>
                {replies.length > 0 && (
                  <button type="button" className="btn" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.move)}>
                    {isOpen ? 'Dölj svaren' : `Visa ${other(turn)}:s ${replies.length} svar`}
                  </button>
                )}
              </div>
              {isOpen && (
                <ul aria-label={`${other(turn)}:s svar efter ${turn} i ${cellName(s.move)}`}>
                  {replies.map(({ r, v }) => (
                    <li key={r} className="ttt-move-row">
                      <MiniBoard b={play(child, r, other(turn))} highlight={[r]} />
                      <span className={v === worst ? 'ttt-bad' : undefined}>
                        {other(turn)} i {cellName(r)}: för {turn} blir det {valueText(v)}
                        {v === worst ? ` ◀ ${other(turn)}:s bästa svar` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <p className="hint">Värdet räknas för {turn}. Minimax antar att motståndaren väljer det svar som är sämst för {turn}, och väljer sedan det drag vars sämsta fall är bäst.</p>
    </>
  );
}

function SeriesTable() {
  const rows = useMemo(
    () =>
      (['slump', 'regler', 'minimax'] as AgentKind[]).map((o) => ({ o, r: series('slump', o) })),
    [],
  );
  return (
    <table className="table" data-testid="serie">
      <caption>100 partier mot slumpagenten (slumpen spelar X och börjar, startvärde 1–100)</caption>
      <thead>
        <tr>
          <th scope="col">O spelas av</th>
          <th scope="col">O vinner</th>
          <th scope="col">Oavgjort</th>
          <th scope="col">O förlorar</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ o, r }) => (
          <tr key={o}>
            <th scope="row">{agentNames[o]}</th>
            <td>{r.O}</td>
            <td>{r.oavgjort}</td>
            <td>{r.X}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [game, setGame] = useStoredState<Board>('board', emptyBoard, isBoard);
  const [history, setHistory] = useStoredState<Board[]>('history', [], (v): v is Board[] => Array.isArray(v) && v.every(isBoard));
  const [starter, setStarter] = useStoredState<Player>('starter', 'X', isPlayer);
  const [opponent, setOpponent] = useStoredState<AgentKind>('opponent', 'minimax', isAgent);
  const [seed, setSeed] = useStoredState<number>('seed', 1, (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 999);
  const [preset, setPreset] = useState<PositionId>('tomt');
  const [message, setMessage] = useState('');

  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const fixed = guided && setup.position !== null;
  const opp: AgentKind = guided ? 'minimax' : opponent;
  const board: Board = fixed ? parseBoard(positions[setup.position!].board) : game;
  const turn = toMove(board, fixed ? 'X' : starter);
  const result = winner(board);
  const agentPlayer: Player = 'O';

  const agentReply = (b: Board): { b: Board; text: string } => {
    if (winner(b) || toMove(b, starter) !== agentPlayer) return { b, text: '' };
    const c = seededChoice(opp, b, agentPlayer, seed);
    if (!c) return { b, text: '' };
    return { b: play(b, c.move, agentPlayer), text: `${agentNames[opp]} lade O i ${cellName(c.move)} (${c.reason}).` };
  };

  const finish = (b: Board) => {
    const w = winner(b);
    return w === 'X' ? ' Du vann!' : w === 'O' ? ' Agenten vann.' : w === 'oavgjort' ? ' Oavgjort.' : '';
  };

  const onPlay = (i: number) => {
    if (fixed || result) return;
    if (turn !== 'X') {
      setMessage('Det är agentens tur. Tryck på ”Låt agenten dra”.');
      return;
    }
    if (game[i] !== null) {
      setMessage(`${cellName(i)} är redan upptagen. Välj en tom ruta.`);
      return;
    }
    const afterYou = play(game, i, 'X');
    const r = agentReply(afterYou);
    setHistory([...history, game]);
    setGame(r.b);
    setMessage(`Du lade X i ${cellName(i)}. ${r.text}${finish(r.b)}`);
  };

  const agentMoveNow = () => {
    const r = agentReply(game);
    if (r.b !== game) {
      setHistory([...history, game]);
      setGame(r.b);
      setMessage(r.text + finish(r.b));
    }
  };

  const newGame = (b: Board = emptyBoard(), who: Player = starter) => {
    setHistory([]);
    if (who === 'O' && b.every((c) => c === null)) {
      const c = seededChoice(opp, b, 'O', seed)!;
      const nb = play(b, c.move, 'O');
      setGame(nb);
      setMessage(`Nytt parti. ${agentNames[opp]} började och lade O i ${cellName(c.move)}.`);
    } else {
      setGame(b);
      setMessage(`Nytt parti. ${toMove(b, who) === 'X' ? 'Din tur – du spelar X.' : 'Agentens tur.'}`);
    }
  };

  const status = (() => {
    if (result === 'X') return fixed ? 'X har tre i rad.' : 'Du vann!';
    if (result === 'O') return fixed ? 'O har tre i rad.' : 'Agenten vann.';
    if (result === 'oavgjort') return 'Oavgjort – brädet är fullt.';
    if (fixed) return `${positions[setup.position!].note} ${turn} ska dra.`;
    return turn === 'X' ? 'Din tur: du spelar X. Välj en ruta med piltangenterna och tryck Enter.' : 'Agentens tur.';
  })();

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Var lägger agenten sitt O?',
      body: (
        <>
          <p>
            Du spelar X och agenten spelar O. Rutorna heter A1–C3: bokstaven är kolumnen och siffran raden. Titta på brädet. Agenten använder <strong>minimax</strong>: den tänker igenom alla möjliga fortsättningar och antar att du spelar så bra du kan.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-drag',
              prompt: 'Var tror du att minimaxagenten lägger sitt O?',
              options: [
                { id: 'C1', text: 'C1 – i slutet av översta raden' },
                { id: 'A3', text: 'A3 – i ett hörn' },
                { id: 'B3', text: 'B3 – mitt på nedersta raden' },
                { id: 'A2', text: 'A2 – kanten till vänster' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'jamfor-blockera',
      phase: 'jamfor',
      title: 'Tre motståndare, samma bräde',
      body: (
        <>
          <p>Tabellen visar vad slumpagenten, regelagenten och minimaxagenten väljer i exakt samma läge. Jämför med din förutsägelse.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vem-missar',
              prompt: 'Vilken motståndare kan missa att blockera X i det här läget?',
              options: [
                { id: 'slump', text: 'Slumpagenten', correct: true },
                { id: 'regler', text: 'Regelagenten', feedback: 'Regelagenten har en regel som säger att den ska blockera motståndarens tre i rad. Den prövas direkt efter regeln om att vinna.' },
                { id: 'minimax', text: 'Minimaxagenten', feedback: 'Minimax ser att X vinner direkt om O inte lägger i C1. Det sämsta fallet för alla andra drag är förlust, så den blockerar.' },
              ],
              explanation: 'Slumpagenten väljer bland alla lediga rutor och tar ingen hänsyn till hotet. Med andra startvärden väljer den andra rutor – oftast fel.',
            }}
          />
        </>
      ),
    },
    {
      id: 'vinst',
      phase: 'prova',
      title: 'Vinna eller blockera?',
      body: (
        <>
          <p>Nu har både X och O två i rad. O ska dra.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vinna-forst',
              prompt: 'Vad gör minimaxagenten här?',
              options: [
                { id: 'a', text: 'Lägger O i C2 och vinner direkt', correct: true },
                { id: 'b', text: 'Blockerar X i C1', feedback: 'Att blockera är viktigt, men här kan O vinna på en gång. En vinst nu är värd mer än att stoppa ett hot – partiet tar ju slut.' },
                { id: 'c', text: 'Tar ett hörn', feedback: 'Då vinner X i nästa drag. Minimax ser att det ger förlust.' },
              ],
              explanation: 'Minimax ger draget C2 värdet vinst om 1 drag, det bästa möjliga. Regelagenten gör samma sak eftersom regeln ”vinn om du kan” står först.',
            }}
          />
        </>
      ),
    },
    {
      id: 'gaffel',
      phase: 'jamfor',
      title: 'En fälla som reglerna inte ser',
      body: (
        <>
          <p>
            X har två motsatta hörn och O har mitten. Regelagenten följer regeln <em>ta ett hörn</em>. Minimaxagenten väljer något annat. Öppna beslutsträdet och undersök draget C1.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'gaffel-trad',
              prompt: 'Vad visar beslutsträdet om draget O i C1?',
              options: [
                { id: 'a', text: 'X kan blockera i A3 och sedan hota två rader samtidigt, så O förlorar om X spelar bra', correct: true },
                { id: 'b', text: 'C1 är lika bra som alla andra drag', feedback: 'Titta på värdet: C1 och A3 ger förlust, kanterna A2, B1, B3 och C2 ger oavgjort.' },
                { id: 'c', text: 'O vinner eftersom O får två i rad', feedback: 'O får två i rad, men X blockerar i A3 och får då två hot på en gång. O kan bara stoppa ett av dem.' },
              ],
              explanation: 'Regler som ”ta ett hörn” fungerar oftast men ser inte flera drag framåt. Minimax letar igenom spelträdet och hittar att en kant räddar oavgjort.',
            }}
          />
        </>
      ),
    },
    {
      id: 'spela',
      phase: 'prova',
      title: 'Spela mot minimax',
      body: (
        <>
          <p>
            Spela ett parti mot minimaxagenten. Gå till en ruta med piltangenterna och tryck <kbd>Enter</kbd>, eller klicka. Kan du vinna? Titta sedan på tabellen över 100 partier mot slumpagenten.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'regler-forlust',
              prompt: 'Hur många av de 100 partierna förlorade regelagenten mot slumpagenten?',
              answer: 2,
              wrong: [
                { value: 0, feedback: '0 gäller minimaxagenten. Titta på raden för regelagenten.' },
                { value: 81, feedback: '81 är antalet partier regelagenten vann. Frågan gäller förluster.' },
              ],
              hint: 'Titta i kolumnen ”O förlorar” på raden för regelagenten.',
              explanation: 'Regelagenten förlorade 2 partier – slumpen råkade gillra en fälla som reglerna inte ser. Minimax förlorade inget, eftersom tre i rad blir oavgjort med perfekt spel.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara minimax',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'minimax-forklaring',
            prompt: 'Förklara med egna ord hur minimaxagenten väljer drag och varför den slog regelagenten i fällan med två hörn. Varför fungerar inte samma metod lika enkelt i schack?',
            criteria: [
              'beskriver att agenten provar alla drag och motståndarens svar ända till slutet av partiet',
              'förklarar antagandet att motståndaren väljer det som är sämst för agenten',
              'jämför med regelagenten som bara tittar på läget just nu',
              'nämner att spelträdet för schack är alldeles för stort att gå igenom helt',
            ],
          }}
        />
      ),
    },
  ];

  const playable = !fixed && !result && turn === 'X';

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Inställningar">
            <Segmented legend="Motståndare (O)" value={opponent} options={agentKinds.map((k) => ({ value: k, label: agentNames[k].replace('agent', '') }))} onChange={setOpponent} />
            <Segmented
              legend="Vem börjar?"
              value={starter}
              options={[
                { value: 'X', label: 'Du (X)' },
                { value: 'O', label: 'Agenten (O)' },
              ]}
              onChange={(v) => {
                setStarter(v);
                newGame(emptyBoard(), v);
              }}
            />
            <NumberField
              label="Startvärde för slumpagenten (1–999)"
              value={seed}
              min={1}
              max={999}
              onChange={(v) => {
                const n = Math.round(v);
                if (n >= 1 && n <= 999) setSeed(n);
              }}
            />
            <SelectField label="Brädläge" value={preset} options={positionIds.map((p) => ({ value: p, label: positions[p].name }))} onChange={setPreset} />
            <button
              type="button"
              className="btn"
              onClick={() => {
                setStarter('X');
                newGame(parseBoard(positions[preset].board), 'X');
              }}
            >
              Ladda brädläget
            </button>
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={fixed ? `Brädläge: ${positions[setup.position!].name}` : `Parti mot ${agentNames[opp].toLowerCase()}`}>
          <LiveStatus>
            {!fixed && message ? `${message} ` : ''}
            {status}
          </LiveStatus>
          <BoardView b={board} playable={playable} onPlay={onPlay} label={`Tre i rad-bräde. ${describeBoard(board)} Använd piltangenterna för att gå mellan rutorna${playable ? ' och Enter för att lägga X' : ''}.`} />
          {!fixed && (
            <div className="row" style={{ marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => newGame()}>
                Nytt parti
              </button>
              <button
                type="button"
                className="btn"
                disabled={history.length === 0}
                onClick={() => {
                  setGame(history[history.length - 1]!);
                  setHistory(history.slice(0, -1));
                  setMessage('Senaste draget ångrades.');
                }}
              >
                Ångra drag
              </button>
              {!result && turn === 'O' && (
                <button type="button" className="btn" onClick={agentMoveNow}>
                  Låt agenten dra
                </button>
              )}
            </div>
          )}
          {result && !fixed && (
            <p data-testid="resultat">
              <strong>Resultat:</strong> {result === 'X' ? 'du vann' : result === 'O' ? 'agenten vann' : 'oavgjort'}.
            </p>
          )}
        </Panel>
        {(guided ? setup.compare : true) && (
          <Panel title="Samma brädläge, olika motståndare">
            {turn === 'O' || fixed ? <CompareAgents b={board} seed={seed} /> : <p>Det är din tur. Tabellen visar agenternas val när det är O:s tur.</p>}
          </Panel>
        )}
        {(guided ? setup.tree : true) && (
          <Panel title="Beslutsträdet (en liten del)">
            <DecisionTree key={board.join()} b={board} />
          </Panel>
        )}
        {(guided ? setup.series : true) && (
          <Panel title="Många partier">
            <SeriesTable />
          </Panel>
        )}
      </div>
    </div>
  );
}
