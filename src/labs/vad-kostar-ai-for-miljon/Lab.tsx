import '../../chapters/etik/etik.css';
import './miljo.css';
import { keyedSteps } from '../../chapters/etik/keyedSteps';
import { BarChart } from '../../components/lab/Charts';
import { LiveStatus, Panel, Segmented, SelectField, Slider, Toggle } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Question } from '../../components/lab/Questions';
import {
  assumptions,
  assumptionValue,
  baseLevels,
  baseSettings,
  calculate,
  CAR_KG_PER_KM,
  ELECTRICITY_KR_PER_KWH,
  fmt,
  fmtCount,
  fmtRough,
  HEATING,
  isProbe,
  isPerDay,
  isSettings,
  KETTLE_KWH_PER_LITRE,
  levelName,
  levels,
  LICENSE_KR_PER_STUDENT,
  lifetimeExamples,
  LIMITS,
  mixes,
  models,
  PHONE_CHARGE_WH,
  REBOUND,
  rebound,
  sanitize,
  sensitivity,
  span,
  trainingMWh,
  trainingVsUse,
  whPerQuestion,
  type AssumptionId,
  type Level,
  type MixId,
  type ModelId,
  type Result,
  type Settings,
} from './logic';

/** Kort ursprung för varje antagande. Fullständiga källor står i texten under arbetsytan och i lärarhandledningen. */
const origin: Record<AssumptionId, string> = {
  perFraga: 'Stor modell: publicerade mätningar och uppskattningar (ca 0,2–0,6 Wh). Liten och resonerande modell: undervisningsantagande.',
  perBild: 'Forskningsmätning på öppna bildmodeller (medel ca 3 Wh, värsta ca 11 Wh). Lågt värde: undervisningsantagande.',
  traning: 'Lågt värde nära en publicerad uppskattning för en stor modell från 2020. Övriga: undervisningsantagande.',
  livstid: 'Undervisningsantagande (okänt för verkliga tjänster).',
  elmix: 'Norden: 90 g är Naturvårdsverkets värde för nordisk elmix. Världen: ca 470 g (2024). Spannen är ungefärliga.',
  vatten: 'Undervisningsantagande, huvudvärdet i nivå med en publicerad redovisning (ca 1,1 liter/kWh).',
};

function valueText(id: AssumptionId, level: Level, model: ModelId, mix: MixId): string {
  const v = assumptionValue(id, level, model, mix);
  const unit = assumptions.find((a) => a.id === id)!.unit;
  return id === 'livstid' ? `${fmtCount(v)} ${unit}` : `${fmtRough(v)} ${unit}`;
}

type StepView = 'start' | 'fragor' | 'traning' | 'antaganden' | 'rekyl' | 'eget';
const stepViews: StepView[] = ['start', 'fragor', 'traning', 'antaganden', 'rekyl', 'eget'];

