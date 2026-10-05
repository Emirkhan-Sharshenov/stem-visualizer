import React, { useMemo } from 'react';
import { ArrowRight, Calculator, Route } from 'lucide-react';
import { SECTIONS, topicById } from '../../data/curriculum';
import type { Topic } from '../../data/curriculum/types';
import { PROBLEMS } from '../../lib/problems';
import { Progress, useProgress } from '../../lib/progress';
import { usePlan } from '../../lib/plan';
import { ProGate } from '../pro/ProPage';

type Lang = 'ru' | 'en';
type T2 = { ru: string; en: string };
const COLOR: Record<string, string> = { physics: '#E5484D', chemistry: '#30A46C', biology: '#F5A524' };

interface Step {
  topic: Topic;
  why: T2;
  weight: number;
  kind: 'quiz' | 'problem' | 'gap';
}

/** what to revise next: failed topic quizzes, weak problem types, and gaps inside sections already started */
export function buildPlan(p: Progress, limit = 8): Step[] {
  const steps = new Map<string, Step>();
  const add = (s: Step) => {
    const cur = steps.get(s.topic.id);
    if (!cur || cur.weight < s.weight) steps.set(s.topic.id, s);
  };

  for (const [id, q] of Object.entries(p.quiz)) {
    const t = topicById(id);
    const share = q.best / q.total;
    if (t && share < 0.75) {
      const pct = Math.round(share * 100);
      add({ topic: t, kind: 'quiz', weight: 3 - share, why: { ru: `тест темы: ${pct}%, нужно 75%`, en: `topic quiz: ${pct}%, 75% needed` } });
    }
  }

  for (const g of PROBLEMS) {
    const st = p.problems?.[g.id];
    if (!st || st.total < 2 || st.ok / st.total >= 0.6) continue;
    const t = g.topics.map(topicById).find(Boolean);
    if (t) add({ topic: t, kind: 'problem', weight: 2.5 - st.ok / st.total, why: { ru: `задачи «${g.title.ru}»: ${st.ok} из ${st.total}`, en: `“${g.title.en}” problems: ${st.ok} of ${st.total}` } });
  }

  for (const s of SECTIONS) {
    const started = s.topics.some((t) => p.completed[t.id]);
    if (!started) continue;
    s.topics.forEach((t, i) => {
      // a skipped topic that sits before one already done
      if (!p.completed[t.id] && s.topics.slice(i + 1).some((x) => p.completed[x.id])) add({ topic: t, kind: 'gap', weight: 1, why: { ru: 'пропущена в разделе', en: 'skipped in its section' } });
    });
  }

  return [...steps.values()].sort((a, b) => b.weight - a.weight).slice(0, limit);
}

const SAMPLE: T2[] = [
  { ru: 'тест темы: 50%, нужно 75%', en: 'topic quiz: 50%, 75% needed' },
  { ru: 'расчётные задачи: 1 из 4', en: 'calculation problems: 1 of 4' },
  { ru: 'пропущена в разделе', en: 'skipped in its section' },
];

/** Pro: a personal revision plan built from the learner's own mistakes */
export const StudyPlan: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const p = useProgress();
  const plan = usePlan();
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const steps = useMemo(() => buildPlan(p), [p]);

  // a believable preview behind the lock for free users
  const shown: Step[] = plan.pro ? steps : SECTIONS.slice(3, 6).map((s, i) => ({ topic: s.topics[0], kind: 'quiz', weight: 0, why: SAMPLE[i] }));

  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 inline-flex items-center gap-1.5">
        <Route className="w-3.5 h-3.5" strokeWidth={2} />
        {L('Мой план повторения', 'My revision plan')}
      </h2>
      <div className="mt-3">
        <ProGate
          lang={lang}
          pro={plan.pro}
          onUpgrade={() => window.dispatchEvent(new Event('open-pro'))}
          title={L('Персональный план — в Pro', 'Personal plan is part of Pro')}
          text={L('Собираем твои ошибки в тестах и задачах и говорим, что повторить в первую очередь.', 'We gather your mistakes in quizzes and problems and tell you what to revise first.')}
        >
          {shown.length === 0 ? (
            <div className="bg-surface border border-line rounded-xl p-5 text-sm text-ink-2">
              {L('Пока нечего повторять. Проходи тесты в конце тем и решай задачи — план появится по твоим ошибкам.', 'Nothing to revise yet. Take topic quizzes and solve problems, and the plan will build itself from your mistakes.')}
            </div>
          ) : (
            <ol className="bg-surface border border-line rounded-xl divide-y divide-line">
              {shown.map((s, i) => (
                <li key={s.topic.id}>
                  <button onClick={() => onOpenTopic(s.topic.id)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-muted font-mono text-xs text-ink-2 flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] text-ink truncate">{s.topic.title[lang]}</span>
                      <span className="text-xs text-ink-3 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLOR[s.topic.subject] }} />
                        {s.topic.grade} {L('кл.', 'gr.')} · {s.kind === 'problem' && <Calculator className="w-3 h-3" strokeWidth={2} />}
                        {s.why[lang]}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-ink-3 shrink-0" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </ProGate>
      </div>
    </section>
  );
};
