import type { ReactNode } from 'react';
import '../../chapters/etik/etik.css';
import { keyedSteps } from '../../chapters/etik/keyedSteps';
import { LiveStatus, Panel, Segmented, SelectField } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Question, type ChoiceSpec } from '../../components/lab/Questions';
import { REFERENCE_DATE, categories, categoryName, classifyGuidanceBot, isFact, milestones, scenarioById, scenarios, type Fact, type Scenario } from './logic';

const kindLabel = { publicering: 'Publicering', ikrafttradande: 'Ikraftträdande', tillampning: 'Tillämpning' } as const;

function classifySpec(s: Scenario): ChoiceSpec {
  return {
    kind: 'choice',
    id: `klass-${s.id}`,
    prompt: `Hur behandlas ”${s.title}” i AI-förordningen, utifrån antagandena?`,
    options: categories.map((c) => ({ id: c.id, text: c.name, correct: c.id === s.answer, feedback: s.wrong[c.id] })),
    explanation: s.explanation,
  };
}

function ScenarioCard({ s, children }: { s: Scenario; children?: ReactNode }) {
  return (
    <article className="etik-card" data-scenario={s.id}>
      <h4>
        <span className="etik-badge">Påhittat</span> {s.title}
      </h4>
      <p>{s.description}</p>
      <p>
        <strong>Antaganden:</strong>
      </p>
      <ul>
        {s.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      {children}
      <Question spec={classifySpec(s)} />
      <details>
        <summary>Vad behöver utredas i verkligheten – och vad säger GDPR?</summary>
        <p>
          <strong>Fakta att utreda:</strong>
        </p>
        <ul>
          {s.investigate.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p>
          <strong>GDPR:</strong>
        </p>
        <ul>
          {s.gdpr.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p>
          <strong>Gäller från:</strong> {s.appliesFrom}
        </p>
      </details>
    </article>
  );
}

function ReferenceBox() {
  return (
    <aside className="callout callout-varning" aria-label="Om de rättsliga uppgifterna">
      <p className="etik-refdate">
        <strong>Referensdatum: {REFERENCE_DATE}.</strong> Uppgifterna gäller förordning (EU) 2024/1689 i den lydelse som ändrats genom (EU) 2026/1744, och GDPR (EU) 2016/679. Reglerna kan ha ändrats efter detta datum.
      </p>
      <p>
        <strong>Undervisningsmaterial, inte juridisk rådgivning.</strong> Scenarierna är påhittade och bedömningarna gäller bara under de antaganden som står i varje scenario. Läs alltid den aktuella texten:{' '}
        <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer">
          AI-förordningen på EUR-Lex
        </a>
        ,{' '}
        <a href="https://eur-lex.europa.eu/eli/reg/2026/1744/oj" target="_blank" rel="noopener noreferrer">
          ändringsförordningen 2026/1744
        </a>
        ,{' '}
        <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noopener noreferrer">
          GDPR på EUR-Lex
        </a>{' '}
        och{' '}
        <a href="https://www.imy.se/verksamhet/ai/" target="_blank" rel="noopener noreferrer">
          IMY om AI
        </a>
        .
      </p>
    </aside>
  );
}

function Timeline() {
  return (
    <Panel title="Tidslinje för AI-förordningen">
      <ol className="etik-timeline" data-testid="tidslinje">
        {milestones.map((m) => (
          <li key={m.iso}>
            <time dateTime={m.iso}>{m.date}</time> <span className={`etik-badge ${m.kind === 'ikrafttradande' ? 'etik-badge-warn' : ''}`}>{kindLabel[m.kind]}</span>
            <br />
            {m.text} <span className="hint">({m.source})</span>
          </li>
        ))}
      </ol>
      <p className="hint">
        <strong>Ikraftträdande</strong> betyder att lagen finns och är bindande. <strong>Tillämpning</strong> betyder att en viss regel faktiskt börjar gälla och måste följas. För AI-förordningen skiljer det flera år.
      </p>
    </Panel>
  );
}

function GuidanceVariant() {
  const [fact, setFact] = useStoredState<Fact>('fakta-antagning', 'okant', isFact);
  const r = classifyGuidanceBot(fact);
  return (
    <div className="panel">
      <Segmented
        legend="Används botens bedömning när kommunen beslutar om antagning?"
        value={fact}
        options={[
          { value: 'okant', label: 'Okänt' },
          { value: 'nej', label: 'Nej' },
          { value: 'ja', label: 'Ja' },
        ]}
        onChange={setFact}
      />
      <LiveStatus>
        <span data-testid="variant-klass">
          <strong>Bedömning:</strong> {categoryName(r.category)}.
        </span>{' '}
        {r.reason}
      </LiveStatus>
    </div>
  );
}

const stepScenario: (string | null)[] = [null, 'kanslo', 'rattning', 'vagledning', 'avhopp', null, null];

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [picked, setPicked] = useStoredState<string>('scenario', 'kanslo', (v): v is string => typeof v === 'string' && scenarioById.has(v));

  const sid = guided ? stepScenario[Math.min(step, stepScenario.length - 1)] : picked;
  const scenario = sid ? scenarioById.get(sid) : undefined;
  const showTimeline = !guided || step >= 5;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Är alla AI-system i skolan högrisk?',
      body: (
        <>
          <p>
            EU:s AI-förordning delar in AI-användning efter risk: en del är <strong>förbjuden</strong>, en del är <strong>högrisk</strong> med särskilda krav, en del har krav på <strong>öppenhet</strong>, och resten har inga särskilda krav utöver de allmänna. GDPR gäller parallellt när personuppgifter behandlas.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-skola',
              prompt: 'Vad tror du gäller för AI-system som används i skolor?',
              options: [
                { id: 'alla-hog', text: 'Alla är högrisk' },
                { id: 'beror', text: 'Det beror på vad systemet används till' },
                { id: 'inga', text: 'Inga särskilda regler gäller för skolor' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'kanslo',
      phase: 'prova',
      title: 'Scenario 1: Känsloläsaren',
      body: <p>Läs scenariot och antagandena till höger. Välj sedan hur AI-förordningen behandlar systemet. Läs återkopplingen även om du svarar rätt.</p>,
    },
    {
      id: 'rattning',
      phase: 'prova',
      title: 'Scenario 2: Rättningsassistenten',
      body: (
        <>
          <p>Klassa systemet till höger. Svara sedan på frågan om GDPR.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'gdpr-rattning',
              multiple: true,
              prompt: 'Vilka delar av GDPR blir viktiga för rättningsassistenten?',
              options: [
                { id: 'art22', text: 'Rätten att inte bli föremål för beslut som enbart grundas på automatiserad behandling (art. 22)', correct: true },
                { id: 'art35', text: 'Konsekvensbedömning avseende dataskydd (art. 35)', correct: true },
                { id: 'ingen', text: 'Ingen – när AI-förordningen gäller behövs inte GDPR', feedback: 'Båda förordningarna gäller samtidigt. AI-förordningen ställer krav på själva AI-systemet; GDPR reglerar behandlingen av personuppgifter.' },
                { id: 'art9', text: 'Förbudet mot känsliga uppgifter (art. 9) gör systemet olagligt', feedback: 'Provsvar är inte känsliga uppgifter i GDPR:s mening (art. 9 gäller bland annat hälsa och biometriska uppgifter för identifiering). Enligt antagandena används inga sådana uppgifter.' },
              ],
              explanation: 'Om poängen i praktiken avgör betyget utan mänsklig prövning blir art. 22 aktuell. Och eftersom systemet bedömer elever med ny teknik behövs troligen en konsekvensbedömning (art. 35).',
            }}
          />
        </>
      ),
    },
    {
      id: 'vagledning',
      phase: 'jamfor',
      title: 'Scenario 3: Ett faktum avgör',
      body: (
        <>
          <p>
            Klassa studievägledarboten utifrån antagandena. Ändra sedan bara <strong>ett faktum</strong> – om botens bedömning används vid antagning – och se hur bedömningen ändras.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'ett-faktum',
              prompt: 'Vad visar försöket med studievägledarboten?',
              options: [
                { id: 'anvandning', text: 'Samma teknik kan klassas olika beroende på vad resultatet används till', correct: true },
                { id: 'teknik', text: 'Klassningen beror på vilken sorts AI-teknik som används', feedback: 'Tekniken var densamma i alla tre fallen. Det som ändrades var hur resultatet användes. AI-förordningen utgår till stor del från användningsområdet.' },
                { id: 'alltid', text: 'En chattbot är alltid högrisk', feedback: 'När boten bara ger råd gäller öppenhetskravet i art. 50.1, inte högriskreglerna.' },
              ],
              explanation: 'AI-förordningen klassar främst efter avsett användningsområde. Därför är ”Det behövs mer information” ofta rätt svar när användningen är oklar.',
            }}
          />
        </>
      ),
    },
    {
      id: 'avhopp',
      phase: 'prova',
      title: 'Scenario 4: Vad behöver utredas?',
      body: (
        <>
          <p>Klassa avhoppsvarnaren till höger. Ta sedan reda på vilka fakta som saknas.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'utreda-avhopp',
              multiple: true,
              prompt: 'Vilka fakta behöver utredas för att kunna bedöma avhoppsvarnaren?',
              options: [
                { id: 'anvandning', text: 'Vad mentorerna gör med listan och om den påverkar beslut om eleven', correct: true },
                { id: 'uppgifter', text: 'Om uppgifter om hälsa eller frånvaroorsaker används', correct: true },
                { id: 'automatik', text: 'Om något beslut fattas helt automatiskt', correct: true },
                { id: 'leverantor', text: 'Vilket land leverantören har sitt huvudkontor i', feedback: 'Det kan spela roll för andra frågor, till exempel överföring av uppgifter utanför EU, men det avgör inte hur systemet klassas i AI-förordningen.' },
                { id: 'pris', text: 'Vad systemet kostar', feedback: 'Priset påverkar inte den rättsliga bedömningen.' },
              ],
              explanation: 'Användningen avgör AI-förordningens klassning, vilka uppgifter som används avgör om art. 9 blir aktuell, och automatiska beslut avgör om art. 22 gäller.',
            }}
          />
        </>
      ),
    },
    {
      id: 'datum',
      phase: 'jamfor',
      title: 'Ikraftträdande eller tillämpning?',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'nar-forbud',
            prompt: 'Från vilket datum gäller förbudet mot känsloigenkänning i skolor?',
            options: [
              { id: '2025', text: '2 februari 2025', correct: true },
              { id: '2024', text: '1 augusti 2024', feedback: 'Då trädde förordningen i kraft. Men de flesta regler började tillämpas senare – förbuden från 2 februari 2025.' },
              { id: '2026', text: '2 augusti 2026', feedback: 'Det är när huvuddelen av förordningen började tillämpas. Förbuden i art. 5 kom tidigare, 2 februari 2025.' },
              { id: '2027', text: '2 december 2027', feedback: 'Det är det nya datumet för högriskkraven enligt bilaga III. Förbuden skjuts inte upp av ändringsförordningen.' },
            ],
            explanation: 'Förordningen trädde i kraft 1 augusti 2024, men förbuden i art. 5 började tillämpas först 2 februari 2025 (art. 113).',
          }}
        />
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara med egna ord',
      body: (
        <>
          <p>Du kan nu välja fritt bland alla sju scenarierna i experimentläget.</p>
          <Question
            spec={{
              kind: 'open',
              id: 'forklara-reglering',
              prompt: 'Välj ett av scenarierna. Förklara hur det regleras, vilka antaganden din bedömning bygger på och vad som skulle ändra den.',
              criteria: [
                'Jag anger vilken kategori i AI-förordningen som gäller och hänvisar till en artikel eller bilaga.',
                'Jag nämner minst ett antagande som bedömningen bygger på.',
                'Jag beskriver ett faktum som skulle ändra bedömningen.',
                'Jag tar upp minst en fråga om GDPR.',
                'Jag skiljer på när regeln trädde i kraft och när den började tillämpas.',
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
        {!guided && (
          <Panel title="Välj scenario">
            <SelectField label="Scenario" value={picked} options={scenarios.map((s) => ({ value: s.id, label: s.title }))} onChange={setPicked} />
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <ReferenceBox />
        {scenario && (
          <ScenarioCard key={scenario.id} s={scenario}>
            {scenario.id === 'vagledning' && <GuidanceVariant />}
          </ScenarioCard>
        )}
        {showTimeline && <Timeline />}
      </div>
    </div>
  );
}
