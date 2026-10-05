import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Check, Clock, Sun } from 'lucide-react';
import { Section, sectionsFor, SUBJECTS, Topic, gradesFor } from '../../data/curriculum';
import { progress, useProgress } from '../../lib/progress';
import { dailyQuestions, questionsForTopic, sectionTest, todayKey } from '../../lib/quiz';
import { Quiz } from './Quiz';
import type { StemCategory } from '../../types/stem';

type Lang = 'ru' | 'en';
const COLOR: Record<string, string> = { physics: '#E5484D', chemistry: '#30A46C', biology: '#F5A524' };
const NAME: Record<string, { ru: string; en: string }> = {
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
};

const chipCls = (active: boolean) => `h-9 px-3.5 rounded-full text-sm border cursor-pointer transition-colors ${active ? 'border-transparent' : 'bg-surface border-line text-ink-2 hover:text-ink'}`;
const chipStyle = (active: boolean, color = '#16171A') => (active ? { background: color, color: '#fff' } : undefined);

/** subject + grade picker shared by the topic and section browsers */
function usePicker() {
  const [subject, setSubject] = useState<StemCategory>('physics');
  const grades = gradesFor(subject);
  const [grade, setGrade] = useState<number>(grades[0]);
  const g = grades.includes(grade) ? grade : grades[0];
  return { subject, setSubject, grade: g, setGrade, grades };
}

