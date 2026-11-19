import { useId, useState } from 'react';
import '../../chapters/etik/etik.css';
import { keyedSteps } from '../../chapters/etik/keyedSteps';
import { LiveStatus, Panel, SelectField } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStorageListener, useStoredState } from '../../components/lab/LabContext';
import { Question } from '../../components/lab/Questions';
import { labKey } from '../../lib/progress';
import { readJSON } from '../../lib/storage';
import {
  concerns,
  conditions,
  consequences,
  decisions,
  isConditionList,
  isDecision,
  isRole,
  metricIds,
  metricName,
  metricText,
  roles,
  type ConditionId,
  type Decision,
  type RoleId,
} from './logic';
import { exampleDecisions } from './teacher';

const OPEN_ID = 'motivera-beslut';
const MIN_WORDS = 40;

/** Beslut och villkor per genomgångssteg; null = elevens eget val. */
const stepSetup: ({ decision: Decision; conditions: ConditionId[] } | null)[] = [
  { decision: 'infor', conditions: [] },
  { decision: 'infor', conditions: [] },
  { decision: 'villkor', conditions: ['granskning'] },
  null,
  null,
];

function ConditionBoxes({ value, onChange, disabled }: { value: ConditionId[]; onChange: (v: ConditionId[]) => void; disabled: boolean }) {
  const base = useId();
  return (
    <fieldset className="criteria" disabled={disabled}>
      <legend>Villkor</legend>
      {conditions.map((c) => (
        <div key={c.id} className="field field-toggle">
          <input
            id={`${base}-${c.id}`}
            type="checkbox"
            checked={value.includes(c.id)}
            onChange={(e) => onChange(e.target.checked ? [...value, c.id] : value.filter((x) => x !== c.id))}
          />
          <label htmlFor={`${base}-${c.id}`}>
            <strong>{c.name}</strong>
            <br />
            <small className="hint">{c.detail}</small>
          </label>
        </div>
      ))}
      {disabled && <p className="hint">Villkoren används bara vid ”med villkor” och pilot.</p>}
    </fieldset>
  );
}

