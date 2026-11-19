import { useMemo, useState } from 'react';
import { ratioText } from '../../components/lab/Charts';
import { Legend, LiveStatus, NumberField, Panel, Segmented, SelectField, Slider } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Question, usePrediction } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import { DepthChart } from './DepthChart';
import {
  accuracy,
  buildTree,
  countRows,
  countsText,
  decodeSplitMap,
  depthCurve,
  encodeSplitMap,
  evaluateSplit,
  findNode,
  fmtGini,
  FULL_DEPTH,
  growSteps,
  growTree,
  isSplitMap,
  labelSymbol,
  labelText,
  NEW_DAY,
  pathText,
  pct,
  predictPath,
  pruneAt,
  rankSplits,
  splitKey,
  splitText,
  stepsToMap,
  TEST,
  thresholds,
  total,
  TRAIN,
  WEATHERS,
  weatherSymbol,
  answers,
  type Feature,
  type Path,
  type Row,
  type Split,
  type SplitResult,
  type Weather,
} from './logic';
import { DataTable, TreeView } from './TreeView';
import './lab.css';

const fullSteps = growSteps();
const curve = depthCurve();
const TEMP_T = thresholds('temp');
const VIND_T = thresholds('vind');
/** Djupet som används i "följ vägen"-steget i genomgångsläget. */
const PATH_DEPTH = 3;
/** Handbyggda träd får frågor på högst fyra nivåer. */
const HAND_MAX_DEPTH = 4;

type Example = Pick<Row, 'vader' | 'temp' | 'vind'>;
const isExample = (v: unknown): v is Example =>
  typeof v === 'object' &&
  v !== null &&
  WEATHERS.includes((v as Example).vader) &&
  typeof (v as Example).temp === 'number' &&
  Number.isFinite((v as Example).temp) &&
  typeof (v as Example).vind === 'number' &&
  Number.isFinite((v as Example).vind);

interface Setup {
  data: boolean;
  builder: boolean;
  compare: boolean;
  grow: boolean;
  depth: boolean;
  path: boolean;
}
const none: Setup = { data: false, builder: false, compare: false, grow: false, depth: false, path: false };
const stepSetup: Setup[] = [
  { ...none, data: true },
  { ...none, builder: true },
  { ...none, builder: true, compare: true },
  { ...none, grow: true },
  { ...none, depth: true },
  { ...none, path: true },
  { ...none, depth: true },
];

const fmtTemp = (t: number) => (t < 0 ? `−${-t}` : String(t));
const exampleText = (e: Example) => `${weatherSymbol[e.vader]} ${e.vader}, ${fmtTemp(e.temp)} °C, vind ${e.vind} m/s`;

function featureValueText(s: Split, e: Example): string {
  if (s.feature === 'vader') return `är vädret ${e.vader}`;
  if (s.feature === 'temp') return `är temperaturen ${fmtTemp(e.temp)} °C`;
  return `är vinden ${e.vind} m/s`;
}

/* ---------- Förhandsvisning av en delning ---------- */

