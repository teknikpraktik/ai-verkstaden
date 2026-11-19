# AI-verkstaden

Interaktiva laborationer för gymnasiekursen **Artificiell intelligens** (nivå 1). Webbplatsen har sex kapitel, 26 laborationer, ett avslutande projekt, en reflektionssida, en sökbar begreppslista med ämnesregister och en lärarhandledning. Allt innehåll är skrivet för webbplatsen.

Eleverna arbetar enligt **förutsäg → prova → jämför → förklara**. Varje labb har ett genomgångsläge (ett steg i taget) och ett experimentläge (alla reglage), automatisk återkoppling på kontrollerbara frågor, kriterier för öppna frågor och knappen *Börja om*.

## Krav

- Node.js 22 eller senare och npm (låsfilen `package-lock.json` ska användas).
- För webbläsartester: Chromium via Playwright (`npx playwright install chromium` om den saknas).

## Kom igång

```bash
npm ci
```

```bash
npm run dev
```

Öppna adressen som skrivs ut (normalt http://localhost:4321/).

## Kontroller

| Kommando | Vad det gör |
|---|---|
| `npm run lint` | ESLint (TypeScript, React-hooks, jsx-a11y) |
| `npm run check` | Typkontroll av Astro- och TypeScript-filer (`astro check`) |
| `npm test` | Enhetstester (Vitest): algoritmer, data, kursregister, textmarkering |
| `npm run test:content` | Strikt innehållskontroll: varje labb har mål, täckning, begrepp, innehåll och lärarstöd |
| `npm run build` | Statiskt produktionsbygge till `dist/` |
| `npm run check:links` | Går igenom `dist/` och hittar trasiga interna länkar, ankare och saknade kursrutter |
| `npm run test:e2e` | Playwright mot det byggda resultatet (dator- och mobilbredd) |
| `npm run verify` | Allt ovan i ordning |
| `npm run docs:coverage` | Genererar [docs/tackningsmatris.md](docs/tackningsmatris.md) från kursregistret |

Samma kontroller körs i GitHub Actions (`.github/workflows/ci.yml`).

> Astro 7 startar `astro preview` i bakgrunden när det körs av ett AI-verktyg. Skripten använder därför `--ignore-lock` så att servern körs i förgrunden.

## Publicering (Vercel)

Webbplatsen är helt statisk och publiceras från roten (`/`).

1. Importera repot i Vercel (*Add New → Project*).
2. Vercel läser `vercel.json`: ramverk Astro, `npm ci`, `npm run build`, utdata `dist/`.
3. Varje push till en gren ger en förhandsversion; produktionsgrenen väljs i Vercels projektinställningar.

Ingen miljövariabel krävs. Ska webbplatsen ligga under en undersökväg (t.ex. `https://skola.se/ai-verkstaden/`) sätts `BASE_PATH=/ai-verkstaden` vid bygget; alla interna länkar går via `src/course/routes.ts` och följer med.

## Innehållsstruktur

```
src/
  course/        Kursregister: kapitel (chapters.ts), typer (types.ts), begrepp (glossary.ts), rutter (routes.ts)
  labs/<id>/     En mapp per labb: meta.ts, content.ts, Lab.tsx, teacher.ts, logic.ts (+ tester)
  chapters/<id>/ Kunskapskontroll (check.ts) och lärarstöd (teacher.ts) per kapitel
  components/    Delade komponenter: lab/ (frågor, reglage, stegning, rutnät, diagram), site/, astro/
  lib/           Lokal lagring, progression, slump med startvärde, sökalgoritmer, textmarkering
  pages/         Startsida, kapitel, labbar, projekt, begrepp, lärare, reflektion, arbetsöversikt, om
  teacher/       Data för lärarsidan (terminsplan, ämnesplanskoppling)
tests/e2e/       Playwright-tester
docs/            Plan, kontrakt för labbar och täckningsmatris
```

Labbordningen och numreringen styrs av `src/course/chapters.ts`. Metadata för varje labb (mål, förkunskaper, tid, begrepp, täckning) ligger i labbens `meta.ts` och samlas automatiskt i registret.

## Så ändrar du en labb (för lärare)

- **Text runt labben** (introduktion, förklaringar, slutsats, fördjupningar): `src/labs/<id>/content.ts`. Skriv vanlig text i strängarna. `**fet**`, `*kursiv*`, `[[begrepps-id]]` (länk till begreppslistan) och `[text](/labb/annan-labb/)` fungerar.
- **Mål, tid, förkunskaper och sökord**: `src/labs/<id>/meta.ts`.
- **Frågor och återkoppling i labben**: i `src/labs/<id>/Lab.tsx`, sök efter `spec={{`. Varje fel alternativ har en `feedback` som förklarar felet.
- **Facit, missuppfattningar och diskussionsstopp**: `src/labs/<id>/teacher.ts` (visas på lärarsidan).
- **Data och algoritmer**: `logic.ts`/datafiler i labbens mapp. Siffror som nämns i texten är låsta i `logic.test.ts` – kör `npm test` efter en ändring så att text och beräkning fortsätter att stämma.
- **Nytt begrepp**: lägg till i `src/course/glossary.ts` (eller labbens `concepts.ts`).

Kör `npm run verify` innan du publicerar.

## Integritet och lagring

Inga konton, ingen databas, ingen extern AI-tjänst, ingen spårning. All beräkning sker i webbläsaren. `localStorage` (prefix `aiv:v1:`) används bara för elevens arbetsöversikt (besökta/klara labbar, senaste labb), sparade svar och tillstånd i labbar samt projektorläget. Om lagringen är blockerad eller innehåller trasig data fungerar labbarna ändå; arbetet sparas då bara tills sidan laddas om. Eleven kan rensa allt under *Min arbetsöversikt*.

## Förenklingar och antaganden

- **Modellerna är små och förenklade** så att de går att följa steg för steg: sökningar på små grafer och rutnät, k-NN och linjär regression på ett tiotal punkter, k-means i två dimensioner, tabellbaserad Q-inlärning i ett litet rutnät, ett neuralt nätverk med ett dolt lager för XOR, en bag-of-words-klassificerare och en liten n-grammodell för nästa ord. Varje labb märks med *Förenklad modell*, *Syntetiska data*, *Påhittat scenario* eller *Simulering* där det gäller.
- **All data är syntetisk** och alla personer, skolor och företag i scenarierna är påhittade.
- **Sökalgoritmerna** (`src/lib/search.ts`) är grafsökning med lista över besökta noder; målet testas när noden tas ut ur gränsen. A* hittar en billigaste väg när kantkostnaderna är positiva och heuristiken är konsistent (och därmed tillåten).
- **Svenska ordlistor** i språkkapitlet är små och handgjorda; begränsningarna visas i labben.
- **Juridik** (labb 25 och kapitel 6) är undervisningsmaterial, inte juridisk rådgivning. Referensdatum är 2026-11-19. Labben bygger på AI-förordningen (EU) 2024/1689 i den lydelse som ändrats 2026 (AI-omnibusen, i kraft 27 juli 2026 enligt kommissionen; högriskreglerna i bilaga III tillämpas från 2 december 2027 och i bilaga I från 2 augusti 2028) och på GDPR (EU) 2016/679. EUR-Lex gick inte att läsa automatiskt från byggmiljön (webbläsarkontroll), så artikeltexterna är kontrollerade mot kommissionens sidor, IMY och en konsoliderad sekundärtext. Källäget redovisas per påstående i lärarhandledningen under labb 25. **Kontrollera mot EUR-Lex innan materialet används.**
- **Ämnesplanskopplingen** finns i lärarhandledningen och är kontrollerad 2026-11-19 mot Skolverkets gällande ämnesplan *Artificiell intelligens* (ämneskod ARTI, gäller från 1 juli 2025; nivå 1 = ARTI1000X, 100 poäng). Källa: https://syllabuswebb.skolverket.se/syllabuscw/jsp/subject.htm?subjectCode=ARTI&tos=gy

## Kända luckor mot ämnesplanen

Kursplanen för webbplatsen (27 sidor) täcker inte allt centralt innehåll i nivå 1. Lärarhandledningen anger förslag för varje lucka:

- Objektigenkänning och datorseende (vision) saknar egen labb.
- Beslutsträd som inlärningsmetod saknas (spelträdet i labb 9 är sökning, inte inlärning).
- Generativ AI berörs bara genom nästa-ord-modellen i labb 18.
- Miljöaspekter och ekonomiska konsekvenser av AI behandlas bara indirekt.
- Situationer där AI är överlägsen människan och tvärtom behandlas som diskussionsstopp, inte i en egen labb.
- Arbetsgrenen heter `claude/new-session-1o6mfl` (sessionens tilldelade gren) i stället för `feat/ai-verkstaden`.

## Tillgänglighet

Mål: WCAG 2.2 nivå AA. Alla kärnuppgifter fungerar med tangentbord (rutnät med piltangenter och Enter, inga dra-och-släpp-moment utan alternativ), synlig fokusmarkering, semantiska rubriker, etiketter på alla reglage, textalternativ till diagram och tillstånd, färg kompletteras med symboler/text, och `prefers-reduced-motion` respekteras. Animationer används bara för algoritmförlopp som kan stegas, pausas och återställas. Projektorläget i sidhuvudet förstorar texten.