function CompareRows() {
  const a = consequences('infor', []);
  const b = consequences('villkor', ['granskning']);
  const rows: { m: 'hjalp' | 'felkontakt' | 'timmar' | 'overprovning' }[] = [{ m: 'hjalp' }, { m: 'felkontakt' }, { m: 'timmar' }, { m: 'overprovning' }];
  return (
    <div className="etik-wrap">
      <table className="table" data-testid="jamforelse">
        <caption>Ett villkor läggs till: mentorn granskar varje markering</caption>
        <thead>
          <tr>
            <th scope="col">Konsekvens</th>
            <th scope="col">Utan villkor</th>
            <th scope="col">Med granskning</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ m }) => (
            <tr key={m}>
              <th scope="row">{metricName[m]}</th>
              <td>{metricText(a, m)}</td>
              <td>{metricText(b, m)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useWordCount(): number {
  const { labId } = useLab();
  const read = () => {
    const v = readJSON<{ text?: unknown }>(labKey(labId, `open:${OPEN_ID}`), {});
    return typeof v.text === 'string' && v.text.trim() ? v.text.trim().split(/\s+/).length : 0;
  };
  const [n, setN] = useState(read);
  useStorageListener(() => setN(read()));
  return n;
}

function Examples() {
  const words = useWordCount();
  const [show, setShow] = useState(false);
  if (words < MIN_WORDS) {
    return (
      <p className="hint" data-testid="exempel-last">
        Exempelresonemang visas när du har skrivit minst {MIN_WORDS} ord om ditt eget beslut (nu {words}).
      </p>
    );
  }
  return (
    <div>
      <button type="button" className="btn" aria-expanded={show} onClick={() => setShow((s) => !s)}>
        {show ? 'Dölj exempelresonemang' : 'Visa exempelresonemang att jämföra med'}
      </button>
      {show && (
        <ul className="etik-cards" data-testid="exempel">
          {exampleDecisions.map((e) => (
            <li key={e.title} className="etik-card">
              <h5>{e.title}</h5>
              <p>{e.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [role, setRole] = useStoredState<RoleId>('roll', 'elev', isRole);
  const [decision, setDecision] = useStoredState<Decision>('beslut', 'villkor', isDecision);
  const [chosen, setChosen] = useStoredState<ConditionId[]>('villkor', ['granskning'], isConditionList);

  const setup = guided ? stepSetup[Math.min(step, stepSetup.length - 1)] : null;
  const d = setup?.decision ?? decision;
  const cs = setup?.conditions ?? chosen;
  const o = consequences(d, cs);
  const flagged = concerns(o);
  const r = roles.find((x) => x.id === role)!;
  const free = setup === null || setup === undefined;

  const steps: GuidedStep[] = [
    {
      id: 'roll',
      phase: 'forutsag',
      title: 'Välj en roll och förutsäg',
      body: (
        <>
          <p>
            Året är 2030. Det påhittade Ekbackens gymnasium funderar på att införa <strong>Avhoppsvarnaren</strong>, ett AI-system som utifrån uppgifter om eleverna markerar dem som riskerar att hoppa av. Mentorerna kontaktar de markerade. Du ska ta ställning – från en roll.
          </p>
          <SelectField<RoleId> label="Din roll" value={role} options={roles.map((x) => ({ value: x.id, label: x.name }))} onChange={setRole} />
          <p>
            <strong>{r.name}:</strong> {r.interest}
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-hjalp',
              prompt: 'Om skolan inför systemet utan några villkor – tror du att fler elever i riskzonen får hjälp än i dag?',
              options: [
                { id: 'ja', text: 'Ja, fler får hjälp' },
                { id: 'samma', text: 'Ungefär lika många' },
                { id: 'nej', text: 'Nej, färre' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'utan-villkor',
      phase: 'prova',
      title: 'Inför utan villkor',
      body: (
        <>
          <p>Konsekvenserna till höger gäller om systemet införs utan villkor för alla 200 elever i årskursen. Jämför med din förutsägelse.</p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'felkontakter',
              prompt: 'Hur många elever utan risk kontaktas felaktigt?',
              answer: 24,
              wrong: [
                { value: 40, feedback: '40 är alla som systemet markerar, både rätt och fel. Frågan gäller bara dem som inte är i riskzonen.' },
                { value: 16, feedback: '16 är de elever i riskzonen som markeras rätt och får hjälp. Frågan gäller de felaktiga kontakterna.' },
                { value: 180, feedback: '180 är alla elever utan risk. Hur många av dem kontaktas?' },
              ],
              hint: 'Läs raden ”Elever som kontaktas felaktigt”.',
              explanation: 'Systemet hjälper 16 av 20 i stället för 8 av 20, men 24 elever utan risk kontaktas felaktigt – och ingen av dem får veta varför eller kan ifrågasätta det.',
            }}
          />
        </>
      ),
    },
    {
      id: 'ett-villkor',
      phase: 'jamfor',
      title: 'Lägg till ett villkor',
      body: (
        <>
          <p>Nu ändras bara en sak: en mentor granskar varje markering innan någon elev kontaktas. Jämför i tabellen.</p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'felkontakter-granskning',
              prompt: 'Hur många elever kontaktas felaktigt med mänsklig granskning?',
              answer: 6,
              wrong: [
                { value: 24, feedback: '24 gällde utan villkor. Läs kolumnen ”Med granskning”.' },
                { value: 15, feedback: '15 är antalet elever i riskzonen som får hjälp med granskning.' },
                { value: 0, feedback: 'Granskningen stryker 3 av 4 felaktiga markeringar – inte alla. Mentorn kan också ta fel.' },
              ],
              hint: 'Läs raden ”Elever som kontaktas felaktigt” i kolumnen ”Med granskning”.',
              explanation: 'Felaktiga kontakter minskar från 24 till 6. Priset: en elev i riskzonen stryks av misstag (15 i stället för 16) och mentortiden ökar från 20 till 20,5 timmar.',
            }}
          />
        </>
      ),
    },
    {
      id: 'eget',
      phase: 'prova',
      title: 'Fatta ditt eget beslut',
      body: (
        <>
          <p>Välj beslut och villkor under arbetsytan. Titta särskilt på raderna som är viktiga för din roll (★).</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vilket-villkor',
              prompt: 'Vilket villkor gör att en elev kan få en felaktig markering ändrad?',
              options: [
                { id: 'overprovning', text: 'Eleven får veta och kan begära ändring', correct: true },
                { id: 'granskning', text: 'Mentorn granskar varje markering', feedback: 'Granskningen minskar antalet fel, men eleven vet fortfarande inte om att hen markerats och kan inte själv ifrågasätta det.' },
                { id: 'revision', text: 'Granska felen per grupp varje termin', feedback: 'Revisionen visar om felen drabbar vissa grupper, men hjälper inte den enskilda eleven att få sin markering ändrad.' },
              ],
              explanation: 'Överprövning kräver att den som berörs vet om beslutet, förstår varför och kan få det prövat. Det är en annan sak än att systemet gör färre fel.',
            }}
          />
        </>
      ),
    },
    {
      id: 'motivera',
      phase: 'forklara',
      title: 'Motivera ditt beslut',
      body: (
        <>
          <Question
            spec={{
              kind: 'open',
              id: OPEN_ID,
              prompt: 'Skriv ditt beslut som ett kort yttrande till skolans ledning. Utgå från din roll.',
              criteria: [
                'Jag anger beslut och villkor och använder minst två siffror från konsekvenserna.',
                'Jag väger nytta (fler som får hjälp) mot risk (felaktiga kontakter, snedvridning, integritet).',
                'Jag anger vem som ska ha ansvaret för systemet och för följderna.',
                'Jag tar ställning till hur en elev ska kunna överpröva en markering.',
                'Jag nämner hur någon med en annan roll skulle se på beslutet.',
              ],
            }}
          />
          <Examples />
        </>
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={keyedSteps(steps)} index={step} onStepChange={(i) => setStep(i)} />
        {(free || !guided) && (
          <Panel title="Beslut">
            {!guided && <SelectField<RoleId> label="Din roll" value={role} options={roles.map((x) => ({ value: x.id, label: x.name }))} onChange={setRole} />}
            <SelectField<Decision> label="Beslut" value={decision} options={decisions.map((x) => ({ value: x.id, label: x.name }))} onChange={setDecision} />
            <ConditionBoxes value={chosen} onChange={setChosen} disabled={decision === 'nej' || decision === 'infor'} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={`Konsekvenser: ${decisions.find((x) => x.id === d)!.name}`}>
          <p className="hint">
            Påhittat scenario. Siffrorna räknas fram ur uttalade antaganden, se texten under arbetsytan. {o.systemUsed ? `Gäller ${o.students} elever, varav ${o.atRisk} i riskzonen.` : ''}
          </p>
          {!guided || free ? null : (
            <p>
              <strong>Villkor i det här steget:</strong> {cs.length ? cs.map((c) => conditions.find((x) => x.id === c)!.name.toLowerCase()).join(', ') : 'inga'}.
            </p>
          )}
          <LiveStatus>
            <span data-testid="sammanfattning">
              {metricName.hjalp}: {metricText(o, 'hjalp')}. {metricName.felkontakt}: {metricText(o, 'felkontakt')}.
            </span>
          </LiveStatus>
          <div className="etik-wrap">
            <table className="table" data-testid="konsekvenser">
              <caption>
                Konsekvenser sedda från rollen {r.name.toLowerCase()} (★ = viktigt för rollen, ! = bör uppmärksammas)
              </caption>
              <tbody>
                {metricIds.map((m) => (
                  <tr key={m}>
                    <th scope="row">
                      {r.cares.includes(m) && (
                        <>
                          <span aria-hidden="true">★ </span>
                          <span className="visually-hidden">Viktigt för din roll: </span>
                        </>
                      )}
                      {metricName[m]}
                    </th>
                    <td>
                      {flagged.includes(m) && (
                        <span className="etik-badge etik-badge-bad">
                          <span aria-hidden="true">!</span>
                          <span className="visually-hidden">Bör uppmärksammas:</span>
                        </span>
                      )}{' '}
                      {metricText(o, m)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        {(!guided || step >= 2) && (
          <Panel title="Jämförelse: ett villkor i taget">
            <CompareRows />
          </Panel>
        )}
      </div>
    </div>
  );
}
