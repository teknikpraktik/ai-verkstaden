/** Alla interna länkar går via dessa hjälpare så att en undersökväg (BASE_PATH) fungerar. */
const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');

export function url(path: string): string {
  const clean = path.replace(/^\//, '');
  return BASE + clean;
}

export const routes = {
  home: () => url(''),
  chapter: (chapterId: string) => url(`kapitel/${chapterId}/`),
  lab: (labId: string, part?: string) =>
    part === 'avslutning' ? url(`projekt/${labId}/`) : url(`labb/${labId}/`),
  glossary: (conceptId?: string) => url('begrepp/') + (conceptId ? `#${conceptId}` : ''),
  teacher: (anchor?: string) => url('larare/') + (anchor ? `#${anchor}` : ''),
  reflection: () => url('reflektion/'),
  overview: () => url('min-oversikt/'),
  about: () => url('om/'),
};
