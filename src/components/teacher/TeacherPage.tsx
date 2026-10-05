import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ClipboardList, Copy, GraduationCap, Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import { gradesFor, SECTIONS, sectionsFor } from '../../data/curriculum';
import type { StemCategory } from '../../types/stem';
import {
  addAssignment,
  Assignment,
  assignmentDone,
  classAssignments,
  classErrorText,
  ClassRow,
  classStudents,
  createClass,
  deleteClass,
  joinClass,
  leaveClass,
  removeAssignment,
  removeStudent,
  Student,
  studentClasses,
  teacherClasses,
} from '../../lib/classes';
import { usePlan } from '../../lib/plan';
import { useProgress } from '../../lib/progress';
import { useSession } from '../../lib/supabase';
import { buildPlan } from '../progress/StudyPlan';
import { ProGate } from '../pro/ProPage';

type Lang = 'ru' | 'en';
type OpenTopic = (id: string) => void;
const SUBJ: { id: StemCategory; ru: string; en: string; color: string }[] = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
];
const card = 'bg-surface border border-line rounded-xl';
const btn = 'h-10 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-50';
const primary = `${btn} bg-accent hover:bg-accent-hover`;
const ghost = `${btn} bg-surface border border-line text-ink hover:bg-muted`;
const field = 'h-10 px-3 rounded-lg bg-surface border border-line text-sm text-ink outline-none focus:border-accent';