function ResultPanel({ s, r, title }: { s: Settings; r: Result; title: string }) {
  const sp = span(s);
  const rows: { name: string; lag: string; bas: string; hog: string }[] = [
    { name: 'Energi (kWh)', lag: fmtRough(sp.lag.kWh.total), bas: fmt(r.kWh.total), hog: fmtRough(sp.hog.kWh.total) },
    { name: 'Utsläpp (kg CO₂e)', lag: fmtRough(sp.lag.co2Kg), bas: fmt(r.co2Kg), hog: fmtRough(sp.hog.co2Kg) },
    { name: 'Vatten till kylning (liter)', lag: fmtRough(sp.lag.waterL), bas: fmt(r.waterL), hog: fmtRough(sp.hog.waterL) },
  ];
  return (
    <Panel title={title}>
      <p className="hint">
        Påhittad skola, förenklad modell. {fmt(sanitize(s).students)} elever, {SCHOOL_TEXT}. {models.find((m) => m.id === s.model)!.name}, {mixes.find((m) => m.id === s.mix)!.name.toLowerCase()}.
      </p>
      <LiveStatus>
        <span data-testid="sammanfattning">
          Huvudberäkning: {fmt(r.kWh.total)} kWh och {fmt(r.co2Kg)} kg CO₂e per läsår (spann {fmtRough(sp.lag.co2Kg)}–{fmtRough(sp.hog.co2Kg)} kg).
        </span>
      </LiveStatus>
      <div className="etik-wrap">
        <table className="table" data-testid="resultat">
          <caption>Per läsår. ”Lågt” och ”Högt” = alla antaganden lågt respektive högt samtidigt.</caption>
          <thead>
            <tr>
              <th scope="col">Mått</th>
              <th scope="col">Lågt</th>
              <th scope="col">Huvudberäkning</th>
              <th scope="col">Högt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.name}>
                <th scope="row">{x.name}</th>
                <td>{x.lag}</td>
                <td>
                  <strong>{x.bas}</strong>
                </td>
                <td>{x.hog}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BarChart
        title="Var går energin? (kWh per läsår, huvudberäkning)"
        format={(v) => `${fmt(v)} kWh`}
        data={[
          { label: 'Elevernas frågor', value: r.kWh.fragor, color: 'var(--c1)' },
          { label: 'Bilder', value: r.kWh.bilder, color: 'var(--c2)' },
          { label: 'Skolans andel av träningen', value: r.kWh.traning, color: 'var(--c4)' },
        ]}
      />
      <h4 className="miljo-sub">Jämför med vardagen</h4>
      <dl className="etik-kv" data-testid="jamforelser">
        <dt>Per elev och skoldag</dt>
        <dd>{fmtRough(r.whPerStudentDay)} Wh</dd>
        <dt>Koka vatten</dt>
        <dd>{fmt(r.kettleLitres)} liter</dd>
        <dt>Ladda en mobil</dt>
        <dd>{fmt(r.phoneCharges)} gånger</dd>
        <dt>Köra bensinbil</dt>
        <dd>{fmt(r.carKm)} km (samma utsläpp)</dd>
      </dl>
      <p className="hint">
        Antaganden för jämförelserna: {fmtRough(KETTLE_KWH_PER_LITRE)} kWh per liter kokat vatten, {PHONE_CHARGE_WH} Wh per mobilladdning, {fmtRough(CAR_KG_PER_KM)} kg CO₂e per km med bensinbil.
      </p>
    </Panel>
  );
}

const SCHOOL_TEXT = 'ett läsår med 180 skoldagar (36 veckor)';

function EconomyPanel({ r }: { r: Result }) {
  const share = r.licenseKr + r.electricityKr > 0 ? (100 * r.electricityKr) / (r.licenseKr + r.electricityKr) : 0;
  return (
    <Panel title="Ekonomi för skolan (påhittade priser)">
      <dl className="etik-kv" data-testid="ekonomi">
        <dt>Licens för AI-assistenten</dt>
        <dd>
          {fmt(r.licenseKr)} kr ({LICENSE_KR_PER_STUDENT} kr per elev)
        </dd>
        <dt>Elen i datacentret</dt>
        <dd>
          {fmt(r.electricityKr)} kr ({fmtRough(ELECTRICITY_KR_PER_KWH)} kr/kWh, ingår i priset)
        </dd>
        <dt>Elens andel av kostnaden</dt>
        <dd>{fmtRough(share)} %</dd>
      </dl>
      <p className="hint">Skolan betalar licensen. Leverantören betalar elen och vattnet – men utsläppen hamnar där datacentret står.</p>
    </Panel>
  );
}

function HeatingPanel({ r }: { r: Result }) {
  const h = r.heating;
  if (!h) return null;
  return (
    <Panel title="Nyttosidan: AI-styrd värme (påhittat exempel)">
      <p>
        Kommunen kan också använda AI för att styra värmen i skolans byggnader efter väder och schema. Antagande: skolan värms med {fmt(HEATING.heatKWh)} kWh fjärrvärme per år och styrningen sparar {fmt(HEATING.saving.bas * 100)} % (spann {fmt(HEATING.saving.lag * 100)}–{fmt(HEATING.saving.hog * 100)} %).
      </p>
      <dl className="etik-kv" data-testid="nytta">
        <dt>Sparad värme</dt>
        <dd>{fmt(h.savedKWh)} kWh</dd>
        <dt>Minskade utsläpp</dt>
        <dd>
          <span aria-hidden="true">▼ </span>
          {fmt(h.savedKg)} kg CO₂e
        </dd>
        <dt>Styrsystemets egen el</dt>
        <dd>
          <span aria-hidden="true">▲ </span>
          {fmt(h.systemKWh)} kWh = {fmt(h.systemKg)} kg CO₂e
        </dd>
        <dt>Netto för värmestyrningen</dt>
        <dd>
          <strong>{h.netKg < 0 ? `minskar med ${fmt(-h.netKg)} kg CO₂e` : `ökar med ${fmt(h.netKg)} kg CO₂e`}</strong>
        </dd>
        <dt>Netto i pengar</dt>
        <dd>{h.netKr > 0 ? `kostar ${fmt(h.netKr)} kr` : `sparar ${fmt(-h.netKr)} kr`} per år (licens {fmt(HEATING.licenseKr)} kr minus sparad värme)</dd>
      </dl>
      <p className="hint">Jämför: AI-assistenten för eleverna ger {fmt(r.co2Kg)} kg CO₂e. Nyttan av den är främst lärande – den går inte att mäta i kilo.</p>
    </Panel>
  );
}

