import { useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, Panel, Segmented, SelectField, Slider, Toggle } from '../../components/lab/Controls';
import { BarChart } from '../../components/lab/Charts';
import { Question, usePrediction } from '../../components/lab/Questions';
import { StepperControls, useStepper } from '../../components/lab/Stepper';
import { imageAlt, MiniImage, PixelGrid, SceneView } from './PixelViews';
import {
  blackCount,
  classify,
  classInfo,
  classOrder,
  emptyImage,
  isImage,
  isVariantId,
  objectName,
  pct,
  runScene,
  SCENE_H,
  SCENE_W,
  SIZE,
  templates,
  togglePixel,
  variantById,
  variants,
  type Img,
  type VariantId,
} from './logic';
import './objekt.css';

type Picture = VariantId | 'egen';
const isPicture = (v: unknown): v is Picture => v === 'egen' || isVariantId(v);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isNum = (lo: number, hi: number) => (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;

/** Antal fönsterlägen: (28 − 6 + 1) × (8 − 6 + 1) = 69. Steg 0 = inget fönster ännu. */
const WINDOW_COUNT = (SCENE_W - SIZE + 1) * (SCENE_H - SIZE + 1);

interface StepSetup {
  part: 'bild' | 'scen';
  picture: 'original' | 'variant' | 'egen';
  scores: boolean;
  sceneControls: boolean;
}

const stepSetup: StepSetup[] = [
  { part: 'bild', picture: 'original', scores: false, sceneControls: false },
  { part: 'bild', picture: 'original', scores: true, sceneControls: false },
  { part: 'bild', picture: 'variant', scores: true, sceneControls: false },
  { part: 'scen', picture: 'original', scores: true, sceneControls: false },
  { part: 'scen', picture: 'original', scores: true, sceneControls: true },
  { part: 'bild', picture: 'egen', scores: true, sceneControls: false },
];

const guidedVariants: VariantId[] = ['original', 'flyttad', 'vriden', 'dold', 'inverterad'];

const predictionText: Record<string, string> = {
  kvar: 'att koppen fortfarande skulle få nästan 100 %',
  lagre: 'att likheten skulle sjunka men att svaret fortfarande skulle bli kopp',
  fel: 'att modellen skulle svara fel klass',
};

function ScoreView({ img }: { img: Img }) {
  const c = classify(img);
  const text =
    c.best === null
      ? 'Bilden har inga svarta pixlar, så det finns inget att jämföra. Modellen kan inte svara.'
      : `Modellen svarar ${classInfo[c.best].name} med likheten ${pct(c.bestScore)} %.`;
  return (
    <>
      <LiveStatus>
        <span data-testid="bild-resultat">{text}</span>
      </LiveStatus>
      <BarChart
        title="Likhet med varje mall (svarta pixlar i båda ÷ svarta pixlar i någon av dem)"
        max={1}
        format={(v) => `${pct(v)} %`}
        data={c.scores.map((s) => ({
          label: `${classInfo[s.label].symbol} ${classInfo[s.label].name}${s.label === c.best ? ' (bäst)' : ''}`,
          value: s.score,
          color: classInfo[s.label].color,
          note: `(${s.both} av ${s.either})`,
        }))}
      />
    </>
  );
}

function Templates() {
  return (
    <ul className="pixel-templates" aria-label="Mallarna modellen jämför med">
      {classOrder.map((k) => (
        <li key={k}>
          <figure>
            <MiniImage img={templates[k]} label={imageAlt(templates[k], `Mallen för ${classInfo[k].name}`)} width={60} />
            <figcaption>
              <span aria-hidden="true" style={{ color: classInfo[k].color }}>
                {classInfo[k].symbol}{' '}
              </span>
              {classInfo[k].name} ({blackCount(templates[k])} svarta)
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const setup = stepSetup[Math.min(Math.max(step, 0), stepSetup.length - 1)]!;

  const [numbers, setNumbers] = useStoredState<boolean>('numbers', false, isBool);
  const [guidedVariant, setGuidedVariant] = useStoredState<VariantId>('guided-variant', 'flyttad', isVariantId);
  const [picture, setPicture] = useStoredState<Picture>('picture', 'original', isPicture);
  const [own, setOwn] = useStoredState<Img>('own-image', templates.cup, (v): v is Img => isImage(v));
  const [guidedNoise, setGuidedNoise] = useStoredState<number>('guided-noise', 20, isNum(0, 30));
  const [guidedThreshold, setGuidedThreshold] = useStoredState<number>('guided-threshold', 70, isNum(0, 100));
  const [noise, setNoise] = useStoredState<number>('noise', 10, isNum(0, 30));
  const [threshold, setThreshold] = useStoredState<number>('threshold', 70, isNum(0, 100));
  const [seed, setSeed] = useStoredState<number>('seed', 1, isNum(1, 1e9));
  const [prediction] = usePrediction('flytta-kopp');

  const stepper = useStepper(WINDOW_COUNT + 1, { initial: guided && step !== 4 ? 0 : WINDOW_COUNT });

  // Vilken bild som testas
  const img: Img = guided
    ? setup.picture === 'egen'
      ? own
      : setup.picture === 'variant'
        ? variantById(guidedVariant).make()
        : templates.cup
    : picture === 'egen'
      ? own
      : variantById(picture).make();
  const editable = guided ? setup.picture === 'egen' : picture === 'egen';
  const imgLabel = editable ? 'Din bild, 6 × 6 pixlar. Piltangenter flyttar, Enter byter svart/vit.' : 'Bilden som testas, 6 × 6 pixlar';

  // Scenen
  const sceneNoise = guided ? (setup.sceneControls ? guidedNoise : 0) : noise;
  const sceneThreshold = guided ? (setup.sceneControls ? guidedThreshold : 70) : threshold;
  const sceneSeed = guided ? 1 : seed;
  const run = useMemo(() => runScene(sceneNoise, sceneThreshold, sceneSeed), [sceneNoise, sceneThreshold, sceneSeed]);
  const frame = stepper.index;
  const current = frame >= 1 ? run.windows[frame - 1]! : null;
  const indexOf = (x: number, y: number) => y * (SCENE_W - SIZE + 1) + x;
  const shownFound = run.found.filter((f) => indexOf(f.x, f.y) < frame);
  const shownVerdicts = run.found.map((f, i) => ({ f, ok: run.evaluation.verdicts[i]! })).filter(({ f }) => indexOf(f.x, f.y) < frame).map(({ ok }) => ok);

  const onStepChange = (i: number) => {
    setStep(i);
    if (i === 2) setGuidedVariant('flyttad');
    if (i === 3) stepper.reset();
    if (i === 4) {
      setGuidedNoise(20);
      setGuidedThreshold(70);
      stepper.toEnd();
    }
  };

  const windowText = (() => {
    if (!current) return `Inget fönster ännu. Tryck på ”Steg framåt” för att låta fönstret börja i övre vänstra hörnet. Det finns ${WINDOW_COUNT} lägen.`;
    const where = `Läge ${frame} av ${WINDOW_COUNT}: kolumn ${current.x + 1}–${current.x + SIZE}, rad ${current.y + 1}–${current.y + SIZE}.`;
    if (current.best === null) return `${where} Fönstret är helt vitt – inget att jämföra.`;
    const p = pct(current.score);
    return `${where} Mest likt ${classInfo[current.best].name}: ${p} %, ${p >= sceneThreshold ? 'minst' : 'under'} tröskeln ${sceneThreshold} %.`;
  })();

  const e = run.evaluation;
  const missedNames = e.missedObjects;
  const resultText = stepper.atEnd
    ? `Alla ${WINDOW_COUNT} lägen testade med brus ${sceneNoise} % och tröskel ${sceneThreshold} %: ${run.found.length} fynd. Rätt: ${e.correct} av 3 föremål. Felaktiga fynd: ${e.falsePos}. Missade: ${e.missed}${missedNames.length ? ` (${missedNames.map((o) => objectName(o.label)).join(', ')})` : ''}.`
    : `Resultatet räknas när alla ${WINDOW_COUNT} lägen är testade (tryck ”Till slutet”).`;

  const numbersToggle = <Toggle label="Visa bilden som tal (1 = svart, 0 = vit)" checked={numbers} onChange={setNumbers} />;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad ser datorn?',
      body: (
        <>
          <p>
            Bilden är 6 × 6 pixlar och föreställer en <strong>kopp</strong> med handtag. För datorn är bilden bara 36 tal: 1 för svart och 0 för vit. Slå på ”Visa bilden som tal” och se själv.
          </p>
          <p>
            Modellen känner igen föremål genom att jämföra bilden med en <strong>mall</strong> för varje klass: äpple, kopp och nyckel. Den klass vars mall är mest lik vinner. Den här bilden är exakt likadan som kopp-mallen.
          </p>
          <Question
            key="flytta-kopp"
            spec={{
              kind: 'predict',
              id: 'flytta-kopp',
              prompt: 'Om koppen flyttas två pixlar åt höger – vad tror du händer med modellens svar?',
              options: [
                { id: 'kvar', text: 'Koppen får fortfarande nästan 100 % – det är ju samma kopp' },
                { id: 'lagre', text: 'Likheten sjunker, men modellen svarar fortfarande kopp' },
                { id: 'fel', text: 'Modellen svarar fel klass' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'mallar',
      phase: 'prova',
      title: 'Jämför med mallarna',
      body: (
        <>
          <p>
            Modellen räknar ut en <strong>likhet</strong> för varje mall: hur många svarta pixlar finns i <em>både</em> bilden och mallen, delat med hur många svarta pixlar som finns i <em>någon</em> av dem. Samma bild som mallen ger 100 %.
          </p>
          <Question
            key="likhet-apple"
            spec={{
              kind: 'numeric',
              id: 'likhet-apple',
              prompt: 'Koppen och äpplemallen har 15 svarta pixlar gemensamt, och 29 pixlar är svarta i någon av dem. Vilken likhet ger det i procent (avrunda till heltal)?',
              answer: 52,
              tolerance: 0.5,
              unit: '%',
              wrong: [
                { value: 88, feedback: '15 ÷ 17 delar bara med koppens svarta pixlar. Då skulle en bild som är helt svart få 100 % mot allt. Dela med pixlarna som är svarta i någon av bilderna: 29.' },
                { value: 56, feedback: '15 ÷ 27 delar bara med äpplemallens svarta pixlar. Dela med pixlarna som är svarta i någon av bilderna: 29.' },
                { value: 15, feedback: '15 är antalet gemensamma svarta pixlar. Dela med 29 och räkna om till procent.' },
              ],
              hint: 'Räkna 15 ÷ 29 och gör om till procent.',
              explanation: '15 ÷ 29 ≈ 0,52, alltså 52 %. Det är vad stapeln för äpple visar. Koppen liknar sin egen mall mest (100 %), så modellen svarar kopp.',
            }}
          />
        </>
      ),
    },
    {
      id: 'andra',
      phase: 'jamfor',
      title: 'Flytta, vrid, skym',
      body: (
        <>
          <p>Välj en ändring i taget och jämför staplarna med originalet. Varje ändring görs på samma kopp.</p>
          {prediction && (
            <p className="callout callout-info" data-testid="jamfor-forutsagelse">
              Du förutsade {predictionText[prediction] ?? 'något'}. Med koppen flyttad två steg svarar modellen <strong>äpple (34 %)</strong>, och kopp får bara 21 %.
            </p>
          )}
          <Question
            key="skymd-kopp"
            spec={{
              kind: 'choice',
              id: 'skymd-kopp',
              prompt: 'Vilken av ändringarna klarar modellen fortfarande – alltså svarar kopp?',
              options: [
                { id: 'flyttad', text: 'Flyttad 2 steg åt höger', feedback: 'Flyttad ger äpple 34 % och kopp 21 %. Mallen jämför pixel för pixel på exakt samma plats, så när koppen flyttas hamnar de svarta pixlarna fel.' },
                { id: 'vriden', text: 'Vriden ett kvarts varv', feedback: 'Vriden ger äpple 38 % och kopp 31 %. Modellen har bara en upprätt mall och vet inte att en kopp kan ligga ned.' },
                { id: 'dold', text: 'Högra delen skymd', correct: true },
                { id: 'inverterad', text: 'Omvänd belysning (svart ↔ vitt)', feedback: 'Omvänd belysning ger kopp 0 % – inte en enda svart pixel hamnar där mallen har svart. Modellen svarar äpple 35 %.' },
              ],
              explanation: 'Skymd kopp ger fortfarande kopp, men bara 41 %. Den vänstra halvan stämmer exakt med mallen. Flyttad, vriden och omvänd ger fel svar, trots att du ser att det är samma kopp.',
            }}
          />
        </>
      ),
    },
    {
      id: 'fonster',
      phase: 'prova',
      title: 'Leta efter föremål i en större bild',
      body: (
        <>
          <p>
            Nu ska modellen <strong>hitta</strong> föremål i en bild på 28 × 8 pixlar. Ett fönster på 6 × 6 pixlar glider ett steg i taget åt höger, rad för rad. I varje läge jämförs det som syns i fönstret med de tre mallarna.
          </p>
          <p>
            Om bästa likheten är minst <strong>tröskeln 70 %</strong> blir det ett fynd. Om två fynd överlappar behålls det med högst likhet. Stega en bit och tryck sedan på ”Till slutet”.
          </p>
          <Question
            key="antal-lagen"
            spec={{
              kind: 'numeric',
              id: 'antal-lagen',
              prompt: 'Hur många fönsterlägen testar modellen i bilden på 28 × 8 pixlar?',
              answer: 69,
              wrong: [
                { value: 224, feedback: '224 är antalet pixlar (28 × 8). Fönstret är 6 pixlar brett och kan inte sticka ut utanför bilden.' },
                { value: 66, feedback: 'Nästan! Det blir 23 lägen per rad (28 − 6 + 1), inte 22. Glöm inte det första läget.' },
                { value: 46, feedback: 'Fönstret är 6 pixlar högt och bilden 8, så det får plats på tre höjder (rad 1, 2 och 3), inte två.' },
              ],
              hint: 'Hur många lägen per rad (28 − 6 + 1)? Hur många rader (8 − 6 + 1)?',
              explanation: '23 lägen i sidled × 3 i höjdled = 69. Riktiga bilder har miljontals pixlar, och fönster i många storlekar – därför behövs snabbare metoder.',
            }}
          />
        </>
      ),
    },
    {
      id: 'brus',
      phase: 'jamfor',
      title: 'Brus och tröskel',
      body: (
        <>
          <p>
            Nu har bilden <strong>20 % brus</strong>: var femte pixel har ungefär slumpats om, som i en mörk eller suddig bild. Ändra <strong>en sak i taget</strong> – bruset eller tröskeln – och läs resultatet.
          </p>
          <Question
            key="missade"
            spec={{
              kind: 'numeric',
              id: 'missade',
              prompt: 'Brus 20 % och tröskel 70 %: hur många av de tre föremålen (äpple, nyckel, kopp) missar modellen?',
              answer: 2,
              wrong: [
                { value: 3, feedback: 'Äpplet hittas fortfarande (71 %). Läs raden ”Rätt” i resultatet.' },
                { value: 1, feedback: 'Både nyckeln och koppen missas. Bollen räknas inte, eftersom den inte har någon mall.' },
                { value: 0, feedback: 'Med 0 % brus hittas alla tre. Kontrollera att bruset står på 20 % och tröskeln på 70 %.' },
              ],
              explanation: 'Bara äpplet (71 %) klarar tröskeln. Bruset gör både koppen (67 %) och nyckeln mindre lika sina mallar. Små föremål som nyckeln påverkas mest, eftersom några få fel pixlar är en stor del av dem.',
            }}
          />
          <Question
            key="sank-troskel"
            spec={{
              kind: 'choice',
              id: 'sank-troskel',
              prompt: 'Behåll bruset på 20 % och sänk tröskeln till 50 %. Vad händer?',
              options: [
                { id: 'a', text: 'Modellen hittar alla tre föremålen och gör inga fel', feedback: 'Prova och läs resultatet: nyckeln hittas, men som ”äpple”, och bollen tas också för ett äpple.' },
                { id: 'b', text: 'Koppen hittas, men det blir två felaktiga fynd: nyckeln och bollen tas för äpplen', correct: true },
                { id: 'c', text: 'Ingenting ändras, tröskeln påverkar bara hur säker modellen är', feedback: 'Tröskeln avgör vilka fönster som räknas som fynd. Lägre tröskel ger fler fynd – både rätta och felaktiga.' },
              ],
              explanation: 'Rätt: 2, felaktiga fynd: 2, missade: 1. Låg tröskel ger fler fynd men också fler falska larm. Hög tröskel ger få falska larm men fler missade föremål.',
            }}
          />
        </>
      ),
    },
    {
      id: 'rita',
      phase: 'forklara',
      title: 'Rita själv och förklara',
      body: (
        <>
          <p>
            Rita en egen bild: klicka på en pixel, eller gå runt med piltangenterna och tryck Enter. Prova att rita en kopp som modellen <em>inte</em> känner igen, eller något som inte är en kopp men som modellen ändå kallar kopp.
          </p>
          <Question
            key="manniska-modell"
            spec={{
              kind: 'open',
              id: 'manniska-modell',
              prompt: 'Du kände igen koppen även när den var flyttad, vriden eller hade omvänd belysning – men modellen gjorde det inte. Varför? Vad skulle en bättre modell behöva?',
              criteria: [
                'förklarar att mallen jämför pixel för pixel på exakt samma plats',
                'ger ett exempel från labben med siffror (t.ex. flyttad kopp: äpple 34 %)',
                'beskriver att människor känner igen form och delar oavsett var de är i bilden',
                'föreslår något som hjälper, t.ex. många exempel i olika lägen, fönster som glider eller ett nätverk som lär sig mönster',
              ],
            }}
          />
        </>
      ),
    },
  ];

  const pictureControls = (
    <>
      <SelectField<Picture>
        label="Bild att testa"
        value={picture}
        options={[...variants.map((v) => ({ value: v.id as Picture, label: v.label })), { value: 'egen', label: 'Egen bild (rita själv)' }]}
        onChange={setPicture}
      />
    </>
  );

  const ownButtons = (
    <div className="row" role="group" aria-label="Snabbval för din bild">
      <button type="button" className="btn" onClick={() => setOwn(emptyImage())}>
        Rensa bilden
      </button>
      {classOrder.map((k) => (
        <button key={k} type="button" className="btn" onClick={() => setOwn(templates[k])}>
          Börja från {classInfo[k].name}
        </button>
      ))}
    </div>
  );

  const showBild = guided ? setup.part === 'bild' : true;
  const showScen = guided ? setup.part === 'scen' : true;

  const bildPanel = (
    <Panel title="Känn igen en bild">
      <div className="pixel-row">
        <PixelGrid img={img} numbers={numbers} label={imgLabel} onToggle={editable ? (r, c) => setOwn(togglePixel(own, r, c)) : undefined} />
        <div>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>Mallar</strong>
          </p>
          <Templates />
        </div>
      </div>
      <p className="hint" data-testid="bild-info">
        {blackCount(img)} av 36 pixlar är svarta.{editable ? ' Klicka eller använd piltangenter och Enter för att ändra en pixel.' : ''}
      </p>
      {(guided ? setup.scores : true) ? (
        <ScoreView img={img} />
      ) : (
        <LiveStatus>
          <span data-testid="bild-resultat">Modellens svar visas när du har gjort din förutsägelse och gått vidare.</span>
        </LiveStatus>
      )}
    </Panel>
  );

  const scenPanel = (
    <Panel title={`Hitta föremål: brus ${sceneNoise} %, tröskel ${sceneThreshold} %`}>
      <StepperControls stepper={stepper} label="Flytta fönstret" />
      <LiveStatus>
        <span data-testid="fonster-status">{windowText}</span>
      </LiveStatus>
      <SceneView scene={run.scene} window={current} found={shownFound} verdicts={shownVerdicts} thresholdPct={sceneThreshold} />
      {current && current.best !== null && (
        <BarChart
          title={`Likhet i fönstret (läge ${frame})`}
          max={1}
          format={(v) => `${pct(v)} %`}
          data={classOrder.map((k) => ({ label: `${classInfo[k].symbol} ${classInfo[k].name}`, value: current.scores[k], color: classInfo[k].color }))}
        />
      )}
      <p data-testid="fynd-resultat">
        <strong>Resultat:</strong> {resultText}
      </p>
      {stepper.atEnd && run.found.length > 0 && (
        <div className="table-wrap">
          <table className="table" data-testid="fynd-tabell">
            <caption>Modellens fynd</caption>
            <thead>
              <tr>
                <th scope="col">Kolumner</th>
                <th scope="col">Rader</th>
                <th scope="col">Svar</th>
                <th scope="col">Likhet</th>
                <th scope="col">Bedömning</th>
              </tr>
            </thead>
            <tbody>
              {run.found.map((f, i) => (
                <tr key={`${f.x}-${f.y}`}>
                  <td>
                    {f.x + 1}–{f.x + SIZE}
                  </td>
                  <td>
                    {f.y + 1}–{f.y + SIZE}
                  </td>
                  <td>{f.best ? classInfo[f.best].name : '–'}</td>
                  <td>{pct(f.score)} %</td>
                  <td className="pixel-verdict" style={{ color: e.verdicts[i] ? 'var(--ok)' : 'var(--bad)' }}>
                    {e.verdicts[i] ? '✓ rätt' : '✗ fel'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );

  const noiseLabel = (v: number) => `${v} %`;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={onStepChange} />
        {guided && (
          <Panel title="Reglage">
            {setup.part === 'bild' && numbersToggle}
            {setup.picture === 'variant' && (
              <Segmented<VariantId>
                legend="Ändring av koppen"
                value={guidedVariants.includes(guidedVariant) ? guidedVariant : 'original'}
                options={guidedVariants.map((id) => ({ value: id, label: variantById(id).label }))}
                onChange={setGuidedVariant}
              />
            )}
            {setup.picture === 'egen' && ownButtons}
            {setup.part === 'scen' && !setup.sceneControls && <p className="hint">Brus 0 % och tröskel 70 % i det här steget.</p>}
            {setup.sceneControls && (
              <>
                <Segmented<string> legend="Brus" value={String(guidedNoise)} options={[0, 10, 20].map((v) => ({ value: String(v), label: `${v} %` }))} onChange={(v) => setGuidedNoise(Number(v))} />
                <Slider label="Tröskel" value={guidedThreshold} min={0} max={100} step={5} onChange={setGuidedThreshold} format={noiseLabel} />
              </>
            )}
          </Panel>
        )}
        {!guided && (
          <Panel title="Inställningar">
            {pictureControls}
            {numbersToggle}
            {picture === 'egen' && ownButtons}
            <Slider label="Brus i den stora bilden" value={noise} min={0} max={30} step={5} onChange={setNoise} format={noiseLabel} />
            <Slider label="Tröskel" value={threshold} min={0} max={100} step={5} onChange={setThreshold} format={noiseLabel} />
            <button type="button" className="btn" onClick={() => setSeed(seed + 1)} disabled={noise === 0}>
              Nytt slumpat brus (nr {seed})
            </button>
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        {showBild && bildPanel}
        {showScen && scenPanel}
      </div>
    </div>
  );
}
