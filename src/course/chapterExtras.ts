import type { QuestionSpec } from '../components/lab/Questions';
import type { ChapterTeacherNotes } from './types';

const checks = import.meta.glob<{ default: QuestionSpec[] }>('../chapters/*/check.ts', { eager: true });
const teachers = import.meta.glob<{ default: ChapterTeacherNotes }>('../chapters/*/teacher.ts', { eager: true });

const pick = <T>(mods: Record<string, { default: T }>, id: string): T | undefined =>
  Object.entries(mods).find(([p]) => p.includes(`/chapters/${id}/`))?.[1].default;

export const chapterCheck = (id: string) => pick(checks, id) ?? [];
export const chapterTeacher = (id: string) => pick(teachers, id);
