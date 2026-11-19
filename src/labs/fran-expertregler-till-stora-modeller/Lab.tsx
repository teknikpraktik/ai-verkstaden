import { useEffect, useRef, useState } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { Panel, Segmented } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { byId, checkOrder, correctOrder, DRIVERS, driverName, driverSymbol, isOrder, move, startOrder, type Driver } from './logic';

type View = 'order' | 'timeline';
type Filter = Driver | 'alla';
const stepSetup: { view: View; drivers: boolean; decision: boolean }[] = [
  { view: 'order', drivers: false, decision: false },
  { view: 'order', drivers: false, decision: false },
  { view: 'timeline', drivers: false, decision: false },
  { view: 'timeline', drivers: true, decision: false },
  { view: 'timeline', drivers: true, decision: false },
  { view: 'timeline', drivers: false, decision: true },
];

interface Checked {
  order: string[];
  attempts: number;
}
const isChecked = (v: unknown): v is Checked | null => v === null || (typeof v === 'object' && v !== null && isOrder((v as Checked).order) && typeof (v as Checked).attempts === 'number');

function OrderList({ order, setOrder, checked, onCheck }: { order: string[]; setOrder: (o: string[]) => void; checked: Checked | null; onCheck: () => void }) {
  const refs = useRef(new Map<string, HTMLButtonElement | null>());
  const [focusNext, setFocusNext] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');
  useEffect(() => {
    if (focusNext) {
      refs.current.get(focusNext)?.focus();
      setFocusNext(null);
    }
  }, [focusNext, order]);

  const doMove = (i: number, d: -1 | 1) => {
    const id = order[i]!;
    const next = move(order, i, d);
    setOrder(next);
    const ni = i + d;
    const atEdge = ni === 0 || ni === next.length - 1;
    // behåll fokus på samma knapp om det går, annars på den andra knappen
    setFocusNext(atEdge ? `${id}:${d === -1 ? 'down' : 'up'}` : `${id}:${d === -1 ? 'up' : 'down'}`);
    setAnnounce(`${byId.get(id)!.title} flyttad till plats ${ni + 1} av ${next.length}.`);
  };

  const res = checked ? checkOrder(checked.order) : null;
  const sameAsChecked = checked !== null && checked.order.join() === order.join();
  return (
    <div>
      <ol className="h2-orderlist" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }} aria-label="Milstolpar, äldst först">
        {order.map((id, i) => {
          const m = byId.get(id)!;
          const mark = sameAsChecked ? (correctOrder[i] === id ? '✓' : '✗') : null;
          return (
            <li key={id} data-milestone={id} className="panel" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.4rem 0.6rem', background: mark === '✓' ? 'var(--ok-soft)' : mark === '✗' ? 'var(--bad-soft)' : undefined }}>
              <span aria-hidden="true" style={{ fontWeight: 800, minWidth: '1.5rem' }}>
                {i + 1}.
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong>{m.title}</strong>
                {mark && <span> {mark === '✓' ? '✓ rätt plats' : '✗ fel plats'}</span>}
              </span>
              <button type="button" className="btn" ref={(el) => void refs.current.set(`${id}:up`, el)} disabled={i === 0} onClick={() => doMove(i, -1)} aria-label={`Flytta upp ${m.title}`}>
                <span aria-hidden="true">↑</span>
              </button>
              <button type="button" className="btn" ref={(el) => void refs.current.set(`${id}:down`, el)} disabled={i === order.length - 1} onClick={() => doMove(i, 1)} aria-label={`Flytta ned ${m.title}`}>
                <span aria-hidden="true">↓</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>
      <div className="row" style={{ marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-primary" onClick={onCheck}>
          Kontrollera ordningen
        </button>
      </div>
      {res && (
        <div className={`callout ${res.done ? 'callout-tips' : 'callout-varning'}`} role="status" data-testid="ordning-resultat">
          {res.done ? (
            <p>
              <strong>✓ Rätt ordning!</strong> Alla {res.total} milstolpar står rätt. {checked!.attempts > 1 ? `Du behövde ${checked!.attempts} försök.` : ''}
            </p>
          ) : (
            <>
              <p>
                <strong>✗ Inte riktigt.</strong> {res.correctPositions} av {res.total} står på rätt plats. {res.inversions} par står i fel ordning sinsemellan.
              </p>
              {res.firstSwap && (
                <p>
                  Ledtråd: titta på <strong>{byId.get(res.firstSwap[0])!.title}</strong> och <strong>{byId.get(res.firstSwap[1])!.title}</strong>. Vilken av dem kom först? {hint(res.firstSwap)}
                </p>
              )}
              <p>Flytta och kontrollera igen.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function hint([a, b]: [string, string]): string {
  const ids = [a, b].sort().join('+');
  const tips: Record<string, string> = {
    'chatgpt+transformer': 'ChatGPT bygger på transformern – så vilken måste ha kommit först?',
    'alexnet+alphago': 'AlphaGo använde djupa neurala nätverk, som slog igenom med AlexNet.',
    'eliza+expertsystem': 'ELIZA var ett tidigt experiment med mönsterregler; expertsystemen byggde vidare på regeltanken i större skala.',
    'dartmouth+eliza': 'Begreppet AI myntades innan de första chattprogrammen.',
  };
  return tips[ids] ?? 'Tänk på vad som behövdes för att den andra skulle vara möjlig.';
}

function Timeline({ filter }: { filter: Filter }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem', borderLeft: '3px solid var(--border)', paddingLeft: '0.9rem' }} aria-label="Tidslinje" data-testid="tidslinje">
      {correctOrder.map((id) => {
        const m = byId.get(id)!;
        const ds = DRIVERS.filter((d) => d in m.drivers);
        const hit = filter !== 'alla' && filter in m.drivers;
        const dim = filter !== 'alla' && !hit;
        return (
          <li key={id} data-milestone={id} className="panel" style={{ opacity: dim ? 0.6 : 1, borderWidth: hit ? 3 : 1, borderColor: hit ? 'var(--accent)' : undefined }}>
            <p style={{ margin: 0 }}>
              <strong>{m.when}</strong> {hit && <span>◆ </span>}
              <strong>{m.title}</strong>
            </p>
            <p style={{ margin: '0.2rem 0' }}>{m.text}</p>
            <p className="hint" style={{ margin: 0 }}>
              Drivkrafter:{' '}
              {ds.map((d) => (
                <span key={d} className="chip" style={{ marginRight: '0.3rem' }}>
                  {driverSymbol[d]} = {driverName[d]}
                </span>
              ))}
            </p>
            {hit && <p style={{ margin: '0.2rem 0 0' }}>{m.drivers[filter as Driver]}</p>}
          </li>
        );
      })}
    </ol>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [order, setOrder] = useStoredState<string[]>('order', startOrder, isOrder);
  const [checked, setChecked] = useStoredState<Checked | null>('checked', null, isChecked);
  const [filter, setFilter] = useStoredState<Filter>('filter', 'alla', (v): v is Filter => v === 'alla' || DRIVERS.includes(v as Driver));
  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const view: View | 'both' = guided ? setup.view : 'both';
  const showDrivers = guided ? setup.drivers : true;

  const onCheck = () => setChecked({ order, attempts: (checked?.attempts ?? 0) + 1 });

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Hur gammal är AI?',
      body: (
        <Question
          spec={{
            kind: 'predict',
            id: 'gissa-begrepp',
            prompt: 'När tror du att begreppet ”artificiell intelligens” började användas?',
            options: [
              { id: '1950', text: 'På 1950-talet' },
              { id: '1980', text: 'På 1980-talet' },
              { id: '2000', text: 'På 2000-talet' },
              { id: '2010', text: 'På 2010-talet' },
            ],
          }}
        />
      ),
    },
    {
      id: 'ordna',
      phase: 'prova',
      title: 'Ordna milstolparna',
      body: (
        <p>
          Sätt de åtta milstolparna i tidsordning, äldst överst. Använd knapparna <strong>↑</strong> och <strong>↓</strong> (de går också att nå med Tab och trycka på med Enter). Tryck på <strong>Kontrollera ordningen</strong> när du är klar. Du kan försöka hur många gånger som helst.
        </p>
      ),
    },
    {
      id: 'tidslinje',
      phase: 'jamfor',
      title: 'Jämför med tidslinjen',
      body: (
        <>
          <p>Här är milstolparna med årtal. Jämför med din ordning och din förutsägelse.</p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'antal-ar',
              prompt: 'Hur många år gick det från mötet i Dartmouth till att ChatGPT släpptes?',
              unit: 'år',
              answer: 66,
              wrong: [
                { value: 56, feedback: '56 år är tiden från ELIZA (1966). Frågan gäller mötet i Dartmouth.' },
                { value: 25, feedback: '25 år är tiden från Deep Blue (1997). Frågan gäller mötet i Dartmouth.' },
              ],
              hint: 'Ta ChatGPT:s årtal minus Dartmouth-mötets årtal.',
              explanation: '2022 − 1956 = 66 år. Idéerna är alltså gamla – men det mesta av det du använder i dag har kommit de senaste femton åren.',
            }}
          />
        </>
      ),
    },
    {
      id: 'drivkrafter',
      phase: 'prova',
      title: 'Vad drev utvecklingen?',
      body: (
        <>
          <p>
            Välj en drivkraft ovanför tidslinjen. Milstolparna där den var viktig markeras med ◆ och en förklaring.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'deepblue-drivkraft',
              prompt: 'Vilken drivkraft var viktigast för att Deep Blue kunde slå världsmästaren 1997?',
              options: [
                { id: 'berakning', text: 'Beräkningskraft', correct: true },
                { id: 'data', text: 'Data', feedback: 'Deep Blue byggde främst på sökning bland möjliga drag och en värdering av ställningar som människor hade programmerat – inte på att lära sig av stora datamängder.' },
                { id: 'algoritmer', text: 'Algoritmer', feedback: 'Sökmetoderna för schack var kända sedan länge. Det nya var hårdvaran som kunde söka hundratals miljoner ställningar per sekund.' },
              ],
              explanation: 'Specialbyggda schackkretsar gjorde att Deep Blue kunde räkna mycket längre fram än tidigare datorer.',
            }}
          />
          <Question
            spec={{
              kind: 'choice',
              id: 'alexnet-drivkraft',
              multiple: true,
              prompt: 'Liknande neurala nätverk fanns redan på 1990-talet. Vilka två saker fanns 2012 som gjorde AlexNet möjligt?',
              options: [
                { id: 'data', text: 'Över en miljon märkta bilder i ImageNet', correct: true },
                { id: 'berakning', text: 'Grafikkort som kan göra många beräkningar samtidigt', correct: true },
                { id: 'investeringar', text: 'Miljardinvesteringar från techföretag', feedback: 'De stora investeringarna i djupinlärning kom framför allt efter genombrottet 2012, inte före.' },
              ],
              explanation: 'Mycket data och snabb beräkning gjorde att en gammal idé – neurala nätverk med många lager – plötsligt fungerade.',
            }}
          />
        </>
      ),
    },
    {
      id: 'forklara',
      phase: 'forklara',
      title: 'Drivkrafterna samverkar',
      body: (
        <>
          <Question
            spec={{
              kind: 'choice',
              id: 'chatgpt-drivkrafter',
              multiple: true,
              prompt: 'Vilka drivkrafter behövdes för att stora språkmodeller som ChatGPT skulle bli möjliga?',
              options: [
                { id: 'data', text: 'Data', correct: true },
                { id: 'berakning', text: 'Beräkningskraft', correct: true },
                { id: 'algoritmer', text: 'Algoritmer', correct: true },
                { id: 'investeringar', text: 'Investeringar', correct: true },
              ],
              explanation: 'Alla fyra: enorma textmängder, tusentals processorer, transformern från 2017 och stora investeringar. Ingen av dem hade räckt ensam.',
            }}
          />
          <Question
            spec={{
              kind: 'open',
              id: 'drivkraft-forklara',
              prompt: 'Välj en drivkraft och förklara hur den påverkade minst två av milstolparna.',
              criteria: ['nämner en drivkraft och två milstolpar med rätt ungefärlig tid', 'förklarar vad drivkraften gjorde möjligt', 'jämför: vad var annorlunda före och efter'],
            }}
          />
        </>
      ),
    },
    {
      id: 'vardag',
      phase: 'forklara',
      title: 'Ett vardagsbeslut',
      body: (
        <>
          <p>
            <em>Påhittat scenario:</em> Du är ute i skogen med en kompis som hittar en gul svamp. Kompisen fotograferar den med en app som svarar: <strong>”Kantarell – 92 % säker”</strong>. Kompisen vill steka den till middag.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'svamp',
              prompt: 'Vad är klokast att göra?',
              options: [
                { id: 'a', text: 'Inte äta svampen på appens ord, utan kontrollera med en svampkunnig person eller en bok du kan lita på', correct: true },
                { id: 'b', text: 'Äta den – 92 % är nästan säkert', feedback: '92 % betyder att appen ofta har fel i liknande fall. Det kan vara ett giftigt felsvar, och då är priset för ett fel mycket högt.' },
                { id: 'c', text: 'Ta en ny bild – får du samma svar igen är det säkert', feedback: 'Samma modell gör ofta samma fel på liknande bilder. Två likadana svar betyder inte att svaret är rätt.' },
              ],
              explanation: 'En bildmodell har lärt sig av de bilder den har tränats på och kan inte känna, lukta eller vända på svampen. När ett fel kan vara farligt behövs en människa som kan ta ansvar för bedömningen.',
            }}
          />
          <Question
            spec={{
              kind: 'open',
              id: 'eget-beslut',
              prompt: 'Beskriv ett beslut i din vardag där det spelar roll att förstå hur AI fungerar. Vad skulle du göra annorlunda tack vare det du vet?',
              criteria: ['beskriver ett konkret vardagsbeslut', 'säger vad AI-systemet bygger på (regler, data, modell)', 'förklarar en risk eller begränsning', 'beskriver vad du själv skulle göra'],
            }}
          />
        </>
      ),
    },
  ];


  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
      </div>
      <div className="lab-stack">
        {(view === 'order' || view === 'both') && (
          <Panel title="Ordna milstolparna – äldst överst">
            <OrderList order={order} setOrder={setOrder} checked={checked} onCheck={onCheck} />
            {!guided && (
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  setOrder(startOrder);
                  setChecked(null);
                }}
              >
                Blanda om från början
              </button>
            )}
          </Panel>
        )}
        {(view === 'timeline' || view === 'both') && (
          <Panel title="Tidslinje">
            {showDrivers && (
              <Segmented legend="Markera drivkraft" value={filter} options={[{ value: 'alla' as Filter, label: 'Ingen' }, ...DRIVERS.map((d) => ({ value: d as Filter, label: `${driverSymbol[d]} ${driverName[d]}` }))]} onChange={setFilter} />
            )}
            <Timeline filter={showDrivers ? filter : 'alla'} />
          </Panel>
        )}
      </div>
    </div>
  );
}
