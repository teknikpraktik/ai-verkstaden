import { useMemo } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, Panel, Segmented, SelectField, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import {
  autonomyNames,
  evaluate,
  isConditions,
  isConfig,
  missions,
  presets,
  rules,
  sensorIds,
  sensorNames,
  statusNames,
  takeoverIds,
  takeoverNames,
  type Autonomy,
  type Conditions,
  type MissionId,
  type Outcome,
  type PresetId,
  type RobotConfig,
  type Status,
} from './logic';
import '../styr-en-robot/robotik.css';

const stepVariants: PresetId[][] = [['lagerKamera'], ['lagerKamera'], ['lagerKamera', 'lagerLidar'], ['jordbruk'], ['omsorgUtan', 'omsorgNarhet', 'omsorgLarm'], ['omsorgLarm']];
/** Förhållandet som visas först i varje steg. */
const stepCondition = ['normalt', 'morker', 'morker', 'regn', 'trangt', 'trangt'];

const statusSymbol: Record<Status, string> = { klart: '✓', hjalp: '◆', misslyckat: '✗', risk: '⚠' };
const stateLabel = { ok: 'fungerar', osaker: 'osäker', nej: 'fungerar inte', saknas: 'saknas' } as const;

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rb-status rb-status-${status}`}>
      <span aria-hidden="true">{statusSymbol[status]} </span>
      {statusNames[status]}
    </span>
  );
}

function configText(cfg: RobotConfig) {
  const s = cfg.sensors.length ? cfg.sensors.map((x) => sensorNames[x].split(' (')[0]).join(', ') : 'inga sensorer';
  const t = cfg.autonomy === 'sjalvstandig' ? (cfg.takeover.length ? cfg.takeover.map((x) => takeoverNames[x]).join('; ') : 'inga villkor') : 'en person är med hela tiden';
  return { s, a: autonomyNames[cfg.autonomy], t };
}

function OutcomeView({ outcome }: { outcome: Outcome }) {
  return (
    <div data-testid="utfall">
      <p>
        <StatusBadge status={outcome.status} />
      </p>
      <ul className="rb-stats">
        <li>
          Övertaganden: <strong>{outcome.takeovers}</strong>
        </li>
        <li>
          Personaltid: <strong>{outcome.staffMinutes} min</strong>
        </li>
      </ul>
      <p>
        <strong>Sensorerna just nu:</strong>{' '}
        {sensorIds.map((s) => `${sensorNames[s].split(' (')[0]} – ${stateLabel[outcome.sensorState[s]]}`).join(' · ')}
      </p>
      <h4>Därför blev det så</h4>
      <ul className="rb-rules" aria-label="Förklaring med regler">
        {outcome.explanations.map((e, i) => (
          <li key={i} className="rb-fired">
            <span className="rb-rule-id">{e.rule}</span>
            {e.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareTable({ mission, cfg }: { mission: MissionId; cfg: RobotConfig }) {
  const rows = useMemo(() => missions[mission].conditionPresets.map((cp) => ({ cp, o: evaluate(mission, cfg, cp.c) })), [mission, cfg]);
  return (
    <table className="table" data-testid="jamforelse">
      <caption>Samma robot och samma uppdrag under olika förhållanden</caption>
      <thead>
        <tr>
          <th scope="col">Förhållande</th>
          <th scope="col">Resultat</th>
          <th scope="col">Övertaganden</th>
          <th scope="col">Personaltid</th>
          <th scope="col">Regler</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ cp, o }) => (
          <tr key={cp.id}>
            <th scope="row">{cp.name}</th>
            <td>
              <StatusBadge status={o.status} />
            </td>
            <td>{o.takeovers}</td>
            <td>{o.staffMinutes} min</td>
            <td>{o.fired.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RuleList({ fired }: { fired: string[] }) {
  const groups = [...new Set(rules.map((r) => r.group))];
  return (
    <div data-testid="regler">
      {groups.map((g) => (
        <div key={g}>
          <h4>{g}</h4>
          <ul className="rb-rules">
            {rules
              .filter((r) => r.group === g)
              .map((r) => (
                <li key={r.id} className={fired.includes(r.id) ? 'rb-fired' : undefined}>
                  <span className="rb-rule-id">{r.id}</span>
                  {r.text}
                  {fired.includes(r.id) && <strong> (används nu)</strong>}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const isMission = (v: unknown): v is MissionId => v === 'lager' || v === 'jordbruk' || v === 'omsorg';
const toggle = <T,>(list: T[], item: T, on: boolean): T[] => (on ? [...new Set([...list, item])] : list.filter((x) => x !== item));

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [variantIdx, setVariantIdx] = useStoredState<number>('variant', 0, (v): v is number => typeof v === 'number');
  const [condId, setCondId] = useStoredState<string | null>('cond', null, (v): v is string | null => v === null || typeof v === 'string');
  const [expMission, setExpMission] = useStoredState<MissionId>('exp-mission', 'lager', isMission);
  const [expCfg, setExpCfg] = useStoredState<RobotConfig>('exp-cfg', presets.lagerKamera.cfg, isConfig);
  const [expCond, setExpCond] = useStoredState<Conditions>('exp-cond', { morker: false, regn: false, trangt: false }, isConditions);

  const s = Math.min(step, stepVariants.length - 1);
  const variants = stepVariants[s]!;
  const presetId = variants[Math.min(variantIdx, variants.length - 1)]!;
  const preset = presets[presetId];
  const mission: MissionId = guided ? preset.mission : expMission;
  const cfg: RobotConfig = guided ? preset.cfg : expCfg;
  const m = missions[mission];
  const guidedCond = m.conditionPresets.find((c) => c.id === (condId ?? stepCondition[s])) ?? m.conditionPresets[0]!;
  const cond: Conditions = guided ? guidedCond.c : expCond;
  const outcome = useMemo(() => evaluate(mission, cfg, cond), [mission, cfg, cond]);
  const ct = configText(cfg);

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'En lagerrobot på nattskiftet',
      body: (
        <>
          <p>
            Lagerroboten har en <strong>kamera</strong> och en <strong>närhetssensor</strong>. Den kör <strong>självständigt</strong> och kallar på en människa när sensorerna är osäkra eller vägen är blockerad. Läs reglerna i panelen ”Reglerna i simuleringen”. Just nu visas resultatet under normala förhållanden.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-morker',
              prompt: 'På nattskiftet är belysningen släckt. Vad tror du händer?',
              options: [
                { id: 'klarar', text: 'Roboten klarar uppdraget lika bra som på dagen' },
                { id: 'hjalp', text: 'Roboten behöver mycket hjälp eller klarar inte uppdraget alls' },
                { id: 'risk', text: 'Roboten kör vidare och blir en säkerhetsrisk' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'morker',
      phase: 'prova',
      title: 'Kör i mörker',
      body: (
        <>
          <p>Nu visas mörker. Byt mellan förhållandena och läs förklaringen. Varje rad hänvisar till en regel.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'lager-morker',
              prompt: 'Vilka regler förklarar att uppdraget inte blev utfört i mörker?',
              options: [
                { id: 'a', text: 'S1 och U1: kameran fungerar inte i mörker, och roboten har ingen annan sensor för att hitta vägen', correct: true },
                { id: 'b', text: 'R1: det är för trångt i lagret', feedback: 'R1 gäller bara när människor rör sig nära roboten. Välj ”Mörker” – där är lagret tomt.' },
                { id: 'c', text: 'A4: roboten saknar villkor för övertagande', feedback: 'Roboten har villkoret ”när sensorerna är osäkra”. Därför stannade den och kallade på hjälp (A3) i stället för att köra blint.' },
              ],
              explanation: 'Utan fungerande kamera kan roboten inte se vägen (U1). Villkoret för övertagande gör att den stannar säkert – men då måste en människa göra hela jobbet: 60 minuters personaltid.',
            }}
          />
        </>
      ),
    },
    {
      id: 'lidar',
      phase: 'prova',
      title: 'Lägg till en sensor',
      body: (
        <>
          <p>
            Välj <strong>Kamera + närhet + lidar</strong>. Bara en sak ändras: roboten får en lidar. Jämför tabellen för de två roboterna.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'lidar-varfor',
              prompt: 'Varför klarar roboten med lidar nattskiftet?',
              options: [
                { id: 'a', text: 'Lidarn mäter med eget laserljus och fungerar i mörker (S2), och en fungerande sensor räcker för att hitta vägen inomhus (U1)', correct: true },
                { id: 'b', text: 'Lidarn gör kameran bättre i mörker', feedback: 'Kameran fungerar fortfarande inte (S1). Det är lidarn som tar över uppgiften att se vägen.' },
                { id: 'c', text: 'Fler sensorer ger alltid bättre resultat', feedback: 'Inte alltid – i regn är både kamera och lidar osäkra (S1, S2). Det är vilken sensor som fungerar under förhållandet som avgör.' },
              ],
              explanation: 'Olika sensorer har olika svagheter. Genom att kombinera sensorer som inte störs av samma sak blir roboten robustare. Med lidar: 1 övertagande (pallen) och 5 minuters personaltid även i mörker.',
            }}
          />
        </>
      ),
    },
    {
      id: 'jordbruk',
      phase: 'jamfor',
      title: 'Ogräsrensning i regn',
      body: (
        <>
          <p>
            Nu rensar roboten ogräs i en grönsaksodling. Den har alla fyra sensorerna. Jämför de fyra förhållandena i tabellen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'regn-overtaganden',
              prompt: 'Hur många gånger måste en människa ta över i regn?',
              answer: 9,
              wrong: [
                { value: 8, feedback: '8 är antalet rader där sensorerna var osäkra. Läs förklaringen igen – något mer händer under uppdraget.' },
                { value: 1, feedback: '1 övertagande blir det under normala förhållanden (slangen över raden). I regn är dessutom kameran och lidarn osäkra.' },
              ],
              hint: 'Räkna ihop övertagandena i förklaringen: osäkra sensorer i varje rad plus slangen.',
              explanation: 'Kamera och lidar är osäkra i regn (S1, S2), så roboten ber om hjälp i alla 8 rader, plus 1 gång för slangen: 9 övertaganden och 45 minuters personaltid. Regel N1: roboten gör knappt någon nytta i regn.',
            }}
          />
        </>
      ),
    },
    {
      id: 'omsorg',
      phase: 'prova',
      title: 'Omsorg: människor först',
      body: (
        <>
          <p>
            På äldreboendet kör roboten måltidsbrickor till de boendes dörrar i en korridor där boende går med rullator. Prova de tre robotarna. Läs omsorgsreglerna O1–O3.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'omsorg-varfor',
              prompt: 'Roboten med närhetssensor krockar inte med någon. Varför räknas den ändå som en säkerhetsrisk?',
              options: [
                { id: 'a', text: 'En boende som kände sig yr fick ingen hjälp, eftersom roboten saknade villkoret att larma personal (O3)', correct: true },
                { id: 'b', text: 'Den har ingen närhetssensor (R1)', feedback: 'Den här roboten har närhetssensor – R2 gäller, och roboten väntar när någon kommer nära. Läs förklaringen en gång till.' },
                { id: 'c', text: 'Kameran filmar inne hos de boende', feedback: 'Enligt O2 används kameran bara i korridoren. Det är inte därför uppdraget underkänns.' },
              ],
              explanation: 'I omsorgen räcker det inte att roboten inte krockar. Människors trygghet och värdighet går före effektivitet: en boende som behöver hjälp ska få det direkt. Med larmvillkoret: 2 övertaganden och 10 minuters personaltid.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Motivera ditt val',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'motivera-omsorg',
            prompt:
              'Välj sensorer, autonominivå och villkor för övertagande för roboten på äldreboendet (prova gärna i experimentläget). Motivera valet med hjälp av reglerna. Vad bör en robot aldrig göra i omsorgen, och vad kan simuleringen inte visa?',
            criteria: [
              'hänvisar till minst två regler med id (till exempel R1, O3)',
              'förklarar varför valet fungerar under flera förhållanden (natt, trång korridor)',
              'tar upp värdighet och trygghet: personal står för kontakten och kroppsnära hjälp (O1)',
              'nämner något simuleringen förenklar, till exempel att verkligheten har fler situationer än reglerna täcker',
            ],
          }}
        />
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps
          steps={steps}
          index={step}
          onStepChange={(i) => {
            setStep(i);
            setVariantIdx(0);
            setCondId(null);
          }}
        />
        {!guided && (
          <Panel title="Konfigurera roboten">
            <SelectField
              label="Uppdrag"
              value={expMission}
              options={(Object.keys(missions) as MissionId[]).map((k) => ({ value: k, label: `${missions[k].place}: ${missions[k].name}` }))}
              onChange={setExpMission}
            />
            <fieldset className="rb-checks">
              <legend>Sensorer</legend>
              {sensorIds.map((sid) => (
                <Toggle key={sid} label={sensorNames[sid]} checked={expCfg.sensors.includes(sid)} onChange={(on) => setExpCfg({ ...expCfg, sensors: toggle(expCfg.sensors, sid, on) })} />
              ))}
            </fieldset>
            <Segmented<Autonomy>
              legend="Autonominivå"
              value={expCfg.autonomy}
              options={(Object.keys(autonomyNames) as Autonomy[]).map((k) => ({ value: k, label: autonomyNames[k] }))}
              onChange={(v) => setExpCfg({ ...expCfg, autonomy: v })}
            />
            <fieldset className="rb-checks">
              <legend>Kalla på en människa … (gäller självständig robot)</legend>
              {takeoverIds.map((t) => (
                <Toggle key={t} label={takeoverNames[t]} checked={expCfg.takeover.includes(t)} onChange={(on) => setExpCfg({ ...expCfg, takeover: toggle(expCfg.takeover, t, on) })} />
              ))}
            </fieldset>
            <fieldset className="rb-checks">
              <legend>Förhållanden</legend>
              <Toggle label="Mörker" checked={expCond.morker} onChange={(v) => setExpCond({ ...expCond, morker: v })} />
              <Toggle label="Regn (påverkar bara utomhus)" checked={expCond.regn} onChange={(v) => setExpCond({ ...expCond, regn: v })} />
              <Toggle label="Trångt – människor nära roboten" checked={expCond.trangt} onChange={(v) => setExpCond({ ...expCond, trangt: v })} />
            </fieldset>
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title={`${m.place}: ${m.name}`}>
          <p>{m.task}</p>
          {guided && variants.length > 1 && (
            <Segmented
              legend="Robot"
              value={presetId}
              options={variants.map((v) => ({ value: v, label: presets[v].name }))}
              onChange={(v) => setVariantIdx(variants.indexOf(v))}
            />
          )}
          {guided && (
            <Segmented legend="Förhållande" value={guidedCond.id} options={m.conditionPresets.map((c) => ({ value: c.id, label: c.name }))} onChange={(v) => setCondId(v)} />
          )}
          <p className="rb-program" data-testid="konfiguration">
            Sensorer: {ct.s}
            <br />
            Autonomi: {ct.a}
            <br />
            Övertagande: {ct.t}
          </p>
          <LiveStatus>
            {guided ? guidedCond.name : 'Dina förhållanden'}: {statusNames[outcome.status]}. {outcome.takeovers} {outcome.takeovers === 1 ? 'övertagande' : 'övertaganden'}, {outcome.staffMinutes} minuters personaltid.
          </LiveStatus>
          <OutcomeView outcome={outcome} />
        </Panel>
        <Panel title="Jämförelse">
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Jämförelsetabell">
            <CompareTable mission={mission} cfg={cfg} />
          </div>
        </Panel>
        <Panel title="Reglerna i simuleringen">
          <p className="hint">Simuleringen är påhittad och förenklad. Allt som händer följer av de här reglerna – inget annat.</p>
          <RuleList fired={outcome.fired} />
        </Panel>
      </div>
    </div>
  );
}
