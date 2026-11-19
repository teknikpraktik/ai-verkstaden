// Genererar docs/tackningsmatris.md från kursregistret: npm run docs:coverage
import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { labs, partTitle } from '../src/course/registry';

it.runIf(process.env.GEN_COVERAGE === '1')('skriver täckningsmatrisen', () => {
  const lines: string[] = [
    '# Täckningsmatris',
    '',
    'Genereras från `coverage` i varje labbs `meta.ts` med `npm run docs:coverage`. Ändra inte för hand.',
    '',
    '| Nr | Labb | Rutt | Delämne | Förväntat elevresultat | Verifiering |',
    '|---|---|---|---|---|---|',
  ];
  let part = '';
  for (const l of labs) {
    if (l.part !== part) {
      part = l.part;
      lines.push(`| | **${partTitle(l.part)}** | | | | |`);
    }
    const rows = l.coverage.length ? l.coverage : [{ topic: '⚠ saknas', outcome: '', verification: '' }];
    rows.forEach((c, i) => {
      const esc = (s: string) => s.replace(/\|/g, '\\|');
      lines.push(i === 0 ? `| ${l.number} | ${esc(l.title)} | \`${l.href}\` | ${esc(c.topic)} | ${esc(c.outcome)} | ${esc(c.verification)} |` : `| | | | ${esc(c.topic)} | ${esc(c.outcome)} | ${esc(c.verification)} |`);
    });
  }
  writeFileSync(new URL('../docs/tackningsmatris.md', import.meta.url), lines.join('\n') + '\n');
});
