import { Fragment, useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, Slider, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { ratioText } from '../../components/lab/Charts';
import { evaluateAll, groupName, MAX_TRAIN, predict, presets, runPreset, sv, testSet, train, trainingSet, type Example, type Group, type PresetId } from './logic';

type Result = ReturnType<typeof evaluateAll>;
const presetIds = Object.keys(presets) as PresetId[];
const isPreset = (v: unknown): v is PresetId => typeof v === 'string' && v in presets;

/** Vad arbetsytan visar i varje genomgångssteg. */
const stepSetup: { run: boolean; explain: boolean; choosePreset: boolean; compare: boolean }[] = [
  { run: false, explain: false, choosePreset: false, compare: false },
  { run: true, explain: false, choosePreset: false, compare: false },
  { run: true, explain: false, choosePreset: false, compare: false },
  { run: true, explain: true, choosePreset: false, compare: false },
  { run: true, explain: true, choosePreset: true, compare: true },
  { run: true, explain: true, choosePreset: true, compare: true },
];

const W = 560;
const LANE = 56;
const M = { l: 78, r: 14, t: 14, b: 40 };
const H = M.t + 2 * LANE + M.b;
const xScale = (v: number) => M.l + (v / 8) * (W - M.l - M.r);

function StripPlot({ examples, threshold, title, showErrors }: { examples: Example[]; threshold: number | null; title: string; showErrors: boolean }) {
  const groups: Group[] = ['norrby', 'soderby'];
  const desc = groups
    .map((g) => {
      const ex = examples.filter((e) => e.group === g);
      if (ex.length === 0) return `${groupName[g]}: inga exempel.`;
      const ones = ex.filter((e) => e.digit === 1).map((e) => e.x);
      const sevens = ex.filter((e) => e.digit === 7).map((e) => e.x);
      const range = (a: number[]) => (a.length ? `${sv(Math.min(...a))}–${sv(Math.max(...a))} mm` : 'inga');
      const wrong = threshold === null ? 0 : ex.filter((e) => predict(threshold, e.x) !== e.digit).length;
      return `${groupName[g]}: ettor ${range(ones)}, sjuor ${range(sevens)}${showErrors && threshold !== null ? `, ${wrong} felaktigt lästa` : ''}.`;
    })
    .join(' ');
  return (
    <figure className="plot" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${threshold !== null ? `Tröskeln ligger vid ${sv(threshold)} mm. ` : ''}${desc}`}>
        <g className="axis" aria-hidden="true">
          {groups.map((g, gi) => (
            <g key={g}>
              <rect x={M.l} y={M.t + gi * LANE} width={W - M.l - M.r} height={LANE - 4} fill="var(--surface-2)" />
              <text x={M.l - 8} y={M.t + gi * LANE + LANE / 2 + 2} textAnchor="end" className="axis-label">
                {groupName[g]}
              </text>
            </g>
          ))}
          <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
            <g key={t}>
              <line x1={xScale(t)} x2={xScale(t)} y1={H - M.b} y2={H - M.b + 4} />
              <text x={xScale(t)} y={H - M.b + 16} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle" className="axis-label">
            Längd på övre strecket (mm)
          </text>
        </g>
        {threshold !== null && (
          <g aria-hidden="true">
            <line x1={xScale(threshold)} x2={xScale(threshold)} y1={M.t - 6} y2={H - M.b} stroke="var(--text)" strokeWidth={2} strokeDasharray="6 4" />
            <text x={xScale(threshold) + 4} y={M.t + 2} fontSize={12} fill="var(--text)" fontWeight={700}>
              tröskel {sv(threshold)}
            </text>
          </g>
        )}
        <g aria-hidden="true">
          {groups.map((g, gi) =>
            examples
              .filter((e) => e.group === g)
              .map((e, i) => {
                const wrong = showErrors && threshold !== null && predict(threshold, e.x) !== e.digit;
                const cx = xScale(e.x);
                const cy = M.t + gi * LANE + 12 + ((i * 7) % 4) * 9 + (e.digit === 7 ? 4 : 0);
                return (
                  <g key={e.id}>
                    {wrong && <circle cx={cx} cy={cy - 4} r={8} fill="var(--bad-soft)" stroke="var(--bad)" strokeWidth={2} />}
                    <text x={cx} y={cy} textAnchor="middle" fontSize={13} fontWeight={800} fill={e.digit === 1 ? 'var(--c1)' : 'var(--c2)'}>
                      {e.digit}
                    </text>
                  </g>
                );
              }),
          )}
        </g>
      </svg>
      <figcaption className="hint">{desc}</figcaption>
    </figure>
  );
}

function ResultTable({ result, caption }: { result: Result; caption: string }) {
  const rows: [string, Result['norrby'] | null][] = [
    ['Norrby', result.norrby],
    ['Söderby', result.soderby],
  ];
  return (
    <div className="table-wrap">
      <table className="table" data-testid="resultat-tabell">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Skola</th>
            <th scope="col">Fel av antal svar (felandel)</th>
            <th scope="col">Ettor lästa som 7</th>
            <th scope="col">Sjuor lästa som 1</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, r]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td data-testid={`fel-${name.toLowerCase()}`}>{ratioText(r!.errors, r!.n)}</td>
              <td>{ratioText(r!.onesAsSeven, r!.ones)}</td>
              <td>{ratioText(r!.sevensAsOne, r!.sevens)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Alla tillsammans</th>
            <td data-testid="fel-totalt">{ratioText(result.total.errors, result.total.n)}</td>
            <td>–</td>
            <td>–</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PresetCompare() {
  const rows = useMemo(() => presetIds.map((id) => ({ id, ...runPreset(id) })), []);
  return (
    <div className="table-wrap">
      <table className="table" data-testid="urval-jamforelse">
        <caption>Samma modell och samma testdata – bara träningsdatan ändras</caption>
        <thead>
          <tr>
            <th scope="col">Träningsdata</th>
            <th scope="col">Inlärd tröskel</th>
            <th scope="col">Fel i Norrby</th>
            <th scope="col">Fel i Söderby</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{presets[r.id].name}</th>
              <td>{r.model ? `${sv(r.model.threshold)} mm` : '–'}</td>
              <td>{r.result ? ratioText(r.result.norrby.errors, r.result.norrby.n) : '–'}</td>
              <td>{r.result ? ratioText(r.result.soderby.errors, r.result.soderby.n) : '–'}</td>
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
  const [ran, setRan] = useStoredState<boolean>('ran', false, (v): v is boolean => typeof v === 'boolean');
  const [preset, setPreset] = useStoredState<PresetId>('preset', 'norrby24', isPreset);
  const [nNorrby, setNNorrby] = useStoredState<number>('n-norrby', 24, (v): v is number => typeof v === 'number' && v >= 0 && v <= MAX_TRAIN.norrby);
  const [nSoderby, setNSoderby] = useStoredState<number>('n-soderby', 0, (v): v is number => typeof v === 'number' && v >= 0 && v <= MAX_TRAIN.soderby);
  const [manual, setManual] = useStoredState<boolean>('manual', false, (v): v is boolean => typeof v === 'boolean');
  const [manualT, setManualT] = useStoredState<number>('manual-t', 3.65, (v): v is number => typeof v === 'number' && v >= 0 && v <= 8);

  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const activePreset: PresetId = guided ? (setup.choosePreset ? preset : 'norrby24') : preset;
  const counts = guided ? presets[activePreset] : { norrby: nNorrby, soderby: nSoderby };
  const training = useMemo(() => trainingSet(counts.norrby, counts.soderby), [counts.norrby, counts.soderby]);
  const model = useMemo(() => train(training), [training]);
  const threshold = !guided && manual ? manualT : (model?.threshold ?? null);
  const showRun = guided ? setup.run && ran : true;
  const result = useMemo(() => (threshold === null ? null : evaluateAll(threshold)), [threshold]);
  const showExplain = guided ? setup.explain : true;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vem tror du får flest fel?',
      body: (
        <>
          <p>
            En skanner läser handskrivna svar på matteprov och avgör om det står <strong>1</strong> eller <strong>7</strong>. Modellen har tränats på 24 svar från <strong>Norrby</strong>. Nu ska den användas i både Norrby och <strong>Söderby</strong>. Titta på träningsdatan i diagrammet.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-grupp',
              prompt: 'Vilken skola tror du får störst andel felaktigt lästa svar?',
              options: [
                { id: 'norrby', text: 'Norrby' },
                { id: 'soderby', text: 'Söderby' },
                { id: 'lika', text: 'Ungefär lika för båda' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'kor',
      phase: 'prova',
      title: 'Kör klassificeraren på testdata',
      body: (
        <>
          <p>
            Testdatan är nya svar som modellen inte har sett: <strong>40 från Norrby</strong> och <strong>10 från Söderby</strong>. Tryck på <strong>Kör modellen på testdata</strong> och läs tabellen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'soderby-felandel',
              prompt: 'Hur stor andel av Söderbys svar lästes fel? Svara i procent.',
              unit: '%',
              answer: 50,
              wrong: [
                { value: 5, feedback: '5 är antalet fel. En andel får du genom att dela med nämnaren: hur många svar från Söderby som testades (10).' },
                { value: 10, feedback: '10 % är felandelen för alla 50 svar tillsammans. Frågan gäller bara Söderbys 10 svar.' },
              ],
              hint: 'Dela antalet fel i Söderby med antalet testade svar från Söderby.',
              explanation: '5 av 10 svar blev fel, alltså 50 %. I Norrby blev 0 av 40 fel.',
            }}
          />
        </>
      ),
    },
    {
      id: 'namnare',
      phase: 'jamfor',
      title: 'Jämför med tydliga nämnare',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'totalt-missvisande',
            prompt: 'Totalt blev 5 av 50 svar fel (10 %). Varför ger den siffran en missvisande bild?',
            options: [
              { id: 'a', text: 'Söderby är bara 10 av de 50 svaren, så deras höga felandel späds ut av Norrbys många felfria svar', correct: true },
              { id: 'b', text: 'Den är inte missvisande – 10 % fel är lågt, så modellen fungerar bra för alla', feedback: 'Ett genomsnitt kan dölja stora skillnader. Varannan elev i Söderby fick sitt svar fel läst.' },
              { id: 'c', text: 'Totalen räknar bara med Norrby', feedback: 'Totalen räknar med alla 50 svar. Problemet är att grupperna är olika stora, så den stora gruppen styr genomsnittet.' },
            ],
            explanation: 'Jämför alltid felandel per grupp och skriv ut nämnaren: 0 av 40 i Norrby och 5 av 10 i Söderby.',
          }}
        />
      ),
    },
    {
      id: 'forklaring',
      phase: 'prova',
      title: 'Vad visar modellens förklaring?',
      body: (
        <>
          <p>
            Modellen är mycket enkel och går att förklara helt: den tittar bara på <strong>längden på det övre strecket</strong>. Är strecket längre än tröskeln säger den 7, annars 1. Felaktigt lästa svar har en ring och ✗ i diagrammet.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'forklaring-visar',
              prompt: 'Vad kan förklaringen synliggöra om felen i Söderby?',
              options: [
                { id: 'a', text: 'Söderbys ettor har ett övre streck på 3,7–4,7 mm, längre än tröskeln 3,65 mm, så de läses som sjuor', correct: true },
                { id: 'b', text: 'Eleverna i Söderby skriver slarvigare', feedback: 'Diagrammet visar att Söderbys ettor är lika tydliga som Norrbys – de ser bara annorlunda ut, med en längre flagga upptill. Felet ligger i vad modellen har lärt sig.' },
                { id: 'c', text: 'Modellen har gjort ett räknefel', feedback: 'Modellen räknar exakt som den ska. Tröskeln var den bästa för Norrbys handstil, men Söderbys ettor fanns inte med i träningen.' },
              ],
              explanation: 'Förklaringen visar vilken egenskap och vilken gräns modellen använder. Därför syns det att tröskeln passar Norrbys ettor men inte Söderbys.',
            }}
          />
        </>
      ),
    },
    {
      id: 'urval',
      phase: 'jamfor',
      title: 'Ändra träningsdatan – en sak i taget',
      body: (
        <>
          <p>
            Välj träningsdata ovanför diagrammet. Jämför först <em>24</em> med <em>48 svar från Norrby</em> (fler exempel, samma urval). Jämför sedan med <em>12 + 12</em> (lika många exempel som från början, men annat urval).
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'procentenheter',
              prompt: 'Med 12 + 12 exempel: hur många procentenheter lägre blev Söderbys felandel jämfört med 24 svar från Norrby?',
              unit: 'procentenheter',
              answer: 50,
              wrong: [
                { value: 5, feedback: '5 är skillnaden i antal fel. Frågan gäller felandelen i procent: från 50 % till 0 %.' },
                { value: 0, feedback: '0 är skillnaden när du går från 24 till 48 svar från Norrby. Fler exempel från samma urval ändrade ingenting. Jämför med 12 + 12.' },
              ],
              hint: 'Läs Söderbys felandel i jämförelsetabellen för båda träningsdatan och ta skillnaden.',
              explanation: 'Söderbys felandel sjönk från 50 % till 0 %, alltså 50 procentenheter, fast antalet träningsexempel var detsamma (24). Det var urvalet som spelade roll.',
            }}
          />
        </>
      ),
    },
    {
      id: 'lita',
      phase: 'forklara',
      title: 'Transparens är inte samma sak som tillit',
      body: (
        <>
          <Question
            spec={{
              kind: 'choice',
              id: 'transparens-tillit',
              prompt: 'Modellen tränad på 24 svar från Norrby är helt genomskinlig: alla kan se regeln. Kan skolan därför lita på att den läser alla elevers svar rätt?',
              options: [
                { id: 'a', text: 'Nej. Förklaringen visar hur modellen räknar, men inte om träningsdatan liknar alla elevers handstil. Det måste testas för varje grupp.', correct: true },
                { id: 'b', text: 'Ja, när man vet exakt hur modellen räknar kan den inte göra oväntade fel', feedback: 'Regeln var känd hela tiden, men felen i Söderby syntes först när modellen testades på deras svar. Att förstå hur något räknar är inte samma sak som att veta att det räknar rätt.' },
                { id: 'c', text: 'Nej, för en modell som går att förklara är alltid sämre än en som inte går att förklara', feedback: 'Förklarbarhet gör inte en modell sämre. Här var förklaringen till och med det som hjälpte oss att hitta orsaken till felen.' },
              ],
              explanation: 'Transparens gör det möjligt att granska. Tillit kräver dessutom att utfallet har testats på rätt data, uppdelat per grupp.',
            }}
          />
          <Question
            spec={{
              kind: 'open',
              id: 'rad-till-skolan',
              prompt: 'Skolan i Söderby funderar på att köpa skannern. Vad skulle du råda dem att kontrollera innan de använder den på riktiga prov?',
              criteria: [
                'nämner att modellen ska testas på svar från deras egna elever',
                'jämför felandel per grupp med tydlig nämnare, inte bara en total',
                'förklarar att det är urvalet i träningsdatan som avgör, inte bara mängden data',
                'skiljer på att kunna se hur modellen räknar och att kunna lita på resultatet',
              ],
            }}
          />
        </>
      ),
    },
  ];

  const status = (() => {
    if (!model) return 'Modellen kan inte tränas: träningsdatan måste innehålla både ettor och sjuor. Öka antalet exempel.';
    if (!showRun || !result) return `Modellen är tränad på ${training.length} svar (${counts.norrby} från Norrby, ${counts.soderby} från Söderby). Den har inte körts på testdata än.`;
    return `Testdata: Norrby ${ratioText(result.norrby.errors, result.norrby.n)} fel, Söderby ${ratioText(result.soderby.errors, result.soderby.n)} fel.`;
  })();

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps.map((s) => ({ ...s, body: <Fragment key={s.id}>{s.body}</Fragment> }))} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Inställningar">
            <Slider label="Träningssvar från Norrby" value={nNorrby} min={0} max={MAX_TRAIN.norrby} step={6} onChange={setNNorrby} format={(v) => `${v} svar`} />
            <Slider label="Träningssvar från Söderby" value={nSoderby} min={0} max={MAX_TRAIN.soderby} step={6} onChange={setNSoderby} format={(v) => `${v} svar`} />
            <Toggle label="Ställ in tröskeln själv" checked={manual} onChange={setManual} hint="Då används din tröskel i stället för den inlärda." />
            {manual && <Slider label="Tröskel" value={manualT} min={0} max={8} step={0.05} onChange={(v) => setManualT(Math.round(v * 100) / 100)} format={(v) => `${sv(v)} mm`} />}
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title="Klassificeraren: 1 eller 7?">
          {guided && setup.choosePreset && (
            <Segmented legend="Träningsdata" value={preset} options={presetIds.map((id) => ({ value: id, label: presets[id].name }))} onChange={setPreset} />
          )}
          {guided && setup.run && !ran && (
            <button type="button" className="btn btn-primary" onClick={() => setRan(true)}>
              Kör modellen på testdata
            </button>
          )}
          <LiveStatus>{status}</LiveStatus>
          {showExplain && model && (
            <div className="callout" data-testid="modellforklaring">
              <p className="callout-title">Modellens förklaring</p>
              <p>
                Om övre strecket är längre än <strong>{sv(threshold ?? model.threshold)} mm</strong> → svara <strong>7</strong>, annars → svara <strong>1</strong>.
                {!guided && manual ? ' (Tröskeln är inställd för hand.)' : ` Tröskeln är inlärd från ${model.trainSize} träningssvar, där den gav ${model.trainErrors} fel.`}
              </p>
            </div>
          )}
          {showRun && result ? (
            <StripPlot examples={testSet} threshold={showExplain ? threshold : null} showErrors title="Testdata: 40 svar från Norrby och 10 från Söderby" />
          ) : (
            <StripPlot examples={training} threshold={null} showErrors={false} title={`Träningsdata: ${training.length} svar`} />
          )}
          <Legend
            items={[
              { swatch: 'var(--surface)', symbol: '1', text: 'Svaret är egentligen 1' },
              { swatch: 'var(--surface)', symbol: '7', text: 'Svaret är egentligen 7' },
              { swatch: 'var(--bad-soft)', symbol: '✗', text: 'Felaktigt läst (ring)' },
              { swatch: 'var(--surface)', symbol: '┆', text: 'Tröskel' },
            ]}
          />
          {showRun && result && <ResultTable result={result} caption={`Fel på testdatan (tränad på ${training.length} svar)`} />}
        </Panel>
        {(guided ? setup.compare : true) && (
          <Panel title="Jämförelse av urval">
            <PresetCompare />
          </Panel>
        )}
      </div>
    </div>
  );
}
