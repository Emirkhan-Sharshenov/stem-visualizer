import { supabase } from './supabase';
import type { Progress } from './progress';

/* Teacher dashboard data: classes, members, assignments (all protected by RLS in 0004_classes.sql). */

export interface ClassRow {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
  teacher_id: string;
}
export interface Assignment {
  id: string;
  class_id: string;
  kind: 'topic' | 'section';
  ref_id: string;
  title: string;
  due: string | null;
  created_at: string;
}
export interface Student {
  id: string;
  name: string;
  joinedAt: string;
  progress: Progress | null;
}

const db = () => {
  if (!supabase) throw new Error('offline');
  return supabase;
};
const must = <T,>({ data, error }: { data: T | null; error: unknown }) => {
  if (error) throw error;
  return data as T;
};

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => ALPHABET[b % ALPHABET.length]).join('');

/* ---------- teacher ---------- */

export async function teacherClasses(uid: string) {
  const classes = must<ClassRow[]>(await db().from('classes').select('*').eq('teacher_id', uid).order('created_at'));
  if (!classes.length) return [] as (ClassRow & { students: number })[];
  const members = must<{ class_id: string }[]>(await db().from('class_members').select('class_id').in('class_id', classes.map((c) => c.id)));
  return classes.map((c) => ({ ...c, students: members.filter((m) => m.class_id === c.id).length }));
}

export async function createClass(uid: string, name: string): Promise<ClassRow> {
  for (let i = 0; i < 5; i++) {
    const { data, error } = await db().from('classes').insert({ teacher_id: uid, name: name.trim(), join_code: newCode() }).select().single();
    if (!error) return data as ClassRow;
    if (!String((error as { message?: string }).message).includes('join_code')) throw error;
  }
  throw new Error('code');
}

export const renameClass = async (id: string, name: string) => must(await db().from('classes').update({ name: name.trim() }).eq('id', id));
export const deleteClass = async (id: string) => must(await db().from('classes').delete().eq('id', id));
export const removeStudent = async (classId: string, userId: string) => must(await db().from('class_members').delete().eq('class_id', classId).eq('user_id', userId));

export async function classStudents(classId: string): Promise<Student[]> {
  const members = must<{ user_id: string; joined_at: string }[]>(await db().from('class_members').select('user_id, joined_at').eq('class_id', classId));
  if (!members.length) return [];
  const ids = members.map((m) => m.user_id);
  const [profiles, progress] = await Promise.all([
    db().from('profiles').select('id, name').in('id', ids).then(must<{ id: string; name: string | null }[]>),
    db().from('progress').select('user_id, data').in('user_id', ids).then(must<{ user_id: string; data: Progress }[]>),
  ]);
  return members
    .map((m) => ({
      id: m.user_id,
      joinedAt: m.joined_at,
      name: profiles.find((p) => p.id === m.user_id)?.name || '—',
      progress: progress.find((p) => p.user_id === m.user_id)?.data ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const classAssignments = async (classIds: string[]) =>
  classIds.length ? must<Assignment[]>(await db().from('assignments').select('*').in('class_id', classIds).order('created_at', { ascending: false })) : [];

export const addAssignment = async (a: Pick<Assignment, 'class_id' | 'kind' | 'ref_id' | 'title' | 'due'>) => must(await db().from('assignments').insert(a));
export const removeAssignment = async (id: string) => must(await db().from('assignments').delete().eq('id', id));

/* ---------- student ---------- */

export async function joinClass(code: string) {
  const { data, error } = await db().rpc('join_class', { p_code: code });
  if (error) throw error;
  return data as string;
}

export async function studentClasses(uid: string) {
  const rows = must<{ class_id: string }[]>(await db().from('class_members').select('class_id').eq('user_id', uid));
  if (!rows.length) return [] as (ClassRow & { teacher: string })[];
  const classes = must<ClassRow[]>(await db().from('classes').select('*').in('id', rows.map((r) => r.class_id)));
  const teachers = must<{ id: string; name: string | null }[]>(await db().from('profiles').select('id, name').in('id', [...new Set(classes.map((c) => c.teacher_id))]));
  return classes.map((c) => ({ ...c, teacher: teachers.find((t) => t.id === c.teacher_id)?.name || '' }));
}

export const leaveClass = async (classId: string, uid: string) => removeStudent(classId, uid);

/* ---------- shared ---------- */

/** an assignment is done when the topic is marked understood, or a section test was passed (70%+) */
export function assignmentDone(a: Assignment, p: Progress | null) {
  if (!p) return false;
  if (a.kind === 'topic') return !!p.completed?.[a.ref_id];
  return (p.tests ?? []).some((t) => t.section === a.ref_id && t.score / t.total >= 0.7);
}

export function classErrorText(e: unknown, lang: 'ru' | 'en') {
  const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  const map: [RegExp, string, string][] = [
    [/not_signed_in/, 'Сначала войди в аккаунт.', 'Log in first.'],
    [/invalid_code/, 'Класса с таким кодом нет. Проверь код у учителя.', 'No class with this code. Check it with your teacher.'],
    [/own_class/, 'Это твой собственный класс.', 'This is your own class.'],
    [/row-level security|violates/, 'Создавать классы можно с Pro.', 'Creating classes needs Pro.'],
    [/relation .* does not exist|schema cache/, 'Кабинет ещё не настроен в базе (нужна миграция 0004).', 'The dashboard is not set up in the database yet (migration 0004).'],
    [/offline/, 'Аккаунты ещё не подключены.', 'Accounts are not connected yet.'],
  ];
  const hit = map.find(([r]) => r.test(msg));
  return hit ? (lang === 'ru' ? hit[1] : hit[2]) : lang === 'ru' ? 'Не получилось. Попробуй ещё раз.' : 'Something went wrong. Try again.';
}
