# Genomförandeplan

Status uppdateras löpande. Täckningen per delämne finns i [tackningsmatris.md](tackningsmatris.md) (genereras från kursregistret).

## Etapper

1. **Grund (huvudagent)** – Astro 7 + React 19 + TypeScript (strict), kursregister, delade komponenter, design, lokal lagring, länkkontroll, ESLint, Vitest, Playwright, CI.
2. **Lodrätt snitt (huvudagent)** – labb 7 *Bredden först och djupet först* från startsida → kapitel → labb → återkoppling → progression efter omladdning → Playwright. Kontrakt i [kontrakt.md](kontrakt.md).
3. **Arbetsströmmar (underagenter, isolerade worktrees, en mapp per labb)**
   - A: kapitel 1 (labb 1–4) + `src/chapters/introduktion/`
   - B: kapitel 2 (labb 5, 6, 8, 9) + `src/chapters/sokning/`
   - C: kapitel 3 (labb 10–15) + `src/chapters/maskininlarning/`
   - D: kapitel 4 (labb 16–18) + `src/chapters/sprak/`
   - E: kapitel 5 (labb 19–21) + `src/chapters/robotik/`
   - F: kapitel 6 (labb 22–26) + `src/chapters/etik/`
   - G: avslutning – slutprojekt (27), reflektionssida, lärarsida (`src/pages/larare/`, `src/pages/reflektion/`, `src/teacher/`)
4. **Integration (huvudagent)** – sammanslagning per etapp, gemensamma ändringar, uppdaterad täckningsmatris, `STRICT_CONTENT=1`-kontroll.
5. **Granskning** – en agent dubbelgranskar algoritmer och tester; en annan gör elev- och tangentbordsgenomgång. Fynd åtgärdas och kontroller körs om.
6. **Leverans** – README, CI, push av arbetsgren.

## Nästa konkreta åtgärd om sessionen avbryts

Se avsnittet *Status* nedan; kör `npm run test:content` för att se vilka labbar som fortfarande är platshållare (`// STUB`).

## Status

- [x] Etapp 1–2 klara och verifierade lokalt (lint, typkontroll, enhetstester, bygge, länkkontroll, 48 Playwright-tester).
- [x] Etapp 3–4: alla sju arbetsströmmar klara och ihopslagna (flera avbrott p.g.a. användningsgräns; återupptagna). Inga platshållare kvar; `npm run test:content` passerar.
- [x] Ämnesplanskopplingen verifierad mot Skolverkets text (ARTI, gäller från 2025-07-01).
- [x] Ren installation (`npm ci` i färsk klon) + lint, typkontroll, enhetstester, bygge och länkkontroll passerar.
- [ ] Etapp 5: algoritmgranskning och elev-/tangentbordsgenomgång pågår.

### Återuppta efter avbrott

1. `git worktree list` och `git log <gren>` för varje `worktree-agent-*`-gren visar vilka labbar som är committade.
2. Slå ihop färdiga grenar till arbetsgrenen (`git merge --no-ff <gren>`); mapparna är disjunkta så konflikter ska inte uppstå.
3. Labbar som fortfarande är platshållare har `// STUB` i `Lab.tsx`: `grep -l STUB src/labs/*/Lab.tsx`.
4. Kör `npm run verify` och `npm run test:content` efter varje sammanslagning.
