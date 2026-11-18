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
