import { useId, useMemo, useState } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, Panel, Segmented, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { ConfusionMatrix, ratioText } from '../../components/lab/Charts';
import {
  classify,
  DEFAULT_OPTIONS,
  evaluate,
  formatWeight,
  HELD_OUT,
  labelSymbol,
  labelText,
  PROBES,
  train,
  TRAINING,
  type Classification,
  type Example,
  type Label,
} from './logic';
import '../gor-text-till-data/sprak.css';

const MAX_LEN = 200;
const isString = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
type AlphaKey = '1' | '0.1' | '0';
const isAlpha = (v: unknown): v is AlphaKey => v === '1' || v === '0.1' || v === '0';
const isLabel = (v: unknown): v is Label => v === 'viktigt' || v === 'vanta';
const isExamples = (v: unknown): v is Example[] =>
  Array.isArray(v) && v.every((e) => typeof e === 'object' && e !== null && typeof (e as Example).text === 'string' && isLabel((e as Example).label));

/** Meddelandet som laddas när eleven går till ett steg i genomgången. */
const stepMessage: (string | null)[] = [PROBES.start, PROBES.start, PROBES.negation, PROBES.unknown, null, null];
/** Vilka paneler som syns i varje steg. */
const stepViews: { training: boolean; test: boolean; heldOut: boolean }[] = [
  { training: true, test: false, heldOut: false },
  { training: false, test: true, heldOut: false },
  { training: false, test: true, heldOut: false },
  { training: false, test: true, heldOut: false },
  { training: false, test: false, heldOut: true },
  { training: false, test: true, heldOut: true },
];

function DecisionBadge({ decision }: { decision: Label | null }) {
  if (decision === null) return <span className="sp-badge">● Oavgjort</span>;
  return (
    <span className={`sp-badge ${decision === 'viktigt' ? 'sp-badge-a' : 'sp-badge-b'}`}>
      {labelSymbol[decision]} {labelText[decision]}
    </span>
  );
}

const num = (x: number) => (Number.isNaN(x) ? '?' : x === Infinity ? '+∞' : x === -Infinity ? '−∞' : (Math.round(x * 100) / 100).toFixed(2).replace('.', ',').replace('-', '−'));
const signClass = (x: number) => (x > 0 ? 'sp-pos' : x < 0 ? 'sp-neg' : 'sp-muted');

