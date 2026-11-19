import { useMemo } from 'react';
import { ConfusionMatrix, ratioText } from '../../components/lab/Charts';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Segmented, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { CurveChart, PlantPlot } from './Charts12';
import { decisionGrid, evaluate, K_OPTIONS, leakageDemo, makeSplit, pct, validationCurve, type Evaluation } from './logic';

const split = makeSplit();
const curve = validationCurve(split.train, split.validation);

interface Locked {
  k: number;
  /** true om eleven har ångrat ett tidigare val – då är testet redan "förbrukat". */
  reused: boolean;
}

const isLocked = (v: unknown): v is Locked | null =>
  v === null || (typeof v === 'object' && v !== null && typeof (v as Locked).k === 'number' && (K_OPTIONS as readonly number[]).includes((v as Locked).k) && typeof (v as Locked).reused === 'boolean');

interface StepSetup {
  curve: boolean;
  slider: boolean;
  lock: boolean;
  errors: boolean;
  leak: boolean;
}

const stepSetup: StepSetup[] = [
  { curve: false, slider: false, lock: false, errors: false, leak: false },
  { curve: true, slider: true, lock: false, errors: false, leak: false },
  { curve: true, slider: true, lock: true, errors: false, leak: false },
  { curve: true, slider: true, lock: true, errors: false, leak: false },
  { curve: false, slider: false, lock: false, errors: true, leak: false },
  { curve: false, slider: false, lock: false, errors: false, leak: true },
  { curve: true, slider: false, lock: true, errors: true, leak: false },
];

function EvalLine({ e, name }: { e: Evaluation; name: string }) {
  return (
    <p style={{ margin: '0.25rem 0' }}>
      <strong>{name}:</strong> {ratioText(e.correct, e.total)} rätt. Sjuka plantor som hittades: {e.tp} av {e.tp + e.fn}. Falsklarm: {e.fp}.
    </p>
  );
}

