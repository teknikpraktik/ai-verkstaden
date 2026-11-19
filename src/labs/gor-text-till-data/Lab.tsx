import { useId, useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, Panel, Segmented, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import {
  analyze,
  countVectors,
  DICT_SIZE,
  DOCUMENTS,
  representationLabel,
  SAMPLE_TEXTS,
  sharedCount,
  START_TEXT,
  summarizeAnalysis,
  type Representation,
  type TokenRow,
} from './logic';
import './sprak.css';

const MAX_LEN = 600;
const isRep = (v: unknown): v is Representation => v === 'ordform' || v === 'stam' || v === 'lemma';
const isString = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

/** Vad arbetsytan visar i varje genomgångssteg – en sak i taget. */
const stepViews: {
  tokens: boolean;
  stem: boolean;
  lemma: boolean;
  vectors: boolean;
}[] = [
  { tokens: false, stem: false, lemma: false, vectors: false },
  { tokens: true, stem: false, lemma: false, vectors: false },
  { tokens: true, stem: true, lemma: false, vectors: false },
  { tokens: true, stem: true, lemma: true, vectors: false },
  { tokens: false, stem: false, lemma: false, vectors: true },
  { tokens: true, stem: true, lemma: true, vectors: true },
];

const kindLabel = {
  ord: 'ord',
  tal: 'tal',
  skiljetecken: 'skiljetecken',
} as const;

function TokenList({ rows }: { rows: TokenRow[] }) {
  if (rows.length === 0) return <p className="sp-muted">(inga token – texten är tom)</p>;
  return (
    <ol className="sp-tokens" aria-label={`Token i texten, ${rows.length} stycken`} data-testid="token-lista">
      {rows.map((r, i) => (
        <li key={i} className={r.token.kind === 'skiljetecken' ? 'sp-punct' : r.token.kind === 'tal' ? 'sp-num' : undefined}>
          {r.token.text}
          {r.token.kind !== 'ord' && <span className="sp-kind">({kindLabel[r.token.kind]})</span>}
        </li>
      ))}
    </ol>
  );
}

function CompareTable({ rows, stemCol, lemmaCol }: { rows: TokenRow[]; stemCol: boolean; lemmaCol: boolean }) {
  const words = rows.filter((r) => r.token.kind === 'ord');
  if (words.length === 0) return <p className="sp-muted">Det finns inga ord att jämföra. Skriv några ord i textrutan.</p>;
  return (
    <div className="sp-scroll-y">
      <table className="table" data-testid="jamfor-tabell">
        <caption>
          Varje ord: tokenisering{stemCol ? ', stemming' : ''}
          {lemmaCol ? ' och lemmatisering' : ''}
        </caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            {stemCol && <th scope="col">Stam (ändelse som klipptes)</th>}
            {lemmaCol && <th scope="col">Lemma (ur ordlistan)</th>}
          </tr>
        </thead>
        <tbody>
          {words.map((r, i) => (
            <tr key={i}>
              <th scope="row">{r.token.text}</th>
              {stemCol && (
                <td>
                  {r.stem.stem} <span className="sp-muted">{r.stem.suffix ? `(−${r.stem.suffix})` : '(ingen regel passade)'}</span>
                </td>
              )}
              {lemmaCol && (
                <td>
                  {r.lemma.known ? (
                    <>
                      {r.lemma.lemma}
                      {r.lemma.ambiguous && (
                        <>
                          {' '}
                          <span className="sp-unknown">◆ tvetydigt:</span> <span className="hint">{r.lemma.ambiguous}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {r.lemma.lemma} <span className="sp-unknown">⚠ okänt – faller igenom oförändrat</span>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VectorView({ docs, rep, lowercase }: { docs: { name: string; short: string; text: string }[]; rep: Representation; lowercase: boolean }) {
  const table = useMemo(
    () =>
      countVectors(
        docs.map((d) => d.text),
        rep,
        lowercase,
      ),
    [docs, rep, lowercase],
  );
  const pairs: [number, number][] = [];
  for (let a = 0; a < docs.length; a++) for (let b = a + 1; b < docs.length; b++) pairs.push([a, b]);
  return (
    <>
      <ul className="sp-tight">
        {docs.map((d) => (
          <li key={d.name}>
            <strong>{d.name}:</strong> {d.text || <span className="sp-muted">(tom)</span>}
          </li>
        ))}
      </ul>
      <p data-testid="ordforrad">
        <strong>Ordförråd med {representationLabel[rep].toLowerCase()}:</strong> {table.vocabulary.length} olika termer. Varje dokument blir en vektor med {table.vocabulary.length}{' '}
        tal.
      </p>
      <div className="sp-scroll-y">
        <table className="table" data-testid="vektor-tabell">
          <caption>Ordvektorer: hur många gånger varje term förekommer (skiljetecken räknas inte)</caption>
          <thead>
            <tr>
              <th scope="col">Term</th>
              {docs.map((d) => (
                <th scope="col" key={d.name} className="sp-num-cell">
                  {d.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.vocabulary.map((t, i) => (
              <tr key={t}>
                <th scope="row">{t}</th>
                {table.counts.map((c, d) => (
                  <td key={d} className={`sp-num-cell ${c[i] ? '' : 'sp-zero'}`}>
                    {c[i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <strong>Gemensamma förekomster:</strong> {pairs.map(([a, b]) => `${docs[a]!.short}–${docs[b]!.short}: ${sharedCount(table, a, b)}`).join(' · ')}
      </p>
    </>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [text, setText] = useStoredState<string>('text', START_TEXT, isString);
  const [rep, setRep] = useStoredState<Representation>('rep', 'ordform', isRep);
  const [lowercaseStored, setLowercase] = useStoredState<boolean>('lowercase', true, isBool);
  const [includeOwnStored, setIncludeOwn] = useStoredState<boolean>('include-own', false, isBool);
  const textId = useId();

  const view = guided ? stepViews[Math.min(step, stepViews.length - 1)]! : { tokens: true, stem: true, lemma: true, vectors: true };
  const lowercase = guided ? true : lowercaseStored;
  const includeOwn = guided ? false : includeOwnStored;

  const rows = useMemo(() => analyze(text, lowercase), [text, lowercase]);
  const summary = useMemo(() => summarizeAnalysis(rows), [rows]);
  const docs = useMemo(
    () => [...DOCUMENTS.map((d) => ({ name: d.name, short: d.id, text: d.text })), ...(includeOwn ? [{ name: 'Din text', short: 'Din text', text }] : [])],
    [includeOwn, text],
  );
  const changed = text !== START_TEXT;

  const resetText = (
    <button type="button" className="btn" onClick={() => setText(START_TEXT)}>
      Återställ starttexten
    </button>
  );
  const startNote = changed && <p className="callout callout-tips">Frågan gäller starttexten. Du har ändrat texten – {resetText}</p>;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Är ”Hundarna” och ”Hunden” samma ord?',
      body: (
        <>
          <p>
            En dator ser bara tecken. För att kunna räkna med text måste den först bestämma vad som är ett ”ord”. Läs starttexten i textrutan: <em>{START_TEXT}</em>
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'hund-samma',
              prompt: 'Kommer datorn att räkna ”Hundarna” och ”Hunden” som samma ord?',
              options: [
                { id: 'ja', text: 'Ja, det är ju samma ord' },
                {
                  id: 'efter',
                  text: 'Bara om texten bearbetas först, till exempel genom att ändelser tas bort',
                },
                { id: 'nej', text: 'Nej, aldrig – bokstäverna är olika' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'tokenisering',
      phase: 'prova',
      title: 'Dela upp texten i token',
      body: (
        <>
          <p>
            Första steget är <strong>tokenisering</strong>: texten delas upp i token. Här blir varje ord, varje tal och varje skiljetecken en egen token. Titta på token-listan och
            prova gärna att ändra texten.
          </p>
          {startNote}
          <Question
            spec={{
              kind: 'numeric',
              id: 'antal-token',
              prompt: 'Hur många token blir starttexten?',
              answer: 9,
              wrong: [
                {
                  value: 7,
                  feedback: '7 är antalet ord. Här räknas också punkten och utropstecknet som token – de kan bära betydelse, till exempel att en mening tar slut.',
                },
                {
                  value: 8,
                  feedback: 'Nästan. Kontrollera att du har räknat både punkten och utropstecknet.',
                },
              ],
              hint: 'Räkna rutorna i token-listan, även de gula skiljetecknen.',
              explanation: '7 ord och 2 skiljetecken ger 9 token. ”Hundarna” och ”Hunden” är fortfarande två olika token.',
            }}
          />
        </>
      ),
    },
    {
      id: 'stemming',
      phase: 'prova',
      title: 'Klipp bort ändelser (stemming)',
      body: (
        <>
          <p>
            <strong>Stemming</strong> klipper bort ändelser enligt fasta regler, till exempel <em>-arna</em>, <em>-en</em> och <em>-er</em>. Labbens stemmer är en egen förenklad
            regelsamling. Titta på kolumnen <em>Stam</em>.
          </p>
          {startNote}
          <Question
            spec={{
              kind: 'choice',
              id: 'sprang-stam',
              prompt: '”Hundarna” och ”Hunden” får samma stam, hund. Varför får ”sprang” och ”springer” olika stammar?',
              options: [
                {
                  id: 'a',
                  text: 'Stemming klipper bara ändelser. I ”sprang” har vokalen inuti ordet ändrats, och det ser reglerna inte',
                  correct: true,
                },
                {
                  id: 'b',
                  text: 'Datorn vet inte att det är verb',
                  feedback: 'Stemmern bryr sig inte om ordklass alls. Den jämför bara slutet av ordet med en lista över ändelser.',
                },
                {
                  id: 'c',
                  text: 'Det är ett fel i labben – en riktig stemmer klarar det',
                  feedback: 'Även riktiga stemmers bygger på regler för ändelser. Starka verb som springa–sprang kräver en ordlista.',
                },
              ],
              explanation:
                '”springer” minus -er ger spring, men ”sprang” har ingen ändelse att klippa. Stemming fungerar bra för regelbundna böjningar men missar starka verb och omljud (bok–böcker).',
            }}
          />
        </>
      ),
    },
    {
      id: 'lemma',
      phase: 'jamfor',
      title: 'Jämför med lemmatisering',
      body: (
        <>
          <p>
            <strong>Lemmatisering</strong> slår upp varje ord i en ordlista och ersätter det med grundformen (lemmat). Labbens ordlista är <strong>reducerad</strong>: den har bara{' '}
            {DICT_SIZE.lemmas} grundformer och {DICT_SIZE.forms} böjningsformer. Prova knappen <em>Ord utanför ordlistan</em> eller skriv egna ord.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'okant-ord',
              prompt: 'Vad händer med ett ord som inte finns i den reducerade ordlistan, till exempel ”robotdammsugaren”?',
              options: [
                {
                  id: 'a',
                  text: 'Det passerar oförändrat – det ”faller igenom” – och räknas som ett eget ord',
                  correct: true,
                },
                {
                  id: 'b',
                  text: 'Datorn gissar grundformen',
                  feedback: 'Ordlistan kan inte gissa. Den hittar antingen ordet eller inte. Att gissa utifrån ändelser är vad stemming gör.',
                },
                {
                  id: 'c',
                  text: 'Ordet tas bort ur texten',
                  feedback: 'Ordet finns kvar, men oförändrat. Därför blir ”robotdammsugaren” och ”robotdammsugare” fortfarande två olika ord.',
                },
              ],
              explanation: 'En ordlista är exakt men bara så bra som den är stor. Stemming klarar okända ord men ger ibland stammar som inte är ord, som ”bättr” eller ”böck”.',
            }}
          />
        </>
      ),
    },
    {
      id: 'vektorer',
      phase: 'prova',
      title: 'Räkna ord: ordvektorer',
      body: (
        <>
          <p>
            Nu räknar vi hur många gånger varje term förekommer i tre korta dokument. Varje dokument blir en <strong>ordvektor</strong> – en lista med tal. Byt representation med
            knapparna ovanför tabellen, en i taget, och se hur ordförrådet ändras.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'hund-a',
              prompt: 'Välj Lemma. Hur många gånger förekommer termen ”hund” i dokument A?',
              answer: 2,
              wrong: [
                {
                  value: 0,
                  feedback: '0 gäller ordformer: ordet ”hund” står inte exakt så i dokument A. Välj Lemma – då räknas ”Hunden” och ”Hundarna” båda som hund.',
                },
                {
                  value: 1,
                  feedback: 'Du har nog bara räknat ett av orden. Både ”Hunden” och ”Hundarna” blir lemmat hund.',
                },
              ],
              hint: 'Leta upp raden ”hund” i tabellen och läs av kolumn A när Lemma är valt.',
              explanation: 'Med lemman blir ”Hunden” och ”Hundarna” samma term, så dokument A får 2. Ordförrådet krymper från 21 ordformer till 18 stammar och 17 lemman.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Vad vinner och förlorar vi?',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'begransningar',
            prompt: 'Förklara med egna exempel från labben när stemming, lemmatisering och ren tokenisering ger olika resultat. Vilka begränsningar har den reducerade ordlistan?',
            criteria: [
              'Ger ett exempel där stemming och lemmatisering ger olika resultat (t.ex. sprang/springer eller böcker/boken).',
              'Förklarar att okända ord faller igenom oförändrade i ordlistan.',
              'Nämner att en ordlista inte vet vilken betydelse ett tvetydigt ord har (t.ex. ”var” eller ”får”).',
              'Beskriver vad som händer med ordvektorerna när fler former slås ihop.',
            ],
          }}
        />
      ),
    },
  ];

  const status =
    summary.tokens === 0
      ? 'Texten är tom. Skriv något i textrutan eller välj en exempeltext.'
      : `${summary.tokens} token: ${summary.words} ord, ${summary.numbers} tal och ${summary.punctuation} skiljetecken. Olika termer: ${summary.distinct.ordform} ordformer, ${summary.distinct.stam} stammar, ${summary.distinct.lemma} lemman.${summary.unknownWords.length ? ` Okända ord i ordlistan: ${summary.unknownWords.length}.` : ''}`;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Inställningar">
            <Toggle
              label="Gör om till små bokstäver"
              checked={lowercase}
              onChange={setLowercase}
              hint="Gäller ordformer. Stemming och ordlistan arbetar alltid med små bokstäver."
            />
            <Toggle label="Lägg till din text som ett fjärde dokument" checked={includeOwn} onChange={setIncludeOwn} />
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title="Din text">
          <label htmlFor={textId}>Exempeltext (sparas bara i den här webbläsaren)</label>
          <textarea id={textId} className="sp-textarea" rows={3} maxLength={MAX_LEN} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row" role="group" aria-label="Exempeltexter">
            {SAMPLE_TEXTS.map((s) => (
              <button key={s.label} type="button" className="btn" aria-pressed={text === s.text} onClick={() => setText(s.text)}>
                {s.label}
              </button>
            ))}
            <button type="button" className="btn btn-quiet" onClick={() => setText('')}>
              Töm
            </button>
          </div>
          {(view.tokens || view.stem || view.lemma) && <LiveStatus>{status}</LiveStatus>}
        </Panel>

        {view.tokens && (
          <Panel title="Tokenisering">
            <TokenList rows={rows} />
            <p className="hint">Gul ruta = skiljetecken, blå ruta = tal. Varje ruta är en token.</p>
          </Panel>
        )}

        {(view.stem || view.lemma) && (
          <Panel title={view.lemma ? 'Stemming och lemmatisering' : 'Stemming'}>
            <CompareTable rows={rows} stemCol={view.stem} lemmaCol={view.lemma} />
            {view.lemma && (
              <p className="callout callout-forenklad">
                Reducerad ordlista: {DICT_SIZE.lemmas} grundformer och {DICT_SIZE.forms} böjningsformer, handgjorda för labben. En riktig svensk ordlista har hundratusentals
                former. Ord som saknas märks med ⚠.
              </p>
            )}
          </Panel>
        )}

        {view.vectors && (
          <Panel title="Ordvektorer för ett litet dokumenturval">
            <Segmented
              legend="Räkna med"
              value={rep}
              options={(Object.keys(representationLabel) as Representation[]).map((r) => ({ value: r, label: representationLabel[r] }))}
              onChange={setRep}
            />
            <VectorView docs={docs} rep={rep} lowercase={lowercase} />
          </Panel>
        )}
      </div>
    </div>
  );
}
