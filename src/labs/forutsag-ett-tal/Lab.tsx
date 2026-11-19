import { useMemo } from 'react';
import { PlotFrame } from '../../components/lab/Charts';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Legend, LiveStatus, Panel, Slider, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { fitLine, fmt, isLine, LEVEL_RANGE, mse, newDays, predictLine, SLOPE_RANGE, startLine, training, type DataPoint, type Line } from './logic';

interface StepSetup {
  sliders: boolean;
  fit: boolean;
  wide: boolean;
}

const stepSetup: StepSetup[] = [
  { sliders: false, fit: false, wide: false },
  { sliders: false, fit: false, wide: false },
  { sliders: true, fit: false, wide: false },
  { sliders: true, fit: true, wide: false },
  { sliders: false, fit: true, wide: true },
  { sliders: true, fit: true, wide: true },
];

const GOAL = 20;
const fit = fitLine(training)!;
const fitMse = mse(fit, training);

function RegressionPlot({ line, showFit, wide }: { line: Line; showFit: boolean; wide: boolean }) {
  const xDomain: [number, number] = wide ? [0, 40] : [10, 30];
  const yDomain: [number, number] = wide ? [-80, 200] : [-20, 140];
  const pts: DataPoint[] = wide ? [...training, ...newDays] : training;
  const desc = `${training.length} träningsdagar som runda punkter${wide ? ` och ${newDays.length} nya dagar som fyrkanter` : ''}. Din linje förutsäger ${fmt(predictLine(line, xDomain[0]), 0)} glassar vid ${xDomain[0]} °C och ${fmt(predictLine(line, xDomain[1]), 0)} vid ${xDomain[1]} °C.${showFit ? ' Den streckade linjen är anpassad till träningsdata.' : ''} Tabellen under diagrammet visar alla värden.`;
  return (
    <PlotFrame width={520} height={340} xDomain={xDomain} yDomain={yDomain} xLabel="Högsta temperatur (°C)" yLabel="Sålda glassar" title="Glassförsäljning och temperatur" description={desc}>
      {(x, y) => {
        const clipY = (v: number) => Math.max(yDomain[0], Math.min(yDomain[1], v));
        const seg = (l: Line) => {
          const x1 = xDomain[0];
          const x2 = xDomain[1];
          return { x1: x(x1), y1: y(predictLine(l, x1)), x2: x(x2), y2: y(predictLine(l, x2)) };
        };
        return (
          <g>
            <defs>
              <clipPath id="regr-clip">
                <rect x={x(xDomain[0])} y={y(yDomain[1])} width={x(xDomain[1]) - x(xDomain[0])} height={y(yDomain[0]) - y(yDomain[1])} />
              </clipPath>
            </defs>
            <g aria-hidden="true" clipPath="url(#regr-clip)">
              {yDomain[0] < 0 && <line x1={x(xDomain[0])} x2={x(xDomain[1])} y1={y(0)} y2={y(0)} stroke="var(--text-muted)" strokeWidth={1.5} />}
              {wide && <rect x={x(14)} y={y(yDomain[1])} width={x(28) - x(14)} height={y(yDomain[0]) - y(yDomain[1])} fill="var(--accent-soft)" opacity={0.5} />}
              {pts.map((p, i) => (
                <line key={`r${i}`} x1={x(p.x)} x2={x(p.x)} y1={y(p.y)} y2={y(clipY(predictLine(line, p.x)))} stroke="var(--bad)" strokeWidth={2} />
              ))}
              {showFit && <line {...seg(fit)} stroke="var(--c3)" strokeWidth={2.5} strokeDasharray="8 5" />}
              <line {...seg(line)} stroke="var(--c1)" strokeWidth={3} />
              {training.map((p, i) => (
                <circle key={`t${i}`} cx={x(p.x)} cy={y(p.y)} r={6} fill="var(--c2)" stroke="var(--surface)" strokeWidth={1.5} />
              ))}
              {wide &&
                newDays.map((p, i) => <rect key={`n${i}`} x={x(p.x) - 6} y={y(p.y) - 6} width={12} height={12} fill="var(--c4)" stroke="var(--surface)" strokeWidth={1.5} />)}
              {wide && (
                <text x={x(21)} y={y(yDomain[1]) + 14} textAnchor="middle" fontSize={12} fill="var(--text)">
                  träningsdatans område
                </text>
              )}
            </g>
          </g>
        );
      }}
    </PlotFrame>
  );
}