const fmtDate = (d: string | null, lang: Lang) => (d ? new Date(d).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short' }) : '');
const lastActive = (s: Student) => s.progress?.days?.[s.progress.days.length - 1] ?? null;
const avgQuiz = (s: Student) => {
  const q = Object.values(s.progress?.quiz ?? {});
  return q.length ? Math.round((q.reduce((a, x) => a + x.best / x.total, 0) / q.length) * 100) : null;
};

/* ---------- assignment picker ---------- */

const NewAssignment: React.FC<{ lang: Lang; classId: string; onDone: () => void }> = ({ lang, classId, onDone }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [subject, setSubject] = useState<StemCategory>('physics');
  const grades = gradesFor(subject);
  const [grade, setGrade] = useState(grades[0]);
  const g = grades.includes(grade) ? grade : grades[0];
  const sections = sectionsFor(subject, g);
  const [sectionId, setSectionId] = useState('');
  const section = sections.find((s) => s.id === sectionId) ?? sections[0];
  const [topicId, setTopicId] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!section) return;
    const topic = section.topics.find((t) => t.id === topicId);
    setBusy(true);
    setErr('');
    try {
      await addAssignment({
        class_id: classId,
        kind: topic ? 'topic' : 'section',
        ref_id: topic ? topic.id : section.id,
        title: topic ? topic.title[lang] : `${L('Тест', 'Test')}: ${section.title[lang]}`,
        due: due || null,
      });
      setTopicId('');
      onDone();
    } catch (e) {
      setErr(classErrorText(e, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${card} p-4 flex flex-col gap-3`}>
      <div className="text-sm font-medium text-ink">{L('Новое задание', 'New assignment')}</div>
      <div className="grid sm:grid-cols-3 gap-2">
        <select className={field} value={subject} onChange={(e) => { setSubject(e.target.value as StemCategory); setSectionId(''); setTopicId(''); }}>
          {SUBJ.map((s) => <option key={s.id} value={s.id}>{s[lang]}</option>)}
        </select>
        <select className={field} value={g} onChange={(e) => { setGrade(Number(e.target.value)); setSectionId(''); setTopicId(''); }}>
          {grades.map((x) => <option key={x} value={x}>{x} {L('класс', 'grade')}</option>)}
        </select>
        <select className={field} value={section?.id ?? ''} onChange={(e) => { setSectionId(e.target.value); setTopicId(''); }}>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.title[lang]}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2">
        <select className={field} value={topicId} onChange={(e) => setTopicId(e.target.value)}>
          <option value="">{L('Тест по всему разделу', 'Test on the whole section')}</option>
          {section?.topics.map((t) => <option key={t.id} value={t.id}>{L('Тема', 'Topic')}: {t.title[lang]}</option>)}
        </select>
        <input type="date" className={field} value={due} onChange={(e) => setDue(e.target.value)} title={L('Срок', 'Due')} />
        <button onClick={save} disabled={busy || !section} className={primary} style={{ color: '#fff' }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {L('Задать', 'Assign')}
        </button>
      </div>
      <p className="text-xs text-ink-3">
        {L('Тема считается выполненной, когда ученик прошёл тест в конце темы. Раздел — когда сдал тест по разделу на 70%+.', 'A topic counts as done when the student passes its end-of-topic quiz; a section when they score 70%+ on its section test.')}
      </p>
      {err && <p className="text-sm text-[#CC2F35]">{err}</p>}
    </div>
  );
};

/* ---------- one class ---------- */

const ClassView: React.FC<{ lang: Lang; cls: ClassRow; onBack: () => void; onDeleted: () => void }> = ({ lang, cls, onBack, onDeleted }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [tab, setTab] = useState<'students' | 'assignments'>('students');
  const [students, setStudents] = useState<Student[] | null>(null);
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([classStudents(cls.id), classAssignments([cls.id])]);
      setStudents(s);
      setTasks(a);
    } catch (e) {
      setErr(classErrorText(e, lang));
      setStudents([]);
    }
  }, [cls.id, lang]);
  useEffect(() => void load(), [load]);

  const copy = () => {
    navigator.clipboard?.writeText(cls.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // topics the class struggles with most (from everyone's failed quizzes)
  const weak = useMemo(() => {
    const count = new Map<string, { title: string; n: number }>();
    for (const s of students ?? []) if (s.progress) for (const step of buildPlan(s.progress, 20)) {
      const c = count.get(step.topic.id) ?? { title: step.topic.title[lang], n: 0 };
      count.set(step.topic.id, { ...c, n: c.n + 1 });
    }
    return [...count.values()].sort((a, b) => b.n - a.n).slice(0, 5);
  }, [students, lang]);

  return (
    <div className="flex flex-col gap-5">
      <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('Все классы', 'All classes')}
      </button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif text-[30px] leading-tight text-ink">{cls.name}</h2>
        <div className={`${card} px-4 py-2.5 flex items-center gap-3`}>
          <div>
            <div className="text-[11px] text-ink-3">{L('Код для учеников', 'Student join code')}</div>
            <div className="font-mono text-xl tracking-[0.2em] text-ink">{cls.join_code}</div>
          </div>
          <button onClick={copy} className="w-9 h-9 rounded-lg border border-line hover:bg-muted flex items-center justify-center text-ink-2 cursor-pointer" title={L('Скопировать', 'Copy')}>
            {copied ? <Check className="w-4 h-4 text-[#1E7A4C]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="text-sm text-ink-2 -mt-2">
        {L('Ученики входят в аккаунт → меню профиля → «Мои классы» → вводят код.', 'Students log in → profile menu → “My classes” → enter the code.')}
      </p>
      {err && <p className="text-sm text-[#CC2F35]">{err}</p>}

      <div className="flex p-1 rounded-lg bg-muted border border-line self-start">
        {(
          [
            ['students', L(`Ученики · ${students?.length ?? 0}`, `Students · ${students?.length ?? 0}`)],
            ['assignments', L(`Задания · ${tasks.length}`, `Assignments · ${tasks.length}`)],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`h-9 px-4 rounded-md text-sm cursor-pointer ${tab === id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>

      {students === null ? (
        <Loader2 className="w-5 h-5 animate-spin text-ink-3" />
      ) : tab === 'students' ? (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
          {students.length === 0 ? (
            <div className={`${card} p-6 text-sm text-ink-2`}>{L(`Пока никого. Дай ученикам код ${cls.join_code}.`, `No one yet. Give students the code ${cls.join_code}.`)}</div>
          ) : (
            <div className={`${card} overflow-x-auto`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-3 border-b border-line">
                    <th className="px-4 py-2.5 font-normal">{L('Ученик', 'Student')}</th>
                    <th className="px-3 py-2.5 font-normal">{L('Тем', 'Topics')}</th>
                    <th className="px-3 py-2.5 font-normal">{L('Тесты', 'Quizzes')}</th>
                    <th className="px-3 py-2.5 font-normal">{L('Задания', 'Tasks')}</th>
                    <th className="px-3 py-2.5 font-normal">{L('Был', 'Active')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const done = Object.values(s.progress?.completed ?? {}).filter(Boolean).length;
                    const avg = avgQuiz(s);
                    const tasksDone = tasks.filter((a) => assignmentDone(a, s.progress)).length;
                    const plan = s.progress ? buildPlan(s.progress, 5) : [];
                    return (
                      <React.Fragment key={s.id}>
                        <tr onClick={() => setOpen(open === s.id ? null : s.id)} className="border-b border-line last:border-0 hover:bg-muted cursor-pointer">
                          <td className="px-4 py-3 text-ink">{s.name}</td>
                          <td className="px-3 py-3 font-mono">{done}</td>
                          <td className={`px-3 py-3 font-mono ${avg === null ? 'text-ink-3' : avg >= 75 ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{avg === null ? '—' : `${avg}%`}</td>
                          <td className="px-3 py-3 font-mono">{tasks.length ? `${tasksDone}/${tasks.length}` : '—'}</td>
                          <td className="px-3 py-3 text-ink-2">{fmtDate(lastActive(s), lang) || '—'}</td>
                        </tr>
                        {open === s.id && (
                          <tr className="border-b border-line bg-muted/50">
                            <td colSpan={5} className="px-4 py-3">
                              <div className="text-xs text-ink-2 mb-1.5">{L('Что ему стоит повторить:', 'What to revise:')}</div>
                              {plan.length ? (
                                <ul className="flex flex-col gap-1 text-sm">
                                  {plan.map((p) => (
                                    <li key={p.topic.id} className="text-ink">
                                      {p.topic.title[lang]} <span className="text-ink-3">· {p.why[lang]}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-ink-3">{L('Ошибок пока нет.', 'No mistakes so far.')}</p>
                              )}
                              <button
                                onClick={async () => {
                                  if (!confirm(L(`Убрать ${s.name} из класса?`, `Remove ${s.name} from the class?`))) return;
                                  await removeStudent(cls.id, s.id).catch(() => undefined);
                                  load();
                                }}
                                className="mt-3 text-xs text-[#CC2F35] hover:underline cursor-pointer"
                              >
                                {L('Убрать из класса', 'Remove from class')}
                              </button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <aside className={`${card} p-4`}>
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Сложные темы класса', 'Class trouble spots')}</h3>
            {weak.length ? (
              <ol className="mt-3 flex flex-col gap-2 text-sm">
                {weak.map((w) => (
                  <li key={w.title} className="flex justify-between gap-2">
                    <span className="text-ink">{w.title}</span>
                    <span className="text-ink-3 shrink-0">{w.n} {L('уч.', 'st.')}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-ink-3">{L('Появятся, когда ученики начнут проходить тесты.', 'These appear once students take quizzes.')}</p>
            )}
          </aside>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <NewAssignment lang={lang} classId={cls.id} onDone={load} />
          {tasks.map((a) => {
            const doneBy = students.filter((s) => assignmentDone(a, s.progress));
            const late = a.due && new Date(a.due + 'T23:59:59') < new Date();
            return (
              <div key={a.id} className={`${card} p-4`}>
                <div className="flex items-start gap-3">
                  <ClipboardList className="w-5 h-5 text-accent mt-0.5 shrink-0" strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] text-ink">{a.title}</div>
                    <div className="text-xs text-ink-3">
                      {a.kind === 'topic' ? L('тема', 'topic') : L('тест по разделу', 'section test')}
                      {a.due && <span className={late ? 'text-[#CC2F35]' : ''}> · {L('до', 'due')} {fmtDate(a.due, lang)}</span>}
                    </div>
                  </div>
                  <span className="font-mono text-sm text-ink">{doneBy.length}/{students.length}</span>
                  <button
                    onClick={async () => {
                      if (!confirm(L('Удалить задание?', 'Delete the assignment?'))) return;
                      await removeAssignment(a.id).catch(() => undefined);
                      load();
                    }}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-ink-3 hover:text-[#CC2F35] hover:bg-muted cursor-pointer"
                    title={L('Удалить', 'Delete')}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
                {students.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {students.map((s) => {
                      const ok = assignmentDone(a, s.progress);
                      return (
                        <span key={s.id} className={`px-2 py-0.5 rounded-full text-xs border ${ok ? 'bg-[#EAF6EF] border-[#BFE3CC] text-[#1E7A4C]' : 'bg-surface border-line text-ink-3'}`}>
                          {ok ? '✓ ' : ''}
                          {s.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={async () => {
          if (!confirm(L(`Удалить класс «${cls.name}»? Задания тоже удалятся.`, `Delete “${cls.name}”? Its assignments go too.`))) return;
          await deleteClass(cls.id).catch(() => undefined);
          onDeleted();
        }}
        className="self-start text-sm text-[#CC2F35] hover:underline cursor-pointer"
      >
        {L('Удалить класс', 'Delete class')}
      </button>
    </div>
  );
};

/* ---------- teacher home ---------- */

const PREVIEW = [
  { name: '9 «А» — физика', n: 27 },
  { name: '10 «Б» — химия', n: 24 },
];

const TeacherHome: React.FC<{ lang: Lang; uid: string }> = ({ lang, uid }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const [classes, setClasses] = useState<(ClassRow & { students: number })[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    teacherClasses(uid)
      .then(setClasses)
      .catch((e) => {
        setErr(classErrorText(e, lang));
        setClasses([]);
      });
  }, [uid, lang]);
  useEffect(load, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setErr('');
    try {
      const c = await createClass(uid, name);
      setName('');
      load();
      setOpenId(c.id);
    } catch (e) {
      setErr(classErrorText(e, lang));
    } finally {
      setBusy(false);
    }
  };

  const open = classes?.find((c) => c.id === openId);
  if (open) return <ClassView lang={lang} cls={open} onBack={() => { setOpenId(null); load(); }} onDeleted={() => { setOpenId(null); load(); }} />;

  const list = (items: { id?: string; name: string; n: number; code?: string }[]) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((c) => (
        <button key={c.id ?? c.name} onClick={() => c.id && setOpenId(c.id)} className={`${card} text-left p-4 hover:border-line-strong hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer`}>
          <div className="text-[16px] font-medium text-ink">{c.name}</div>
          <div className="mt-1 text-xs text-ink-3 inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
            {c.n} {L('учеников', 'students')}
            {c.code && <span className="font-mono">· {c.code}</span>}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <ProGate
      lang={lang}
      pro={plan.pro || plan.loading}
      onUpgrade={() => window.dispatchEvent(new Event('open-pro'))}
      title={L('Кабинет учителя — в Pro', 'The teacher dashboard is part of Pro')}
      text={L('Создавай классы, задавай темы и тесты и смотри, кто что прошёл и где ошибается.', 'Create classes, assign topics and tests, and see who did what and where they struggle.')}
    >
      <div className="flex flex-col gap-4">
        <div className={`${card} p-4 flex flex-col sm:flex-row gap-2`}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder={L('Название класса, например «9 А — физика»', 'Class name, e.g. “9A Physics”')}
            className={`${field} flex-1`}
          />
          <button onClick={create} disabled={busy || !name.trim()} className={primary} style={{ color: '#fff' }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {L('Создать класс', 'Create class')}
          </button>
        </div>
        {err && <p className="text-sm text-[#CC2F35]">{err}</p>}
        {!plan.pro
          ? list(PREVIEW)
          : classes === null
            ? <Loader2 className="w-5 h-5 animate-spin text-ink-3" />
            : classes.length === 0
              ? <p className="text-sm text-ink-2">{L('Классов пока нет — создай первый.', 'No classes yet. Create your first one.')}</p>
              : list(classes.map((c) => ({ id: c.id, name: c.name, n: c.students, code: c.join_code })))}
      </div>
    </ProGate>
  );
};

/* ---------- student side (also shown on the progress page) ---------- */

export const StudentClasses: React.FC<{ lang: Lang; onOpenTopic: OpenTopic; compact?: boolean }> = ({ lang, onOpenTopic, compact }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user } = useSession();
  const p = useProgress();
  const [classes, setClasses] = useState<(ClassRow & { teacher: string })[] | null>(null);
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const cs = await studentClasses(user.id);
      setClasses(cs);
      setTasks(await classAssignments(cs.map((c) => c.id)));
    } catch {
      setClasses([]);
    }
  }, [user]);
  useEffect(() => void load(), [load]);

  const join = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await joinClass(code);
      setCode('');
      setMsg({ ok: true, text: L('Готово! Ты в классе.', 'Done! You joined the class.') });
      load();
    } catch (e) {
      setMsg({ ok: false, text: classErrorText(e, lang) });
    } finally {
      setBusy(false);
    }
  };

  const openTask = (a: Assignment) => {
    if (a.kind === 'topic') return onOpenTopic(a.ref_id);
    const s = SECTIONS.find((x) => x.id === a.ref_id);
    if (s?.topics[0]) onOpenTopic(s.topics[0].id);
  };

  if (!user) {
    if (compact) return null;
    return (
      <div className={`${card} p-6 text-sm text-ink-2`}>
        <a href="#/login" className="text-accent hover:underline">{L('Войди в аккаунт', 'Log in')}</a>
        {L(', чтобы вступить в класс по коду учителя.', ' to join a class with your teacher’s code.')}
      </div>
    );
  }
  const pending = tasks.filter((a) => !assignmentDone(a, p));
  if (compact && !pending.length) return null;

  const taskList = (items: Assignment[]) => (
    <ul className="flex flex-col divide-y divide-line">
      {items.map((a) => {
        const ok = assignmentDone(a, p);
        const late = !ok && a.due && new Date(a.due + 'T23:59:59') < new Date();
        return (
          <li key={a.id}>
            <button onClick={() => openTask(a)} className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-muted rounded-lg px-2 cursor-pointer">
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${ok ? 'bg-[#30A46C] border-[#30A46C]' : 'border-line-strong'}`}>
                {ok && <Check className="w-3 h-3" style={{ color: '#fff' }} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[15px] ${ok ? 'text-ink-3 line-through' : 'text-ink'}`}>{a.title}</span>
                <span className="text-xs text-ink-3">
                  {classes?.find((c) => c.id === a.class_id)?.name}
                  {a.due && <span className={late ? 'text-[#CC2F35]' : ''}> · {L('до', 'due')} {fmtDate(a.due, lang)}</span>}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  if (compact)
    return (
      <section>
        <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 inline-flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} />
          {L('Задания от учителя', 'From your teacher')} · {pending.length}
        </h2>
        <div className={`${card} mt-3 px-2 py-1`}>{taskList(pending)}</div>
      </section>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} p-4`}>
        <div className="text-sm font-medium text-ink">{L('Вступить в класс', 'Join a class')}</div>
        <div className="mt-2 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))} onKeyDown={(e) => e.key === 'Enter' && join()} placeholder={L('Код от учителя', 'Code from your teacher')} className={`${field} flex-1 font-mono tracking-[0.15em] uppercase`} />
          <button onClick={join} disabled={busy} className={primary} style={{ color: '#fff' }}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {L('Вступить', 'Join')}
          </button>
        </div>
        {msg && <p className={`mt-2 text-sm ${msg.ok ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{msg.text}</p>}
      </div>
      {classes?.map((c) => {
        const own = tasks.filter((a) => a.class_id === c.id);
        return (
          <div key={c.id} className={`${card} p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[16px] font-medium text-ink">{c.name}</div>
                {c.teacher && <div className="text-xs text-ink-3">{L('Учитель', 'Teacher')}: {c.teacher}</div>}
              </div>
              <button
                onClick={async () => {
                  if (!confirm(L(`Выйти из класса «${c.name}»?`, `Leave “${c.name}”?`))) return;
                  await leaveClass(c.id, user.id).catch(() => undefined);
                  load();
                }}
                className="text-xs text-ink-3 hover:text-[#CC2F35] inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> {L('Выйти', 'Leave')}
              </button>
            </div>
            <div className="mt-2">{own.length ? taskList(own) : <p className="text-sm text-ink-3 py-2">{L('Заданий пока нет.', 'No assignments yet.')}</p>}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- page ---------- */

export const TeacherPage: React.FC<{ lang: Lang; onOpenTopic: OpenTopic; initialTab?: 'teacher' | 'student' }> = ({ lang, onOpenTopic, initialTab = 'teacher' }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user } = useSession();
  const [tab, setTab] = useState(initialTab);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink inline-flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-accent" strokeWidth={1.5} />
            {tab === 'teacher' ? L('Кабинет учителя', 'Teacher dashboard') : L('Мои классы', 'My classes')}
          </h1>
          <p className="mt-1 text-[15px] text-ink-2 max-w-2xl">
            {tab === 'teacher'
              ? L('Классы, задания со сроком и прогресс каждого ученика — без таблиц и ручной проверки.', 'Classes, assignments with due dates and each student’s progress, with no spreadsheets or manual marking.')
              : L('Вступи в класс по коду учителя и выполняй задания.', 'Join your teacher’s class with a code and complete assignments.')}
          </p>
        </div>
        <div className="flex p-1 rounded-lg bg-muted border border-line self-start">
          {(
            [
              ['teacher', L('Я учитель', 'I teach')],
              ['student', L('Я ученик', 'I’m a student')],
            ] as const
          ).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`h-9 px-4 rounded-md text-sm cursor-pointer ${tab === id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'}`}>
              {label}
            </button>
          ))}
        </div>
      </header>
      {tab === 'student' ? (
        <StudentClasses lang={lang} onOpenTopic={onOpenTopic} />
      ) : !user ? (
        <div className={`${card} p-6 text-sm text-ink-2`}>
          <a href="#/login" className="text-accent hover:underline">{L('Войди в аккаунт', 'Log in')}</a>
          {L(', чтобы создавать классы.', ' to create classes.')}
        </div>
      ) : (
        <TeacherHome lang={lang} uid={user.id} />
      )}
    </div>
  );
};

export default TeacherPage;
