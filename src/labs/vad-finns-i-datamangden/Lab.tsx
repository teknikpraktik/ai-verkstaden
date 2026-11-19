import { useMemo, useState } from 'react';
import { GuidedSteps, useGuidedStep, type GuidedStep } from '../../components/lab/GuidedSteps';
import { useLab, useStoredState } from '../../components/lab/LabContext';
import { BarChart, ratioText } from '../../components/lab/Charts';
import { Legend, LiveStatus, NumberField, Panel, Segmented, Toggle } from '../../components/lab/Controls';
import { Question } from '../../components/lab/Questions';
import { addBatch, baseApples, COLORS, countPixels, farmName, findImbalances, isAppleList, LABELS, summarize, toImage, toText, type Apple, type Color, type Label, type Pixel } from './logic';

const skinColor: Record<Color, string> = { röd: 'var(--bad)', grön: 'var(--ok)', gul: 'var(--c5)' };
const pixelName: Record<Pixel, string> = { 0: 'bakgrund', 1: 'skal', 2: 'fläck', 3: 'skaft' };

/** Vad som visas i varje genomgångssteg. */
const stepSetup = [
  { inspect: false, summary: false, collectA: false, collectB: false },
  { inspect: true, summary: false, collectA: false, collectB: false },
  { inspect: true, summary: false, collectA: false, collectB: false },
  { inspect: false, summary: true, collectA: false, collectB: false },
  { inspect: false, summary: true, collectA: true, collectB: false },
  { inspect: false, summary: true, collectA: true, collectB: true },
  { inspect: false, summary: true, collectA: true, collectB: true },
];

function PixelImage({ apple, asNumbers }: { apple: Apple; asNumbers: boolean }) {
  const img = toImage(apple);
  const fill = (p: Pixel) => (p === 0 ? 'var(--surface)' : p === 1 ? skinColor[apple.color] : p === 2 ? 'var(--wall)' : 'var(--c3)');
  return (
    <figure style={{ margin: 0 }}>
      <div
        role="img"
        aria-label={`Bild av äpple nr ${apple.id}: 8 × 8 pixlar. ${countPixels(img, 1)} skalpixlar (${apple.color}), ${countPixels(img, 2)} fläckpixlar och ${countPixels(img, 3)} skaftpixel.`}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1.6rem)', gap: 1, width: 'max-content', border: '1px solid var(--border)', background: 'var(--border)' }}
      >
        {img.flat().map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            title={pixelName[p]}
            style={{
              width: '1.6rem',
              height: '1.6rem',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: asNumbers ? 'var(--surface)' : fill(p),
              color: 'var(--text)',
            }}
          >
            {asNumbers ? p : p === 2 ? '•' : ''}
          </span>
        ))}
      </div>
      <figcaption className="hint">{asNumbers ? 'Varje tal är en pixel: 0 bakgrund, 1 skal, 2 fläck, 3 skaft.' : 'Fläckar är markerade med •.'}</figcaption>
    </figure>
  );
}