function ResidualTable({ line, data, caption, testId }: { line: Line; data: DataPoint[]; caption: string; testId?: string }) {
  const rows = data.map((p) => {
    const pred = predictLine(line, p.x);
    const r = p.y - pred;
    return { ...p, pred, r, r2: r * r };
  });
  const sum = rows.reduce((s, r) => s + r.r2, 0);
  return (
    <div className="table-wrap">
      <table className="table" data-testid={testId}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Temp. (°C)</th>
            <th scope="col">Sålda</th>
            <th scope="col">Förutsagt</th>
            <th scope="col">Residual</th>
            <th scope="col">Residual²</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.x}>
              <td>{r.x}</td>
              <td>{r.y}</td>
              <td>{fmt(r.pred)}</td>
              <td>{fmt(r.r)}</td>
              <td>{fmt(r.r2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={4}>
              Summa / antal {rows.length} = medelkvadratfel
            </th>
            <td>
              <strong>{fmt(rows.length ? sum / rows.length : NaN)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const [line, setLine] = useStoredState<Line>('line', startLine, isLine);
  const [showFit, setShowFit] = useStoredState<boolean>('fit', true, (v): v is boolean => typeof v === 'boolean');
  const [wideExp, setWideExp] = useStoredState<boolean>('wide', false, (v): v is boolean => typeof v === 'boolean');

  const slidersOn = guided ? setup.sliders : true;
  const activeLine = guided && !setup.sliders && step < 4 ? startLine : guided && step === 4 ? fit : line;
  const fitOn = guided ? setup.fit && step !== 4 : showFit;
  const wide = guided ? setup.wide : wideExp;
  const userMse = useMemo(() => mse(activeLine, training), [activeLine]);

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Hur bra är en platt linje?',
      body: (
        <>
          <p>
            En glasskiosk har skrivit upp dagens högsta temperatur och hur många glassar som såldes. Nu vill de kunna <strong>förutsäga ett tal</strong>: hur många glassar ska de beställa till i morgon?
          </p>
          <p>
            Den blå linjen är en första gissning: 60 glassar oavsett väder. De röda strecken är <strong>residualerna</strong> – hur långt varje dag ligger från linjen. Medelkvadratfelet (MSE) sammanfattar alla residualer i ett tal.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-lutning',
              prompt: 'Vad tror du händer med medelkvadratfelet om linjen får luta uppåt, så att den förutsäger fler glassar varma dagar?',
              options: [
                { id: 'lagre', text: 'Det blir lägre' },
                { id: 'hogre', text: 'Det blir högre' },
                { id: 'samma', text: 'Det blir ungefär detsamma' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'residual',
      phase: 'prova',
      title: 'Läs av en residual',
      body: (
        <>
          <p>
            Residual = <strong>verkligt värde − förutsagt värde</strong>. En positiv residual betyder att kiosken sålde fler än linjen trodde.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'residual-28',
              prompt: 'Vad är residualen för dagen med 28 °C när linjen förutsäger 60 glassar?',
              answer: 44,
              wrong: [
                { value: -44, feedback: 'Du har räknat förutsagt minus verkligt. Residualen räknas som verkligt − förutsagt: 104 − 60.' },
                { value: 104, feedback: '104 är antalet sålda glassar den dagen. Residualen är skillnaden mot linjens förutsägelse.' },
                { value: 1936, feedback: '1936 är residualen i kvadrat. Frågan gäller själva residualen.' },
              ],
              hint: 'Hitta raden för 28 °C i tabellen. Ta sålda minus förutsagt.',
              explanation: '104 − 60 = 44. I kvadrat blir det 1936, det största bidraget till MSE.',
            }}
          />
        </>
      ),
    },
    {
      id: 'prova',
      phase: 'prova',
      title: 'Flytta linjen själv',
      body: (
        <>
          <p>
            Använd reglagen för <strong>lutning</strong> och <strong>nivå vid 20 °C</strong>. Ändra en sak i taget och se hur residualerna och MSE ändras. Försök få MSE under {GOAL}.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'kvadrat-varfor',
              prompt: 'En residual blir dubbelt så stor. Hur mycket växer dess bidrag till medelkvadratfelet?',
              options: [
                { id: 'a', text: 'Fyra gånger så mycket', correct: true },
                { id: 'b', text: 'Dubbelt så mycket', feedback: 'Det skulle gälla om vi tog medelvärdet av residualerna utan att kvadrera. Med kvadrat blir 2 · 2 = 4 gånger så stort.' },
                { id: 'c', text: 'Inte alls, positiva och negativa tar ut varandra', feedback: 'Det är därför man kvadrerar: kvadraten är alltid positiv, så fel åt olika håll kan inte ta ut varandra.' },
              ],
              explanation: 'Kvadreringen gör att stora fel straffas mycket hårdare än små. Därför försöker linjen undvika riktigt stora missar.',
            }}
          />
        </>
      ),
    },
    {
      id: 'jamfor',
      phase: 'jamfor',
      title: 'Jämför med den anpassade linjen',
      body: (
        <>
          <p>
            Den streckade gröna linjen har datorn räknat fram med <strong>minsta kvadratmetoden</strong>: den linje som ger lägst möjliga MSE på träningsdatan.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'mse-anpassad',
              prompt: 'Vad är medelkvadratfelet för den anpassade linjen? Svara med en decimal.',
              answer: 10.0,
              tolerance: 0.06,
              wrong: [{ value: 687.2, feedback: '687,2 är MSE för den platta startlinjen. Titta på resultatet för den streckade, anpassade linjen.' }],
              hint: 'Läs av rutan med resultat ovanför diagrammet.',
              explanation: `MSE ≈ ${fmt(fitMse)}. Lutningen är ${fmt(fit.slope)} glassar per grad.`,
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'sla-anpassad',
              prompt: 'Kan du hitta en linje som har lägre MSE än den anpassade linjen på samma träningsdata?',
              options: [
                { id: 'a', text: 'Nej, den anpassade linjen har lägst möjliga MSE för just de här punkterna', correct: true },
                { id: 'b', text: 'Ja, om man provar tillräckligt länge', feedback: 'Minsta kvadratmetoden räknar fram exakt den linje som ger lägst MSE. Du kan komma nära (10,4 med reglagen) men inte under.' },
                { id: 'c', text: 'Ja, en linje genom alla punkter', feedback: 'Punkterna ligger inte på en rak linje, så ingen rak linje går genom alla. En krokig kurva skulle kunna det – men då lär den sig bruset (överanpassning, labb 12).' },
              ],
              explanation: 'Lägst fel på träningsdata betyder ändå inte att linjen fungerar bra överallt. Det ser du i nästa steg.',
            }}
          />
        </>
      ),
    },
    {
      id: 'extrapolera',
      phase: 'jamfor',
      title: 'Utanför träningsdatan',
      body: (
        <>
          <p>
            Nu är axlarna utdragna. Det skuggade området visar temperaturerna i träningsdatan (14–28 °C). Fyrkanterna är <strong>nya dagar</strong> som modellen aldrig har sett: en kall vårdag och två värmeböljedagar då kiosken sålde slut.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'extrapolera-5',
              prompt: 'Hur många glassar förutsäger den anpassade linjen för en dag med 5 °C? Avrunda till heltal.',
              answer: -29.7,
              tolerance: 0.35,
              wrong: [{ value: 4, feedback: '4 är hur många som faktiskt såldes den dagen. Frågan gäller vad linjen förutsäger – läs av raden för 5 °C.' }],
              hint: 'Läs av kolumnen Förutsagt för 5 °C i tabellen över nya dagar.',
              explanation: 'Linjen säger ungefär −30 glassar – ett omöjligt svar. Linjen vet inte att man inte kan sälja färre än noll.',
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'extrapolera-varfor',
              prompt: 'Varför blir förutsägelserna så dåliga för 5 °C och 36 °C?',
              options: [
                { id: 'a', text: 'Linjen har bara sett 14–28 °C. Utanför det området kan sambandet se helt annorlunda ut.', correct: true },
                { id: 'b', text: 'Linjen är felräknad', feedback: 'Linjen är rätt räknad – den har lägst MSE på träningsdatan. Problemet är att vi använder den där den aldrig har sett data.' },
                { id: 'c', text: 'Det var för få nya dagar', feedback: 'Fler nya dagar hade gett en säkrare bild av felet, men felet beror på att linjen fortsätter rakt där verkligheten inte gör det.' },
              ],
              explanation: 'Det kallas extrapolering. Kiosken kan inte sälja mer än 120 glassar, och ingen säljer färre än noll – sådant syns inte i träningsdatan.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara för kiosken',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'rad-till-kiosken',
            prompt: 'Kiosken vill använda linjen för att beställa glass hela året. Vilka råd ger du? Använd orden residual, medelkvadratfel och extrapolering.',
            criteria: [
              'förklarar vad medelkvadratfelet mäter',
              'varnar för att använda linjen långt utanför 14–28 °C',
              'ger ett konkret exempel, t.ex. negativa glassar vid 5 °C eller att kiosken bara rymmer 120',
              'föreslår något som kan göra modellen bättre, t.ex. mer data från andra årstider',
            ],
          }}
        />
      ),
    },
  ];

  const status = `Din linje: ${fmt(activeLine.slope)} glassar per grad, ${fmt(activeLine.level, 0)} glassar vid 20 °C. MSE på träningsdata: ${fmt(userMse)}.${fitOn ? ` Anpassade linjen: MSE ${fmt(fitMse)}.` : ''}${slidersOn && userMse < GOAL ? ` ✓ Under ${GOAL} – bra!` : ''}`;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {slidersOn && (
          <Panel title="Din linje">
            <Slider label="Lutning" value={line.slope} min={SLOPE_RANGE[0]} max={SLOPE_RANGE[1]} step={0.5} onChange={(v) => setLine({ ...line, slope: v })} format={(v) => `${fmt(v)} glassar per grad`} />
            <Slider label="Nivå vid 20 °C" value={line.level} min={LEVEL_RANGE[0]} max={LEVEL_RANGE[1]} step={1} onChange={(v) => setLine({ ...line, level: v })} format={(v) => `${v} glassar`} />
            <button type="button" className="btn" onClick={() => setLine(startLine)}>
              Återställ linjen
            </button>
          </Panel>
        )}
        {!guided && (
          <Panel title="Visa">
            <Toggle label="Visa den anpassade linjen" checked={showFit} onChange={setShowFit} />
            <Toggle label="Dra ut axlarna och visa nya dagar" checked={wideExp} onChange={setWideExp} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={guided && step === 4 ? 'Den anpassade linjen utanför träningsdatan' : 'Glasskiosken'}>
          <LiveStatus>
            <span data-testid="mse-resultat">{guided && step === 4 ? `Anpassade linjen: MSE ${fmt(fitMse)} på träningsdata men ${fmt(mse(fit, newDays))} på de nya dagarna.` : status}</span>
          </LiveStatus>
          <RegressionPlot line={activeLine} showFit={fitOn} wide={wide} />
          <Legend
            items={[
              { swatch: 'var(--c2)', symbol: '●', text: 'Träningsdag' },
              ...(wide ? [{ swatch: 'var(--c4)', symbol: '■', text: 'Ny dag' }] : []),
              { swatch: 'var(--c1)', symbol: '—', text: guided && step === 4 ? 'Anpassad linje' : 'Din linje' },
              ...(fitOn && !(guided && step === 4) ? [{ swatch: 'var(--c3)', symbol: '- -', text: 'Anpassad linje (streckad)' }] : []),
              { swatch: 'var(--bad)', symbol: '|', text: 'Residual' },
            ]}
          />
        </Panel>
        <Panel title="Residualer">
          <ResidualTable line={activeLine} data={training} caption={guided && step === 4 ? 'Anpassade linjen på träningsdagarna' : 'Din linje på träningsdagarna'} testId="residualtabell" />
          {wide && <ResidualTable line={activeLine} data={newDays} caption={guided && step === 4 ? 'Anpassade linjen på de nya dagarna' : 'Din linje på de nya dagarna'} testId="nya-dagar" />}
        </Panel>
      </div>
    </div>
  );
}
