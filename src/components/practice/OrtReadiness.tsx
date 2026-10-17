import React, { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { SECTIONS } from '../../data/curriculum';
import { PROBLEMS } from '../../lib/problems';
import { useProgress } from '../../lib/progress';

type Lang = 'ru' | 'en';
const SUBJ = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
];

/** how ready the learner is for each ORT subject test, and the weakest sections to fix first */
export const OrtReadiness: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const p = useProgress();

  const rows = useMemo(
    () =>
      SUBJ.map((s) => {
        const secs = SECTIONS.filter((x) => x.subject === s.id && x.grade >= 7);
        const topics = secs.flatMap((x) => x.topics);
        const coverage = topics.length ? topics.filter((t) => p.completed[t.id]).length / topics.length : 0;
        const gens = PROBLEMS.filter((g) => g.subject === s.id);
        const tried = gens.map((g) => p.problems?.[g.id]).filter((x): x is { ok: number; total: number } => !!x && x.total > 0);
        const solved = tried.reduce((a, x) => a + x.ok, 0);
        const total = tried.reduce((a, x) => a + x.total, 0);
        const accuracy = total >= 5 ? solved / total : null;
        const mocks = p.tests.filter((t) => t.section === 'ort' && t.subject === s.id).slice(-3);
        const mock = mocks.length ? mocks.reduce((a, t) => a + t.score / t.total, 0) / mocks.length : null;
        // weights shift to what we actually know about the learner
        const parts: [number, number][] = [[coverage, 0.3]];
        if (accuracy !== null) parts.push([accuracy, 0.3]);
        if (mock !== null) parts.push([mock, 0.4]);
        const w = parts.reduce((a, [, k]) => a + k, 0);
        const score = Math.round((parts.reduce((a, [v, k]) => a + v * k, 0) / w) * 100);
        // weakest sections: least covered first, with at least one unfinished topic
        const weak = secs
          .map((x) => ({ sec: x, share: x.topics.filter((t) => p.completed[t.id]).length / x.topics.length, next: x.topics.find((t) => !p.completed[t.id]) }))
          .filter((x) => x.next)
          .sort((a, b) => a.share - b.share || a.sec.grade - b.sec.grade)
          .slice(0, 3);
        const weakProblems = gens
          .map((g) => ({ g, st: p.problems?.[g.id] }))
          .filter((x) => x.st && x.st.total >= 3 && x.st.ok / x.st.total < 0.6)
          .slice(0, 2);
        return { s, coverage, accuracy, mock, mocks, score, weak, weakProblems };
      }),
    [p],
  );

  const verdict = (v: number) => (v >= 80 ? L('готов', 'ready') : v >= 60 ? L('почти готов', 'nearly there') : v >= 35 ? L('нужна практика', 'needs practice') : L('только начинаешь', 'just starting'));

  return (
    <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Gauge className="w-5 h-5 text-accent" />
        <h2 className="font-serif text-2xl text-ink">{L('Готовность к ОРТ', 'Exam readiness')}</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {rows.map(({ s, coverage, accuracy, mock, mocks, score, weak, weakProblems }) => (
          <div key={s.id} className="rounded-xl border border-line p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s[lang]}
              </span>
              <span className="text-xs text-ink-2">{verdict(score)}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-serif text-4xl text-ink">{score}%</span>
              {mocks.length > 1 && (
                <svg viewBox="0 0 60 24" className="w-16 h-6 mb-1.5" aria-hidden>
                  <polyline points={mocks.map((t, i) => `${(i / (mocks.length - 1)) * 58 + 1},${23 - (t.score / t.total) * 22}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2" />
                </svg>
              )}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${score}%`, background: s.color }} />
            </div>
            <div className="text-xs text-ink-2 flex flex-col gap-0.5">
              <span>
                {L('Темы 7–11 кл.', 'Topics, grades 7–11')}: <b className="text-ink">{Math.round(coverage * 100)}%</b>
              </span>
              <span>
                {L('Точность в задачах', 'Problem accuracy')}: <b className="text-ink">{accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`}</b>
              </span>
              <span>
                {L('Пробные ОРТ', 'Mock exams')}: <b className="text-ink">{mock === null ? L('ещё не сдавал', 'none yet') : `${Math.round(mock * 100)}%`}</b>
              </span>
            </div>
            {(weak.length > 0 || weakProblems.length > 0) && (
              <div className="border-t border-line pt-2">
                <div className="text-[11px] uppercase tracking-[0.05em] text-ink-3 mb-1">{L('Подтянуть в первую очередь', 'Fix first')}</div>
                <ul className="flex flex-col gap-1">
                  {weak.map((x) => (
                    <li key={x.sec.id}>
                      <button onClick={() => onOpenTopic(x.next!.id)} className="text-left text-sm text-accent hover:underline cursor-pointer">
                        {x.sec.grade} {L('кл.', 'gr.')} · {x.sec.title[lang]}
                      </button>
                    </li>
                  ))}
                  {weakProblems.map((x) => (
                    <li key={x.g.id} className="text-sm text-[#B42318]">
                      {L('Задачи', 'Problems')}: {x.g.title[lang]} ({x.st!.ok}/{x.st!.total})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-3">{L('Это оценка по твоей работе на сайте, а не официальный балл ОРТ. Чем больше пробных экзаменов и задач, тем точнее прогноз.', 'This is an estimate from your work on the site, not an official exam score. More mock exams and problems make it more accurate.')}</p>
    </div>
  );
};

export default OrtReadiness;
