import { Fragment, useId, useState } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { LiveStatus, Panel, Segmented, Slider } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { CATEGORIES, categoryName, classifyMessage, isAnswers, isMotivated, scoreAnswers, situations, spamModel, systems, thermostat, type Answers, type Category } from './logic';

type View = 'cards' | 'situations';
const stepSetup: { view: View; classify: boolean; reveal: boolean; compare: boolean }[] = [
  { view: 'cards', classify: false, reveal: false, compare: false },
  { view: 'cards', classify: true, reveal: false, compare: false },
  { view: 'cards', classify: true, reveal: true, compare: false },
  { view: 'cards', classify: true, reveal: true, compare: false },
  { view: 'situations', classify: false, reveal: false, compare: false },
  { view: 'situations', classify: false, reveal: false, compare: true },
  { view: 'situations', classify: false, reveal: false, compare: true },
];

const sv = (v: number) => String(v).replace('.', ',');
const verdictText = { skräp: '✗ Skräppost – stoppas', 'inte skräp': '✓ Inte skräppost – släpps igenom', 'vet inte': '? Poäng 0 – modellen vet inte och släpper igenom' } as const;

function SystemCards({ answers, setAnswer, classify, reveal }: { answers: Answers; setAnswer: (id: string, c: Category) => void; classify: boolean; reveal: boolean }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 17rem), 1fr))' }}>
      {systems.map((s) => {
        const a = answers[s.id];
        const ok = a !== undefined && isMotivated(s, a);
        const others = (Object.keys(s.motivated) as Category[]).filter((c) => c !== a);
        return (
          <li key={s.id} className="panel" data-system={s.id} style={{ background: reveal && a ? (ok ? 'var(--ok-soft)' : 'var(--bad-soft)') : undefined }}>
            <h4 style={{ margin: '0 0 0.25rem' }}>{s.name}</h4>
            <p style={{ margin: '0 0 0.5rem' }}>{s.description}</p>
            {classify && <Segmented legend={`Hur fungerar ${s.name.toLowerCase()}?`} hideLegend value={a ?? ('' as Category)} options={CATEGORIES.map((c) => ({ value: c, label: categoryName[c] }))} onChange={(c) => setAnswer(s.id, c)} />}
            {reveal && a && (
              <div role="status" data-testid={`bedomning-${s.id}`}>
                <p style={{ margin: '0.4rem 0 0.2rem', fontWeight: 700 }}>{ok ? '✓ Välmotiverat' : '✗ Svårt att motivera'}</p>
                <p style={{ margin: 0 }}>{ok ? s.motivated[a] : s.otherwise}</p>
                {others.length > 0 && (
                  <p style={{ margin: '0.3rem 0 0' }} className="hint">
                    {ok ? 'Gränsfall – också välmotiverat: ' : 'Välmotiverat: '}
                    {others.map((c) => categoryName[c].toLowerCase()).join(', ')}.
                  </p>
                )}
              </div>
            )}
            {reveal && !a && <p className="hint">Inte sorterat än.</p>}
          </li>
        );
      })}
    </ul>
  );
}

function MessageResult({ text }: { text: string }) {
  const r = classifyMessage(text);
  return (
    <div data-testid="filter-resultat">
      <p style={{ margin: '0.3rem 0' }}>
        <strong>Filtret:</strong> {verdictText[r.verdict]} (poäng {r.score})
      </p>
      <p className="hint" style={{ margin: 0 }}>
        {r.known.length ? `Kända ord: ${r.known.map((k) => `${k.word} (${k.weight > 0 ? '+' : ''}${k.weight})`).join(', ')}. ` : 'Inga kända ord. '}
        {r.unknown.length ? `Okända ord (poäng 0): ${r.unknown.join(', ')}.` : ''}
      </p>
    </div>
  );
}

