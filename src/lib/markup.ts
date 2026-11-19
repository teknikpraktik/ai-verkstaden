/**
 * Minimal textmarkering för kursinnehållet (content.ts, teacher.ts):
 *   **fet**, *kursiv*, `kod`
 *   [[begrepp-id]] eller [[begrepp-id|visad text]]  → länk till begreppslistan
 *   [länktext](/labb/bygg-en-graf/)                  → intern länk (bassökväg läggs till)
 *   [länktext](https://eur-lex.europa.eu/...)         → extern länk
 * Allt annat HTML-escapas.
 */
export interface MarkupOptions {
  conceptHref: (id: string) => string;
  conceptTerm: (id: string) => string | undefined;
  internalHref: (path: string) => string;
  /** Anropas för okända begrepp (används i tester för att hitta trasiga länkar). */
  onUnknownConcept?: (id: string) => void;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderInline(text: string, o: MarkupOptions): string {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[\[([a-z0-9äåö-]+)(?:\|([^\]]+))?\]\]/g, (_m, id: string, label?: string) => {
    const term = o.conceptTerm(id);
    if (!term) o.onUnknownConcept?.(id);
    return `<a class="concept-link" href="${o.conceptHref(id)}">${label ?? term ?? id}</a>`;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    if (/^https?:\/\//.test(href)) return `<a href="${href}" rel="noopener" class="external">${label}<span class="visually-hidden"> (extern länk)</span></a>`;
    return `<a href="${o.internalHref(href)}">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return s;
}

/** Tar bort markering för t.ex. sökindex och meta-beskrivningar. */
export function plainText(text: string): string {
  return text
    .replace(/\[\[[a-z0-9äåö-]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([a-z0-9äåö-]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`]/g, '');
}
