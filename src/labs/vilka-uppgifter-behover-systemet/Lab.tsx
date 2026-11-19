import { useId } from 'react';
import '../../chapters/etik/etik.css';
import { keyedSteps } from '../../chapters/etik/keyedSteps';
import { LiveStatus, Panel, SelectField } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Question } from '../../components/lab/Questions';
import { evaluate, fields, isPurpose, isSelection, purposes, storages, vendorProposal, type FieldId, type PurposeId, type Selection, type Storage } from './logic';

const stepPurpose: (PurposeId | null)[] = ['ovningar', 'ovningar', 'ovningar', 'oversikt', null];

function FieldRow({ id, choice, onChange }: { id: FieldId; choice: Selection[FieldId]; onChange: (c: Selection[FieldId]) => void }) {
  const f = fields.find((x) => x.id === id)!;
  const cb = useId();
  return (
    <li className="etik-field" data-field={id}>
      <div className="field field-toggle">
        <input id={cb} type="checkbox" checked={choice.on} onChange={(e) => onChange({ ...choice, on: e.target.checked })} />
        <label htmlFor={cb}>
          <strong>{f.name}</strong>
          {f.sensitive && <span className="etik-badge etik-badge-warn"> känslig</span>}
          <br />
          <small className="hint">{f.example}</small>
        </label>
      </div>
      <SelectField<Storage>
        label={`Lagringstid för ${f.name.toLowerCase()}`}
        value={choice.keep}
        disabled={!choice.on}
        options={storages.map((s) => ({ value: s.id, label: s.name }))}
        onChange={(keep) => onChange({ ...choice, keep })}
      />
    </li>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [sel, setSel] = useStoredState<Selection>('urval', vendorProposal, isSelection);
  const [expPurpose, setExpPurpose] = useStoredState<PurposeId>('andamal', 'ovningar', isPurpose);

  const purpose: PurposeId = guided ? (stepPurpose[Math.min(step, stepPurpose.length - 1)] ?? expPurpose) : expPurpose;
  const ev = evaluate(purpose, sel);
  const p = purposes.find((x) => x.id === purpose)!;
  const purposeFree = !guided || stepPurpose[Math.min(step, stepPurpose.length - 1)] === null;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Hur mycket behöver Läxkompis veta?',
      body: (
        <>
          <p>
            Det påhittade Ekbackens gymnasium ska börja använda matteverktyget <strong>Läxkompis</strong>. Ändamålet är att <strong>föreslå övningar</strong> utifrån vad varje elev har svårt för. Leverantören föreslår att verktyget samlar in 9 olika uppgifter och sparar dem i 5 år.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-antal',
              prompt: 'Hur många av de 9 uppgifterna tror du verkligen behövs för ändamålet?',
              options: [
                { id: 'alla', text: 'Alla 9 – leverantören vet vad som behövs' },
                { id: 'halften', text: 'Ungefär hälften' },
                { id: 'fa', text: 'Bara 2–3' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'minimera',
      phase: 'prova',
      title: 'Ta bort det som inte behövs',
      body: (
        <>
          <p>
            Bocka ur uppgifter i listan till höger och läs återkopplingen. Målet är att verktyget ska fungera med så få uppgifter som möjligt – det kallas <strong>dataminimering</strong>.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'nodvandiga',
              multiple: true,
              prompt: 'Vilka uppgifter är nödvändiga för ändamålet att föreslå övningar?',
              options: [
                { id: 'elevid', text: 'Pseudonymt elev-id', correct: true },
                { id: 'svar', text: 'Svar på övningar', correct: true },
                { id: 'namn', text: 'Namn', feedback: 'Verktyget behöver kunna känna igen dig från gång till gång, men inte veta vad du heter. Ett slumpat id räcker; skolan kan koppla id:t till dig vid behov.' },
                { id: 'stod', text: 'Diagnos eller stödbehov', feedback: 'Det kan verka hjälpsamt, men svaren visar redan vad du har svårt med. Uppgifter om hälsa är dessutom känsliga och får bara behandlas i undantagsfall (GDPR art. 9).' },
                { id: 'betyg', text: 'Betyg i tidigare kurser', feedback: 'Gamla betyg säger mindre om vad du behöver öva på nu än dina svar gör. De är uppgifter från ett annat sammanhang.' },
              ],
              explanation: 'Två uppgifter räcker: ett id så att verktyget känner igen dig, och dina svar så att det vet vad du har svårt för. Tid per uppgift kan möjligen motiveras, men måste i så fall förklaras.',
            }}
          />
        </>
      ),
    },
    {
      id: 'lagring',
      phase: 'prova',
      title: 'Hur länge?',
      body: (
        <>
          <p>Ändra lagringstiden för de uppgifter du behållit och se vad återkopplingen säger.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'hur-lange',
              prompt: 'Hur länge är det rimligt att spara svaren för ändamålet att föreslå övningar?',
              options: [
                { id: 'kurs', text: 'Tills kursen är avslutad', correct: true },
                { id: 'alltid', text: 'För alltid, ifall de behövs senare', feedback: '”Ifall de behövs” är inget ändamål. Personuppgifter ska inte sparas längre än ändamålet kräver – det kallas lagringsminimering (GDPR art. 5).' },
                { id: 'lektion', text: 'Raderas efter varje lektion', feedback: 'Det skyddar integriteten, men då kan verktyget inte se vad du har haft svårt med tidigare och ändamålet går inte att uppnå.' },
              ],
              explanation: 'När kursen är slut behövs inte längre förslag på övningar i den, så uppgifterna kan raderas. Terminens slut kan också vara rimligt för en kurs som är en termin lång.',
            }}
          />
        </>
      ),
    },
    {
      id: 'nytt-andamal',
      phase: 'jamfor',
      title: 'Samma uppgifter – nytt ändamål',
      body: (
        <>
          <p>
            Nu ändras bara ändamålet: läraren vill ha en <strong>översikt</strong> över vilka moment varje elev har svårt med. Uppgifterna du valde ligger kvar. Läs den nya återkopplingen.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'andamal-styr',
              prompt: 'Vad visar jämförelsen?',
              options: [
                { id: 'andamal', text: 'Vilka uppgifter som behövs beror på ändamålet – namn och klass behövs för läraröversikten men inte för övningsförslagen', correct: true },
                { id: 'mer', text: 'Det är alltid bättre att samla in mer, ifall ändamålet ändras', feedback: 'Det är just det dataminimering förbjuder. Om ändamålet ändras ska man pröva på nytt vilka uppgifter som behövs.' },
                { id: 'samma', text: 'Samma uppgifter passar alla ändamål', feedback: 'Titta på återkopplingen: med samma urval saknas nu namn och klass. Ändamålet styr urvalet.' },
              ],
              explanation: 'Först bestäms ändamålet, sedan vilka uppgifter som behövs för just det. Det är ändamålsbegränsning och dataminimering tillsammans.',
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'betyg-andamal',
              prompt: 'Leverantören föreslår senare att svaren också ska användas för att föreslå betyg. Vad gäller?',
              options: [
                { id: 'prova', text: 'Det är ett nytt ändamål som måste prövas för sig – det är inte självklart tillåtet bara för att uppgifterna redan finns', correct: true },
                { id: 'ok', text: 'Det är tillåtet eftersom uppgifterna redan är insamlade', feedback: 'Att uppgifterna redan finns gör inte ett nytt ändamål tillåtet. Enligt ändamålsbegränsningen får de inte användas på ett sätt som är oförenligt med det ursprungliga ändamålet.' },
                { id: 'forbjudet', text: 'Det är alltid förbjudet att använda AI vid betygssättning', feedback: 'Det finns inget sådant generellt förbud. Men ett AI-system som bedömer läranderesultat räknas som högrisk enligt AI-förordningen och får särskilda krav – se labb 25.' },
              ],
              explanation: 'Ett nytt ändamål kräver en ny prövning: är det förenligt med det ursprungliga, vilken rättslig grund finns, och vad säger AI-förordningen om system som bedömer elever?',
            }}
          />
        </>
      ),
    },
    {
      id: 'foljdfragor',
      phase: 'forklara',
      title: 'Vilka frågor återstår?',
      body: (
        <>
          <p>Du kan nu välja ändamål fritt. Läs följdfrågorna under återkopplingen.</p>
          <Question
            spec={{
              kind: 'open',
              id: 'motivera-urval',
              prompt: 'Skriv ett kort förslag till rektorn: vilket ändamål, vilka uppgifter, hur länge – och vilka två följdfrågor som måste besvaras innan Läxkompis tas i bruk.',
              criteria: [
                'Jag anger ändamålet och motiverar varje uppgift utifrån det.',
                'Jag förklarar varför minst en uppgift från leverantörens förslag inte behövs.',
                'Jag anger en lagringstid och motiverar den.',
                'Jag tar upp två följdfrågor, t.ex. om vem som är ansvarig, hur eleverna informeras eller vem som får se uppgifterna.',
              ],
            }}
          />
        </>
      ),
    },
  ];

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={keyedSteps(steps)} index={step} onStepChange={(i) => setStep(i)} />
        {purposeFree && (
          <Panel title="Ändamål">
            <SelectField<PurposeId> label="Ändamål" value={expPurpose} options={purposes.map((x) => ({ value: x.id, label: x.name }))} onChange={setExpPurpose} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={`Läxkompis – ändamål: ${p.name}`}>
          <p>{p.description}</p>
          <LiveStatus>
            <span data-testid="status">
              {ev.chosen} av {fields.length} uppgifter valda. {ev.ok ? '✓ Inga problem.' : `✗ ${ev.problems} problem att åtgärda.`}
            </span>
          </LiveStatus>
          <div className="row">
            <button type="button" className="btn btn-quiet" onClick={() => setSel(vendorProposal())}>
              Återställ leverantörens förslag
            </button>
          </div>
          <ul className="etik-fields" aria-label="Uppgifter som Läxkompis kan samla in">
            {fields.map((f) => (
              <FieldRow key={f.id} id={f.id} choice={sel[f.id]} onChange={(c) => setSel({ ...sel, [f.id]: c })} />
            ))}
          </ul>
        </Panel>
        <Panel title="Återkoppling">
          <ul className="etik-feedback" data-testid="aterkoppling">
            {ev.messages.map((m) => (
              <li key={`${m.kind}-${m.field ?? 'alla'}-${m.text.slice(0, 20)}`}>
                <span className={`etik-badge etik-badge-${m.kind}`}>{m.kind === 'ok' ? '✓ OK' : m.kind === 'bad' ? '✗ Problem' : '? Fråga'}</span> {m.text}
              </li>
            ))}
          </ul>
          <h4>Följdfrågor som situationen väcker</h4>
          <ul>
            {ev.followUps.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
