import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Link2, Search, Trophy, X } from 'lucide-react';
import { gradesFor, Section, SECTIONS, topicById, TOPICS } from '../../data/curriculum';
import type { StemCategory } from '../../types/stem';
import { useProgress } from '../../lib/progress';
import { sectionIcon } from './sectionIcons';
import { useScreenDetail } from '../../lib/pageContext';

/* The course as a game path: one winding road per subject, a stop for every section, grade by grade.
   Finished sections are filled in, the first unfinished one is "you are here". */

type Lang = 'ru' | 'en';
const SUBJ: StemCategory[] = ['physics', 'chemistry', 'biology', 'mathematics'];
const COLOR: Record<string, string> = { physics: '#E5484D', chemistry: '#30A46C', biology: '#F5A524', mathematics: '#8E4EC6' };
const SOFT: Record<string, string> = { physics: '#FDECEC', chemistry: '#E7F6EE', biology: '#FEF4E0', mathematics: '#F3ECFA' };
const NAME: Record<string, { ru: string; en: string }> = {
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
  mathematics: { ru: 'Математика', en: 'Maths' },
};

/** hand-picked links where one subject explains another */
const CROSS: [string, string, { ru: string; en: string }][] = [
  ['c8-combustion', 'p8-fuel', { ru: 'энергия горения', en: 'energy of burning' }],
  ['c8-combustion', 'b6-respiration', { ru: 'окисление', en: 'oxidation' }],
  ['p7-diffusion', 'b5-cell-life', { ru: 'диффузия в клетке', en: 'diffusion in cells' }],
  ['p8-eye', 'b8-other-senses', { ru: 'оптика глаза', en: 'optics of the eye' }],
  ['p9-sound', 'b8-other-senses', { ru: 'слух', en: 'hearing' }],
  ['p10-liquids', 'c11-electrolysis', { ru: 'электролиз', en: 'electrolysis' }],
  ['p8-atom-charge', 'c8-atom', { ru: 'строение атома', en: 'atomic structure' }],
  ['p11-nucleus', 'c11-atom-models', { ru: 'ядро', en: 'nucleus' }],
  ['p9-light-em', 'b6-photosynthesis', { ru: 'свет — энергия фотосинтеза', en: 'light powers photosynthesis' }],
  ['c9-catalysis', 'b10-enzymes', { ru: 'катализ', en: 'catalysis' }],
  ['c10-proteins', 'b10-proteins', { ru: 'белки', en: 'proteins' }],
  ['c10-carbohydrates', 'b10-carbs-lipids', { ru: 'углеводы', en: 'carbohydrates' }],
  ['c10-esters-fats', 'b10-carbs-lipids', { ru: 'жиры', en: 'fats' }],
  ['c8-water', 'b5-cell-chemistry', { ru: 'вода в клетке', en: 'water in cells' }],
  ['p7-atmosphere', 'b8-respiratory-organs', { ru: 'давление и вдох', en: 'pressure and breathing' }],
  ['p7-liquid-pressure', 'b8-vessels-circuits', { ru: 'давление крови', en: 'blood pressure' }],
  ['p8-radiation', 'c11-ecology', { ru: 'парниковый эффект', en: 'greenhouse effect' }],
  ['c11-ecology', 'b11-global-problems', { ru: 'климат', en: 'climate' }],
  ['p9-radioactivity', 'b11-hereditary-diseases', { ru: 'мутации от излучения', en: 'radiation mutations' }],
  ['p10-semiconductors', 'c9-silicon', { ru: 'кремний', en: 'silicon' }],
  ['b10-photosynthesis', 'c11-redox', { ru: 'окисление-восстановление', en: 'redox' }],
  ['b10-metabolism', 'p10-energy', { ru: 'закон сохранения энергии', en: 'energy conservation' }],
];

const ROW = 132; // vertical step between stops
const W = 360; // width of the road
const SWAY = [0, 72, 108, 72, 0, -72, -108, -72]; // left–right wiggle of the road
const NODE = 72;
const TOP = 30; // room above the first stop for the "you are here" tag