function ErrorTable() {
  return (
    <div className="table-wrap">
      <table className="table" data-testid="feltyper">
        <caption>Valideringsdata (35 plantor, varav 13 sjuka) för varje k</caption>
        <thead>
          <tr>
            <th scope="col">k</th>
            <th scope="col">Träffsäkerhet</th>
            <th scope="col">Sjuka som hittades</th>
            <th scope="col">Missade sjuka (falskt negativa)</th>
            <th scope="col">Falsklarm (falskt positiva)</th>
          </tr>
        </thead>
        <tbody>
          {curve.map((c) => (
            <tr key={c.k}>
              <th scope="row">{c.k}</th>
              <td>{pct(c.validation.accuracy)}</td>
              <td>{c.validation.tp}</td>
              <td>{c.validation.fn}</td>
              <td>{c.validation.fp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeakDemo() {
  const [k, setK] = useStoredState<string>('leak-k', '1', (v): v is string => v === '1' || v === '5' || v === '9');
  const d = useMemo(() => leakageDemo(split.train, Number(k)), [k]);
  return (
    <section className="callout callout-varning" aria-labelledby="leak-title" data-testid="lackage">
      <h3 id="leak-title" className="callout-title" style={{ marginTop: 0 }}>
        ⚠ Separat demonstration: dataläckage
      </h3>
      <p>
        Den här rutan använder <strong>egna påhittade plantor</strong> – inte ditt låsta test. Tänk dig att 35 plantor fotograferades två gånger, och att samma plantor råkade hamna både i träningsdatan och i testdatan.
      </p>
      <Segmented
        legend="k i demonstrationen"
        value={k}
        options={[
          { value: '1', label: 'k = 1' },
          { value: '5', label: 'k = 5' },
          { value: '9', label: 'k = 9' },
        ]}
        onChange={setK}
      />
      <div className="table-wrap">
        <table className="table">
          <caption>Träffsäkerhet med k = {k}</caption>
          <thead>
            <tr>
              <th scope="col">Modell</th>
              <th scope="col">På demo-testet</th>
              <th scope="col">På helt nya plantor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Utan läckage</th>
              <td>{pct(d.honestOnDemoTest.accuracy)}</td>
              <td>{pct(d.honestOnFresh.accuracy)}</td>
            </tr>
            <tr>
              <th scope="row">Med läckage (testplantorna fanns i träningen)</th>
              <td>
                <strong>{pct(d.leakyOnDemoTest.accuracy)}</strong>
              </td>
              <td>{pct(d.leakyOnFresh.accuracy)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const setup = guided ? stepSetup[Math.min(step, stepSetup.length - 1)]! : { curve: true, slider: true, lock: true, errors: true, leak: true };
  const [kIndex, setKIndex] = useStoredState<number>('k-index', 0, (v): v is number => typeof v === 'number' && v >= 0 && v < K_OPTIONS.length);
  const [locked, setLocked] = useStoredState<Locked | null>('locked', null, isLocked);
  const [testUsed, setTestUsed] = useStoredState<boolean>('test-used', false, (v): v is boolean => typeof v === 'boolean');

  const k = locked ? locked.k : K_OPTIONS[kIndex]!;
  const point = curve.find((c) => c.k === k)!;
  const grid = useMemo(() => decisionGrid(split.train, k), [k]);
  const test = useMemo(() => (locked ? evaluate(split.train, split.test, locked.k) : null), [locked]);

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vilken modell blir bäst på träningsdatan?',
      body: (
        <>
          <p>
            Ett växthus vill hitta <strong>sjuka tomatplantor</strong> tidigt. 150 plantor har mätts och undersökts. De har delats upp <em>en gång</em> i tre delar:
          </p>
          <ul>
            <li>
              <strong>Träning (80)</strong> – modellen lär sig av dem.
            </li>
            <li>
              <strong>Validering (35)</strong> – används för att välja k.
            </li>
            <li>
              <strong>Test (35)</strong> – låst tills du har valt. Används en enda gång.
            </li>
          </ul>
          <p>Modellen är k-närmaste grannar från labb 10. Litet k ger en krokig, detaljerad gräns. Stort k ger en enkel gräns.</p>
          <Question key="gissa-trana"
            spec={{
              kind: 'predict',
              id: 'gissa-trana',
              prompt: 'Vilket k tror du ger högst träffsäkerhet på träningsdatan?',
              options: [
                { id: '1', text: 'k = 1' },
                { id: '9', text: 'k = 9' },
                { id: '79', text: 'k = 79' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'overanpassning',
      phase: 'prova',
      title: 'Träning mot validering',
      body: (
        <>
          <p>
            Diagrammet visar träffsäkerheten på <strong>träning</strong> (● heldragen) och <strong>validering</strong> (▲ streckad) för varje k. Flytta reglaget och titta på gränsen i växthusdiagrammet.
          </p>
          <Question key="k1-100"
            spec={{
              kind: 'choice',
              id: 'k1-100',
              prompt: 'Med k = 1 blir träffsäkerheten 100 % på träningsdatan men bara 80 % på valideringsdatan. Varför?',
              options: [
                { id: 'a', text: 'Varje träningsplanta är sin egen närmaste granne, så modellen har i praktiken lärt sig svaren utantill', correct: true },
                { id: 'b', text: 'Valideringsdatan är felmärkt', feedback: 'Det finns inget som tyder på det. Samma sak händer med alla nya plantor: modellen följer träningsdatans slump för noga.' },
                { id: 'c', text: 'Modellen med k = 1 är för enkel', feedback: 'Tvärtom – k = 1 är den mest detaljerade modellen. Den är så detaljerad att den lär sig bruset i träningsdatan.' },
              ],
              explanation: 'Det kallas överanpassning: modellen passar träningsdatan perfekt men generaliserar sämre. Därför kan man inte välja modell efter träningsresultatet.',
            }}
          />
        </>
      ),
    },
    {
      id: 'valj',
      phase: 'prova',
      title: 'Välj k med valideringsdata',
      body: (
        <>
          <p>Använd valideringskurvan för att välja k. Testdatan är fortfarande låst.</p>
          <Question key="basta-k"
            spec={{
              kind: 'numeric',
              id: 'basta-k',
              prompt: 'Vilket k ger högst träffsäkerhet på valideringsdatan?',
              answer: 9,
              wrong: [
                { value: 1, feedback: 'k = 1 har högst träffsäkerhet på träningsdatan (100 %), men på valideringsdatan når den bara 80 %. Valet ska göras på valideringsdata.' },
                { value: 79, feedback: 'k = 79 säger "frisk" om alla plantor och får lägst valideringsresultat (63 %).' },
              ],
              hint: 'Titta på den streckade linjen (▲) eller tabellen och hitta den högsta punkten.',
              explanation: 'k = 9 ger 33 av 35 rätt (94 %) på valideringsdatan. Sätt reglaget på k = 9 och lås valet.',
            }}
          />
        </>
      ),
    },
    {
      id: 'testa',
      phase: 'jamfor',
      title: 'Lås valet och testa',
      body: (
        <>
          <p>
            Tryck på <strong>Lås valet och kör testet</strong>. Först nu används de 35 testplantorna – en enda gång. Jämför testresultatet med valideringsresultatet.
          </p>
          <Question key="test-en-gang"
            spec={{
              kind: 'choice',
              id: 'test-en-gang',
              prompt: 'Testresultatet blev lägre än valideringsresultatet. Du är frestad att gå tillbaka och prova ett annat k. Vad händer då?',
              options: [
                { id: 'a', text: 'Då har testdatan använts för att välja modell, och testresultatet blir för optimistiskt', correct: true },
                { id: 'b', text: 'Ingenting – testdatan ändras inte av att man tittar på den', feedback: 'Datan ändras inte, men ditt val gör det. Om du väljer k efter testresultatet har testet blivit en del av valet och mäter inte längre hur modellen fungerar på nya plantor.' },
                { id: 'c', text: 'Testresultatet blir sämre', feedback: 'Det blir snarare för bra: du väljer ju det k som råkade passa just de här 35 testplantorna.' },
              ],
              explanation: 'Valideringsresultatet var lite för optimistiskt eftersom vi valde det bästa av åtta försök. Testet ger en ärligare bild – men bara om det används en gång.',
            }}
          />
        </>
      ),
    },
    {
      id: 'feltyper',
      phase: 'jamfor',
      title: 'Totalt mått eller feltyper?',
      body: (
        <>
          <p>
            Träffsäkerhet räknar alla fel lika. Men att <strong>missa en sjuk planta</strong> (falskt negativ) kan sprida smitta i hela växthuset, medan ett <strong>falsklarm</strong> (falskt positiv) bara kostar en extra kontroll.
          </p>
          <Question key="k79-hittar"
            spec={{
              kind: 'numeric',
              id: 'k79-hittar',
              prompt: 'Med k = 79 är träffsäkerheten 63 % på valideringsdatan. Hur många av de 13 sjuka plantorna hittar modellen?',
              answer: 0,
              wrong: [
                { value: 22, feedback: '22 är antalet plantor modellen får rätt – alla är friska plantor som den kallar friska. Frågan gäller de sjuka.' },
                { value: 13, feedback: '13 är antalet sjuka plantor som modellen missar (falskt negativa). Hur många hittar den?' },
              ],
              hint: 'Titta på kolumnen ”Sjuka som hittades” för k = 79.',
              explanation: 'Noll. Modellen säger ”frisk” om alla plantor. 63 % låter inte hopplöst, men modellen är helt värdelös för det den ska göra.',
            }}
          />
          <Question key="samma-traffsakerhet"
            spec={{
              kind: 'choice',
              id: 'samma-traffsakerhet',
              prompt: 'k = 5 och k = 25 har båda 89 % på valideringsdatan. Vilken skulle växthuset föredra?',
              options: [
                { id: 'a', text: 'k = 25, eftersom den missar färre sjuka plantor (2 mot 3)', correct: true },
                { id: 'b', text: 'k = 5, eftersom den har färre falsklarm', feedback: 'k = 5 har färre falsklarm (1 mot 2), men ett falsklarm kostar bara en extra kontroll. En missad sjuk planta kan smitta andra.' },
                { id: 'c', text: 'Det spelar ingen roll – träffsäkerheten är densamma', feedback: 'Samma totalmått kan dölja olika fel. Förväxlingsmatrisen visar vilka fel modellen gör.' },
              ],
              explanation: 'Vilket fel som är värst beror på uppgiften – det är ett beslut människor måste ta, inte modellen.',
            }}
          />
        </>
      ),
    },
    {
      id: 'lackage',
      phase: 'jamfor',
      title: 'Demonstration: dataläckage',
      body: (
        <Question key="lackage-varfor"
          spec={{
            kind: 'choice',
            id: 'lackage-varfor',
            prompt: 'Med läckage får k = 1 hela 100 % på demo-testet, men bara 74 % på helt nya plantor. Vad har hänt?',
            options: [
              { id: 'a', text: 'Testplantorna fanns i träningsdatan, så modellen kände redan igen dem. Testet mätte minne, inte förmåga.', correct: true },
              { id: 'b', text: 'Modellen blev bättre av mer data', feedback: 'På helt nya plantor blev den nästan inte bättre alls (71 % mot 74 %). Den stora skillnaden på demo-testet kommer av att modellen redan sett svaren.' },
              { id: 'c', text: 'De nya plantorna är svårare', feedback: 'Modellen utan läckage får ungefär samma resultat på båda. Det är bara den läckta modellen som ser orimligt bra ut på demo-testet.' },
            ],
            explanation: 'Dataläckage betyder att information från testdatan har tagit sig in i träningen eller valet. Resultatet ser bättre ut än det är.',
          }}
        />
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara arbetsgången',
      body: (
        <Question key="tre-delar"
          spec={{
            kind: 'open',
            id: 'tre-delar',
            prompt: 'Förklara för växthusets ägare varför datan delas i träning, validering och test, och vad testresultatet säger – och inte säger.',
            criteria: [
              'förklarar att träningsresultatet är för optimistiskt (överanpassning)',
              'förklarar att valideringsdatan används för att välja k',
              'förklarar att testdatan bara används en gång, efter valet',
              'nämner att träffsäkerheten inte visar hur många sjuka plantor som missas',
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
        {setup.slider && (
          <Panel title="Välj modell">
            <Slider
              label="Antal grannar k"
              value={locked ? K_OPTIONS.indexOf(locked.k as (typeof K_OPTIONS)[number]) : kIndex}
              min={0}
              max={K_OPTIONS.length - 1}
              onChange={setKIndex}
              disabled={!!locked}
              format={(i) => `k = ${K_OPTIONS[i]}`}
              hint={locked ? 'Valet är låst eftersom testet har körts.' : 'Litet k = mer komplex modell.'}
            />
            <EvalLine e={point.train} name="Träning" />
            <EvalLine e={point.validation} name="Validering" />
          </Panel>
        )}
        {setup.lock && (
          <Panel title="Testdata">
            {!locked ? (
              <>
                <p>
                  <span aria-hidden="true">🔒 </span>35 testplantor är undanlagda. De används först när du har låst ditt val.
                </p>
                <button type="button" className="btn btn-primary" onClick={() => {
                    setLocked({ k, reused: testUsed });
                    setTestUsed(true);
                  }}>
                  Lås valet (k = {k}) och kör testet
                </button>
              </>
            ) : (
              <div data-testid="testresultat">
                <p>
                  <strong>Låst val: k = {locked.k}.</strong> Testresultat: {ratioText(test!.correct, test!.total)} rätt.
                </p>
                {locked.reused && (
                  <p className="callout callout-varning">
                    Testdatan har redan använts för ett tidigare val. Det här resultatet är därför inte längre ett ärligt mått på hur modellen fungerar på nya plantor.
                  </p>
                )}
                <ConfusionMatrix tp={test!.tp} fp={test!.fp} fn={test!.fn} tn={test!.tn} positive="sjuk" negative="frisk" caption={`Testdata, k = ${locked.k}`} />
                <button type="button" className="btn btn-quiet" onClick={() => setLocked(null)}>
                  Ångra valet (testet räknas sedan som förbrukat)
                </button>
              </div>
            )}
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        {setup.curve && (
          <Panel title="Överanpassning: träning och validering">
            <LiveStatus>
              <span data-testid="val-resultat">
                k = {k}: träning {pct(point.train.accuracy)}, validering {pct(point.validation.accuracy)}.
              </span>
            </LiveStatus>
            <CurveChart curve={curve} selected={k} />
            <Legend
              items={[
                { swatch: 'var(--c1)', symbol: '●', text: 'Träning (heldragen)' },
                { swatch: 'var(--c2)', symbol: '▲', text: 'Validering (streckad)' },
              ]}
            />
            <details>
              <summary>Visa som tabell</summary>
              <div className="table-wrap">
                <table className="table">
                  <caption>Träffsäkerhet för varje k</caption>
                  <thead>
                    <tr>
                      <th scope="col">k</th>
                      <th scope="col">Träning (80)</th>
                      <th scope="col">Validering (35)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curve.map((c) => (
                      <tr key={c.k}>
                        <th scope="row">{c.k}</th>
                        <td>{pct(c.train.accuracy)}</td>
                        <td>{pct(c.validation.accuracy)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Panel>
        )}
        {(setup.curve || !guided || step === 0) && (
          <Panel title={`Växthuset: träningsplantor och modellens svar (k = ${k})`}>
            <PlantPlot train={split.train} grid={grid} k={k} />
            <Legend
              items={[
                { swatch: 'var(--c1)', symbol: '●', text: 'Frisk planta / modellen säger frisk' },
                { swatch: 'var(--c2)', symbol: '▲', text: 'Sjuk planta / modellen säger sjuk' },
              ]}
            />
          </Panel>
        )}
        {setup.slider && !locked && (
          <Panel title="Feltyper på valideringsdata">
            <ConfusionMatrix tp={point.validation.tp} fp={point.validation.fp} fn={point.validation.fn} tn={point.validation.tn} positive="sjuk" negative="frisk" caption={`Validering, k = ${k}`} />
          </Panel>
        )}
        {setup.errors && (
          <Panel title="Samma träffsäkerhet – olika fel">
            <ErrorTable />
          </Panel>
        )}
        {setup.leak && <LeakDemo />}
      </div>
    </div>
  );
}