function SplitPreview({ res, testId }: { res: SplitResult; testId?: string }) {
  const nYes = total(res.yes);
  const nNo = total(res.no);
  const n = nYes + nNo;
  return (
    <div className="dt-preview" data-testid={testId}>
      <div className="table-wrap">
        <table className="table">
          <caption>{splitText(res.split)}</caption>
          <thead>
            <tr>
              <th scope="col">Gren</th>
              <th scope="col">Dagar</th>
              <th scope="col">Gini</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Ja</th>
              <td>{nYes === 0 ? '0 dagar' : countsText(res.yes)}</td>
              <td>{fmtGini(res.giniYes)}</td>
            </tr>
            <tr>
              <th scope="row">Nej</th>
              <td>{nNo === 0 ? '0 dagar' : countsText(res.no)}</td>
              <td>{fmtGini(res.giniNo)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="dt-calc">
        Före delningen: Gini {fmtGini(res.parent)}.
        <br />
        Viktad Gini efter delningen = {nYes}/{n} · {fmtGini(res.giniYes)} + {nNo}/{n} · {fmtGini(res.giniNo)} = <strong>{fmtGini(res.weighted)}</strong>
        <br />
        Minskning: {fmtGini(res.gain)}
      </p>
      {(nYes === 0 || nNo === 0) && (
        <p className="callout callout-varning">
          <span aria-hidden="true">⚠ </span>Frågan delar inte: alla dagar hamnar i samma gren. Den tomma grenen får ärva svaret från föräldern.
        </p>
      )}
    </div>
  );
}

/* ---------- Handbyggaren ---------- */

interface Draft {
  feature: Feature;
  vader: Weather;
  temp: number;
  vind: number;
}
const defaultDraft: Draft = { feature: 'vader', vader: 'regn', temp: 5, vind: 8 };
const draftSplit = (d: Draft): Split => (d.feature === 'vader' ? { feature: 'vader', value: d.vader } : { feature: d.feature, value: d[d.feature] });

function SplitEditor({ node, path, describe, onApply, current }: { node: Row[]; path: Path; describe: string; onApply: (s: Split) => void; current?: Split }) {
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const split = draftSplit(draft);
  const res = evaluateSplit(node, split);
  const counts = countRows(node);
  const pure = total(counts) > 0 && (counts.installd === 0 || counts.genomfors === 0);
  return (
    <div className="dt-editor" data-testid="delningsval">
      <p>
        <strong>Vald nod:</strong> {describe} – {total(counts) === 0 ? '0 dagar' : countsText(counts)}.
      </p>
      {pure && <p className="hint">Noden är redan ren (Gini 0). Ingen fråga kan göra den renare.</p>}
      <Segmented
        legend="Fråga om"
        value={draft.feature}
        options={[
          { value: 'vader', label: 'Väder' },
          { value: 'temp', label: 'Temperatur' },
          { value: 'vind', label: 'Vind' },
        ]}
        onChange={(f) => setDraft({ ...draft, feature: f })}
      />
      {draft.feature === 'vader' && (
        <SelectField<Weather>
          label="Väder = …?"
          value={draft.vader}
          options={WEATHERS.map((w) => ({ value: w, label: `${weatherSymbol[w]} ${w}` }))}
          onChange={(w) => setDraft({ ...draft, vader: w })}
        />
      )}
      {draft.feature === 'temp' && (
        <SelectField<string>
          label="Temperatur ≥ … °C?"
          value={String(draft.temp)}
          options={TEMP_T.map((t) => ({ value: String(t), label: `${fmtTemp(t)} °C` }))}
          onChange={(t) => setDraft({ ...draft, temp: Number(t) })}
        />
      )}
      {draft.feature === 'vind' && (
        <SelectField<string>
          label="Vind ≥ … m/s?"
          value={String(draft.vind)}
          options={VIND_T.map((t) => ({ value: String(t), label: `${t} m/s` }))}
          onChange={(t) => setDraft({ ...draft, vind: Number(t) })}
        />
      )}
      <SplitPreview res={res} testId="forhandsvisning" />
      <button type="button" className="btn btn-primary" onClick={() => onApply(split)}>
        {current ? `Byt till ”${splitText(split)}”` : `Ställ frågan ”${splitText(split)}”`}
      </button>
      {path !== '' || current ? null : <p className="hint">Frågan läggs i roten. Sedan kan du dela grenarna vidare.</p>}
    </div>
  );
}

function CandidateTable({ rows, mine, limit = 5, caption, testId }: { rows: Row[]; mine?: Split; limit?: number; caption: string; testId?: string }) {
  const ranked = useMemo(() => rankSplits(rows), [rows]);
  const top = ranked.slice(0, limit);
  const mineRes = mine ? ranked.find((r) => splitKey(r.split) === splitKey(mine)) : undefined;
  const mineRank = mineRes ? ranked.indexOf(mineRes) + 1 : 0;
  const shown = mineRes && !top.includes(mineRes) ? [...top, mineRes] : top;
  return (
    <div className="table-wrap">
      <table className="table" data-testid={testId}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Plats</th>
            <th scope="col">Fråga</th>
            <th scope="col">Ja-gren</th>
            <th scope="col">Nej-gren</th>
            <th scope="col">Viktad Gini</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => {
            const rank = ranked.indexOf(r) + 1;
            const isMine = mine && splitKey(r.split) === splitKey(mine);
            return (
              <tr key={splitKey(r.split)} className={isMine ? 'dt-row-mine' : rank === 1 ? 'dt-row-best' : undefined}>
                <td>{rank}</td>
                <th scope="row">
                  {splitText(r.split)}
                  {rank === 1 && <span className="dt-tag"> ★ algoritmens val</span>}
                  {isMine && <span className="dt-tag"> ◀ ditt val</span>}
                </th>
                <td>
                  {r.yes.installd} ✗ / {r.yes.genomfors} ✓
                </td>
                <td>
                  {r.no.installd} ✗ / {r.no.genomfors} ✓
                </td>
                <td>{fmtGini(r.weighted)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {mineRes && mineRank > limit && <p className="hint">Ditt val hamnar på plats {mineRank} av {ranked.length} möjliga frågor.</p>}
    </div>
  );
}

/* ---------- Automatisk tillväxt ---------- */

function GrowthPanel() {
  const stepper = useStepper(fullSteps.length + 1);
  const i = stepper.index;
  const tree = useMemo(() => buildTree(TRAIN, stepsToMap(fullSteps.slice(0, i))), [i]);
  const step = i > 0 ? fullSteps[i - 1]! : null;
  const full = useMemo(() => buildTree(TRAIN, stepsToMap(fullSteps)), []);
  let status: string;
  if (!step) status = `Bara roten: ${countsText(countRows(TRAIN))}, Gini ${fmtGini(tree.gini)}. Tryck på Steg framåt.`;
  else {
    const where = pathText(full, step.path);
    status = `Delning ${i} av ${fullSteps.length}: ${where === 'Roten' ? 'roten' : `noden ”${where}”`} (${countsText({ installd: step.result.yes.installd + step.result.no.installd, genomfors: step.result.yes.genomfors + step.result.no.genomfors })}, Gini ${fmtGini(step.result.parent)}) delas med ${splitText(step.result.split)} Viktad Gini blir ${fmtGini(step.result.weighted)}.`;
    if (stepper.atEnd) status += ` Klart: alla löv är rena. Trädet har djup ${FULL_DEPTH} och ${fullSteps.length + 1} löv.`;
  }
  return (
    <Panel title="Algoritmen växer trädet">
      <p className="hint">I varje steg tar algoritmen nästa nod (uppifrån och ned) och väljer frågan med lägst viktad Gini. Rena noder delas inte.</p>
      <StepperControls stepper={stepper} label="Trädets tillväxt" showSpeed={false} />
      <LiveStatus>
        <span data-testid="vaxt-status">{status}</span>
      </LiveStatus>
      <TreeView tree={tree} label={`Algoritmens träd efter ${i} delningar`} newest={step?.path} testId="vaxt-trad" />
    </Panel>
  );
}

/* ---------- Djup ---------- */

function DepthTable({ showTest }: { showTest: boolean }) {
  return (
    <div className="table-wrap">
      <table className="table" data-testid="djup-tabell">
        <caption>Träffsäkerhet för varje maxdjup</caption>
        <thead>
          <tr>
            <th scope="col">Maxdjup</th>
            <th scope="col">Löv</th>
            <th scope="col">Träning (24 dagar)</th>
            <th scope="col">Test (12 dagar)</th>
          </tr>
        </thead>
        <tbody>
          {curve.map((c) => (
            <tr key={c.depth}>
              <th scope="row">{c.depth}</th>
              <td>{c.leaves}</td>
              <td>
                {c.train.correct} ({pct(c.train.accuracy)})
              </td>
              <td>{showTest ? `${c.test.correct} (${pct(c.test.accuracy)})` : 'visas efter din förutsägelse'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Labben ---------- */

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const setup = guided ? stepSetup[Math.min(step, stepSetup.length - 1)]! : { data: true, builder: true, compare: true, grow: true, depth: true, path: true };

  const [storedMap, setStoredMap] = useStoredState<Record<string, string>>('hand-tree', {}, isSplitMap);
  const handMap = useMemo(() => decodeSplitMap(storedMap), [storedMap]);
  const handTree = useMemo(() => buildTree(TRAIN, handMap), [handMap]);
  const [selected, setSelected] = useStoredState<string>('selected', '', (v): v is string => typeof v === 'string' && /^[jn]{0,3}$/.test(v));
  const selNode = findNode(handTree, selected) ?? handTree;
  const handTrain = accuracy(handTree, TRAIN);
  const handTest = accuracy(handTree, TEST);

  const [depth, setDepth] = useStoredState<number>('depth', 1, (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= FULL_DEPTH);
  const [depthGuess] = usePrediction('gissa-djup');
  const showTest = !guided || depthGuess !== null;
  const depthTree = useMemo(() => growTree(depth), [depth]);
  const point = curve[depth]!;

  const [example, setExample] = useStoredState<Example>('example', { vader: NEW_DAY.vader, temp: NEW_DAY.temp, vind: NEW_DAY.vind }, isExample);
  const ex: Example = guided ? NEW_DAY : example;
  const pathDepth = guided ? PATH_DEPTH : depth;
  const pathTree = useMemo(() => growTree(pathDepth), [pathDepth]);
  const path = useMemo(() => predictPath(pathTree, ex), [pathTree, ex]);
  const pathStepper = useStepper(path.length);
  const pIndex = Math.min(pathStepper.index, path.length - 1);
  const pathNode = path[pIndex]!;
  const onPath = useMemo(() => new Set(path.slice(0, pIndex + 1).map((n) => n.path)), [path, pIndex]);

  const applySplit = (s: Split) => {
    const pruned = pruneAt(handMap, selected);
    setStoredMap(encodeSplitMap({ ...pruned, [selected]: s }));
  };
  const removeSplit = (p: Path) => {
    setStoredMap(encodeSplitMap(pruneAt(handMap, p)));
    if (selected.startsWith(p) && selected !== p) setSelected(p);
  };

  const rootSplit = handMap[''];
  const rootRes = rootSplit ? evaluateSplit(TRAIN, rootSplit) : null;
  const algoRoot = fullSteps[0]!.result;

  let pathStatus: string;
  if (pathNode.split) {
    const yes = answers(pathNode.split, ex);
    pathStatus = `Fråga ${pIndex + 1}: ${splitText(pathNode.split)} Här ${featureValueText(pathNode.split, ex)}, så svaret är ${yes ? 'ja' : 'nej'}. Tryck Steg framåt för att följa ${yes ? 'ja' : 'nej'}-grenen.`;
  } else {
    pathStatus = `Lövet svarar: ${labelSymbol[pathNode.prediction]} ${labelText[pathNode.prediction]}. ${
      total(pathNode.counts) === 0 ? 'Lövet har inga träningsdagar, så svaret ärvs från föräldern.' : `Här hamnade ${countsText(pathNode.counts)} bland träningsdagarna.`
    }`;
  }

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vilken fråga delar bäst?',
      body: (
        <>
          <p>
            En fotbollsklubb vill kunna säga i förväg om <strong>utomhusträningen blir inställd</strong>. Tränaren har antecknat väder, temperatur och vind för 24 träningsdagar och om träningen blev av (tabellen). 12 andra dagar sparas som <strong>testdagar</strong>.
          </p>
          <p>
            Ett <strong>beslutsträd</strong> är en kedja av ja/nej-frågor som modellen lär sig från märkta exempel. Det är något annat än spelträdet i labb 9, där trädet visade möjliga drag i ett spel.
          </p>
          <Question
            key="gissa-rot"
            spec={{
              kind: 'predict',
              id: 'gissa-rot',
              prompt: 'Trädets första fråga ska dela dagarna så att grupperna blir så ”rena” som möjligt. Vilken fråga tror du är bäst?',
              options: [
                { id: 'regn', text: 'Väder = regn?' },
                { id: 'temp', text: 'Temperatur ≥ 5 °C?' },
                { id: 'vind', text: 'Vind ≥ 11 m/s?' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'bygg',
      phase: 'prova',
      title: 'Ställ den första frågan själv',
      body: (
        <>
          <p>
            Välj en fråga i rutan <strong>Bygg ditt träd</strong> och se hur dagarna fördelas i ja- och nej-grenen. Måttet <strong>Gini</strong> visar hur blandad en grupp är: 0 betyder att alla dagar har samma utfall, 0,5 att det är hälften av varje.
          </p>
          <p className="dt-formula">Gini = 1 − (andel inställda)² − (andel genomförda)²</p>
          <p>Roten har 11 inställda och 13 genomförda dagar: 1 − (11/24)² − (13/24)² ≈ 0,497. En bra fråga ger låg viktad Gini, alltså grenarnas Gini vägda efter hur många dagar de har.</p>
          <Question
            key="gini-regn"
            spec={{
              kind: 'numeric',
              id: 'gini-regn',
              prompt: 'Prova Väder = regn? i roten. Vad blir den viktade Gini efter delningen? Svara med tre decimaler.',
              answer: 0.469,
              tolerance: 0.0015,
              wrong: [
                { value: 0.497, feedback: '0,497 är orenheten i roten innan du delar. Titta på raden ”Viktad Gini efter delningen”.' },
                { value: 0.028, feedback: '0,028 är hur mycket orenheten minskar (0,497 − 0,469). Frågan gäller själva den viktade Gini.' },
                { value: 0.938, feedback: 'Du har lagt ihop grenarnas Gini. Varje gren ska vägas med sin andel av dagarna: 8/24 och 16/24.' },
              ],
              hint: 'Viktad Gini = (dagar i ja / alla dagar) · Gini(ja) + (dagar i nej / alla dagar) · Gini(nej). Värdet står i förhandsvisningen.',
              explanation: 'Ja-grenen har 5 inställda och 3 genomförda (Gini 0,469), nej-grenen 6 och 10 (också 0,469). Viktat: 8/24 · 0,469 + 16/24 · 0,469 ≈ 0,469. Orenheten minskar bara lite från 0,497.',
            }}
          />
          <p className="hint">Prova fler frågor och ställ den du tycker är bäst i roten innan du går vidare.</p>
        </>
      ),
    },
    {
      id: 'jamfor-rot',
      phase: 'jamfor',
      title: 'Ditt val mot algoritmens',
      body: (
        <>
          <p>Algoritmen provar alla möjliga frågor i roten (3 vädertyper, 19 temperaturgränser och 14 vindgränser) och väljer den med lägst viktad Gini. Tabellen visar topplistan och ditt val.</p>
          <Question
            key="varfor-vind"
            spec={{
              kind: 'choice',
              id: 'varfor-vind',
              prompt: 'Varför väljer algoritmen Vind ≥ 11 m/s? i stället för Väder = regn?',
              options: [
                { id: 'a', text: 'Den ger lägst viktad Gini (0,342): alla fem blåsiga dagar blev inställda, så ja-grenen är helt ren', correct: true },
                { id: 'b', text: 'Algoritmen vet att vind är farligare än regn', feedback: 'Algoritmen vet ingenting om fotboll eller väder. Den räknar bara hur dagarna i träningsdatan fördelas för varje möjlig fråga.' },
                { id: 'c', text: 'Den fråga som skickar flest dagar till ja-grenen vinner', feedback: 'Vind ≥ 11 m/s? skickar bara 5 av 24 dagar till ja-grenen. Det som räknas är hur rena grenarna blir, vägt efter storlek.' },
              ],
              explanation: 'Regnfrågan ger två blandade grenar (Gini 0,469 i båda). Vindfrågan ger en ren gren (Gini 0) och en lite mindre blandad nej-gren (0,432), viktat 19/24 · 0,432 ≈ 0,342.',
            }}
          />
        </>
      ),
    },
    {
      id: 'vax',
      phase: 'prova',
      title: 'Låt algoritmen växa trädet',
      body: (
        <>
          <p>
            Stega fram algoritmen med <strong>Steg framåt</strong>. Den gör samma sak i varje nod som du gjorde i roten: provar alla frågor och tar den med lägst viktad Gini. Den kallas <em>girig</em> eftersom den aldrig tänker flera steg framåt.
          </p>
          <Question
            key="ren-nod"
            spec={{
              kind: 'choice',
              id: 'ren-nod',
              prompt: 'Algoritmen delar aldrig noden ”Vind ≥ 11 m/s? ja”. Varför?',
              options: [
                { id: 'a', text: 'Alla fem dagar där blev inställda. Noden är ren (Gini 0) och kan inte bli renare', correct: true },
                { id: 'b', text: 'Den har för få dagar', feedback: 'Algoritmen i labben har ingen gräns för antalet dagar. Den delar till exempel en nod med bara 3 dagar längre ned. Det som avgör är att noden redan är ren.' },
                { id: 'c', text: 'Trädet har nått sitt maxdjup', feedback: 'Noden ligger på djup 1, och andra grenar växer ända till djup 4. Maxdjupet är inte orsaken.' },
              ],
              explanation: 'Algoritmen slutar dela en nod när den är ren, när maxdjupet är nått eller när ingen fråga sänker orenheten. Utan maxdjup växer trädet tills alla löv är rena.',
            }}
          />
        </>
      ),
    },
    {
      id: 'djup',
      phase: 'jamfor',
      title: 'Djupt träd eller grunt träd?',
      body: (
        <>
          <p>
            Med reglaget <strong>Maxdjup</strong> bestämmer du hur många frågor i rad trädet får ställa. Ändra bara djupet och jämför träffsäkerheten på träningsdagarna med testdagarna, som trädet aldrig har sett.
          </p>
          <Question
            key="gissa-djup"
            spec={{
              kind: 'predict',
              id: 'gissa-djup',
              prompt: 'Vilket maxdjup tror du ger flest rätt på de 12 testdagarna?',
              options: [
                { id: '1', text: 'Djup 1 (en fråga)' },
                { id: '2', text: 'Djup 2' },
                { id: '4', text: 'Djup 4 (fullvuxet träd, 100 % på träningsdagarna)' },
              ],
            }}
          />
          <Question
            key="overanpassning"
            spec={{
              kind: 'choice',
              id: 'overanpassning',
              prompt: 'Djup 4 får 100 % rätt på träningsdagarna men bara 83 % på testdagarna, medan djup 2 får 92 %. Vad är den bästa förklaringen?',
              options: [
                { id: 'a', text: 'Det djupa trädet har lärt sig undantag i träningsdatan, till exempel dag 13 då träningen ställdes in en fin dag, och gör fel på liknande testdagar', correct: true },
                { id: 'b', text: 'Testdagarna är felmärkta', feedback: 'Testdagarna följer samma mönster som träningsdagarna. Det är det djupa trädet som har anpassat sig efter ett undantag: dag 13 (moln, 16 °C, svag vind, inställd).' },
                { id: 'c', text: 'Fler frågor ger alltid ett bättre träd, skillnaden är bara slump', feedback: 'Fler frågor ger alltid bättre resultat på träningsdagarna, men inte på nya dagar. Här blir testdag 3 och 4 fel just på grund av frågan som fångar dag 13.' },
              ],
              explanation: 'Det kallas överanpassning. Den sista nivån lägger till frågan ”Temperatur ≥ 12 °C?” bara för att skilja ut dag 13, då tränaren var sjuk. Varma molniga testdagar hamnar sedan fel.',
            }}
          />
          <p className="hint">Obs! Här jämför vi på testdagarna för att se fenomenet. I ett riktigt projekt väljer man djup med valideringsdata och använder testdata en gång på slutet (labb 12).</p>
        </>
      ),
    },
    {
      id: 'vag',
      phase: 'prova',
      title: 'Följ vägen för en ny dag',
      body: (
        <>
          <p>
            En ny dag: <strong>{exampleText(NEW_DAY)}</strong>. Stega fram och se hur trädet (maxdjup {PATH_DEPTH}) ställer en fråga i taget tills det når ett löv.
          </p>
          <Question
            key="vilka-fragor"
            spec={{
              kind: 'choice',
              id: 'vilka-fragor',
              multiple: true,
              prompt: 'Vilka frågor ställer trädet för den nya dagen?',
              options: [
                { id: 'vind', text: 'Vind ≥ 11 m/s?', correct: true },
                { id: 'temp', text: 'Temperatur ≥ 4 °C?', correct: true },
                { id: 'regn', text: 'Väder = regn?', correct: true },
                { id: 'moln', text: 'Väder = moln?', feedback: 'Den frågan finns bara i ja-grenen av ”Temperatur ≥ 4 °C?”. Den nya dagen är 3 °C och går åt nej-hållet.' },
              ],
              explanation: 'Vinden är 4 m/s (nej), temperaturen 3 °C (nej) och det regnar (ja). Lövet har 3 inställda och 0 genomförda träningsdagar, så svaret blir inställd.',
            }}
          />
          <Question
            key="transparens"
            spec={{
              kind: 'choice',
              id: 'transparens',
              prompt: 'Trädets beslut går att förklara fråga för fråga. Betyder det att beslutet är rätt och rättvist?',
              options: [
                { id: 'a', text: 'Nej. Vi kan se hur beslutet fattas, men frågorna bygger på få och kanske skeva exempel och kan ändå ge fel', correct: true },
                { id: 'b', text: 'Ja, ett beslut som går att följa steg för steg kan inte vara fel', feedback: 'Djup 4 gick att följa lika bra men gav fel för varma molniga dagar. Att man ser hur beslutet fattas betyder inte att underlaget är bra.' },
                { id: 'c', text: 'Ja, eftersom en dator räknar fram frågorna objektivt', feedback: 'Algoritmen räknar bara på den data den får. Är datan få, felaktig eller skev blir frågorna också det.' },
              ],
              explanation: 'Beslutsträd är lätta att granska (transparens). Det gör det lättare att upptäcka fel och orättvisa, men det garanterar inte att de saknas.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara för tränaren',
      body: (
        <Question
          key="forklara-trad"
          spec={{
            kind: 'open',
            id: 'forklara-trad',
            prompt: 'Förklara för tränaren hur beslutsträdet lärs in från dagarna och hur det svarar för en ny dag. Varför ska trädet inte göras så djupt som möjligt?',
            criteria: [
              'beskriver att trädet är ja/nej-frågor som lärs från märkta exempel',
              'förklarar att varje fråga väljs så att grupperna blir så rena som möjligt (lägst Gini)',
              'beskriver att en ny dag följer frågorna till ett löv som ger svaret',
              'förklarar att ett för djupt träd lär sig undantag (överanpassning) och blir sämre på nya dagar',
            ],
          }}
        />
      ),
    },
  ];

  const handDescribe = pathText(handTree, selNode.path);

  return (
    <div className="lab-layout dt-lab">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {setup.builder && (
          <Panel title="Bygg ditt träd">
            <SplitEditor node={selNode.rows} path={selNode.path} describe={handDescribe} current={selNode.split} onApply={applySplit} />
          </Panel>
        )}
        {setup.depth && (
          <Panel title="Maxdjup">
            <Slider
              label="Maxdjup"
              value={depth}
              min={0}
              max={FULL_DEPTH}
              onChange={setDepth}
              format={(d) => (d === 0 ? 'djup 0 (bara roten)' : `djup ${d}`)}
              hint="Djup 0 betyder ingen fråga alls: trädet svarar alltid majoriteten."
            />
            <LiveStatus>
              <span data-testid="djup-resultat">
                Djup {depth}: {point.leaves} löv. Träning {ratioText(point.train.correct, point.train.total)}
                {showTest ? `, test ${ratioText(point.test.correct, point.test.total)}` : '. Testresultatet visas när du har gjort din förutsägelse'}.
              </span>
            </LiveStatus>
          </Panel>
        )}
        {setup.path && !guided && (
          <Panel title="Ny dag att klassificera">
            <SelectField<Weather> label="Väder" value={example.vader} options={WEATHERS.map((w) => ({ value: w, label: `${weatherSymbol[w]} ${w}` }))} onChange={(w) => setExample({ ...example, vader: w })} />
            <NumberField label="Temperatur (°C)" value={example.temp} min={-25} max={35} onChange={(t) => setExample({ ...example, temp: Math.round(t) })} />
            <NumberField label="Vind (m/s)" value={example.vind} min={0} max={30} onChange={(v) => setExample({ ...example, vind: Math.round(v) })} />
            <p className="hint">Trädet som används har samma maxdjup som reglaget ({depth}).</p>
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        {setup.data && (
          <Panel title="Träningsdagarna">
            {guided ? (
              <DataTable rows={TRAIN} caption="24 träningsdagar (påhittade)" testId="traningsdata" />
            ) : (
              <>
                <details>
                  <summary>Visa de 24 träningsdagarna</summary>
                  <DataTable rows={TRAIN} caption="24 träningsdagar (påhittade)" testId="traningsdata" />
                </details>
                <details>
                  <summary>Visa de 12 testdagarna</summary>
                  <DataTable rows={TEST} caption="12 testdagar (används aldrig för att bygga trädet)" />
                </details>
              </>
            )}
          </Panel>
        )}
        {setup.builder && (
          <Panel title="Ditt träd">
            <LiveStatus>
              <span data-testid="handtrad-status">
                {Object.keys(handMap).length === 0
                  ? 'Trädet har bara en rot. Det svarar alltid ”genomförs” (majoriteten).'
                  : `Ditt träd har ${Object.keys(handMap).length} ${Object.keys(handMap).length === 1 ? 'fråga' : 'frågor'}. Träning ${ratioText(handTrain.correct, handTrain.total)} rätt${guided ? '' : `, test ${ratioText(handTest.correct, handTest.total)} rätt`}.`}
              </span>
            </LiveStatus>
            <TreeView
              tree={handTree}
              label="Ditt beslutsträd"
              selected={selNode.path}
              onSelect={(p) => setSelected(p)}
              onRemove={removeSplit}
              maxSplitDepth={HAND_MAX_DEPTH}
              testId="handtrad"
            />
          </Panel>
        )}
        {setup.compare && (
          <Panel title="Jämför med algoritmen">
            <LiveStatus>
              <span data-testid="jamfor-rot">
                {rootRes
                  ? `Din fråga i roten: ${splitText(rootRes.split)} ger viktad Gini ${fmtGini(rootRes.weighted)}. Algoritmens fråga: ${splitText(algoRoot.split)} ger ${fmtGini(algoRoot.weighted)}.${
                      splitKey(rootRes.split) === splitKey(algoRoot.split) ? ' Ni valde samma fråga!' : ''
                    }`
                  : `Du har inte ställt någon fråga i roten än. Algoritmens fråga: ${splitText(algoRoot.split)} ger viktad Gini ${fmtGini(algoRoot.weighted)}.`}
              </span>
            </LiveStatus>
            <CandidateTable rows={TRAIN} mine={rootSplit} caption="Bästa frågorna i roten (lägst viktad Gini först)" testId="topplista" />
            {!guided && selNode.path !== '' && <CandidateTable rows={selNode.rows} caption={`Bästa frågorna för vald nod: ${handDescribe}`} mine={selNode.split} />}
            <p className="hint">Lika värden: den fråga som kommer först i ordningen väder, temperatur, vind (lägst gräns först) vinner. Här ger till exempel ”Temperatur ≥ −3 °C?” och ”Vind ≥ 14 m/s?” exakt samma värde.</p>
          </Panel>
        )}
        {setup.grow && <GrowthPanel />}
        {setup.depth && (
          <Panel title="Överanpassning: träning och test">
            <DepthChart curve={curve} selected={depth} showTest={showTest} />
            <Legend
              items={[
                { swatch: 'var(--c1)', symbol: '●', text: 'Träningsdagar (heldragen)' },
                { swatch: 'var(--c2)', symbol: '▲', text: 'Testdagar (streckad)' },
              ]}
            />
            <DepthTable showTest={showTest} />
            <details>
              <summary>Visa trädet med maxdjup {depth}</summary>
              <TreeView tree={depthTree} label={`Algoritmens träd med maxdjup ${depth}`} testId="djup-trad" />
            </details>
          </Panel>
        )}
        {setup.path && (
          <Panel title={`Följ vägen: ${exampleText(ex)}`}>
            <StepperControls stepper={pathStepper} label="Vägen genom trädet" showSpeed={false} />
            <LiveStatus>
              <span data-testid="vag-status">{pathStatus}</span>
            </LiveStatus>
            <TreeView tree={pathTree} label={`Trädet med maxdjup ${pathDepth} och vägen för den nya dagen`} onPath={onPath} current={pathNode.path} testId="vag-trad" />
          </Panel>
        )}
      </div>
    </div>
  );
}