function TrainingTable() {
  return (
    <Panel title="Träning sker en gång, användning sker miljontals gånger">
      <div className="etik-wrap">
        <table className="table" data-testid="traning-tabell">
          <caption>Stor modell: träning {fmt(trainingMWh.stor.bas)} MWh en gång, {fmtRough(whPerQuestion.stor.bas)} Wh per fråga (huvudvärden)</caption>
          <thead>
            <tr>
              <th scope="col">Frågor under modellens livstid</th>
              <th scope="col">Träning per fråga</th>
              <th scope="col">All användning</th>
              <th scope="col">Störst totalt</th>
            </tr>
          </thead>
          <tbody>
            {lifetimeExamples.map((n) => {
              const t = trainingVsUse('stor', n);
              return (
                <tr key={n}>
                  <th scope="row">{fmtCount(n)}</th>
                  <td>{fmtRough(t.trainingWhPerQuestion)} Wh</td>
                  <td>{fmtRough(t.useMWh)} MWh</td>
                  <td>{t.useMWh > t.trainMWh ? 'Användningen' : 'Träningen'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SensitivityPanel({ s }: { s: Settings }) {
  const list = sensitivity(s);
  return (
    <Panel title="Ett antagande i taget">
      <p className="hint">Varje rad: bara det antagandet ändras från lågt till högt, alla andra står kvar. Stapeln visar hur mycket utsläppen kan skilja.</p>
      <BarChart title="Hur mycket ändras utsläppen? (kg CO₂e per läsår)" format={(v) => `${fmt(v)} kg`} data={list.map((x, i) => ({ label: x.name, value: x.spreadKg, color: i === 0 ? 'var(--c2)' : 'var(--c1)', note: i === 0 ? '(störst)' : undefined }))} />
      <div className="etik-wrap">
        <table className="table" data-testid="kanslighet">
          <caption>Utsläpp när ett antagande ändras (kg CO₂e)</caption>
          <thead>
            <tr>
              <th scope="col">Antagande</th>
              <th scope="col">Lågt</th>
              <th scope="col">Högt</th>
              <th scope="col">Skillnad</th>
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id}>
                <th scope="row">{x.name}</th>
                <td>{fmt(x.lagKg)}</td>
                <td>{fmt(x.hogKg)}</td>
                <td>{fmt(x.spreadKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ReboundPanel() {
  const r = rebound(baseSettings.students, REBOUND.before, REBOUND.after);
  return (
    <Panel title="Rekyleffekten">
      <div className="etik-wrap">
        <table className="table" data-testid="rekyl">
          <caption>Bara elevernas frågor, 1 000 elever, kWh per läsår</caption>
          <thead>
            <tr>
              <th scope="col">Läge</th>
              <th scope="col">Energi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Före: stor modell, {REBOUND.before.perDay} frågor per dag</th>
              <td>{fmt(r.beforeKWh)} kWh</td>
            </tr>
            <tr>
              <th scope="row">Bara effektivare: liten modell, fortfarande {REBOUND.before.perDay} frågor</th>
              <td>{fmt(r.efficiencyOnlyKWh)} kWh</td>
            </tr>
            <tr>
              <th scope="row">Efter: liten modell, {REBOUND.after.perDay} frågor per dag</th>
              <td>?</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="hint">
        Den lilla modellen kräver {fmt(r.efficiency)} gånger mindre energi per fråga. Användningen blir {fmt(r.useFactor)} gånger större. Räkna ut den sista raden själv.
      </p>
    </Panel>
  );
}

function AssumptionTable({ s }: { s: Settings }) {
  return (
    <Panel title="Antagandena">
      <div className="etik-wrap">
        <table className="table" data-testid="antaganden">
          <caption>Värden som används ({models.find((m) => m.id === s.model)!.name.toLowerCase()}). ● = används nu.</caption>
          <thead>
            <tr>
              <th scope="col">Antagande</th>
              {levels.map((l) => (
                <th scope="col" key={l}>
                  {levelName[l]}
                </th>
              ))}
              <th scope="col">Ursprung</th>
            </tr>
          </thead>
          <tbody>
            {assumptions.map((a) => (
              <tr key={a.id}>
                <th scope="row">{a.name}</th>
                {levels.map((l) => (
                  <td key={l} className={s.levels[a.id] === l ? 'miljo-current' : undefined}>
                    {s.levels[a.id] === l && (
                      <>
                        <span aria-hidden="true">● </span>
                        <span className="visually-hidden">Används nu: </span>
                      </>
                    )}
                    {valueText(a.id, l, s.model, s.mix)}
                  </td>
                ))}
                <td className="miljo-origin">{origin[a.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SettingsPanel({ s, set }: { s: Settings; set: (v: Settings) => void }) {
  const u = (patch: Partial<Settings>) => set({ ...s, ...patch });
  return (
    <Panel title="Inställningar">
      <Slider label="Elever" value={s.students} {...LIMITS.students} onChange={(v) => u({ students: v })} format={(v) => `${fmt(v)} elever`} />
      <Slider label="Frågor per elev och skoldag" value={s.questionsPerDay} {...LIMITS.questionsPerDay} onChange={(v) => u({ questionsPerDay: v })} />
      <Slider label="Bilder per elev och vecka" value={s.imagesPerWeek} {...LIMITS.imagesPerWeek} onChange={(v) => u({ imagesPerWeek: v })} />
      <SelectField<ModelId> label="Modell" value={s.model} options={models.map((m) => ({ value: m.id, label: m.name }))} onChange={(v) => u({ model: v })} />
      <p className="hint">{models.find((m) => m.id === s.model)!.detail}</p>
      <SelectField<MixId> label="Var körs modellen?" value={s.mix} options={mixes.map((m) => ({ value: m.id, label: m.name }))} onChange={(v) => u({ mix: v })} />
      <Toggle label="Visa också AI-styrd värme (nyttosidan)" checked={s.heating} onChange={(v) => u({ heating: v })} />
      <fieldset className="miljo-levels">
        <legend>Antagandenas nivå</legend>
        {assumptions.map((a) => (
          <Segmented<Level>
            key={a.id}
            legend={a.name}
            value={s.levels[a.id]}
            options={levels.map((l) => ({ value: l, label: `${levelName[l]}: ${valueText(a.id, l, s.model, s.mix)}` }))}
            onChange={(l) => u({ levels: { ...s.levels, [a.id]: l } })}
          />
        ))}
      </fieldset>
      <button type="button" className="btn" onClick={() => set(baseSettings)}>
        Återställ huvudscenariot
      </button>
    </Panel>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [own, setOwn] = useStoredState<Settings>('installningar', baseSettings, isSettings);
  const [perDay, setPerDay] = useStoredState<number>('fragor-per-dag', 10, isPerDay);
  const [probe, setProbe] = useStoredState<{ id: AssumptionId; level: Level }>('prova-antagande', { id: 'elmix', level: 'hog' }, isProbe);

  const view: StepView = guided ? stepViews[Math.min(Math.max(step, 0), stepViews.length - 1)]! : 'eget';
  const settings: Settings = (() => {
    switch (view) {
      case 'fragor':
        return { ...baseSettings, questionsPerDay: perDay };
      case 'antaganden':
        return { ...baseSettings, levels: { ...baseLevels, [probe.id]: probe.level } };
      case 'rekyl':
        return { ...baseSettings, heating: true };
      case 'eget':
        return sanitize(own);
      default:
        return baseSettings;
    }
  })();
  const r = calculate(settings);
  const base = calculate(baseSettings);

  const steps: GuidedStep[] = [
    {
      id: 'start',
      phase: 'forutsag',
      title: 'Gissa först',
      body: (
        <>
          <p>
            Det påhittade Åsens gymnasium har 1 000 elever. Alla får en AI-assistent: varje elev ställer 10 frågor per skoldag och skapar 2 bilder i veckan. Modellen körs i ett datacenter i Norden.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-bil',
              prompt: 'Skolans AI-användning under ett helt läsår ger utsläpp som motsvarar ungefär hur lång resa med bensinbil?',
              options: [
                { id: 'kort', text: 'Under 10 km' },
                { id: 'mellan', text: 'Några hundra km' },
                { id: 'lang', text: 'Över 10 000 km' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'fragor',
      phase: 'prova',
      title: 'Ändra antalet frågor',
      body: (
        <>
          <p>
            Huvudberäkningen ger {fmt(base.co2Kg)} kg CO₂e – ungefär som {fmt(base.carKm)} km med bensinbil. Jämför med din gissning. Ändra nu antalet frågor och se hur energin följer med.
          </p>
          {guided && <Slider label="Frågor per elev och skoldag" value={perDay} {...LIMITS.questionsPerDay} onChange={setPerDay} />}
          <Question
            spec={{
              kind: 'numeric',
              id: 'kwh-per-dag',
              prompt: 'En fråga till den stora modellen kräver ungefär 0,3 Wh. Hur många kWh går åt under en skoldag om 1 000 elever ställer 10 frågor var?',
              answer: 3,
              tolerance: 0.001,
              unit: 'kWh',
              wrong: [
                { value: 3000, feedback: '3 000 är rätt antal wattimmar (Wh). Frågan gäller kilowattimmar: 1 kWh = 1 000 Wh.' },
                { value: 0.003, feedback: 'Du har delat med 1 000 en gång för mycket. 10 000 frågor × 0,3 Wh = 3 000 Wh.' },
                { value: 0.3, feedback: '0,3 Wh gäller en enda fråga. Hur många frågor ställs totalt under dagen?' },
                { value: 30, feedback: 'Kontrollera antalet frågor: 1 000 elever × 10 frågor = 10 000 frågor, inte 100 000.' },
              ],
              hint: 'Räkna först antalet frågor, sedan Wh, och dela sist med 1 000 för att få kWh.',
              explanation: '1 000 × 10 = 10 000 frågor. 10 000 × 0,3 Wh = 3 000 Wh = 3 kWh per skoldag. Under 180 skoldagar blir det 540 kWh.',
            }}
          />
        </>
      ),
    },
    {
      id: 'traning',
      phase: 'jamfor',
      title: 'Träning eller användning?',
      body: (
        <>
          <p>
            Innan modellen kan användas måste den tränas – en gång. Sedan används den av miljontals människor. Tabellen visar hur träningens energi fördelas när modellen används olika många gånger.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'traning-eller-anvandning',
              prompt: 'Modellen tränas en gång med 10 000 MWh och besvarar sedan 100 miljarder frågor à 0,3 Wh. Vad drar mest energi totalt?',
              options: [
                { id: 'traning', text: 'Träningen', feedback: 'Träningen är en stor engångspost, men 100 miljarder × 0,3 Wh = 30 000 MWh. Användningen blir tre gånger större eftersom den upprepas så många gånger.' },
                { id: 'anvandning', text: 'Användningen', correct: true },
                { id: 'lika', text: 'Ungefär lika mycket', feedback: 'Räkna om: 100 miljarder × 0,3 Wh = 30 000 000 000 Wh = 30 000 MWh, alltså tre gånger träningens 10 000 MWh.' },
              ],
              explanation: 'Användningen: 30 000 MWh mot 10 000 MWh. Varje fråga får bära 0,1 Wh av träningen – en tredjedel av sin egen energi. Med bara 1 miljon frågor hade träningen dominerat helt.',
            }}
          />
        </>
      ),
    },
    {
      id: 'antaganden',
      phase: 'jamfor',
      title: 'Ett antagande i taget',
      body: (
        <>
          <p>Siffrorna är osäkra. Välj ett antagande och sätt det lågt eller högt – resten står kvar på huvudvärdet. Vilket antagande flyttar resultatet mest?</p>
          {guided && (
            <>
              <SelectField<AssumptionId>
                label="Antagande att ändra"
                value={probe.id}
                options={assumptions.filter((a) => a.affects === 'co2').map((a) => ({ value: a.id, label: a.name }))}
                onChange={(id) => setProbe({ ...probe, id })}
              />
              <Segmented<Level>
                legend="Nivå"
                value={probe.level}
                options={levels.map((l) => ({ value: l, label: `${levelName[l]}: ${valueText(probe.id, l, 'stor', 'norden')}` }))}
                onChange={(level) => setProbe({ ...probe, level })}
              />
            </>
          )}
          <Question
            spec={{
              kind: 'choice',
              id: 'vilket-antagande',
              prompt: 'Vilket antagande ändrar utsläppen mest i huvudscenariot?',
              options: [
                { id: 'elmix', text: 'Elmixen (utsläpp per kWh)', correct: true },
                { id: 'perFraga', text: 'Energi per fråga', feedback: 'Energin per fråga är viktig, men den kan ”bara” fyrdubblas (0,15–0,6 Wh). Elmixen kan skilja tio gånger (20–210 g per kWh) och slår på all energi samtidigt.' },
                { id: 'traning', text: 'Energi för träningen', feedback: 'Träningen ger en spridning på ca 79 kg. Titta på stapeln som är längst – den gäller ett antagande som påverkar varje kilowattimme.' },
                { id: 'perBild', text: 'Energi per bild', feedback: 'Bilderna är bara en del av energin, så även en stor osäkerhet där flyttar totalen mindre än ett antagande som gäller all energi.' },
              ],
              explanation: 'Elmixen: från ca 19 till ca 197 kg CO₂e, alltså en skillnad på ca 178 kg. Den multipliceras med all energi. Men i ett datacenter med världsgenomsnittlig el blir i stället träningen och livslängden viktigast – vilket antagande som styr beror på scenariot.',
            }}
          />
        </>
      ),
    },
    {
      id: 'rekyl',
      phase: 'jamfor',
      title: 'Effektivare – men mer användning',
      body: (
        <>
          <p>
            När något blir billigare eller snabbare använder vi ofta mer av det. Det kallas rekyleffekt. Samtidigt kan AI också spara energi – se exemplet med AI-styrd värme.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'rekyl',
              prompt: 'Skolan byter till den lilla modellen (0,05 Wh per fråga). Eleverna börjar ställa 80 frågor per dag i stället för 10. Hur många kWh per läsår drar frågorna nu?',
              answer: 720,
              tolerance: 0.5,
              unit: 'kWh',
              wrong: [
                { value: 90, feedback: '90 kWh hade det blivit om eleverna fortsatt med 10 frågor per dag. Men användningen ökade åtta gånger.' },
                { value: 540, feedback: '540 kWh var före bytet. Räkna med den lilla modellen och 80 frågor per dag.' },
                { value: 4320, feedback: 'Det är 80 frågor med den stora modellen (0,3 Wh). Efter bytet kräver varje fråga 0,05 Wh.' },
              ],
              hint: '1 000 elever × 80 frågor × 180 dagar × 0,05 Wh, och dela sedan med 1 000.',
              explanation: '1 000 × 80 × 180 × 0,05 Wh = 720 000 Wh = 720 kWh – mer än de 540 kWh före bytet. Effektiviseringen åts upp av den ökade användningen.',
            }}
          />
        </>
      ),
    },
    {
      id: 'eget',
      phase: 'forklara',
      title: 'Väg nytta mot kostnad',
      body: (
        <>
          <p>Prova egna inställningar i panelen ”Inställningar”. Skriv sedan ett kort ställningstagande.</p>
          <Question
            spec={{
              kind: 'open',
              id: 'vag-nytta',
              prompt: 'Ska kommunen ge alla gymnasieelever en AI-assistent? Väg nyttan mot miljökostnaden och den ekonomiska kostnaden.',
              criteria: [
                'Jag använder minst två siffror från labben, med enhet (kWh, kg CO₂e, liter eller kr).',
                'Jag anger ett spann eller säger vilket antagande som är mest osäkert.',
                'Jag jämför med något: en vardagssak, värmestyrningen eller ett annat val av modell.',
                'Jag nämner vem som betalar och vem som får nyttan.',
                'Jag föreslår minst ett villkor som minskar miljökostnaden (t.ex. modellval, elmix, begränsning) och tänker på rekyleffekten.',
              ],
            }}
          />
        </>
      ),
    },
  ];

  const showSettings = !guided || view === 'eget';
  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={keyedSteps(steps)} index={step} onStepChange={(i) => setStep(i)} />
        {showSettings && <SettingsPanel s={own} set={(v) => setOwn(sanitize(v))} />}
      </div>
      <div className="lab-stack">
        <ResultPanel s={settings} r={r} title={view === 'eget' ? 'Resultat med dina inställningar' : 'Resultat för Åsens gymnasium'} />
        {(!guided || view === 'traning') && <TrainingTable />}
        {(!guided || view === 'antaganden') && <SensitivityPanel s={guided ? baseSettings : settings} />}
        {(!guided || view === 'rekyl') && <ReboundPanel />}
        <HeatingPanel r={r} />
        {(!guided || view === 'eget') && <EconomyPanel r={r} />}
        {(!guided || view === 'antaganden' || view === 'eget') && <AssumptionTable s={settings} />}
      </div>
    </div>
  );
}