function InfluenceTable({ c }: { c: Classification }) {
  return (
    <div className="sp-scroll">
      <table className="table" data-testid="ordpaverkan">
        <caption>Vilka ord påverkar? ▲ positivt tal drar mot Viktigt, ▼ negativt tal drar mot Kan vänta.</caption>
        <thead>
          <tr>
            <th scope="col">Ord</th>
            <th scope="col">I träningsdata (viktigt / kan vänta)</th>
            <th scope="col" className="sp-num-cell">
              Bidrag
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              <em>Förhandsläge</em>
            </th>
            <td className="hint">andel exempel i varje klass</td>
            <td className={`sp-num-cell ${signClass(c.prior)}`}>{formatWeight(c.prior)}</td>
          </tr>
          {c.influences.map((i) => (
            <tr key={i.word}>
              <th scope="row">
                {i.word}
                {i.count > 1 ? ` (×${i.count})` : ''}
              </th>
              <td>{i.known ? `${i.inViktigt} / ${i.inVanta}` : <span className="sp-unknown">⚠ finns inte i träningsdata – hoppas över</span>}</td>
              <td className={`sp-num-cell ${i.known ? signClass(i.total) : 'sp-muted'}`}>{i.known ? formatWeight(i.total) : '–'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              Summa (poäng)
            </th>
            <td className={`sp-num-cell ${signClass(c.score)}`} data-testid="poang">
              {formatWeight(c.score)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function resultText(c: Classification): string {
  if (c.words.length === 0) return 'Meddelandet är tomt. Utan ord har modellen bara förhandsläget att gå på, och klasserna är lika vanliga i träningsdata – oavgjort.';
  if (Number.isNaN(c.score)) return 'Modellen kan inte avgöra: meddelandet har ord som har sannolikhet 0 i båda klasserna. Det händer bara utan utjämning.';
  if (c.knownCount === 0) return `Inget av de ${c.unknownCount} orden finns i träningsdata. Modellen har inget att gå på – oavgjort.`;
  const p = Number.isNaN(c.pViktigt) ? '' : ` Modellens sannolikhet för Viktigt: ${Math.round(c.pViktigt * 100)} %.`;
  const unk = c.unknownCount ? ` ${c.unknownCount} ord saknas i träningsdata och hoppas över.` : '';
  if (c.decision === null) return `Poängen blev exakt 0 – oavgjort.${unk}`;
  return `Beslut: ${labelText[c.decision]} (poäng ${num(c.score)}).${p}${unk}`;
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [message, setMessage] = useStoredState<string>('message', PROBES.start, isString);
  const [alphaKey, setAlphaKey] = useStoredState<AlphaKey>('alpha', '1', isAlpha);
  const [stemsStored, setStems] = useStoredState<boolean>('stems', false, isBool);
  const [added, setAdded] = useStoredState<Example[]>('added', [], isExamples);
  const [newLabel, setNewLabel] = useState<Label>('viktigt');
  const msgId = useId();

  const alpha = guided ? DEFAULT_OPTIONS.alpha : Number(alphaKey);
  const useStems = guided ? DEFAULT_OPTIONS.useStems : stemsStored;
  const training = useMemo(() => (guided ? TRAINING : [...TRAINING, ...added]), [guided, added]);
  const model = useMemo(() => train(training, { alpha, useStems }), [training, alpha, useStems]);
  const result = useMemo(() => classify(model, message), [model, message]);
  const report = useMemo(() => evaluate(model, HELD_OUT), [model]);
  const view = guided ? stepViews[Math.min(step, stepViews.length - 1)]! : { training: true, test: true, heldOut: true };

  const goStep = (i: number) => {
    setStep(i);
    const m = stepMessage[i];
    if (guided && m !== null && m !== undefined) setMessage(m);
  };

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad gör ordet ”inte”?',
      body: (
        <>
          <p>
            En påhittad skola vill sortera sina meddelanden i <strong>Viktigt</strong> och <strong>Kan vänta</strong>. Modellen har lärt sig av 16 exempel som en människa har sorterat (se tabellen <em>Träningsdata</em>). Den räknar bara vilka ord som finns – ordningen ignoreras.
          </p>
          <p>
            Modellen säger <strong>Viktigt</strong> om meddelandet ”{PROBES.start}”.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-negation',
              prompt: `Vad tror du händer om meddelandet blir ”${PROBES.negation}”?`,
              options: [
                { id: 'byter', text: 'Modellen byter till Kan vänta' },
                { id: 'nastan', text: 'Modellen säger fortfarande Viktigt, med nästan samma poäng' },
                { id: 'vet-ej', text: 'Modellen kan inte avgöra' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'ordvikter',
      phase: 'prova',
      title: 'Vilka ord påverkar?',
      body: (
        <>
          <p>
            Varje känt ord får ett <strong>bidrag</strong>: positivt (▲) om ordet är vanligare i Viktigt-exemplen, negativt (▼) om det är vanligare i Kan vänta. Bidragen läggs ihop till en poäng. Över 0 blir det Viktigt, under 0 Kan vänta.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'starkast-ord',
              prompt: `Vilket ord i ”${PROBES.start}” drar mest mot Viktigt?`,
              options: [
                { id: 'morgon', text: 'morgon', correct: true },
                { id: 'i', text: 'i', feedback: '”i” finns i många exempel, men i båda klasserna (5 mot 3). Därför är bidraget litet: +0,40. Ett ord som är vanligt överallt säger inte mycket.' },
                { id: 'lektionen', text: 'lektionen', feedback: '”lektionen” finns bara i ett Viktigt-exempel. Bidraget är +0,68, men ”morgon” finns i två och ger +1,09.' },
                { id: 'installd', text: 'inställd', feedback: '”inställd” känns viktigt för oss, men modellen har bara sett ordet en gång. Bidraget är +0,68.' },
              ],
              explanation: '”morgon” finns i två Viktigt-exempel och inga Kan vänta-exempel. Bidraget blir +1,09, störst av orden i meddelandet. Summan är +3,54.',
            }}
          />
        </>
      ),
    },
    {
      id: 'negation',
      phase: 'prova',
      title: 'Lägg till ”inte”',
      body: (
        <>
          <p>
            Nu står det <em>{PROBES.negation}</em>. Jämför poängen med förra steget (+3,54) och med din förutsägelse.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'negation-varfor',
              prompt: 'Poängen sjönk bara från +3,54 till +3,53. Varför?',
              options: [
                { id: 'a', text: '”inte” finns lika ofta i båda klasserna, och modellen ser inte vilket ord ”inte” hör ihop med', correct: true },
                { id: 'b', text: 'Modellen förstår att lektionen ändå är viktig', feedback: 'Modellen förstår ingenting om lektioner. Den lägger bara ihop bidrag från ord den har räknat i träningsdata.' },
                { id: 'c', text: '”inte” är ett okänt ord', feedback: '”inte” finns i träningsdata, en gång i varje klass. Därför blir bidraget nästan 0 (−0,01).' },
              ],
              explanation: 'I en bag-of-words-modell är ”inte inställd” bara två ord i en påse. Att ”inte” vänder betydelsen kräver att modellen ser ordningen – det gör den inte.',
            }}
          />
        </>
      ),
    },
    {
      id: 'okanda',
      phase: 'prova',
      title: 'Ord som modellen aldrig har sett',
      body: (
        <>
          <p>
            Meddelandet <em>{PROBES.unknown}</em> innehåller bara ord som inte finns i träningsdata. Prova också att tömma rutan, eller skriv ett eget meddelande.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'okanda-ord',
              prompt: 'Varför blir det oavgjort?',
              options: [
                { id: 'a', text: 'Okända ord hoppas över, så det finns inga bidrag – och klasserna är lika vanliga i träningsdata', correct: true },
                { id: 'b', text: 'Modellen gissar att okända ord är oviktiga', feedback: 'Modellen gissar inte. Ett ord den inte har räknat ger inget bidrag åt något håll.' },
                { id: 'c', text: 'Meddelandet är för kort', feedback: 'Längden spelar ingen roll. ”Provet” ensamt ger ett tydligt beslut, eftersom ordet finns i träningsdata.' },
              ],
              explanation: 'Modellen kan bara använda det den har sett. Nya ord, stavfel och andra böjningsformer (”inställt” i stället för ”inställd”) är osynliga för den.',
            }}
          />
        </>
      ),
    },
    {
      id: 'reserverade',
      phase: 'jamfor',
      title: 'Testa på reserverade exempel',
      body: (
        <>
          <p>
            Sex meddelanden har hållits utanför träningen. En människa har sorterat dem i förväg. Jämför modellens beslut med facit i tabellen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'antal-fel',
              prompt: 'Hur många av de 6 reserverade exemplen sorterar modellen fel?',
              answer: 2,
              wrong: [
                { value: 4, feedback: '4 är antalet som blev rätt. Frågan gäller hur många som blev fel.' },
                { value: 1, feedback: 'Titta på båda klasserna: ett viktigt meddelande har missats, och ett oviktigt har blivit falsklarm.' },
                { value: 0, feedback: 'Modellen gör inga fel på träningsexemplen, men de reserverade är nya. Jämför kolumnerna Facit och Modellen.' },
              ],
              hint: 'Räkna raderna med ✗ i tabellen.',
              explanation: 'Två fel: snöstormsmeddelandet avgörs bara av ordet ”på” (−1,11) och blir Kan vänta, och ”Det blir inget prov i morgon” blir Viktigt på grund av ”i morgon”. Felandelen är 2 av 6 (33 %).',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Varför blev det fel?',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'forklara-fel',
            prompt: 'Välj ett av felen på de reserverade exemplen. Förklara med hjälp av ordens bidrag varför modellen gjorde fel, och föreslå en förbättring.',
            criteria: [
              'Pekar ut vilket eller vilka ord som avgjorde beslutet och åt vilket håll de drog.',
              'Förklarar att okända ord hoppas över eller att ordningen (t.ex. ”inget prov”) inte syns.',
              'Föreslår en konkret förbättring, t.ex. fler träningsexempel, stemming eller ordpar.',
              'Nämner varför man testar på exempel som modellen inte har tränats på.',
            ],
          }}
        />
      ),
    },
  ];

  const addExample = () => {
    if (message.trim() === '') return;
    setAdded([...added, { text: message.trim(), label: newLabel }]);
  };

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={goStep} />
        {!guided && (
          <Panel title="Inställningar">
            <Segmented
              legend="Utjämning (α)"
              value={alphaKey}
              options={[
                { value: '1', label: '1 (Laplace)' },
                { value: '0.1', label: '0,1' },
                { value: '0', label: '0 (ingen)' },
              ]}
              onChange={setAlphaKey}
            />
            <p className="hint">Utan utjämning får ett ord som bara finns i en klass oändligt stort bidrag (±∞) och avgör ensamt.</p>
            <Toggle label="Använd stammar (stemmern från labb 16)" checked={stemsStored} onChange={setStems} />
            <Segmented
              legend="Lägg till meddelandet i träningsdata som"
              value={newLabel}
              options={[
                { value: 'viktigt', label: '▲ Viktigt' },
                { value: 'vanta', label: '▼ Kan vänta' },
              ]}
              onChange={setNewLabel}
            />
            <div className="row">
              <button type="button" className="btn" onClick={addExample} disabled={message.trim() === ''}>
                Lägg till i träningsdata
              </button>
              {added.length > 0 && (
                <button type="button" className="btn btn-quiet" onClick={() => setAdded([])}>
                  Ta bort tillagda ({added.length})
                </button>
              )}
            </div>
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        {view.test && (
          <Panel title="Testa ett meddelande">
            <label htmlFor={msgId}>Meddelande (sparas bara i den här webbläsaren)</label>
            <textarea id={msgId} className="sp-textarea" rows={2} maxLength={MAX_LEN} value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="row" role="group" aria-label="Exempelmeddelanden">
              <button type="button" className="btn" onClick={() => setMessage(PROBES.start)}>
                Utan ”inte”
              </button>
              <button type="button" className="btn" onClick={() => setMessage(PROBES.negation)}>
                Med ”inte”
              </button>
              <button type="button" className="btn" onClick={() => setMessage(PROBES.unknown)}>
                Okända ord
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => setMessage('')}>
                Töm
              </button>
            </div>
            <p>
              <DecisionBadge decision={result.decision} />
            </p>
            <LiveStatus>
              <span data-testid="beslut">{resultText(result)}</span>
            </LiveStatus>
            <InfluenceTable c={result} />
          </Panel>
        )}

        {view.heldOut && (
          <Panel title="Reserverade exempel (används inte i träningen)">
            <div className="sp-scroll">
              <table className="table" data-testid="reserverade">
                <caption>Modellens beslut jämfört med facit</caption>
                <thead>
                  <tr>
                    <th scope="col">Meddelande</th>
                    <th scope="col">Facit</th>
                    <th scope="col">Modellen</th>
                    <th scope="col">Rätt?</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr key={r.example.text}>
                      <th scope="row">{r.example.text}</th>
                      <td>
                        {labelSymbol[r.example.label]} {labelText[r.example.label]}
                      </td>
                      <td>
                        {r.result.decision ? `${labelSymbol[r.result.decision]} ${labelText[r.result.decision]}` : '● Oavgjort'}{' '}
                        <span className="hint">({num(r.result.score)})</span>
                      </td>
                      <td className={r.correct ? 'sp-pos' : 'sp-neg'}>{r.correct ? '✓ rätt' : '✗ fel'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p data-testid="felrapport">
              <strong>Fel:</strong> {ratioText(report.errors, report.rows.length)}
              {report.undecided > 0 ? ` (varav ${report.undecided} oavgjorda, räknas som fel)` : ''}.
            </p>
            <ConfusionMatrix tp={report.tp} fn={report.fn} fp={report.fp} tn={report.tn} positive="Viktigt" negative="Kan vänta" caption="Förväxlingsmatris för de reserverade exemplen" />
            <p className="hint">Undersök felen: knapparna visar meddelandet med ordens bidrag.</p>
            <div className="row" role="group" aria-label="Visa ett reserverat exempel i testrutan">
              {report.rows
                .filter((r) => !r.correct)
                .map((r) => (
                  <button
                    key={r.example.text}
                    type="button"
                    className="btn"
                    onClick={() => {
                      setMessage(r.example.text);
                      if (guided && !view.test) goStep(5);
                    }}
                  >
                    Undersök: {r.example.text}
                  </button>
                ))}
            </div>
          </Panel>
        )}

        {view.training && (
          <Panel title={`Träningsdata (${training.length} påhittade meddelanden)`}>
            <div className="sp-scroll">
              <table className="table" data-testid="traningsdata">
                <caption>Exempel som en människa har sorterat</caption>
                <thead>
                  <tr>
                    <th scope="col">Meddelande</th>
                    <th scope="col">Klass</th>
                  </tr>
                </thead>
                <tbody>
                  {training.map((e, i) => (
                    <tr key={i}>
                      <td>
                        {e.text}
                        {i >= TRAINING.length ? <span className="hint"> (tillagt av dig)</span> : ''}
                      </td>
                      <td>
                        {labelSymbol[e.label]} {labelText[e.label]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
