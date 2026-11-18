# Kontrakt för labbar (gäller alla arbetsströmmar)

Fastställt efter det lodräta snittet (labb 7, `src/labs/bredden-forst-och-djupet-forst/`). Använd den som mall.

## Filer per labb – `src/labs/<id>/`

| Fil | Innehåll |
|---|---|
| `meta.ts` | `defineLab({...})`: id (= mappnamn, ändras aldrig), number, part, title, summary, goals, prerequisites, prerequisiteLabs, minutes, concepts (begrepps-id), keywords (ämnesregister), coverage (delämne → elevresultat → verifiering), labels (`forenklad`, `syntetisk`, `pahittad`, `simulering`). |
| `content.ts` | `defineContent({ intro, sections, conclusion, deepDives? })` – statisk text som Astro renderar runt arbetsytan. Block: sträng (stycke), `list`, `pseudo`, `formula`, `note`, `table`. |
| `Lab.tsx` | Default export: arbetsytan (React). Renderas i `LabHost` som ger läge (genomgång/experiment), "Börja om" och felhantering. |
| `teacher.ts` | `defineTeacher({ purpose, tips, misconceptions, discussionStops, answers, sources? })` – facit och exempelresonemang. **Facit för öppna frågor ligger här, inte i labben.** |
| `logic.ts` + `logic.test.ts` | Algoritmer och data, fria från React. Enhetstester med kända utfall och kantfall. |
| `concepts.ts` (valfri) | `defineConcepts([...])` för labbspecifika begrepp som inte finns i `src/course/glossary.ts`. |
| övriga | Lokala komponenter och data får läggas i mappen. |

Textmarkering i content/teacher: `**fet**`, `*kursiv*`, `` `kod` ``, `[[begrepps-id]]`, `[[begrepps-id|text]]`, `[text](/labb/annan-labb/)`, `[text](https://...)`. Okända begrepps-id fångas av `src/course/registry.test.ts`.

## Delade byggstenar (ändras bara av huvudagenten)

- `components/lab/LabContext.tsx`: `useLab()` → `{ labId, mode }`; `useStoredState(key, initial, validate)` sparar under `lab:<id>:<key>` och rensas av "Börja om". **Validera alltid** sparad data som kan ha fel form.
- `components/lab/GuidedSteps.tsx`: steg med faser `forutsag → prova → jamfor → forklara`. I genomgångsläget visas ett steg i taget; använd `useGuidedStep()` + `index`/`onStepChange` om arbetsytan ska anpassas efter steget.
- `components/lab/Questions.tsx`: `Question spec={...}` med `kind: 'choice' | 'numeric' | 'open' | 'predict'`. Fel alternativ ska ha `feedback` som förklarar varför felsvaret är vanligt. Öppna frågor har `criteria`; exempelresonemang i `teacher.ts`.
- `components/lab/Stepper.tsx`: `useStepper(frameCount)` + `StepperControls` för algoritmförlopp (förberäknade ögonblicksbilder; ingen autostart).
- `components/lab/Controls.tsx`: `Slider`, `NumberField`, `Toggle`, `SelectField`, `Segmented`, `Panel`, `LiveStatus`, `Legend`.
- `components/lab/Grid.tsx`: tillgängligt rutnät (piltangenter, Enter, klick; `coordinates`).
- `components/lab/Charts.tsx`: `PlotFrame` (SVG med axlar och klick→datakoordinat), `BarChart`, `ConfusionMatrix`, `ratioText`.
- `lib/random.ts`: `createRng(seed)`, `shuffle`, `gaussian`. All slump ska vara reproducerbar med startvärde.
- `lib/search.ts`: BFS/DFS/UCS/girig/A* med ögonblicksbilder, `gridGraph`, `fromEdgeList`, `manhattan`, `buildSearchTree`.
- CSS-klasser: `lab-layout` (reglage | visualisering), `lab-stack`, `panel`, `row`, `btn btn-primary`, `table`, `callout callout-<kind>`, `cell-*`, `datastructure`. Färgtokens `--c1..--c6`, `--ok`, `--bad` m.fl. Inline-SVG ska använda `var(--...)` så att mörkt läge fungerar.

## Pedagogiska krav per labb

1. Ett fungerande scenario är laddat från start.
2. Genomgångsläget visar en sak i taget (förutsäg → prova → jämför → förklara); experimentläget öppnar fler reglage.
3. Minst en kontrollerbar fråga med automatisk återkoppling och förklarade felsvar; minst en öppen fråga eller ett förklarasteg.
4. En jämförelse där en parameter ändras i taget när det är pedagogiskt relevant.
5. Synligt resultat (text, inte bara grafik). Färg kompletteras alltid med symbol eller text.
6. Märk förenklingar, syntetiska data och påhittade scenarier (`labels` i meta + `note` i content).
7. Allt ska gå med tangentbord; dragning har alltid ett alternativ (knappar, sifferfält, piltangenter).
8. Svenska exempel, inga verkliga personuppgifter.

## Tester

- Enhetstester (`vitest`) i labbens mapp för all logik, med kända utfall som också används i labbens text.
- Playwright: minst en kärnlabb per kapitel i `tests/e2e/<kapitel>.spec.ts` (förutsäg, interaktion, kontrollerat resultat, rätt/fel återkoppling, gärna progression efter omladdning). Hjälpare i `tests/e2e/helpers.ts`.
- `tests/e2e/routes.spec.ts` kontrollerar automatiskt att varje labb laddar utan konsolfel och utan horisontell rullning.
- Kör `npx astro preview` med `--ignore-lock` (Astro 7 startar annars i bakgrunden).
