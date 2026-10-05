import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { TOPICS } from '../../data/curriculum';
import { badges, dayStreak, useProgress } from '../../lib/progress';
import { useSession } from '../../lib/supabase';
import { StudyPlan } from './StudyPlan';

type Lang = 'ru' | 'en';
const SUBJ = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
];

/** The learner's progress: streak, per-subject completion by grade, quiz stats and badges */
export const ProgressPage: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const p = useProgress();
  const { user } = useSession();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const topics = useMemo(() => TOPICS.filter((t) => t.subject !== 'mathematics'), []);
  const done = topics.filter((t) => p.completed[t.id]).length;
  const streak = dayStreak(p);
  const list = badges(p, { all: topics.length });
  const quizzes = Object.values(p.quiz);
  const avg = quizzes.length ? Math.round((quizzes.reduce((s, q) => s + q.best / q.total, 0) / quizzes.length) * 100) : 0;
  const preds = Object.values(p.predictions);
  const predOk = preds.filter((x) => x.ok).length;

  // last 28 days activity
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().slice(0, 10);
  });
  const next = topics.find((t) => !p.completed[t.id] && p.quiz[t.id] === undefined && Object.keys(p.completed).some((id) => id.slice(0, 3) === t.id.slice(0, 3))) ?? topics.find((t) => !p.completed[t.id]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Мой прогресс', 'My progress')}</h1>
        <p className="mt-1 text-[15px] text-ink-2">{user
            ? L('Прогресс сохраняется в аккаунте и доступен на всех устройствах.', 'Progress is saved to your account and available on every device.')
            : L('Прогресс хранится в этом браузере. Войди в аккаунт, чтобы не потерять его.', 'Progress is saved in this browser. Log in to keep it safe.')}</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-surface border border-line p-4">
          <div className="text-xs text-ink-2">{L('Серия дней', 'Day streak')}</div>
          <div className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
            <Flame className={`w-6 h-6 ${streak ? 'text-[#F76B15]' : 'text-ink-3'}`} strokeWidth={1.75} />
            {streak}
          </div>
        </div>
        <div className="rounded-xl bg-surface border border-line p-4">
          <div className="text-xs text-ink-2">{L('Тем пройдено', 'Topics done')}</div>
          <div className="mt-1 font-serif text-3xl text-ink">
            {done}
            <span className="text-lg text-ink-3">/{topics.length}</span>
          </div>
        </div>
        <div className="rounded-xl bg-surface border border-line p-4">
          <div className="text-xs text-ink-2">{L('Средний балл тестов', 'Average quiz score')}</div>
          <div className="mt-1 font-serif text-3xl text-ink">{quizzes.length ? `${avg}%` : '—'}</div>
        </div>
        <div className="rounded-xl bg-surface border border-line p-4">
          <div className="text-xs text-ink-2">{L('Предсказания', 'Predictions')}</div>
          <div className="mt-1 font-serif text-3xl text-ink">
            {predOk}
            <span className="text-lg text-ink-3">/{preds.length}</span>
          </div>
        </div>
      </div>

      <section className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="bg-surface border border-line rounded-xl p-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('По предметам и классам', 'By subject and grade')}</h2>
          <div className="mt-4 flex flex-col gap-5">
            {SUBJ.map((s) => {
              const grades = [...new Set(topics.filter((t) => t.subject === s.id).map((t) => t.grade))].sort((a, b) => a - b);
              return (
                <div key={s.id}>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s[lang]}
                  </div>
                  <div className="mt-2 grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {grades.map((g) => {
                      const all = topics.filter((t) => t.subject === s.id && t.grade === g);
                      const d = all.filter((t) => p.completed[t.id]).length;
                      return (
                        <div key={g} className="rounded-lg bg-muted px-2.5 py-2">
                          <div className="text-[11px] text-ink-2">
                            {g} {L('кл.', 'gr.')}
                          </div>
                          <div className="font-mono text-xs text-ink">
                            {d}/{all.length}
                          </div>
                          <div className="mt-1 h-1 rounded-full bg-line overflow-hidden">
                            <div className="h-full" style={{ width: `${(d / all.length) * 100}%`, background: s.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Активность за 4 недели', 'Last 4 weeks')}</h2>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {days.map((d) => (
                <div key={d} title={d} className={`aspect-square rounded ${p.days.includes(d) ? 'bg-accent' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
          {next && (
            <button onClick={() => onOpenTopic(next.id)} className="text-left bg-accent rounded-xl p-5 hover:bg-accent-hover transition-colors cursor-pointer" style={{ color: '#fff' }}>
              <div className="text-xs opacity-80">{L('Продолжить', 'Continue')}</div>
              <div className="mt-1 font-serif text-xl">{next.title[lang]}</div>
              <div className="text-xs opacity-80 mt-1">
                {SUBJ.find((s) => s.id === next.subject)?.[lang]} · {next.grade} {L('класс', 'grade')}
              </div>
            </button>
          )}
        </div>
      </section>

      <StudyPlan lang={lang} onOpenTopic={onOpenTopic} />

      <section>
        <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">
          {L('Значки', 'Badges')} · {list.filter((b) => b.got).length}/{list.length}
        </h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {list.map((b) => (
            <div key={b.id} className={`rounded-xl border p-4 ${b.got ? 'bg-surface border-line' : 'bg-muted/60 border-line'}`}>
              <div className="flex items-start gap-3">
                <span className={`text-3xl leading-none ${b.got ? '' : 'grayscale opacity-40'}`}>{b.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${b.got ? 'text-ink' : 'text-ink-2'}`}>{b.title[lang]}</div>
                  <div className="text-xs text-ink-3">{b.text[lang]}</div>
                  {!b.got && (
                    <div className="mt-2 h-1 rounded-full bg-line overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${b.part * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProgressPage;