function SituationView({ situationId, setSituation }: { situationId: string; setSituation: (id: string) => void }) {
  const s = situations.find((x) => x.id === situationId) ?? situations[0]!;
  return (
    <div>
      <Segmented legend="Situation" value={s.id} options={situations.map((x) => ({ value: x.id, label: x.title }))} onChange={setSituation} />
      <p>
        <em>{s.context}</em>
      </p>
      {s.message !== null ? (
        <>
          <p>
            <strong>Meddelande:</strong> ”{s.message}”
          </p>
          <MessageResult text={s.message} />
        </>
      ) : (
        <p data-testid="filter-resultat">
          <strong>Termostaten:</strong> rummet är 16 °C, inställt 21 °C → {thermostat(16, 21) === 'värmer' ? '🔥 värmer för fullt' : 'av'}. Regeln vet inget om fönster.
        </p>
      )}
      <p>
        <strong>En människa:</strong> {s.human} <span className="hint">(förmåga: {s.ability})</span>
      </p>
    </div>
  );
}

const abilities: [string, string, string, string][] = [
  ['Förståelse', 'Vet vem som skickar och varför.', 'Har ingen förståelse – följer bara regeln.', 'Ser bara ord och deras poäng, inte vad meddelandet betyder.'],
  ['Generalisering', 'Känner igen lockbeten även på nytt språk.', 'Behöver inte generalisera – samma regel överallt.', 'Okända ord får poäng 0. Engelska mejlet släpps igenom.'],
  ['Erfarenhet', 'Har sett många mejl och lär sig av misstag.', 'Lär sig ingenting av tidigare dagar.', 'Har ”erfarenhet” av exakt tio meddelanden.'],
  ['Situationsbedömning', 'Stänger fönstret i stället för att värma.', 'Värmer för fullt när fönstret är öppet.', 'Stoppar mentorns mejl för att det innehåller ”klicka här”.'],
];

