import { useMemo } from 'react';
import '../../chapters/etik/etik.css';
import { keyedSteps } from '../../chapters/etik/keyedSteps';
import { BarChart } from '../../components/lab/Charts';
import { LiveStatus, NumberField, Panel, Segmented, SelectField } from '../../components/lab/Controls';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Question } from '../../components/lab/Questions';
import {
  DEFAULT_SEED,
  ROBOT_ROUNDS,
  WINDOW,
  clickItem,
  isStoredFeed,
  replay,
  robotChoice,
  simulate,
  summarizeData,
  topicById,
  topicIds,
  topics,
  variation,
  type FeedMode,
  type FeedState,
  type StoredFeed,
  type TopicId,
} from './logic';

const modeLabel: Record<FeedMode, string> = {
  engagemang: 'Engagemangsläge',
  variation: 'Variationsläge',
};

function TopicTag({ topic }: { topic: TopicId }) {
  const t = topicById.get(topic)!;
  return (
    <span className="etik-topic">
      <span className="etik-symbol" style={{ background: t.color }} aria-hidden="true">
        {t.symbol}
      </span>
      {t.name}
    </span>
  );
}

function VariationView({ state, title }: { state: FeedState; title: string }) {
  const v = variation(state.shown);
  return (
    <div>
      <p className="etik-meter" data-testid="variation">
        <strong>{title}:</strong> {v.distinct} av 6 ämnen bland de {v.n} senaste inläggen.
        {v.top && ` Vanligast: ${topicById.get(v.top)!.name} (${v.topCount} av ${v.n}).`}
      </p>
      <BarChart
        title={`Ämnen bland de ${v.n} senaste inläggen`}
        max={WINDOW}
        data={topics.map((t) => ({ label: `${t.symbol} ${t.name}`, value: v.counts[t.id], color: t.color }))}
      />
    </div>
  );
}

