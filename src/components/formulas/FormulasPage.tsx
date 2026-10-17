import React, { useMemo, useState } from 'react';
import { Printer, Search } from 'lucide-react';
import { SECTIONS, SUBJECTS } from '../../data/curriculum';
import type { StemCategory } from '../../types/stem';
import { Formula } from '../Formula';

/* Every key formula from the textbook on one page: search, filter, print for exam prep. */

type Lang = 'ru' | 'en';

const SUBJECT: Record<string, { ru: string; en: string; color: string }> = {
  physics: { ru: 'Физика', en: 'Physics', color: '#E5484D' },
  chemistry: { ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  biology: { ru: 'Биология', en: 'Biology', color: '#F5A524' },
  mathematics: { ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
};

export const FormulasPage: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [subject, setSubject] = useState<StemCategory>('physics');
  const [grade, setGrade] = useState<number | 'all'>('all');
  const [q, setQ] = useState('');

  const all = useMemo(
    () =>
      SECTIONS.flatMap((s) =>
        s.topics.filter((t) => t.formula).map((t) => ({ topic: t, section: s })),
      ),
    [],
  );
  const grades = useMemo(() => [...new Set(all.filter((x) => x.topic.subject === subject).map((x) => x.topic.grade))].sort((a, b) => a - b), [all, subject]);

  const query = q.trim().toLowerCase();
  const shown = all.filter(
    ({ topic, section }) =>
      (query
        ? topic.title[lang].toLowerCase().includes(query) || section.title[lang].toLowerCase().includes(query) || topic.keywords.some((k) => k.includes(query)) || topic.formula!.toLowerCase().includes(query)
        : topic.subject === subject && (grade === 'all' || topic.grade === grade)),
  );

  // group: grade → section
  const groups: { key: string; grade: number; subject: string; title: string; items: typeof shown }[] = [];
  for (const x of shown) {
    const key = x.section.id;
    let g = groups.find((y) => y.key === key);
    if (!g) groups.push((g = { key, grade: x.topic.grade, subject: x.topic.subject, title: x.section.title[lang], items: [] }));
    g.items.push(x);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Шпаргалка формул', 'Formula sheet')}</h1>
          <p className="text-ink-2 mt-1">{L(`Все главные формулы учебника — ${all.length} штук. Нажми на карточку, чтобы открыть тему.`, `Every key formula in the textbook, ${all.length} in all. Tap a card to open its topic.`)}</p>
        </div>
        <button onClick={() => window.print()} className="print:hidden h-9 px-3 rounded-lg border border-line bg-surface text-sm text-ink inline-flex items-center gap-1.5 hover:bg-muted cursor-pointer">
          <Printer className="w-4 h-4" />
          {L('Распечатать', 'Print')}
        </button>
      </div>

      <div className="print:hidden flex flex-col gap-3">
        <label className="flex items-center gap-2 h-10 px-3 rounded-lg bg-surface border border-line focus-within:border-accent max-w-md">
          <Search className="w-4 h-4 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Найти: давление, импульс, моль…', 'Find: pressure, momentum, mole…')} className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-3" />
        </label>
        {!query && (
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setGrade('all');
                }}
                className={`h-9 px-3.5 rounded-full text-sm border inline-flex items-center gap-2 cursor-pointer ${subject === s ? 'border-ink' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}
                style={subject === s ? { color: '#fff', background: '#16171A' } : undefined}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: SUBJECT[s].color }} />
                {SUBJECT[s][lang]}
              </button>
            ))}
            <span className="w-px bg-line mx-1" />
            {(['all', ...grades] as const).map((g) => (
              <button key={g} onClick={() => setGrade(g)} className={`h-9 px-3 rounded-full text-sm border cursor-pointer ${grade === g ? 'bg-accent-soft border-accent text-accent font-medium' : 'bg-surface border-line text-ink-2 hover:text-ink'}`}>
                {g === 'all' ? L('Все классы', 'All grades') : `${g} ${L('кл.', 'gr.')}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 && <p className="text-ink-2">{L('Ничего не нашлось. Попробуй другое слово.', 'Nothing found. Try another word.')}</p>}

      {groups.map((g) => (
        <section key={g.key} className="break-inside-avoid">
          <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: SUBJECT[g.subject]?.color }} />
            {g.grade} {L('класс', 'grade')} · {g.title}
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {g.items.map(({ topic }) => (
              <button key={topic.id} onClick={() => onOpenTopic(topic.id)} className="text-left bg-surface border border-line rounded-xl px-4 py-3 hover:border-accent hover:shadow-sm transition-all cursor-pointer break-inside-avoid min-w-0">
                <div className="text-[13px] text-ink-2 truncate">{topic.title[lang]}</div>
                <div className="mt-1.5 overflow-x-auto overflow-y-hidden text-ink text-[17px] [scrollbar-width:thin]">
                  <Formula tex={topic.formula!} display />
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default FormulasPage;
