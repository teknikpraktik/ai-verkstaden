import '../../chapters/etik/etik.css';
import { keyedSteps } from '../../chapters/etik/keyedSteps';
import { ConfusionMatrix, ratioText } from '../../components/lab/Charts';
import { Legend, LiveStatus, Panel, Slider, Toggle } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Question } from '../../components/lab/Questions';
import {
  COMPARE_THRESHOLD,
  DEFAULT_THRESHOLD,
  cases,
  groupIds,
  groupName,
  isThreshold,
  outcome,
  type GroupId,
  type GroupOutcome,
} from './logic';

/** Punktdiagram: en rad per område, en punkt per ansökan. */
function StripPlot({ thresholds }: { thresholds: Record<GroupId, number> }) {
  const W = 520;
  const rowH = 70;
  const m = { l: 96, r: 14, t: 10, b: 34 };
  const H = m.t + rowH * 2 + m.b;
  const x = (v: number) => m.l + (v / 100) * (W - m.l - m.r);
  const desc = groupIds
    .map((g) => {
      const o = outcome(g, thresholds[g]);
      return `${groupName[g]}: tröskel ${thresholds[g]}, ${o.flagged} av ${o.total} utreds, ${o.fp} korrekta utreds i onödan, ${o.fn} felaktiga missas.`;
    })
    .join(' ');
  return (
    <figure className="plot">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Riskpoäng för 80 påhittade ansökningar i två områden. ${desc}`}>
        <g className="axis" aria-hidden="true">
          <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} />
          {[0, 20, 40, 60, 80, 100].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={H - m.b} y2={H - m.b + 4} />
              <text x={x(t)} y={H - m.b + 16} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text x={(m.l + W - m.r) / 2} y={H - 2} textAnchor="middle" className="axis-label">
            Riskpoäng
          </text>
        </g>
        {groupIds.map((g, gi) => {
          const y0 = m.t + gi * rowH;
          const stack = new Map<number, number>();
          const t = thresholds[g];
          return (
            <g key={g} aria-hidden="true">
              <text x={4} y={y0 + rowH / 2 + 4} fill="var(--text)" fontSize="13">
                {groupName[g]}
              </text>
              <rect x={x(t)} y={y0 + 2} width={Math.max(0, x(100) - x(t))} height={rowH - 6} fill="var(--warn-soft)" />
              <line x1={x(t)} x2={x(t)} y1={y0} y2={y0 + rowH - 2} stroke="var(--warn)" strokeWidth={2} strokeDasharray="4 3" />
              <text x={Math.min(x(t) + 4, W - 70)} y={y0 + 12} fill="var(--warn)" fontSize="11">
                tröskel {t}
              </text>
              {cases
                .filter((c) => c.group === g)
                .map((c) => {
                  const k = stack.get(c.score) ?? 0;
                  stack.set(c.score, k + 1);
                  const cy = y0 + rowH - 12 - k * 9;
                  return c.error ? (
                    <circle key={c.id} cx={x(c.score)} cy={cy} r={4} fill="var(--c2)" />
                  ) : (
                    <circle key={c.id} cx={x(c.score)} cy={cy} r={3.5} fill="var(--surface)" stroke="var(--c1)" strokeWidth={1.6} />
                  );
                })}
            </g>
          );
        })}
      </svg>
      <figcaption className="visually-hidden">{desc}</figcaption>
    </figure>
  );
}

function GroupResult({ o, threshold }: { o: GroupOutcome; threshold: number }) {
  return (
    <div data-testid={`resultat-${o.group}`}>
      <h4>
        {groupName[o.group]} <span className="hint">(tröskel {threshold})</span>
      </h4>
      <ConfusionMatrix tp={o.tp} fp={o.fp} fn={o.fn} tn={o.tn} positive="fel" negative="korrekt" caption={`${groupName[o.group]}: ${o.total} ansökningar`} />
      <ul>
        <li>
          <strong>Utreds i onödan (FP):</strong> {ratioText(o.fp, o.correct)} av de korrekta ansökningarna
        </li>
        <li>
          <strong>Missade fel (FN):</strong> {ratioText(o.fn, o.errors)} av de felaktiga ansökningarna
        </li>
        <li>
          <strong>Utreds totalt:</strong> {ratioText(o.flagged, o.total)}
        </li>
      </ul>
    </div>
  );
}

function CompareThresholds() {
  const rows = [DEFAULT_THRESHOLD, COMPARE_THRESHOLD];
  return (
    <div className="etik-wrap">
      <table className="table" data-testid="jamforelse">
        <caption>Samma ansökningar, bara tröskeln ändras</caption>
        <thead>
          <tr>
            <th scope="col">Tröskel</th>
            <th scope="col">Norr: i onödan (FP)</th>
            <th scope="col">Norr: missade (FN)</th>
            <th scope="col">Söder: i onödan (FP)</th>
            <th scope="col">Söder: missade (FN)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const n = outcome('norr', t);
            const s = outcome('soder', t);
            return (
              <tr key={t}>
                <th scope="row">{t}</th>
                <td>{ratioText(n.fp, n.correct)}</td>
                <td>{ratioText(n.fn, n.errors)}</td>
                <td>{ratioText(s.fp, s.correct)}</td>
                <td>{ratioText(s.fn, s.errors)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Tröskel per genomgångssteg: null = eleven styr själv. */
const stepThreshold: (number | null)[] = [DEFAULT_THRESHOLD, DEFAULT_THRESHOLD, COMPARE_THRESHOLD, null, null];

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [own, setOwn] = useStoredState<number>('troskel', DEFAULT_THRESHOLD, isThreshold);
  const [split, setSplit] = useStoredState<boolean>('olika-trosklar', false, (v): v is boolean => typeof v === 'boolean');
  const [soderT, setSoderT] = useStoredState<number>('troskel-soder', DEFAULT_THRESHOLD, isThreshold);

  const fixed = guided ? stepThreshold[Math.min(step, stepThreshold.length - 1)] ?? null : null;
  const common = fixed ?? own;
  const thresholds: Record<GroupId, number> = { norr: common, soder: !guided && split ? soderT : common };
  const n = outcome('norr', thresholds.norr);
  const s = outcome('soder', thresholds.soder);

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vem drabbas av onödiga utredningar?',
      body: (
        <>
          <p>
            Det påhittade <strong>Bidragskontoret</strong> låter ett system ge varje ansökan en riskpoäng 0–100. Ansökningar med poäng på eller över <strong>tröskeln</strong> utreds manuellt, vilket försenar utbetalningen. Tröskeln är {DEFAULT_THRESHOLD}. Varje punkt i diagrammet är en påhittad ansökan: ● innehöll fel, ○ var korrekt.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-grupp',
              prompt: `Vid tröskel ${DEFAULT_THRESHOLD}: i vilket område utreds störst andel av de korrekta ansökningarna i onödan?`,
              options: [
                { id: 'norr', text: 'Område Norr' },
                { id: 'soder', text: 'Område Söder' },
                { id: 'lika', text: 'Ungefär lika i båda' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'las-av',
      phase: 'prova',
      title: 'Läs av utfallet per område',
      body: (
        <>
          <p>
            Titta på förväxlingsmatriserna. <strong>Falskt positiv</strong> betyder här att en korrekt ansökan utreds. <strong>Falskt negativ</strong> betyder att en felaktig ansökan släpps igenom. Lägg märke till nämnarna: andelen onödiga utredningar räknas bland de <em>korrekta</em> ansökningarna.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'fp-soder',
              prompt: `Hur många korrekta ansökningar i Område Söder utreds i onödan vid tröskel ${DEFAULT_THRESHOLD}?`,
              answer: 14,
              wrong: [
                { value: 24, feedback: '24 är alla korrekta ansökningar i Söder. Frågan gäller hur många av dem som ändå hamnar över tröskeln.' },
                { value: 30, feedback: '30 är alla som utreds i Söder, även de som verkligen innehöll fel. Räkna bara de korrekta (○) över tröskeln.' },
                { value: 58, feedback: '58 är andelen i procent (14 av 24). Frågan gäller antalet.' },
                { value: 1, feedback: '1 gäller Område Norr. Titta på matrisen för Söder.' },
              ],
              hint: 'Titta på rutan ”falskt positiva” i matrisen för Område Söder.',
              explanation: 'I Söder utreds 14 av 24 korrekta ansökningar (58 %) i onödan, i Norr 1 av 32 (3 %). Samma tröskel ger alltså mycket olika utfall.',
            }}
          />
        </>
      ),
    },
    {
      id: 'hoj',
      phase: 'jamfor',
      title: `Höj tröskeln till ${COMPARE_THRESHOLD}`,
      body: (
        <>
          <p>
            Nu ändras bara en sak: tröskeln höjs från {DEFAULT_THRESHOLD} till {COMPARE_THRESHOLD}. Jämför raderna i tabellen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'fn-norr',
              prompt: `Hur många felaktiga ansökningar i Område Norr missas vid tröskel ${COMPARE_THRESHOLD}?`,
              answer: 3,
              wrong: [
                { value: 1, feedback: '1 missades vid tröskel 50. Läs raden för tröskel 60.' },
                { value: 38, feedback: '38 är andelen i procent (3 av 8). Frågan gäller antalet.' },
                { value: 8, feedback: '8 är alla felaktiga ansökningar i Norr. Hur många av dem hamnar under tröskeln?' },
              ],
              hint: 'Titta i kolumnen ”Norr: missade (FN)” på raden 60.',
              explanation: 'Vid tröskel 60 missas 3 av 8 felaktiga ansökningar i Norr (38 %), mot 1 av 8 vid tröskel 50.',
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'vad-hande',
              prompt: 'Vad hände när tröskeln höjdes?',
              options: [
                { id: 'byte', text: 'Färre korrekta ansökningar utreds i onödan, men fler felaktiga släpps igenom', correct: true },
                { id: 'battre', text: 'Systemet blev bättre på alla sätt', feedback: 'Antalet onödiga utredningar minskade, men antalet missade fel ökade i båda områdena (Norr 1 → 3, Söder 0 → 2). En tröskel byter en feltyp mot en annan.' },
                { id: 'samma', text: 'Ingenting ändrades i Norr', feedback: 'Antalet onödiga utredningar i Norr är 1 vid båda trösklarna – men antalet missade fel ökade från 1 till 3.' },
              ],
              explanation: 'En ändrad tröskel flyttar fel mellan typerna. Vilken feltyp som är värst är en värdering, inte en teknisk fråga.',
            }}
          />
        </>
      ),
    },
    {
      id: 'varfor',
      phase: 'prova',
      title: 'Prova själv – och förklara skillnaden',
      body: (
        <>
          <p>Flytta reglaget och leta efter en tröskel du tycker är rimlig. Lägg märke till att området med högre poäng bland korrekta ansökningar alltid får fler onödiga utredningar.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'varfor-soder',
              prompt: 'Varför utreds en större andel korrekta ansökningar i Söder vid samma tröskel?',
              options: [
                { id: 'poang', text: 'Korrekta ansökningar i Söder får högre poäng, eftersom modellen använder något (antal flyttar) som är vanligare där', correct: true },
                {
                  id: 'fler-fel',
                  text: 'Det finns fler felaktiga ansökningar i Söder',
                  feedback: 'Det stämmer att Söder har fler felaktiga ansökningar (16 mot 8), men andelen onödiga utredningar räknas bara bland de korrekta. Där är problemet att de korrekta ansökningarna i Söder får högre poäng.',
                },
                { id: 'avsikt', text: 'Systemet är programmerat att granska Söder hårdare', feedback: 'Tröskeln är densamma för båda. Skillnaden uppstår av sig själv när poängen är förskjuten – ingen behöver ha velat det.' },
              ],
              explanation: 'En gemensam tröskel är inte automatiskt rättvis. Om poängen bygger på uppgifter som skiljer sig mellan grupper av andra skäl blir felen ojämnt fördelade.',
            }}
          />
        </>
      ),
    },
    {
      id: 'motivera',
      phase: 'forklara',
      title: 'Motivera en avvägning',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'motivera-troskel',
            prompt: 'Vilken tröskel skulle du välja, och vilka villkor skulle du ställa på hur systemet används? Använd begreppen rättvisa, transparens, ansvar och mänsklig tillsyn.',
            criteria: [
              'Jag anger en tröskel och redovisar FP och FN per område med nämnare (t.ex. ”3 av 24”).',
              'Jag förklarar vilken feltyp jag tycker är värst och varför.',
              'Jag tar upp rättvisa mellan områdena, inte bara totalt antal fel.',
              'Jag nämner transparens (vad de som utreds får veta) och ansvar (vem som står för beslutet).',
              'Jag beskriver mänsklig tillsyn: vad en handläggare ska göra innan en utredning startar eller avslutas.',
            ],
          }}
        />
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={keyedSteps(steps)} index={step} onStepChange={(i) => setStep(i)} />
        {(!guided || fixed === null) && (
          <Panel title="Tröskel">
            <Slider
              label={!guided && split ? 'Tröskel för Område Norr' : 'Tröskel'}
              value={own}
              min={0}
              max={100}
              onChange={setOwn}
              hint="Poäng på eller över tröskeln → utredning. Piltangenter ändrar med 1."
            />
            {!guided && (
              <>
                <Toggle label="Olika trösklar per område" checked={split} onChange={setSplit} />
                {split && <Slider label="Tröskel för Område Söder" value={soderT} min={0} max={100} onChange={setSoderT} />}
              </>
            )}
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title="Utfall per område (syntetiska data)">
          <LiveStatus>
            Tröskel {thresholds.norr === thresholds.soder ? thresholds.norr : `${thresholds.norr} (Norr) och ${thresholds.soder} (Söder)`}: i onödan utreds {ratioText(n.fp, n.correct)} i Norr och {ratioText(s.fp, s.correct)} i Söder. Missade fel: {ratioText(n.fn, n.errors)} i Norr och {ratioText(s.fn, s.errors)} i Söder.
          </LiveStatus>
          <StripPlot thresholds={thresholds} />
          <Legend
            items={[
              { swatch: 'var(--c2)', symbol: '●', text: 'Ansökan med fel' },
              { swatch: 'var(--surface)', symbol: '○', text: 'Korrekt ansökan' },
              { swatch: 'var(--warn-soft)', symbol: '┆', text: 'Över tröskeln: utreds' },
            ]}
          />
          <div className="etik-two">
            <GroupResult o={n} threshold={thresholds.norr} />
            <GroupResult o={s} threshold={thresholds.soder} />
          </div>
        </Panel>
        {(!guided || step >= 2) && (
          <Panel title="Jämförelse mellan två trösklar">
            <CompareThresholds />
          </Panel>
        )}
      </div>
    </div>
  );
}