function Feed({ state, onClick, onRobot }: { state: FeedState; onClick: (i: number) => void; onRobot?: (n: number) => void }) {
  return (
    <div>
      <p className="hint">
        Sida {state.round + 1}. Välj det inlägg du helst vill se – då laddas nästa sida. ({modeLabel[state.mode]}, startvärde {state.seed})
      </p>
      <ul className="etik-cards" aria-label="Flödet just nu">
        {state.page.map((it, i) => (
          <li key={it.key}>
            <button
              type="button"
              className="etik-post"
              style={{ borderLeftColor: topicById.get(it.topic)!.color }}
              onClick={() => onClick(i)}
              aria-label={`Klicka på inlägget ”${it.title}” (${topicById.get(it.topic)!.name})`}
            >
              <TopicTag topic={it.topic} />
              <span>{it.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {onRobot && (
        <div className="row">
          <button type="button" className="btn" onClick={() => onRobot(1)}>
            Robot-eleven klickar 1 gång
          </button>
          <button type="button" className="btn" onClick={() => onRobot(5)}>
            Robot-eleven klickar 5 gånger
          </button>
        </div>
      )}
    </div>
  );
}

function DataPanel({ state }: { state: FeedState }) {
  const d = summarizeData(state);
  return (
    <Panel title="Det här har systemet sparat om dig" className="etik-data">
      {d.views === 0 ? (
        <p>Inget ännu. Klicka på några inlägg så ser du vad som loggas.</p>
      ) : (
        <>
          <dl className="etik-kv" data-testid="insamlat">
            <dt>Visade inlägg</dt>
            <dd>{d.views} (vilka och i vilken ordning)</dd>
            <dt>Klick</dt>
            <dd>
              {d.clicks}:{' '}
              {topicIds
                .filter((t) => state.clicks[t] > 0)
                .map((t) => `${topicById.get(t)!.name.toLowerCase()} ${state.clicks[t]}`)
                .join(', ')}
            </dd>
            <dt>Överhoppade</dt>
            <dd>
              {topicIds
                .filter((t) => d.skipped[t] > 0)
                .map((t) => `${topicById.get(t)!.name.toLowerCase()} ${d.skipped[t]}`)
                .join(', ') || '–'}
            </dd>
            <dt>Visningstid</dt>
            <dd>{d.totalSeconds} sekunder totalt, per inlägg (simulerad)</dd>
          </dl>
          <p>
            <strong>Slutsatser systemet kan dra:</strong>
          </p>
          <ul>
            {d.inferences.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="hint">
            Flödet i simuleringen använder bara <strong>klick per ämne</strong> för att välja inlägg. Visningstiden loggas ändå – precis som i många riktiga appar.
          </p>
        </>
      )}
    </Panel>
  );
}

function CompareTable() {
  const rows = useMemo(
    () =>
      (['engagemang', 'variation'] as FeedMode[]).map((m) => {
        const s = simulate(DEFAULT_SEED, m, ROBOT_ROUNDS);
        return { mode: m, state: s, v: variation(s.shown) };
      }),
    [],
  );
  return (
    <>
      <div className="etik-wrap">
        <table className="table" data-testid="jamforelse">
          <caption>
            Robot-eleven klickar {ROBOT_ROUNDS} gånger på spel (startvärde {DEFAULT_SEED}). Bara läget skiljer.
          </caption>
          <thead>
            <tr>
              <th scope="col">Läge</th>
              <th scope="col">Olika ämnen bland de {WINDOW} senaste</th>
              <th scope="col">Vanligaste ämnet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.mode}>
                <th scope="row">{modeLabel[r.mode]}</th>
                <td>{r.v.distinct} av 6</td>
                <td>{r.v.top ? `${topicById.get(r.v.top)!.name}: ${r.v.topCount} av ${r.v.n}` : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="etik-two">
        {rows.map((r) => (
          <VariationView key={r.mode} state={r.state} title={modeLabel[r.mode]} />
        ))}
      </div>
    </>
  );
}

const freshFeed = (seed: number, mode: FeedMode): StoredFeed => ({ seed, mode, choices: [] });

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [own, setOwn] = useStoredState<StoredFeed>('feed-guidad', freshFeed(DEFAULT_SEED, 'engagemang'), isStoredFeed);
  const [exp, setExp] = useStoredState<StoredFeed>('feed-experiment', freshFeed(DEFAULT_SEED, 'variation'), isStoredFeed);
  const [favourite, setFavourite] = useStoredState<TopicId>('robot-favorit', 'spel', (v): v is TopicId => topicIds.includes(v as TopicId));

  const stored = guided ? own : exp;
  const setStored = guided ? setOwn : setExp;
  const state = useMemo(() => replay(stored), [stored]);

  const click = (i: number) => setStored({ ...stored, choices: [...stored.choices, i] });
  const robot = (n: number) => {
    let s = state;
    const choices = [...stored.choices];
    for (let k = 0; k < n; k++) {
      const c = robotChoice(s.page, favourite);
      choices.push(c);
      s = clickItem(s, c);
    }
    setStored({ ...stored, choices });
  };

  const showCompare = guided ? step >= 2 : true;

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad händer med variationen?',
      body: (
        <>
          <p>
            Flödet visar fyra påhittade inlägg i taget från sex ämnen. Systemet räknar hur många gånger du klickar på varje ämne och väljer nästa sida utifrån det. Tänk dig en elev som <strong>alltid</strong> klickar på spel när det finns.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-variation',
              prompt: `Vad händer med antalet olika ämnen bland de ${WINDOW} senaste inläggen efter 15 klick på spel?`,
              options: [
                { id: 'okar', text: 'Det blir fler olika ämnen' },
                { id: 'samma', text: 'Ungefär lika många som i början' },
                { id: 'minskar', text: 'Det blir färre olika ämnen' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'prova',
      phase: 'prova',
      title: 'Styr ditt eget flöde',
      body: (
        <>
          <p>
            Klicka på minst fem inlägg i flödet till höger – välj det du själv skulle vilja se. Följ mätaren <em>olika ämnen bland de senaste {WINDOW}</em> och panelen med vad systemet har sparat.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vad-raknas',
              prompt: 'Vad använder flödet i den här simuleringen för att välja nästa sida?',
              options: [
                { id: 'klick', text: 'Hur många gånger du har klickat på varje ämne', correct: true },
                { id: 'asikt', text: 'Vad du tycker om inläggen', feedback: 'Systemet vet inte vad du tycker – bara vad du gör. Ett klick kan vara nyfikenhet, irritation eller ett misstag, men räknas likadant.' },
                { id: 'kvalitet', text: 'Vilka inlägg som är bäst eller mest sanna', feedback: 'Simuleringen bedömer inte kvalitet eller sanning alls. Det är vanligt att tro att flöden visar ”det bästa”, men de visar det som förväntas ge klick.' },
              ],
              explanation: 'Varje klick höjer ämnets vikt, och vikten är (1 + klick)². Därför tar ett ämne snabbt över när du klickar på det flera gånger.',
            }}
          />
        </>
      ),
    },
    {
      id: 'jamfor',
      phase: 'jamfor',
      title: 'Jämför två lägen',
      body: (
        <>
          <p>
            Nu klickar en <strong>robot-elev</strong> på spel {ROBOT_ROUNDS} gånger, med samma startvärde i båda lägena. Det enda som ändras är läget. I <strong>variationsläget</strong> går två av fyra platser på varje sida till andra ämnen än det du klickat mest på.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'antal-amnen',
              prompt: `Hur många olika ämnen finns bland de ${WINDOW} senaste inläggen i engagemangsläget?`,
              answer: 1,
              wrong: [
                { value: 4, feedback: '4 olika ämnen fanns bland de första 12 inläggen, innan robot-eleven hade klickat. Titta på raden för engagemangsläget i tabellen.' },
                { value: 5, feedback: '5 är resultatet i variationsläget. Frågan gäller engagemangsläget.' },
                { value: 12, feedback: '12 är antalet inlägg som mäts. Frågan gäller hur många olika ämnen de tillhör.' },
              ],
              hint: 'Läs av kolumnen ”Olika ämnen” på raden för engagemangsläget.',
              explanation: 'Alla 12 senaste inläggen handlar om spel. I variationsläget finns 5 ämnen och spel står för 6 av 12.',
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'varfor-variation',
              prompt: 'Varför blir det fler ämnen i variationsläget trots att robot-eleven klickar exakt likadant?',
              options: [
                { id: 'regel', text: 'Läget reserverar platser för andra ämnen, oavsett vad eleven klickar på', correct: true },
                { id: 'elev', text: 'Robot-eleven klickar på fler ämnen i variationsläget', feedback: 'Robot-eleven följer samma regel i båda lägena: klicka på spel om det finns. Skillnaden ligger i hur systemet väljer sidan.' },
                { id: 'slump', text: 'Det är bara slumpen', feedback: 'Båda lägena använder samma startvärde. Prova andra startvärden i experimentläget – variationsläget ger flera ämnen varje gång, eftersom två platser per sida alltid går till andra ämnen.' },
              ],
              explanation: 'Utfallet beror på systemets regler, inte bara på användaren. Den som bygger flödet bestämmer hur mycket utrymme andra ämnen får.',
            }}
          />
        </>
      ),
    },
    {
      id: 'data',
      phase: 'forklara',
      title: 'Vad vet systemet om dig?',
      body: (
        <>
          <p>Titta på panelen med insamlade uppgifter för ditt eget flöde. Varje rad i loggen gäller dig.</p>
          <Question
            spec={{
              kind: 'choice',
              id: 'behovs-data',
              multiple: true,
              prompt: 'Vilka uppgifter behöver flödet i simuleringen faktiskt för att välja inlägg?',
              options: [
                { id: 'klick', text: 'Antal klick per ämne', correct: true },
                { id: 'tid', text: 'Hur länge varje inlägg syntes', feedback: 'Visningstiden loggas, men simuleringen använder den aldrig för att välja inlägg. Att samla in sådant ”för säkerhets skull” strider mot tanken med dataminimering.' },
                { id: 'lista', text: 'En lista över alla inlägg du har hoppat över', feedback: 'Det räcker att veta antal klick per ämne. Den detaljerade listan över vad du hoppat över används inte – men den kan avslöja mycket om dig.' },
              ],
              explanation: 'Flödet klarar sig med sex tal: klick per ämne. Resten av loggen är insamling som inte behövs för ändamålet.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Ditt ställningstagande',
      body: (
        <Question
          spec={{
            kind: 'open',
            id: 'motivera-flode',
            prompt: 'Vilket läge borde vara standard i en app för unga, och vilka uppgifter borde appen få spara? Motivera med vad du såg i labben.',
            criteria: [
              'Jag använder resultatet från jämförelsen (antal ämnen i de två lägena).',
              'Jag tar upp minst en nackdel med mitt val, till exempel färre klick eller mindre träffsäkerhet.',
              'Jag kopplar till integritet: vilka uppgifter som behövs och vilka som inte behövs.',
              'Jag nämner vem som bör få bestämma läget (användaren, företaget, någon annan).',
            ],
          }}
        />
      ),
    },
  ];

  const v = variation(state.shown);

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={keyedSteps(steps)} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Inställningar">
            <Segmented
              legend="Läge"
              value={exp.mode}
              options={[
                { value: 'engagemang', label: 'Engagemang' },
                { value: 'variation', label: 'Variation' },
              ]}
              onChange={(m) => setExp(freshFeed(exp.seed, m))}
            />
            <NumberField label="Startvärde för slumpen" value={exp.seed} min={1} max={9999} onChange={(s) => setExp(freshFeed(Math.max(1, Math.round(s)), exp.mode))} />
            <SelectField
              label="Robot-elevens favoritämne"
              value={favourite}
              options={topics.map((t) => ({ value: t.id, label: t.name }))}
              onChange={setFavourite}
            />
            <p className="hint">Ändra en sak i taget. Byte av läge eller startvärde startar ett nytt flöde.</p>
          </Panel>
        )}
      </div>
      <div className="lab-stack">
        <Panel title={guided ? 'Ditt flöde (engagemangsläge)' : `Flöde i ${modeLabel[exp.mode].toLowerCase()}`}>
          <Feed state={state} onClick={click} onRobot={guided ? undefined : robot} />
          <LiveStatus>
            {stored.choices.length === 0
              ? 'Inga klick än.'
              : `${stored.choices.length} klick. ${v.distinct} av 6 ämnen bland de ${v.n} senaste inläggen.`}
          </LiveStatus>
          <VariationView state={state} title="Variation" />
          {stored.choices.length > 0 && (
            <button type="button" className="btn btn-quiet" onClick={() => setStored({ ...stored, choices: [] })}>
              Töm flödet och börja om
            </button>
          )}
        </Panel>
        {showCompare && (
          <Panel title="Jämförelse: engagemang eller variation">
            <CompareTable />
          </Panel>
        )}
        <DataPanel state={state} />
      </div>
    </div>
  );
}