/** progress ring around a stop */
const Ring: React.FC<{ share: number; color: string; fill?: boolean }> = ({ share, color, fill }) => {
  const r = NODE / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <svg width={NODE} height={NODE} className="absolute inset-0 -rotate-90" aria-hidden>
      <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke="#E5E5E0" strokeWidth="6" />
      {share > 0 &&
        (fill ? (
          // just finished: the ring closes up
          <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" className="map-ring-fill" />
        ) : (
          <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${c * share} ${c}`} />
        ))}
    </svg>
  );
};

/** confetti burst around a stop */
const Burst: React.FC<{ color: string }> = ({ color }) => (
  <span className="absolute left-1/2 top-1/2 pointer-events-none" aria-hidden>
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const d = 56 + (i % 3) * 18;
      const style = { width: i % 2 ? 11 : 8, height: i % 2 ? 11 : 8, marginLeft: -5, marginTop: -5, background: [color, '#FFD60A', '#5B8CFF'][i % 3], '--dx': `${Math.cos(a) * d}px`, '--dy': `${Math.sin(a) * d}px` } as React.CSSProperties;
      return <span key={i} className="map-burst absolute rounded-full" style={style} />;
    })}
  </span>
);

// timings of the "section done" animation, ms
const T_POP = 350;
const T_DRAW = 1000;
const T_HOP = 1700;
const T_END = 2800;

export const CourseMap: React.FC<{ lang: Lang; onOpenTopic: (id: string) => void }> = ({ lang, onOpenTopic }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { completed } = useProgress();
  const shareOf = (s: Section) => s.topics.filter((t) => completed[t.id]).length / Math.max(1, s.topics.length);

  // start on the subject with the most progress
  const [subject, setSubject] = useState<StemCategory>(() => {
    const done = (s: string) => TOPICS.filter((t) => t.subject === s && completed[t.id]).length;
    return [...SUBJ].sort((a, b) => done(b) - done(a))[0];
  });
  const sections = useMemo(() => gradesFor(subject).flatMap((g) => SECTIONS.filter((s) => s.subject === subject && s.grade === g)), [subject]);
  const here = sections.find((s) => shareOf(s) < 1);

  // sections finished since the last visit get a little celebration
  const [party, setParty] = useState<string | null>(null);
  useEffect(() => {
    const done = SECTIONS.filter((s) => s.topics.every((t) => completed[t.id])).map((s) => s.id);
    let seen: string[] | null = null;
    try {
      seen = JSON.parse(localStorage.getItem('mapSeenDone') ?? 'null');
    } catch {
      seen = null;
    }
    const save = (ids: string[]) => {
      try {
        localStorage.setItem('mapSeenDone', JSON.stringify(ids));
      } catch {
        // storage unavailable: the celebration simply repeats next time
      }
    };
    // first visit: everything already done counts as seen
    if (!seen) {
      save(done);
      return;
    }
    const before = seen;
    const fresh = done.filter((id) => !before.includes(id));
    if (!fresh.length) return;
    const last = SECTIONS.filter((s) => fresh.includes(s.id)).pop()!;
    setSubject(last.subject);
    setParty(last.id);
    setTimeout(() => nodes.current[last.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    const id = setTimeout(() => {
      setParty(null);
      save([...before, ...fresh]);
    }, T_END);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const partySection = party ? SECTIONS.find((s) => s.id === party) : null;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = sections.find((s) => s.id === openId) ?? null;
  useScreenDetail(
    'map',
    open
      ? `Открыт раздел «${open.title.ru}» (${NAME[open.subject].ru}, ${open.grade} класс). Темы: ${open.topics.map((tp) => `${completed[tp.id] ? '✓' : '○'} ${tp.title.ru}`).join('; ')}.`
      : here
        ? `Предмет: ${NAME[subject].ru}. Следующий непройденный раздел ученика: «${here.title.ru}», ${here.grade} класс.`
        : `Предмет ${NAME[subject].ru} пройден полностью.`,
  );
  const [q, setQ] = useState('');
  const nodes = useRef<Record<string, HTMLButtonElement | null>>({});
  // the road narrows on phones: the wiggle shrinks so the labels always fit
  const road = useRef<HTMLDivElement>(null);
  const [rw, setRw] = useState(W);
  useEffect(() => {
    const el = road.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRw(Math.min(W, el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const LW = rw < W ? 150 : 180;
  const sway = Math.min(1, (rw / 2 - LW / 2) / 108);

  // bring "you are here" into view when a subject opens
  useEffect(() => {
    if (!here) return;
    const el = nodes.current[here.id];
    if (el && here !== sections[0]) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return TOPICS.filter((t) => t.title.ru.toLowerCase().includes(s) || t.title.en.toLowerCase().includes(s)).slice(0, 8);
  }, [q]);
  const jumpTo = (topicId: string) => {
    const t = topicById(topicId);
    if (!t) return;
    setQ('');
    setSubject(t.subject);
    setOpenId(t.sectionId);
    setTimeout(() => nodes.current[t.sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
  };

  const subjectStats = (s: StemCategory) => {
    const all = TOPICS.filter((t) => t.subject === s);
    return { done: all.filter((t) => completed[t.id]).length, total: all.length };
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Карта курса', 'Course map')}</h1>
          <p className="mt-1 text-[15px] text-ink-2 max-w-xl">{L('Твой путь от 5 до 11 класса. Каждый кружок — раздел учебника: нажми, чтобы увидеть темы и продолжить.', 'Your road from grade 5 to 11. Every stop is a section: tap it to see its topics and carry on.')}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <label className="flex items-center gap-2 h-10 px-3 rounded-lg bg-surface border border-line focus-within:border-accent">
            <Search className="w-4 h-4 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Найти тему на карте', 'Find a topic')} className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-3" />
          </label>
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full bg-surface border border-line rounded-lg shadow-lg overflow-hidden">
              {results.map((t) => (
                <li key={t.id}>
                  <button onClick={() => jumpTo(t.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 cursor-pointer">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLOR[t.subject] }} />
                    <span className="flex-1 truncate text-ink">{t.title[lang]}</span>
                    <span className="text-xs text-ink-3">
                      {t.grade} {L('кл.', 'gr.')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
        {SUBJ.map((s) => {
          const st = subjectStats(s);
          const on = s === subject;
          return (
            <button
              key={s}
              onClick={() => {
                setSubject(s);
                setOpenId(null);
              }}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${on ? 'border-transparent' : 'bg-surface border-line hover:border-line-strong'}`}
              style={on ? { background: COLOR[s], color: '#fff' } : undefined}
            >
              <div className="text-sm font-medium">{NAME[s][lang]}</div>
              <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${on ? 'bg-white/30' : 'bg-muted'}`}>
                <div className="h-full rounded-full" style={{ width: `${(st.done / Math.max(1, st.total)) * 100}%`, background: on ? '#fff' : COLOR[s] }} />
              </div>
              <div className={`mt-1 text-[11px] font-mono ${on ? 'opacity-90' : 'text-ink-3'}`}>
                {st.done}/{st.total}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* the road */}
        <div ref={road} className="relative rounded-2xl border border-line py-6 overflow-hidden" style={{ background: `radial-gradient(circle at 50% 0%, ${SOFT[subject]}, #FAFAF7 60%)` }}>
          {gradesFor(subject).map((g) => {
            const secs = sections.filter((s) => s.grade === g);
            const start = sections.indexOf(secs[0]);
            const gradeDone = secs.every((s) => shareOf(s) === 1);
            const pts = secs.map((_, i) => ({ x: rw / 2 + SWAY[(start + i) % SWAY.length] * sway, y: TOP + i * ROW + ROW / 2 }));
            return (
              <section key={g} className="mb-2">
                <div className="mx-auto max-w-[360px] px-4 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-line" />
                    <span className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-sm font-medium ${gradeDone && secs.some((s) => s.id === party) ? 'map-pop' : ''}`} style={{ ...(gradeDone ? { background: COLOR[subject], color: '#fff' } : { background: '#fff', border: '1px solid #E5E5E0', color: '#16171A' }), animationDelay: `${T_HOP}ms` }}>
                      {gradeDone && <Trophy className="w-4 h-4" />}
                      {g} {L('класс', 'grade')}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                </div>
                <div className="relative mx-auto" style={{ width: rw, height: TOP + secs.length * ROW }}>
                  <svg className="absolute inset-0" width={rw} height={TOP + secs.length * ROW} aria-hidden>
                    {pts.slice(1).map((b, i) => {
                      const a = pts[i];
                      const done = shareOf(secs[i]) === 1;
                      const d = `M${a.x},${a.y} C${a.x},${a.y + ROW / 2} ${b.x},${b.y - ROW / 2} ${b.x},${b.y}`;
                      // the road after a just-finished stop draws itself
                      if (done && secs[i].id === party)
                        return (
                          <g key={i}>
                            <path d={d} fill="none" stroke="#D9D9D3" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
                            <path d={d} fill="none" stroke={COLOR[subject]} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" className="map-draw" style={{ animationDelay: `${T_DRAW}ms` }} />
                          </g>
                        );
                      return <path key={i} d={d} fill="none" stroke={done ? COLOR[subject] : '#D9D9D3'} strokeWidth={done ? 6 : 4} strokeDasharray={done ? undefined : '2 10'} strokeLinecap="round" />;
                    })}
                  </svg>
                  {secs.map((s, i) => {
                    const share = shareOf(s);
                    const isHere = here?.id === s.id;
                    const celebrating = party === s.id;
                    const isOpen = openId === s.id;
                    const p = pts[i];
                    return (
                      <div key={s.id} className="absolute flex flex-col items-center" style={{ left: p.x - LW / 2, top: p.y - NODE / 2, width: LW }}>
                        {isHere && (
                          <span className={`absolute -top-9 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md ${party ? 'map-hop' : 'animate-bounce'}`} style={{ background: '#16171A', color: '#fff', animationDelay: party ? `${T_HOP}ms` : undefined }}>
                            {Object.keys(completed).length ? L('Ты здесь', 'You are here') : L('Начни отсюда', 'Start here')}
                          </span>
                        )}
                        <button
                          ref={(el) => {
                            nodes.current[s.id] = el;
                          }}
                          onClick={() => setOpenId(isOpen ? null : s.id)}
                          aria-label={s.title[lang]}
                          className={`relative rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer ${celebrating ? 'map-pop' : ''}`}
                          style={{ width: NODE, height: NODE, animationDelay: celebrating ? `${T_POP}ms` : undefined, boxShadow: isOpen ? `0 0 0 6px ${COLOR[subject]}40` : isHere ? `0 0 0 6px ${COLOR[subject]}26` : undefined }}
                        >
                          <Ring share={share} color={COLOR[subject]} fill={celebrating} />
                          {celebrating && <Burst color={COLOR[subject]} />}
                          <span
                            className="absolute inset-[9px] rounded-full flex items-center justify-center font-semibold text-lg"
                            style={share === 1 ? { background: COLOR[subject], color: '#fff', boxShadow: `inset 0 -4px 0 rgba(0,0,0,0.15)` } : share > 0 || isHere ? { background: '#fff', color: COLOR[subject], boxShadow: 'inset 0 -4px 0 #EDEDE8' } : { background: '#F1F1EC', color: '#A3A6AD', boxShadow: 'inset 0 -4px 0 #E2E2DC' }}
                          >
                            {React.createElement(sectionIcon(s), { className: 'w-7 h-7', strokeWidth: 2 })}
                            {share === 1 && (
                              <span className="absolute -right-1.5 -bottom-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white" style={{ background: '#16171A' }}>
                                <Check className="w-3.5 h-3.5" style={{ color: '#fff' }} strokeWidth={3.5} />
                              </span>
                            )}
                          </span>
                        </button>
                        <span className={`mt-1.5 text-center text-[12.5px] leading-tight line-clamp-2 ${share > 0 || isHere ? 'text-ink font-medium' : 'text-ink-2'}`}>{s.title[lang]}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <div className="text-center text-sm text-ink-3 pt-2">{L('Финиш — готов к ОРТ 🎓', 'Finish line: exam ready 🎓')}</div>
          {partySection && (
            <div className="map-toast sticky bottom-4 mx-auto w-max max-w-[90%] mt-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2" style={{ background: '#16171A', color: '#fff' }}>
              <Trophy className="w-4 h-4 text-[#FFD60A]" />
              {L(`Раздел «${partySection.title.ru}» пройден!`, `Section “${partySection.title.en}” done!`)}
            </div>
          )}
          <style>{`
            .map-pop { animation: mapPop 0.6s cubic-bezier(.3,1.6,.5,1) both; }
            @keyframes mapPop { 0% { transform: scale(.7) } 60% { transform: scale(1.18) } 100% { transform: scale(1) } }
            .map-ring-fill { stroke-dashoffset: 1; animation: mapFill .7s ease-out 350ms forwards; }
            @keyframes mapFill { to { stroke-dashoffset: 0 } }
            .map-burst { opacity: 0; animation: mapBurst .9s ease-out 600ms forwards; }
            @keyframes mapBurst { 0% { opacity: 1; transform: translate(0, 0) scale(1) } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.3) } }
            .map-draw { stroke-dashoffset: 1; animation: mapFill .8s ease-in-out both; }
            .map-hop { animation: mapHop .7s cubic-bezier(.3,1.5,.5,1) both; }
            @keyframes mapHop { 0% { opacity: 0; transform: translateY(-40px) } 100% { opacity: 1; transform: none } }
            .map-toast { animation: mapToast 2800ms ease both; }
            @keyframes mapToast { 0%, 100% { opacity: 0; transform: translateY(10px) } 12%, 85% { opacity: 1; transform: none } }
            @media (prefers-reduced-motion: reduce) { .map-pop, .map-ring-fill, .map-burst, .map-draw, .map-hop, .map-toast { animation: none !important; stroke-dashoffset: 0; } }
          `}</style>
        </div>

        {/* section details: a side panel on desktop, a bottom sheet on phones */}
        {open ? (
          <SectionPanel lang={lang} s={open} completed={completed} onOpenTopic={onOpenTopic} onClose={() => setOpenId(null)} />
        ) : (
          <aside className="hidden lg:block sticky top-20 bg-surface border border-line rounded-xl p-5 text-sm text-ink-2">
            {here ? (
              <>
                <div className="text-xs uppercase tracking-[0.05em] text-ink-3">{L('Следующий шаг', 'Next step')}</div>
                <div className="mt-1 font-serif text-xl text-ink">{here.title[lang]}</div>
                <div className="text-xs text-ink-3">
                  {here.grade} {L('класс', 'grade')}
                </div>
                <button onClick={() => setOpenId(here.id)} className="mt-3 h-10 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ background: COLOR[subject], color: '#fff' }}>
                  {L('Открыть раздел', 'Open the section')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <p>{L('Весь предмет пройден — ты молодец!', 'The whole subject is done. Well done!')}</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

const SectionPanel: React.FC<{ lang: Lang; s: Section; completed: Record<string, boolean>; onOpenTopic: (id: string) => void; onClose: () => void }> = ({ lang, s, completed, onOpenTopic, onClose }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const done = s.topics.filter((t) => completed[t.id]).length;
  const next = s.topics.find((t) => !completed[t.id]) ?? s.topics[0];
  const ids = new Set(s.topics.map((t) => t.id));
  const links = CROSS.filter(([a, b]) => ids.has(a) || ids.has(b))
    .map(([a, b, why]) => ({ other: topicById(ids.has(a) ? b : a), why }))
    .filter((x) => x.other);
  return (
    <>
      <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed lg:sticky z-50 lg:z-auto inset-x-0 bottom-0 lg:top-20 max-h-[78vh] lg:max-h-[calc(100vh-6rem)] overflow-y-auto bg-surface border border-line rounded-t-2xl lg:rounded-xl p-5 shadow-2xl lg:shadow-none">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-[0.05em]" style={{ color: COLOR[s.subject] }}>
              {NAME[s.subject][lang]} · {s.grade} {L('класс', 'grade')}
            </div>
            <h2 className="mt-0.5 font-serif text-2xl leading-tight text-ink">{s.title[lang]}</h2>
          </div>
          <button onClick={onClose} aria-label={L('Закрыть', 'Close')} className="w-8 h-8 rounded-md flex items-center justify-center text-ink-2 hover:bg-hover cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(done / s.topics.length) * 100}%`, background: COLOR[s.subject] }} />
          </div>
          <span className="font-mono text-xs text-ink-2">
            {done}/{s.topics.length}
          </span>
        </div>
        <button onClick={() => onOpenTopic(next.id)} className="mt-4 w-full h-11 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: COLOR[s.subject], color: '#fff' }}>
          {done === s.topics.length ? L('Повторить раздел', 'Revise the section') : done ? L('Продолжить', 'Continue') : L('Начать раздел', 'Start the section')}: {next.title[lang]}
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
        <ul className="mt-4 flex flex-col">
          {s.topics.map((t) => (
            <li key={t.id}>
              <button onClick={() => onOpenTopic(t.id)} className="w-full text-left flex items-center gap-2.5 py-2 border-t border-line hover:bg-muted -mx-2 px-2 rounded cursor-pointer">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={completed[t.id] ? { background: COLOR[s.subject] } : { border: '2px solid #D9D9D3' }}>
                  {completed[t.id] && <Check className="w-3 h-3" style={{ color: '#fff' }} strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-sm ${completed[t.id] ? 'text-ink-2' : 'text-ink'}`}>{t.title[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
        {links.length > 0 && (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.05em] text-ink-3 mb-1.5 inline-flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              {L('Связано с другими предметами', 'Linked to other subjects')}
            </div>
            <ul className="flex flex-col gap-1.5">
              {links.map(({ other, why }) => (
                <li key={other!.id}>
                  <button onClick={() => onOpenTopic(other!.id)} className="text-left text-sm hover:underline cursor-pointer">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: COLOR[other!.subject] }} />
                    <span className="text-ink">{other!.title[lang]}</span>
                    <span className="text-ink-3">
                      {' '}
                      · {NAME[other!.subject][lang]} {other!.grade} — {why[lang]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </>
  );
};

export default CourseMap;