function AbilityTable() {
  return (
    <div className="table-wrap">
      <table className="table" data-testid="formagor">
        <caption>Människa jämfört med de två modellerna i labben</caption>
        <thead>
          <tr>
            <th scope="col">Förmåga</th>
            <th scope="col">Människa</th>
            <th scope="col">Termostaten (fasta regler)</th>
            <th scope="col">Skräppostfiltret (lärt av 10 exempel)</th>
          </tr>
        </thead>
        <tbody>
          {abilities.map(([a, ...cells]) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              {cells.map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Playground() {
  const [text, setText] = useState('Grattis! Klicka på länken för att se resultatet');
  const [room, setRoom] = useState(16);
  const [setpoint, setSetpoint] = useState(21);
  const id = useId();
  return (
    <>
      <Panel title="Testa skräppostfiltret">
        <label htmlFor={id}>Skriv ett eget meddelande</label>
        <textarea id={id} rows={2} value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%' }} />
        {text.trim() === '' ? <p>Skriv något – ett tomt meddelande får poäng 0.</p> : <MessageResult text={text} />}
        <details>
          <summary>Visa alla ordpoäng som filtret har lärt sig</summary>
          <p className="hint">+1 för varje skräpmeddelande ordet finns i, −1 för varje vanligt meddelande.</p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
            {[...spamModel.entries()]
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'sv'))
              .map(([w, v]) => `${w} ${v > 0 ? '+' : ''}${v}`)
              .join(' · ')}
          </p>
        </details>
      </Panel>
      <Panel title="Testa termostaten">
        <Slider label="Temperatur i rummet" value={room} min={5} max={30} step={0.5} onChange={setRoom} format={(v) => `${sv(v)} °C`} />
        <Slider label="Inställd temperatur" value={setpoint} min={15} max={25} step={0.5} onChange={setSetpoint} format={(v) => `${sv(v)} °C`} />
        <LiveStatus>Termostaten: {thermostat(room, setpoint) === 'värmer' ? 'värmer (rummet är kallare än inställt)' : 'av'}.</LiveStatus>
      </Panel>
    </>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [answers, setAnswers] = useStoredState<Answers>('answers', {}, isAnswers);
  const [revealExp, setRevealExp] = useStoredState<boolean>('reveal', false, (v): v is boolean => typeof v === 'boolean');
  const [situation, setSituation] = useStoredState<string>('situation', 'vanlig', (v): v is string => typeof v === 'string');
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const score = scoreAnswers(answers);
  const reveal = guided ? setup.reveal : revealExp;
  const setAnswer = (id: string, c: Category) => setAnswers({ ...answers, [id]: c });

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vilka system lär sig av data?',
      body: (
        <>
          <p>Läs igenom de nio vardagssystemen. Vissa följer regler som människor har skrivit. Andra har lärt sig av exempel.</p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-antal',
              prompt: 'Hur många av de nio systemen tror du lär sig av data, helt eller delvis?',
              options: [
                { id: '0-2', text: '0–2' },
                { id: '3-5', text: '3–5' },
                { id: '6-9', text: '6–9' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'sortera',
      phase: 'prova',
      title: 'Sortera systemen',
      body: (
        <>
          <p>
            Välj för varje system: <strong>fasta regler</strong>, <strong>lärande system</strong> eller en <strong>kombination</strong>. Du kan ändra dig senare.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'ledtrad',
              prompt: 'Vilken ledtråd talar mest för att ett system är lärande?',
              options: [
                { id: 'a', text: 'Det har tränats på exempel och kan bli bättre av mer data', correct: true },
                { id: 'b', text: 'Det har en sensor som känner av omgivningen', feedback: 'Den automatiska dörren har en sensor men följer ändå en fast regel. En sensor ger indata – den gör inte systemet lärande.' },
                { id: 'c', text: 'Det känns smart och svarar snabbt', feedback: 'Miniräknaren är snabb och ”smart” på matte men följer bara inprogrammerade regler. Det som avgör är hur systemet har fått sina regler.' },
              ],
              explanation: 'Ett lärande system har fått sina regler från mönster i exempel, inte från en människa som skrev dem en och en.',
            }}
          />
        </>
      ),
    },
    {
      id: 'bedomning',
      phase: 'jamfor',
      title: 'Jämför med bedömningen',
      body: (
        <>
          <p>
            Nu visas en bedömning under varje system. Grönt med ✓ betyder välmotiverat, rött med ✗ svårt att motivera. Ändra gärna dina svar och se hur bedömningen ändras.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'antal-gransfall',
              prompt: 'Hur många av de nio systemen har mer än ett välmotiverat svar?',
              answer: 3,
              wrong: [
                { value: 9, feedback: 'Alla nio har minst ett välmotiverat svar. Frågan gäller de system där två olika svar båda går att motivera – de står som ”gränsfall”.' },
                { value: 0, feedback: 'Titta efter texten ”Gränsfall – också välmotiverat” eller ”Välmotiverat:” under korten. Sortera alla nio först om du inte ser den.' },
              ],
              hint: 'Räkna korten där bedömningen nämner fler än ett välmotiverat svar.',
              explanation: 'Skräppostfiltret, ansiktsupplåsningen och rättstavningen är gränsfall. Där beror svaret på vilken del av systemet man tittar på.',
            }}
          />
        </>
      ),
    },
    {
      id: 'gransfall',
      phase: 'forklara',
      title: 'Varför finns det gränsfall?',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'varfor-gransfall',
            prompt: 'Varför kan ansiktsupplåsningen kallas både ”lärande system” och ”kombination”?',
            options: [
              { id: 'a', text: 'Igenkänningen har lärts från bilder, men regeln om fem försök är fast. Svaret beror på om man ser till kärnan eller hela systemet.', correct: true },
              { id: 'b', text: 'För att ingen vet hur den fungerar', feedback: 'Vi vet ganska väl hur den är uppbyggd: en lärd modell för igenkänning plus fasta regler runt omkring. Gränsfallet beror på delarna, inte på okunskap.' },
              { id: 'c', text: 'För att den använder kameran', feedback: 'Kameran är en sensor. Den automatiska dörren har också en sensor men är inte ett gränsfall.' },
            ],
            explanation: 'Många verkliga system blandar lärda modeller med fasta regler. Ett bra svar säger vilken del man syftar på.',
          }}
        />
      ),
    },
    {
      id: 'situationer',
      phase: 'prova',
      title: 'Människa och modell i ovanliga situationer',
      body: (
        <>
          <p>
            Nu testar du två små modeller: en termostat med en fast regel och ett skräppostfilter som har lärt sig ordpoäng från tio påhittade meddelanden. Välj situation ovanför resultatet och jämför modellen med vad en människa skulle göra.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'engelska',
              prompt: 'Varför släpper filtret igenom skräpposten på engelska?',
              options: [
                { id: 'a', text: 'Inget av orden fanns i träningsexemplen, så alla får poäng 0', correct: true },
                { id: 'b', text: 'Filtret har förstått att meddelandet är ofarligt', feedback: 'Filtret förstår inget innehåll. Det lägger bara ihop poäng för ord det har sett förut – och här kände det inte igen ett enda.' },
                { id: 'c', text: 'Engelska meddelanden är aldrig skräppost', feedback: 'Det finns gott om skräppost på engelska. Filtret har bara aldrig sett engelska ord.' },
              ],
              explanation: 'Filtret kan inte generalisera till ett nytt språk. En människa ser direkt att det är samma lockbete.',
            }}
          />
        </>
      ),
    },
    {
      id: 'jamfor-formagor',
      phase: 'jamfor',
      title: 'Vad har människan som modellerna saknar?',
      body: (
        <Question
          spec={{
            kind: 'choice',
            id: 'mentor',
            prompt: 'Filtret stoppade mejlet från din mentor. Vilken förmåga saknade det framför allt?',
            options: [
              { id: 'a', text: 'Förståelse av sammanhanget: vem som skickade och varför', correct: true },
              { id: 'b', text: 'Generalisering till ett nytt språk', feedback: 'Mentorns mejl var på svenska och orden ”klicka” och ”här” var kända. Problemet var att filtret inte förstod sammanhanget.' },
              { id: 'c', text: 'Snabbhet', feedback: 'Filtret är mycket snabbt. Det svarar snabbt – men fel, eftersom det bara räknar ord.' },
            ],
            explanation: '”Klicka” (+3) och ”här” (+2) gav tillsammans med ”för” (−1) poängen 4, alltså skräp. Filtret vet inte att avsändaren är din mentor eller att friluftsdagen finns på riktigt.',
          }}
        />
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Förklara med egna ord',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'egen-situation',
            prompt: 'Välj ett av de nio systemen. Beskriv en situation där en människa skulle bedöma annorlunda än systemet, och förklara varför.',
            criteria: [
              'säger om systemet följer fasta regler, lär sig av data eller båda',
              'beskriver en konkret situation',
              'använder minst ett av orden förståelse, generalisering, erfarenhet eller situationsbedömning',
              'förklarar vad systemet saknar som människan har',
            ],
          }}
        />
      ),
    },
  ];

  const status =
    guided && setup.view === 'situations'
      ? 'Välj en situation för att se vad modellen gör.'
      : `Du har sorterat ${score.answered} av ${score.total} system.${reveal ? ` ${score.motivated} av dina ${score.answered} svar är välmotiverade.` : ''}`;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps.map((s) => ({ ...s, body: <Fragment key={s.id}>{s.body}</Fragment> }))} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && <Playground />}
      </div>
      <div className="lab-stack">
        {(!guided || setup.view === 'cards') && (
          <Panel title="Nio vardagssystem">
            <LiveStatus>{status}</LiveStatus>
            {!guided && (
              <div className="row">
                <button type="button" className="btn btn-primary" aria-pressed={revealExp} onClick={() => setRevealExp(!revealExp)}>
                  {revealExp ? 'Dölj bedömningen' : 'Visa bedömningen'}
                </button>
              </div>
            )}
            <SystemCards answers={answers} setAnswer={setAnswer} classify={guided ? setup.classify : true} reveal={reveal} />
          </Panel>
        )}
        {(!guided || setup.view === 'situations') && (
          <Panel title="Människa och modell">
            <SituationView situationId={situation} setSituation={setSituation} />
          </Panel>
        )}
        {(guided ? setup.compare : true) && (
          <Panel title="Jämför förmågor">
            <AbilityTable />
          </Panel>
        )}
      </div>
    </div>
  );
}
