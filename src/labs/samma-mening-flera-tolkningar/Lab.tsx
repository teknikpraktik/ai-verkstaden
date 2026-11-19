import { useId, useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, NumberField, Panel, SelectField, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import {
  ALL_CONTEXT_RULES,
  AMBIGUITIES,
  compareModeration,
  CONTEXT_RULES,
  CORPUS,
  decisionText,
  END,
  FORUM,
  generate,
  interpret,
  KEYWORDS,
  moderateContext,
  moderateKeyword,
  nextDistribution,
  pairCount,
  trainBigram,
  type ContextRuleId,
  type ModerationResult,
} from './logic';
import { tokenize } from '../gor-text-till-data/logic';
import '../gor-text-till-data/sprak.css';

const isString = (v: unknown): v is string => typeof v === 'string';
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isRules = (v: unknown): v is ContextRuleId[] => Array.isArray(v) && v.every((x) => ALL_CONTEXT_RULES.includes(x as ContextRuleId));

const MODEL = trainBigram(CORPUS);
const PAIRS = pairCount(MODEL);

/** Vilken del av arbetsytan som visas i varje genomgångssteg. */
const stepPart: ('tvetydighet' | 'moderering' | 'nasta')[] = ['tvetydighet', 'tvetydighet', 'moderering', 'moderering', 'moderering', 'nasta', 'nasta'];

function AmbiguityPanel() {
  const [ambId, setAmbId] = useStoredState<string>('amb', AMBIGUITIES[0]!.id, isString);
  const [ctxId, setCtxId] = useStoredState<string | null>('ctx', null, isNullableString);
  const amb = AMBIGUITIES.find((a) => a.id === ambId) ?? AMBIGUITIES[0]!;
  const ctx = amb.contexts.find((c) => c.id === ctxId) ?? null;
  const reading = interpret(amb, ctx?.id ?? null);
  const name = useId();
  return (
    <Panel title="Samma mening – vilken tolkning?">
      <SelectField
        label="Mening"
        value={amb.id}
        options={AMBIGUITIES.map((a) => ({ value: a.id, label: a.sentence }))}
        onChange={(v) => {
          setAmbId(v);
          setCtxId(null);
        }}
      />
      <p className="sp-sequence" lang="sv">
        {ctx && <span className="sp-muted">{ctx.text} </span>}
        <strong>{amb.sentence}</strong>
      </p>
      <p className="hint">{amb.kind}</p>
      <fieldset className="segmented">
        <legend>Sammanhang före meningen</legend>
        <div className="sp-choices">
          <label className="option">
            <input type="radio" name={name} checked={ctx === null} onChange={() => setCtxId(null)} /> <span>Inget sammanhang</span>
          </label>
          {amb.contexts.map((c) => (
            <label className="option" key={c.id}>
              <input type="radio" name={name} checked={ctx?.id === c.id} onChange={() => setCtxId(c.id)} /> <span>”{c.text}”</span>
            </label>
          ))}
        </div>
      </fieldset>
      <table className="table" data-testid="tolkningar">
        <caption>Möjliga tolkningar</caption>
        <tbody>
          {amb.readings.map((r) => {
            const chosen = reading === r.id;
            const ruled = reading !== null && !chosen;
            return (
              <tr key={r.id}>
                <td>{r.text}</td>
                <td className={chosen ? 'sp-pos' : ruled ? 'sp-muted' : undefined}>{chosen ? '✓ rimligast här' : ruled ? '✗ mindre rimlig här' : '? möjlig'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <LiveStatus>
        {reading === null
          ? 'Utan sammanhang är meningen tvetydig: båda tolkningarna är möjliga.'
          : `Med sammanhanget blir tolkningen: ${amb.readings.find((r) => r.id === reading)!.text}`}
      </LiveStatus>
    </Panel>
  );
}

function DecisionCell({ r, should }: { r: ModerationResult; should?: boolean }) {
  const stop = r.decision === 'stoppa';
  const wrong = should !== undefined && stop !== should;
  return (
    <td>
      <span className={stop ? 'sp-neg' : 'sp-pos'}>{decisionText[r.decision]}</span>
      {should !== undefined && <span className={wrong ? 'sp-neg' : 'sp-muted'}>{wrong ? (stop ? ' – fel: stoppad i onödan' : ' – fel: missad') : ' – rätt'}</span>}
      <br />
      <span className="hint">{r.reason}</span>
    </td>
  );
}

function ModerationPanel({ rules, reveal }: { rules: ContextRuleId[]; reveal: boolean }) {
  const cmp = useMemo(() => compareModeration(FORUM, rules), [rules]);
  const [own, setOwn] = useStoredState<string>('own-comment', 'Jag ska slå upp läxan i boken.', isString);
  const ownId = useId();
  return (
    <>
      <Panel title="Moderering av ett påhittat elevforum">
        <p>
          <strong>Beslutssätt 1 – nyckelordsregel:</strong> stoppa kommentaren om den innehåller något av orden {KEYWORDS.join(', ')}.
          <br />
          <strong>Beslutssätt 2 – kontextregel:</strong> samma nyckelord, men med undantag som tittar på orden runt omkring:
        </p>
        <ul>
          {CONTEXT_RULES.map((r) => (
            <li key={r.id}>
              <strong>
                {r.label}
                {rules.includes(r.id) ? '' : ' (avstängd)'}:
              </strong>{' '}
              {r.description}
            </li>
          ))}
        </ul>
        <p className="hint">Facit är en mänsklig bedömning i det påhittade scenariot.</p>
        <div className="sp-scroll">
          <table className="table" data-testid="moderering">
            <caption>Samma tio kommentarer, två beslutssätt</caption>
            <thead>
              <tr>
                <th scope="col">Kommentar</th>
                <th scope="col">Facit</th>
                {reveal && <th scope="col">Nyckelordsregel</th>}
                {reveal && <th scope="col">Kontextregel</th>}
                {reveal && <th scope="col">Vem påverkas om det blir fel?</th>}
              </tr>
            </thead>
            <tbody>
              {cmp.rows.map((r) => (
                <tr key={r.comment.id}>
                  <th scope="row">{r.comment.text}</th>
                  <td>{r.comment.shouldStop ? 'Bör stoppas' : 'Ofarlig'}</td>
                  {reveal && <DecisionCell r={r.keyword} should={r.comment.shouldStop} />}
                  {reveal && <DecisionCell r={r.context} should={r.comment.shouldStop} />}
                  {reveal && <td>{r.comment.affected}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!reveal && <p className="callout callout-tips">Besluten visas i nästa steg, när du har gjort din förutsägelse.</p>}
        {reveal && (
          <table className="table" data-testid="moderering-summa">
            <caption>Sammanfattning</caption>
            <thead>
              <tr>
                <th scope="col">Beslutssätt</th>
                <th scope="col" className="sp-num-cell">
                  Stoppade
                </th>
                <th scope="col" className="sp-num-cell">
                  Ofarliga som stoppades
                </th>
                <th scope="col" className="sp-num-cell">
                  Skadliga som missades
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['Nyckelordsregel', cmp.keyword],
                  ['Kontextregel', cmp.context],
                ] as const
              ).map(([label, s]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td className="sp-num-cell">{s.stopped}</td>
                  <td className="sp-num-cell">{s.wrongStops}</td>
                  <td className="sp-num-cell">{s.missed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      {reveal && (
        <Panel title="Prova en egen kommentar">
          <label htmlFor={ownId}>Din kommentar (sparas bara i den här webbläsaren)</label>
          <textarea id={ownId} className="sp-textarea" rows={2} maxLength={200} value={own} onChange={(e) => setOwn(e.target.value)} />
          <table className="table" data-testid="egen-kommentar">
            <caption>Beslut för din kommentar</caption>
            <tbody>
              <tr>
                <th scope="row">Nyckelordsregel</th>
                <DecisionCell r={moderateKeyword(own)} />
              </tr>
              <tr>
                <th scope="row">Kontextregel</th>
                <DecisionCell r={moderateContext(own, rules)} />
              </tr>
            </tbody>
          </table>
        </Panel>
      )}
    </>
  );
}

function NextWordPanel({ experiment }: { experiment: boolean }) {
  const [start, setStart] = useStoredState<string>('start', 'jag', isString);
  const [seed, setSeed] = useStoredState<number>('seed', 1, isNumber);
  const startId = useId();
  const words = tokenize(start)
    .filter((t) => t.kind !== 'skiljetecken')
    .map((t) => t.text.toLowerCase());
  const last = words[words.length - 1];
  const dist = last ? nextDistribution(MODEL, last) : [];
  const greedy = generate(MODEL, start, { greedy: true });
  const sampled = generate(MODEL, start, { greedy: false, seed });
  const show = (g: ReturnType<typeof generate>) => {
    const extra = g.words.slice(words.length).join(' ').replace(/ \.$/, '.');
    return (
      <>
        {words.join(' ')} <span className="sp-new">{extra}</span>
        {g.stop === 'okant' && g.words.length > words.length && <span className="sp-muted"> (stopp: okänt ord)</span>}
        {g.stop === 'max' && <span className="sp-muted"> …</span>}
      </>
    );
  };
  return (
    <Panel title="Nästa ord: en liten språkmodell">
      <label htmlFor={startId}>Början på en mening (sparas bara i den här webbläsaren)</label>
      <input id={startId} type="text" value={start} maxLength={80} onChange={(e) => setStart(e.target.value)} style={{ width: '100%' }} />
      <div className="row" role="group" aria-label="Exempel på början">
        {['jag', 'en', 'det', 'jag såg mannen med', 'robot'].map((s) => (
          <button key={s} type="button" className="btn" aria-pressed={start === s} onClick={() => setStart(s)}>
            {s}
          </button>
        ))}
      </div>
      {words.length === 0 ? (
        <LiveStatus>Skriv minst ett ord.</LiveStatus>
      ) : dist.length === 0 ? (
        <LiveStatus>Modellen har aldrig sett ordet ”{last}” följas av något annat ord i sin korpus. Den kan inte föreslå något nästa ord.</LiveStatus>
      ) : (
        <>
          <table className="table" data-testid="nasta-ord">
            <caption>Efter ”{last}” kommer i korpusen (modellen ser bara det sista ordet):</caption>
            <thead>
              <tr>
                <th scope="col">Nästa ord</th>
                <th scope="col">Antal</th>
                <th scope="col">Sannolikhet</th>
              </tr>
            </thead>
            <tbody>
              {dist.map((d) => (
                <tr key={d.word}>
                  <th scope="row">{d.word === END ? '. (meningen slutar)' : d.word}</th>
                  <td className="sp-num-cell">
                    {d.count} av {dist.reduce((s, x) => s + x.count, 0)}
                  </td>
                  <td>
                    <span className="sp-meter" style={{ width: `${Math.round(d.p * 80)}px` }} aria-hidden="true" />
                    {Math.round(d.p * 100)} %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row">
            <button type="button" className="btn btn-primary" disabled={dist[0]!.word === END} onClick={() => setStart(`${words.join(' ')} ${dist[0]!.word}`)}>
              Lägg till mest sannolika ordet
            </button>
            {dist[0]!.word === END && <span className="hint">Mest sannolikt är att meningen slutar här.</span>}
          </div>
        </>
      )}
      <p className="sp-tight">
        <strong>Girigt (alltid mest sannolika ordet):</strong>
      </p>
      <p className="sp-sequence" data-testid="girig">
        {show(greedy)}
      </p>
      <p className="sp-tight">
        <strong>Slumpat med startvärde {seed}:</strong>
      </p>
      <p className="sp-sequence" data-testid="slumpad">
        {show(sampled)}
      </p>
      <div className="row">
        <button type="button" className="btn" onClick={() => setSeed(seed + 1)}>
          Nytt startvärde
        </button>
        {experiment && <NumberField label="Startvärde" value={seed} min={0} max={9999} onChange={(v) => setSeed(Math.max(0, Math.round(v)))} />}
      </div>
      <p className="callout callout-forenklad">
        <strong>Storleksskillnad:</strong> den här modellen har lärt sig {PAIRS} tal (antal ordpar) från {MODEL.sentences} meningar med {MODEL.tokens} ord, och den ser bara ett ord
        bakåt. Stora språkmodeller har miljarder parametrar, tränas på enorma textmängder och ser tusentals token bakåt. Grundidén – att förutsäga nästa token – är densamma.
      </p>
      {experiment && (
        <details>
          <summary>Visa hela korpusen ({MODEL.sentences} påhittade meningar)</summary>
          <ol>
            {CORPUS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </details>
      )}
    </Panel>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [rulesStored, setRules] = useStoredState<ContextRuleId[]>('rules', ALL_CONTEXT_RULES, isRules);
  const rules = guided ? ALL_CONTEXT_RULES : rulesStored;
  const idx = Math.min(step, stepPart.length - 1);
  const part = stepPart[idx]!;
  const show = (p: (typeof stepPart)[number]) => !guided || part === p;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vem hade kikaren?',
      body: (
        <>
          <p>
            Läs meningen <strong>”Jag såg mannen med kikaren.”</strong> utan att välja något sammanhang.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'vem-kikaren',
              prompt: 'Vem hade kikaren?',
              options: [
                { id: 'jag', text: 'Jag – jag tittade genom kikaren' },
                { id: 'mannen', text: 'Mannen – han bar på en kikare' },
                {
                  id: 'oklart',
                  text: 'Det går inte att avgöra från meningen ensam',
                },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'kontext',
      phase: 'prova',
      title: 'Låt sammanhanget avgöra',
      body: (
        <>
          <p>Välj ett sammanhang före meningen och se hur tolkningen ändras. Prova också de andra meningarna i listan.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vad-avgor',
              prompt: 'Vad avgör vilken tolkning som är rimligast?',
              options: [
                {
                  id: 'a',
                  text: 'Sammanhanget – det som står före eller runt meningen',
                  correct: true,
                },
                {
                  id: 'b',
                  text: 'Ordningen på orden i meningen',
                  feedback: 'Meningen är exakt likadan i båda fallen. Det är just därför den är tvetydig – ordningen räcker inte.',
                },
                {
                  id: 'c',
                  text: 'Det går alltid att avgöra från meningen själv om man läser noga',
                  feedback: 'Vissa meningar har två rimliga tolkningar även för en noggrann läsare. Vi löser det med hjälp av sammanhanget, ofta utan att märka det.',
                },
              ],
              explanation: 'Människor använder sammanhanget hela tiden. Ett datorprogram behöver få se sammanhanget – och kunna använda det – för att välja rätt tolkning.',
            }}
          />
        </>
      ),
    },
    {
      id: 'moderering-gissa',
      phase: 'forutsag',
      title: 'Två sätt att moderera',
      body: (
        <>
          <p>Ett påhittat elevforum ska stoppa hot och kränkningar automatiskt. Läs de två beslutssätten och de tio kommentarerna, men titta inte på besluten än.</p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-moderering',
              prompt: 'Vilket beslutssätt tror du stoppar flest ofarliga kommentarer i onödan?',
              options: [
                { id: 'nyckel', text: 'Nyckelordsregeln' },
                { id: 'kontext', text: 'Kontextregeln' },
                { id: 'lika', text: 'Lika många' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'moderering-jamfor',
      phase: 'jamfor',
      title: 'Jämför besluten',
      body: (
        <Question
          spec={{
            kind: 'numeric',
            id: 'onodigt-stoppade',
            prompt: 'Hur många ofarliga kommentarer stoppar nyckelordsregeln?',
            answer: 5,
            wrong: [
              {
                value: 8,
                feedback: '8 är alla kommentarer som nyckelordsregeln stoppar. Frågan gäller bara de som enligt facit är ofarliga.',
              },
              {
                value: 3,
                feedback: '3 är de skadliga kommentarer som stoppas rätt. Räkna i stället raderna med ”fel: stoppad i onödan”.',
              },
              {
                value: 0,
                feedback: '0 gäller kontextregeln. Titta i kolumnen Nyckelordsregel.',
              },
            ],
            hint: 'Läs av sammanfattningstabellen eller räkna ”stoppad i onödan” i kolumnen Nyckelordsregel.',
            explanation:
              'Nyckelordsregeln stoppar 5 ofarliga kommentarer och missar 1 hot. Kontextregeln stoppar inga ofarliga men missar 2 hot: ”Jag ska slå upp var du bor” (undantaget för ”slå upp” lurades) och ett hot utan nyckelord.',
          }}
        />
      ),
    },
    {
      id: 'vem-paverkas',
      phase: 'forklara',
      title: 'Vem påverkas?',
      body: (
        <>
          <Question
            spec={{
              kind: 'choice',
              id: 'vem-drabbas',
              multiple: true,
              prompt: 'Vilka drabbas när nyckelordsregeln stoppar ofarliga kommentarer?',
              options: [
                {
                  id: 'laxa',
                  text: 'Eleven som ber om hjälp att slå upp ord',
                  correct: true,
                },
                {
                  id: 'anmaler',
                  text: 'Eleven som anmäler att en kompis har blivit hotad',
                  correct: true,
                },
                {
                  id: 'hotad',
                  text: 'Eleven som får kommentaren ”Vi ses efter skolan. Du vet vad som händer då.”',
                  feedback: 'Den eleven drabbas av att för lite stoppas: hotet har inget nyckelord och missas av båda beslutssätten.',
                },
                {
                  id: 'ingen',
                  text: 'Ingen – det är bättre att stoppa för mycket',
                  feedback: 'Att stoppa för mycket har också ett pris. Den som anmäler ett hot tystas, och den som behöver hjälp får ingen.',
                },
              ],
              explanation:
                'Onödiga stopp drabbar oftast vanliga elever, och värst den som försöker anmäla ett hot. Missade hot drabbar den som blir hotad. Ett beslutssätt flyttar felen mellan grupper – därför behövs mänsklig granskning.',
            }}
          />
          <Question
            spec={{
              kind: 'open',
              id: 'valj-beslutssatt',
              prompt: 'Vilket beslutssätt skulle du välja för forumet, och vad skulle du lägga till? Motivera med vem som påverkas av felen.',
              criteria: [
                'Jämför felen hos båda beslutssätten med siffror från tabellen.',
                'Nämner minst en grupp som drabbas av onödiga stopp och en som drabbas av missade hot.',
                'Föreslår något som minskar skadan, t.ex. mänsklig granskning eller möjlighet att överklaga.',
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'nasta-ord',
      phase: 'prova',
      title: 'Förutsäg nästa ord',
      body: (
        <>
          <p>
            En språkmodell räknar ut hur sannolika olika fortsättningar är. Labbens modell har räknat vilka ord som följer på varandra i 20 korta meningar. Välj starten{' '}
            <strong>en</strong> och läs av tabellen. Prova sedan <em>Lägg till mest sannolika ordet</em>, <em>Nytt startvärde</em> och starten <em>robot</em>.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'p-bok',
              prompt: 'Hur stor är sannolikheten att ”en” följs av ”bok”? Svara i procent.',
              answer: 43,
              tolerance: 0.6,
              unit: '%',
              wrong: [
                {
                  value: 3,
                  feedback: '3 är antalet gånger ”en bok” finns i korpusen. Sannolikheten är antalet delat med alla gånger något följer på ”en”.',
                },
                {
                  value: 50,
                  feedback: 'Räkna alla ord som följer på ”en”: 3 + 2 + 1 + 1 = 7, inte 6.',
                },
              ],
              hint: 'Dela antalet för ”bok” med summan av alla antal i tabellen och gör om till procent.',
              explanation: '3 av 7 är ungefär 43 %. Modellen säger ”bok” oftast, men slumpad generering väljer ibland ”katt”, ”tidning” eller ”text”.',
            }}
          />
        </>
      ),
    },
    {
      id: 'sprakmodeller',
      phase: 'forklara',
      title: 'Samband med stora språkmodeller',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'likhet-llm',
            prompt: 'Vad har labbens lilla modell gemensamt med en stor språkmodell?',
            options: [
              {
                id: 'a',
                text: 'Båda förutsäger nästa token utifrån sannolikheter som de har lärt sig av text',
                correct: true,
              },
              {
                id: 'b',
                text: 'Båda slår upp färdiga svar i en databas',
                feedback:
                  'Ingen av dem slår upp svar. De räknar ut sannolikheter för nästa token och väljer ett i taget. Därför kan de skriva meningar som aldrig funnits – och som kan vara fel.',
              },
              {
                id: 'c',
                text: 'Båda ser bara det senaste ordet',
                feedback:
                  'Det gäller bara labbens modell. En stor språkmodell använder tusentals token av sammanhang, vilket är en stor del av varför den klarar ”Jag såg mannen med kikaren” bättre.',
              },
              {
                id: 'd',
                text: 'Båda förstår vad meningarna betyder',
                feedback: 'Labbens modell räknar bara ordpar. Om och hur stora modeller ”förstår” diskuteras, men de bygger också på sannolikheter för nästa token.',
              },
            ],
            explanation:
              'Grundidén är densamma: nästa token väljs utifrån sannolikheter. Skillnaden är storleken – ett sjuttiotal tal mot miljarder parametrar – och att stora modeller ser mycket mer sammanhang.',
          }}
        />
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={idx} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Kontextregelns undantag">
            <p className="hint">Stäng av ett undantag i taget och se hur felen i modereringen ändras.</p>
            {CONTEXT_RULES.map((r) => (
              <Toggle
                key={r.id}
                label={r.label}
                checked={rulesStored.includes(r.id)}
                onChange={(on) => setRules(on ? ALL_CONTEXT_RULES.filter((x) => x === r.id || rulesStored.includes(x)) : rulesStored.filter((x) => x !== r.id))}
              />
            ))}
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        {show('tvetydighet') && <AmbiguityPanel />}
        {show('moderering') && <ModerationPanel rules={rules} reveal={!guided || idx >= 3} />}
        {show('nasta') && <NextWordPanel experiment={!guided} />}
      </div>
    </div>
  );
}