function DataTable({ apples, selected, onSelect }: { apples: Apple[]; selected: number | null; onSelect: (id: number) => void }) {
  if (apples.length === 0) return <p data-testid="tom">Datamängden är tom. Samla in nya äpplen eller återställ.</p>;
  return (
    <div className="table-wrap" style={{ maxHeight: '26rem', overflowY: 'auto' }} tabIndex={0} aria-label="Datamängden, rullbar tabell">
      <table className="table" data-testid="datatabell">
        <caption>
          Datamängden: {apples.length} observationer (en rad = ett äpple)
        </caption>
        <thead>
          <tr>
            <td />
            <th scope="colgroup" colSpan={4} style={{ textAlign: 'center' }}>
              Egenskaper
            </th>
            <th scope="col" style={{ textAlign: 'center' }}>
              Etikett
            </th>
          </tr>
          <tr>
            <th scope="col">Nr</th>
            <th scope="col">Gård</th>
            <th scope="col">Vikt (g)</th>
            <th scope="col">Färg</th>
            <th scope="col">Fläckar</th>
            <th scope="col">Godkänd?</th>
          </tr>
        </thead>
        <tbody>
          {apples.map((a) => (
            <tr key={a.id} style={a.id === selected ? { background: 'var(--accent-soft)' } : undefined}>
              <th scope="row">
                <button type="button" className="btn btn-quiet" aria-pressed={a.id === selected} onClick={() => onSelect(a.id)} aria-label={`Visa äpple nr ${a.id}`} style={{ minWidth: '2.75rem' }}>
                  {a.id === selected ? '▶ ' : ''}
                  {a.id}
                </button>
              </th>
              <td>{a.farm}</td>
              <td>{a.weight}</td>
              <td>{a.color}</td>
              <td>{a.spots}</td>
              <td>{a.label === 'godkänd' ? '✓ godkänd' : '✗ kasseras'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryView({ apples }: { apples: Apple[] }) {
  const s = summarize(apples);
  const imb = findImbalances(s);
  return (
    <div data-testid="sammanstallning">
      <p>
        <strong>{s.total} observationer.</strong> {s.total > 0 && `Kasseras: ${ratioText(s.byLabel.kasseras, s.total)}. Gröna äpplen: ${ratioText(s.byColor.grön, s.total)}.`}
      </p>
      {s.total > 0 && (
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
          <BarChart title="Etiketter" max={s.total} data={LABELS.map((l) => ({ label: l === 'godkänd' ? '✓ godkänd' : '✗ kasseras', value: s.byLabel[l], color: l === 'godkänd' ? 'var(--ok)' : 'var(--bad)' }))} format={(v) => String(v)} />
          <BarChart title="Färg" max={s.total} data={COLORS.map((c) => ({ label: c, value: s.byColor[c], color: skinColor[c] }))} format={(v) => String(v)} />
        </div>
      )}
      {imb.length > 0 && (
        <div className="callout callout-varning">
          <p className="callout-title">Obalans i datamängden</p>
          <ul>
            {imb.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CollectCompare() {
  const rows = useMemo(
    () => [
      { name: 'Startdatamängden', s: summarize(baseApples) },
      { name: '+ 20 från gård A (samma urval)', s: summarize(addBatch(baseApples, 'A', 1)) },
      { name: '+ 20 från gård B (annat urval)', s: summarize(addBatch(baseApples, 'B', 1)) },
    ],
    [],
  );
  return (
    <div className="table-wrap">
      <table className="table" data-testid="insamling-jamforelse">
        <caption>Samma antal nya äpplen – bara urvalet skiljer</caption>
        <thead>
          <tr>
            <th scope="col">Datamängd</th>
            <th scope="col">Antal</th>
            <th scope="col">Kasseras</th>
            <th scope="col">Gröna</th>
            <th scope="col">Gula</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <th scope="row">{r.name}</th>
              <td>{r.s.total}</td>
              <td>{ratioText(r.s.byLabel.kasseras, r.s.total)}</td>
              <td>{r.s.byColor.grön}</td>
              <td>{r.s.byColor.gul}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Inspector({ apple, asNumbers, setAsNumbers }: { apple: Apple; asNumbers: boolean; setAsNumbers: (v: boolean) => void }) {
  return (
    <div data-testid="inspektor">
      <p>
        <strong>Observation:</strong> äpple nr {apple.id}. Samma äpple kan sparas som tabellrad, bild eller text:
      </p>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))' }}>
        <section>
          <h4>Tabelldata</h4>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.1rem 0.75rem', margin: 0 }}>
            <dt>Vikt</dt>
            <dd style={{ margin: 0 }}>{apple.weight} g (egenskap)</dd>
            <dt>Färg</dt>
            <dd style={{ margin: 0 }}>{apple.color} (egenskap)</dd>
            <dt>Fläckar</dt>
            <dd style={{ margin: 0 }}>{apple.spots} (egenskap)</dd>
            <dt>Gård</dt>
            <dd style={{ margin: 0 }}>{farmName[apple.farm]} (egenskap)</dd>
            <dt>
              <strong>Etikett</strong>
            </dt>
            <dd style={{ margin: 0 }}>
              <strong>{apple.label}</strong>
            </dd>
          </dl>
        </section>
        <section>
          <h4>Bilddata</h4>
          <PixelImage apple={apple} asNumbers={asNumbers} />
          <Toggle label="Visa bilden som tal" checked={asNumbers} onChange={setAsNumbers} />
        </section>
        <section>
          <h4>Textdata</h4>
          <blockquote style={{ margin: 0, fontStyle: 'italic' }} data-testid="textdata">
            ”{toText(apple)}”
          </blockquote>
          <p className="hint">Kontrollantens anteckning. Ord i stället för tal.</p>
        </section>
      </div>
    </div>
  );
}

export default function Lab() {
  const { mode } = useLab();
  const guided = mode === 'guided';
  const [step, setStep] = useGuidedStep();
  const [selected, setSelected] = useStoredState<number | null>('selected', 8, (v): v is number | null => v === null || typeof v === 'number');
  const [asNumbers, setAsNumbers] = useState(false);
  const [gotA, setGotA] = useStoredState<boolean>('guided-a', false, (v): v is boolean => typeof v === 'boolean');
  const [gotB, setGotB] = useStoredState<boolean>('guided-b', false, (v): v is boolean => typeof v === 'boolean');
  const [custom, setCustom] = useStoredState<Apple[]>('apples', baseApples, isAppleList);
  const [batches, setBatches] = useStoredState<{ A: number; B: number }>('batches', { A: 0, B: 0 }, (v): v is { A: number; B: number } => typeof v === 'object' && v !== null && typeof (v as { A: unknown }).A === 'number' && typeof (v as { B: unknown }).B === 'number');

  const setup = stepSetup[Math.min(step, stepSetup.length - 1)]!;
  const guidedApples = useMemo(() => {
    let a = baseApples;
    if (setup.collectA && gotA) a = addBatch(a, 'A', 1);
    if (setup.collectB && gotB) a = addBatch(a, 'B', 1);
    return a;
  }, [setup.collectA, setup.collectB, gotA, gotB]);
  const apples = guided ? guidedApples : custom;
  const current = apples.find((a) => a.id === selected) ?? apples[0] ?? null;

  const updateApple = (id: number, patch: Partial<Apple>) => setCustom(custom.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const collectExp = (farm: 'A' | 'B') => {
    const k = batches[farm] + 1;
    setCustom(addBatch(custom, farm, k));
    setBatches({ ...batches, [farm]: k });
  };

  const steps: GuidedStep[] = [
    {
      id: 'forutsag',
      phase: 'forutsag',
      title: 'Vad händer om ni samlar in mer?',
      body: (
        <>
          <p>
            Ett äppelpackeri vill att en modell ska avgöra om äpplen ska <strong>godkännas</strong> eller <strong>kasseras</strong>. Tabellen visar de 20 äpplen som de har samlat in hittills, alla från gård A. Snart ska packeriet ta emot äpplen från fler gårdar.
          </p>
          <Question
            spec={{
              kind: 'predict',
              id: 'gissa-grona',
              prompt: 'Packeriet samlar in 20 äpplen till från gård A. Hur många gröna äpplen tror du finns i datamängden efter det?',
              options: [
                { id: 'inga', text: 'Inga' },
                { id: 'nagra', text: 'Några stycken' },
                { id: 'halften', text: 'Ungefär hälften' },
              ],
            }}
          />
        </>
      ),
    },
    {
      id: 'begrepp',
      phase: 'prova',
      title: 'Observation, egenskap och etikett',
      body: (
        <>
          <p>
            Välj ett äpple i tabellen med knappen i kolumnen <strong>Nr</strong>. Varje rad är en <strong>observation</strong>. Kolumnerna gård, vikt, färg och fläckar är <strong>egenskaper</strong>. Den sista kolumnen är <strong>etiketten</strong> – svaret som modellen ska lära sig att ge.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vad-ar-etikett',
              prompt: 'Vad är etiketten för äpple nr 8?',
              options: [
                { id: 'a', text: 'Att det kasseras', correct: true },
                { id: 'b', text: 'Att det har 4 fläckar', feedback: 'Antalet fläckar är en egenskap – något som går att mäta på äpplet. Etiketten är det svar modellen ska lära sig att förutsäga.' },
                { id: 'c', text: 'Hela raden med nummer 8', feedback: 'Hela raden är en observation, alltså ett exempel. Etiketten är bara den del av raden som är facit.' },
              ],
              explanation: 'Etiketten ”kasseras” har en människa satt. Modellen ska lära sig att gissa etiketten utifrån egenskaperna.',
            }}
          />
        </>
      ),
    },
    {
      id: 'former',
      phase: 'jamfor',
      title: 'Bild, text och tabell',
      body: (
        <>
          <p>
            Samma äpple kan sparas på flera sätt. Slå på <strong>Visa bilden som tal</strong> och se att en bild för en dator bara är 64 tal. Jämför med tabellraden och texten.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'tre-former',
              prompt: 'Vilket påstående stämmer om äpple nr 8 i de tre formerna?',
              options: [
                { id: 'a', text: 'I tabellen står antalet fläckar direkt, men i bilden måste fläckarna hittas bland 64 pixeltal', correct: true },
                { id: 'b', text: 'Alla tre formerna innehåller exakt samma egenskaper', feedback: 'Titta efter vikten: tabellen har den exakt (133 g), texten säger bara ”medelstort” och bilden visar bara ungefärlig storlek. Gården syns inte alls i bilden.' },
                { id: 'c', text: 'Text och bilder kan inte användas som data, bara tabeller', feedback: 'Bilder och texter är vanliga data för AI. De måste bara göras om till tal först, som pixlarna här.' },
              ],
              explanation: 'Tabelldata har färdiga egenskaper i kolumner. I bild- och textdata måste egenskaperna först tas fram ur pixlar eller ord.',
            }}
          />
        </>
      ),
    },
    {
      id: 'obalans',
      phase: 'prova',
      title: 'Hitta obalansen',
      body: (
        <>
          <p>Sammanställningen räknar etiketter och färger i hela datamängden.</p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'andel-kasseras',
              prompt: 'Hur stor andel av äpplena har etiketten ”kasseras”? Svara i procent.',
              unit: '%',
              answer: 15,
              wrong: [
                { value: 3, feedback: '3 är antalet kasserade äpplen. Andelen får du genom att dela med alla 20 äpplen.' },
                { value: 85, feedback: '85 % är andelen godkända. Frågan gäller de kasserade.' },
              ],
              hint: 'Dela antalet kasserade med antalet äpplen totalt och gör om till procent.',
              explanation: '3 av 20 är 15 %. Modellen får alltså bara tre exempel på hur ett kasserat äpple ser ut. Och den har inte sett ett enda grönt äpple.',
            }}
          />
        </>
      ),
    },
    {
      id: 'samma-urval',
      phase: 'prova',
      title: 'Samla in mer från samma urval',
      body: (
        <>
          <p>
            Tryck på <strong>Samla in 20 äpplen från gård A</strong> och titta på sammanställningen igen.
          </p>
          <Question
            spec={{
              kind: 'numeric',
              id: 'grona-efter',
              prompt: 'Hur många gröna äpplen finns i datamängden nu?',
              answer: 0,
              wrong: [
                { value: 20, feedback: '20 är antalet nya äpplen. Titta på stapeln för gröna i sammanställningen.' },
                { value: 40, feedback: '40 är antalet äpplen totalt. Hur många av dem är gröna?' },
              ],
              hint: 'Läs av stapeln ”grön” i sammanställningen efter insamlingen.',
              explanation: 'Fortfarande 0. Gård A odlar bara röda äpplen, så fler exempel från samma gård ger aldrig gröna. Andelen kasserade är också densamma: 6 av 40 (15 %).',
            }}
          />
        </>
      ),
    },
    {
      id: 'annat-urval',
      phase: 'jamfor',
      title: 'Ändra urvalet i stället',
      body: (
        <>
          <p>
            Nu samlar du in lika många äpplen, men från <strong>gård B</strong>. Bara urvalet ändras. Jämför raderna i tabellen <em>Samma antal nya äpplen</em>.
          </p>
          <Question
            spec={{
              kind: 'choice',
              id: 'vad-hjalper',
              prompt: 'Vad behöver packeriet göra för att modellen ska fungera för gröna äpplen?',
              options: [
                { id: 'a', text: 'Samla in äpplen från gårdar som odlar gröna sorter och sätta etiketter på dem', correct: true },
                { id: 'b', text: 'Samla in 1 000 äpplen till från gård A', feedback: 'Hur många du än samlar från gård A blir det inga gröna. Mer data från samma urval ger samma skeva bild.' },
                { id: 'c', text: 'Ändra etiketterna så att fler äpplen kasseras', feedback: 'Etiketterna ska beskriva verkligheten. Att ändra dem gör inte att modellen får se gröna äpplen.' },
              ],
              explanation: 'Med 20 äpplen från gård B kom 11 gröna och 3 gula med. Det är urvalet, inte mängden, som avgör vad modellen kan lära sig.',
            }}
          />
        </>
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
            id: 'forklara-urval',
            prompt: 'Förklara för packeriets chef varför det inte räcker att samla in många fler äpplen från gård A. Använd orden observation, egenskap och etikett.',
            criteria: [
              'använder observation, egenskap och etikett på rätt sätt',
              'beskriver obalansen med siffror, till exempel 0 gröna eller 3 av 20 kasserade',
              'förklarar att fler exempel från samma urval ger samma skeva fördelning',
              'föreslår vad som behöver ändras i insamlingen',
            ],
          }}
        />
      ),
    },
  ];

  const s = summarize(apples);
  const status = s.total === 0 ? 'Datamängden är tom.' : `Datamängden har ${s.total} äpplen: ${s.byLabel.kasseras} kasseras, ${s.byColor.grön} gröna, ${s.byFarm.B} från gård B.`;
  const showInspect = guided ? setup.inspect : true;
  const showSummary = guided ? setup.summary : true;

  return (
    <div className="lab-layout">
      <div className="lab-stack">
        <GuidedSteps steps={steps} index={step} onStepChange={(i) => setStep(i)} />
        {!guided && (
          <Panel title="Ändra datamängden">
            <div className="row">
              <button type="button" className="btn" onClick={() => collectExp('A')}>
                Samla in 20 från gård A
              </button>
              <button type="button" className="btn" onClick={() => collectExp('B')}>
                Samla in 20 från gård B
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  setCustom(baseApples);
                  setBatches({ A: 0, B: 0 });
                  setSelected(8);
                }}
              >
                Återställ
              </button>
            </div>
            {current ? (
              <>
                <h4>Äpple nr {current.id}</h4>
                <Segmented legend="Etikett" value={current.label} options={LABELS.map((l) => ({ value: l, label: l }))} onChange={(v: Label) => updateApple(current.id, { label: v })} />
                <NumberField label="Fläckar" value={current.spots} min={0} max={9} onChange={(v) => updateApple(current.id, { spots: Math.max(0, Math.min(9, Math.round(v))) })} />
                <NumberField label="Vikt (g)" value={current.weight} min={50} max={300} onChange={(v) => updateApple(current.id, { weight: Math.max(50, Math.min(300, Math.round(v))) })} />
                <p className="hint">Etiketten sätts av en människa. Om du ändrar fläckar eller vikt ändras inte etiketten av sig själv.</p>
                <button type="button" className="btn btn-danger" onClick={() => setCustom(custom.filter((a) => a.id !== current.id))}>
                  Ta bort äpple nr {current.id}
                </button>
              </>
            ) : (
              <p>Inga äpplen kvar att ändra.</p>
            )}
          </Panel>
        )}
      </div>

      <div className="lab-stack">
        <Panel title="Datamängd: äpplen på packeriet">
          {guided && setup.collectA && (
            <div className="row">
              <button type="button" className="btn btn-primary" disabled={gotA} onClick={() => setGotA(true)}>
                {gotA ? '✓ 20 äpplen från gård A insamlade' : 'Samla in 20 äpplen från gård A'}
              </button>
              {setup.collectB && (
                <button type="button" className="btn btn-primary" disabled={gotB} onClick={() => setGotB(true)}>
                  {gotB ? '✓ 20 äpplen från gård B insamlade' : 'Samla in 20 äpplen från gård B'}
                </button>
              )}
            </div>
          )}
          <LiveStatus>{status}</LiveStatus>
          {showInspect && current && <Inspector apple={current} asNumbers={asNumbers} setAsNumbers={setAsNumbers} />}
          {showSummary && <SummaryView apples={apples} />}
          <DataTable apples={apples} selected={current?.id ?? null} onSelect={setSelected} />
          <Legend
            items={[
              { swatch: 'var(--ok-soft)', symbol: '✓', text: 'Godkänd' },
              { swatch: 'var(--bad-soft)', symbol: '✗', text: 'Kasseras' },
              { swatch: 'var(--accent-soft)', symbol: '▶', text: 'Valt äpple' },
            ]}
          />
        </Panel>
        {(guided ? setup.collectB : true) && (
          <Panel title="Jämförelse av insamlingar">
            <CollectCompare />
          </Panel>
        )}
      </div>
    </div>
  );
}