const Picker: React.FC<{ lang: Lang; p: ReturnType<typeof usePicker> }> = ({ lang, p }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-2">
      {SUBJECTS.map((s) => (
        <button key={s} onClick={() => p.setSubject(s)} className={chipCls(p.subject === s)} style={chipStyle(p.subject === s, COLOR[s])}>
          {NAME[s]?.[lang] ?? s}
        </button>
      ))}
    </div>
    <div className="flex flex-wrap gap-1.5">
      {p.grades.map((g) => (
        <button key={g} onClick={() => p.setGrade(g)} className={`h-8 px-3 rounded-md text-sm border cursor-pointer ${p.grade === g ? 'bg-surface border-accent text-accent font-medium' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}>
          {g} {lang === 'ru' ? 'класс' : 'grade'}
        </button>
      ))}
    </div>
  </div>
);

/* ---------- questions of the day ---------- */

export const DailyCard: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const date = todayKey();
  const { daily } = useProgress();
  const done = daily[date];
  const [run, setRun] = useState(false);
  const qs = useMemo(() => dailyQuestions(date), [date]);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const streak = (() => {
    let n = 0;
    const d = new Date();
    if (!daily[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1);
    while (daily[d.toISOString().slice(0, 10)]) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  })();
  return (
    <section className="rounded-xl border border-line overflow-hidden bg-surface">
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3" style={{ background: 'linear-gradient(90deg, #FFF4DA, #FDF8EE)' }}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#F5A524] flex items-center justify-center" style={{ color: '#fff' }}>
            <Sun className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-serif text-xl text-ink">{L('3 вопроса дня', '3 questions of the day')}</h2>
            <p className="text-sm text-ink-2">
              {L('Физика, химия и биология — по одному. Новые каждый день.', 'Physics, chemistry and biology, one each. New every day.')}
              {streak > 0 && <span className="ml-1 text-[#B5651D]">{L(`Серия: ${streak} дн.`, `Streak: ${streak} d`)}</span>}
            </p>
          </div>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-[#EAF6EF] text-[#1E7A4C] text-sm">
            <Check className="w-4 h-4" strokeWidth={2.5} />
            {L(`Сегодня: ${done.score} из ${done.total}. Возвращайся завтра!`, `Today: ${done.score} of ${done.total}. Come back tomorrow!`)}
          </span>
        ) : (
          !run && (
            <button onClick={() => setRun(true)} className="h-10 px-5 rounded-lg bg-[#F5A524] hover:brightness-95 text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
              {L('Ответить', 'Answer')}
            </button>
          )
        )}
      </div>
      {run && !done && (
        <div className="p-5">
          <Quiz lang={lang} questions={qs} passMark={0.66} onFinish={(score, total) => progress.recordDaily(date, score, total)} onOpenTopic={onOpenTopic} />
        </div>
      )}
    </section>
  );
};

/* ---------- every topic ---------- */

const TopicRun: React.FC<{ lang: Lang; topic: Topic; onBack: () => void; onOpenTopic: (id: string) => void }> = ({ lang, topic, onBack, onOpenTopic }) => {
  const [attempt, setAttempt] = useState(0);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <button onClick={onBack} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {L('Все темы', 'All topics')}
      </button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs text-ink-3">
            {NAME[topic.subject]?.[lang]} · {topic.grade} {L('класс', 'grade')}
          </span>
          <h2 className="font-serif text-[28px] leading-tight text-ink">{topic.title[lang]}</h2>
        </div>
        <button onClick={() => onOpenTopic(topic.id)} className="h-9 px-3 rounded-lg border border-line bg-surface hover:bg-muted text-sm text-ink inline-flex items-center gap-1.5 cursor-pointer">
          <BookOpen className="w-4 h-4" strokeWidth={1.75} />
          {L('Читать тему', 'Read the topic')}
        </button>
      </div>
      <Quiz key={attempt} lang={lang} questions={questionsForTopic(topic, 10, attempt)} onFinish={(s, t) => progress.recordQuiz(topic.id, s, t)} onRetry={() => setAttempt((a) => a + 1)} onOpenTopic={onOpenTopic} />
    </div>
  );
};

export const TopicsBrowser: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const picker = usePicker();
  const { quiz, completed } = useProgress();
  const [open, setOpen] = useState<Topic | null>(null);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  if (open) return <TopicRun lang={lang} topic={open} onBack={() => setOpen(null)} onOpenTopic={onOpenTopic} />;
  const sections = sectionsFor(picker.subject, picker.grade);
  const all = sections.flatMap((s) => s.topics);
  const passed = all.filter((t) => quiz[t.id] && quiz[t.id].best / quiz[t.id].total >= 0.75).length;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Picker lang={lang} p={picker} />
        <span className="text-sm text-ink-2">
          {L('Тесты сданы', 'Quizzes passed')}: <span className="font-mono text-ink">{passed}/{all.length}</span>
        </span>
      </div>
      {sections.map((sec, i) => (
        <section key={sec.id} className="bg-surface border border-line rounded-xl overflow-hidden">
          <h3 className="px-5 py-3 border-b border-line font-serif text-lg text-ink">
            <span className="font-mono text-sm text-ink-3 mr-2">{String(i + 1).padStart(2, '0')}</span>
            {sec.title[lang]}
          </h3>
          <ul className="divide-y divide-line">
            {sec.topics.map((t) => {
              const r = quiz[t.id];
              const n = questionsForTopic(t).length;
              return (
                <li key={t.id}>
                  <button onClick={() => setOpen(t)} className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-muted cursor-pointer">
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${completed[t.id] ? 'bg-chemistry border-chemistry' : 'border-line-strong'}`}>
                      {completed[t.id] && <Check className="w-3 h-3" color="#fff" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 min-w-0 text-[15px] text-ink truncate">{t.title[lang]}</span>
                    <span className="text-xs text-ink-3 shrink-0">
                      {n} {L('вопр.', 'q.')}
                    </span>
                    {r ? (
                      <span className={`font-mono text-xs px-2 py-0.5 rounded shrink-0 ${r.best / r.total >= 0.75 ? 'bg-[#EAF6EF] text-[#1E7A4C]' : 'bg-[#FDF0EF] text-[#CC2F35]'}`}>
                        {r.best}/{r.total}
                      </span>
                    ) : (
                      <span className="text-xs text-accent shrink-0">{L('Пройти', 'Start')}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

/* ---------- thematic tests by section ---------- */

export const SectionTests: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const picker = usePicker();
  const { tests } = useProgress();
  const [run, setRun] = useState<{ section: Section; seed: number } | null>(null);
  const [timed, setTimed] = useState(false);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  if (run) {
    const qs = sectionTest(run.section, run.seed);
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <button onClick={() => setRun(null)} className="self-start inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {L('Все разделы', 'All sections')}
        </button>
        <div>
          <span className="text-xs text-ink-3">
            {L('Тематический тест', 'Section test')} · {qs.length} {L('вопросов', 'questions')}
          </span>
          <h2 className="font-serif text-[28px] leading-tight text-ink">{run.section.title[lang]}</h2>
        </div>
        <Quiz
          key={run.seed}
          lang={lang}
          questions={qs}
          timeLimit={timed ? qs.length * 60 : undefined}
          passMark={0.7}
          onFinish={(score, total, secs) => progress.recordTest({ at: Date.now(), subject: run.section.subject, score, total, secs, section: run.section.id })}
          onRetry={() => setRun({ section: run.section, seed: Date.now() % 100000 })}
          onOpenTopic={onOpenTopic}
        />
      </div>
    );
  }

  const sections = sectionsFor(picker.subject, picker.grade);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Picker lang={lang} p={picker} />
        <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="accent-[#2F5BFF] w-4 h-4" />
          <Clock className="w-4 h-4" strokeWidth={1.75} />
          {L('На время (1 мин на вопрос)', 'Timed (1 min per question)')}
        </label>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec) => {
          const mine = tests.filter((t) => t.section === sec.id);
          const best = mine.reduce<number | null>((m, t) => Math.max(m ?? 0, Math.round((t.score / t.total) * 100)), null);
          return (
            <button key={sec.id} onClick={() => setRun({ section: sec, seed: Date.now() % 100000 })} className="text-left bg-surface border border-line rounded-xl p-5 hover:border-line-strong hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLOR[sec.subject] }} />
                {sec.topics.length} {L('тем', 'topics')} · {Math.min(25, sec.topics.length * 2)} {L('вопросов', 'questions')}
              </span>
              <span className="font-serif text-lg leading-snug text-ink">{sec.title[lang]}</span>
              <span className="mt-auto text-sm">
                {best === null ? <span className="text-accent">{L('Начать тест', 'Start the test')}</span> : <span className={best >= 70 ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}>{L('Лучший результат', 'Best')}: {best}%</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
