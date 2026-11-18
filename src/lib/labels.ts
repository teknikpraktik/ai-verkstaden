import type { NoteKind } from '../course/types';

export const noteLabels: Record<NoteKind, string> = {
  forenklad: 'Förenklad modell',
  syntetisk: 'Syntetiska data',
  pahittad: 'Påhittat scenario',
  simulering: 'Simulering',
  info: 'Bra att veta',
  tips: 'Tips',
  varning: 'Observera',
};

export const noteExplanations: Record<NoteKind, string> = {
  forenklad: 'Modellen i labben är medvetet förenklad för att den ska gå att följa steg för steg. Verkliga system är större och mer komplicerade.',
  syntetisk: 'Datan är påhittad och skapad för övningen. Den beskriver inga verkliga personer.',
  pahittad: 'Scenariot, organisationerna och personerna är påhittade.',
  simulering: 'Resultatet kommer från en förenklad simulering i webbläsaren, inte från ett verkligt system.',
  info: '',
  tips: '',
  varning: '',
};
