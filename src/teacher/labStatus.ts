import type { TeacherNotes } from '../course/types';

export type TeacherStatus = 'saknas' | 'delvis' | 'klar';

/**
 * Hur färdigt en labbs lärarstöd är. Platshållare ("Under arbete.") och tomt
 * innehåll räknas som saknat, så att lärarsidan kan visa en tydlig notis
 * i stället för tomma rubriker.
 */
export function labStatus(t: TeacherNotes | undefined): TeacherStatus {
  if (!t) return 'saknas';
  const placeholder = t.purpose.trim() === '' || /^under arbete\.?$/i.test(t.purpose.trim());
  const hasAny = t.tips.length + t.misconceptions.length + t.discussionStops.length + t.answers.length > 0;
  if (placeholder && !hasAny) return 'saknas';
  return t.answers.length > 0 ? 'klar' : 'delvis';
}
