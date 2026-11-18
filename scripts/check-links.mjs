// Går igenom det byggda resultatet (dist/) och kontrollerar att alla interna
// länkar och ankare pekar på något som finns, och att alla rutter i kursen byggts.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');
if (!existsSync(dist)) {
  console.error('dist/ saknas – kör npm run build först.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const idsByPage = new Map();
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  idsByPage.set(f, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

function resolve(pathname) {
  if (!pathname.startsWith(base)) return null;
  const rel = decodeURIComponent(pathname.slice(base.length));
  const candidates = [join(dist, rel), join(dist, rel, 'index.html'), join(dist, rel + '.html')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

const errors = [];
let checked = 0;
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const page = '/' + relative(dist, f).replace(/index\.html$/, '');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const raw = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|data:|javascript:)/.test(raw)) continue;
    checked++;
    const u = new URL(raw, 'http://x' + base + page.slice(1));
    const target = u.pathname === new URL('http://x' + base + page.slice(1)).pathname && raw.startsWith('#') ? f : resolve(u.pathname);
    if (!target) {
      errors.push(`${page}: trasig länk ${raw}`);
      continue;
    }
    if (u.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(u.hash.slice(1));
      // Begreppslistans ankare renderas av en React-ö; de finns också i det statiska HTML:et.
      if (!idsByPage.get(target)?.has(id)) errors.push(`${page}: ankaret ${raw} saknas`);
    }
  }
}

// Alla kursrutter ska finnas
const expected = ['', 'begrepp/', 'larare/', 'reflektion/', 'min-oversikt/', 'om/'];
const labDirs = readdirSync(new URL('../src/labs/', import.meta.url).pathname);
const chapterIds = ['introduktion', 'sokning', 'maskininlarning', 'sprak', 'robotik', 'etik'];
for (const c of chapterIds) expected.push(`kapitel/${c}/`);
for (const l of labDirs) expected.push(l === 'granska-ett-ai-system' ? `projekt/${l}/` : `labb/${l}/`);
for (const r of expected) if (!resolve(base + r)) errors.push(`Rutten ${base}${r} har inte byggts`);

if (errors.length) {
  console.error(`${errors.length} fel bland ${checked} kontrollerade länkar:`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log(`OK: ${htmlFiles.length} sidor, ${checked} interna länkar, ${expected.length} kursrutter.`);
