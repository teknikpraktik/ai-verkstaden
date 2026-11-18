import { conceptById } from '../course/registry';
import { routes, url } from '../course/routes';
import { renderInline } from './markup';

/** Renderar kursmarkering till HTML med webbplatsens länkar. */
export function md(text: string): string {
  return renderInline(text, {
    conceptHref: (id) => routes.glossary(id),
    conceptTerm: (id) => conceptById.get(id)?.term,
    internalHref: (p) => (p.startsWith('/') ? url(p) : p),
  });
}
