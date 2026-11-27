import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronRight, Flag, Pencil, RotateCcw, Target, TrendingUp } from 'lucide-react';
import { useProgress } from '../../lib/progress';
import { ORT_DRILLS, type OrtDrill } from '../../lib/ort/paper';
import { ORT_MAX, ORT_SECTIONS, ORT_THRESHOLD, type OrtSectionId } from '../../lib/ort/sections';
import { buildDay, localDay, ortPlan, predictionHistory, predictScore, sectionSkills, useOrtPlan, weekAhead, type OrtPlanSettings, type Phase, type PlanTask } from '../../lib/ortPlan';

type Lang = 'ru' | 'en';

const PHASE: Record<Phase, { ru: string; en: string; dru: string; den: string }> = {
  none: { ru: '', en: '', dru: '', den: '' },
  past: { ru: 'Экзамен прошёл', en: 'Exam is over', dru: 'Поставь новую дату, если пересдаёшь.', den: 'Set a new date if you sit it again.' },
  base: { ru: 'Основа', en: 'Foundations', dru: 'Пробуем все типы заданий и закрываем пробелы. Без спешки.', den: 'Trying every kind of task and filling the gaps. No rush.' },
  train: { ru: 'Тренировка', en: 'Training', dru: 'Разделы на время, слабые типы каждый день, пробник по субботам.', den: 'Timed sections, weak kinds daily, a mock every Saturday.' },
  final: { ru: 'Финиш', en: 'Final stretch', dru: 'Полный пробник каждые 4 дня, между ними — точечная работа.', den: 'A full mock every 4 days, targeted work in between.' },
  rest: { ru: 'Отдых перед экзаменом', en: 'Rest before the exam', dru: 'Чуть-чуть повторить и выспаться. Новое уже не учим.', den: 'Light review and sleep. Nothing new now.' },
};
const DAY_KIND = {
  full: { ru: 'Пробник', en: 'Mock', cls: 'bg-accent text-white' },
  section: { ru: 'Раздел', en: 'Section', cls: 'bg-accent/15 text-accent' },
  drills: { ru: 'Типы', en: 'Drills', cls: 'bg-muted text-ink-2' },
  rest: { ru: 'Отдых', en: 'Rest', cls: 'bg-muted text-ink-2' },
  exam: { ru: 'ОРТ', en: 'ORT', cls: 'bg-ink text-surface' },
} as const;
const WD = { ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };

const plural = (n: number, one: string, few: string, many: string) => {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many;
};

/** the plan to the ORT: a date, a target, today's tasks picked from what is weak, and the expected score week by week */
export const OrtPlan: React.FC<{
  lang: Lang;
  onDrill: (d: OrtDrill) => void;
  onSection: (s: OrtSectionId) => void;
  onFull: () => void;
}> = ({ lang, onDrill, onSection, onFull }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const s = useOrtPlan();
  const p = useProgress();
  const [editing, setEditing] = useState(false);
  const now = Date.now();
  const today = localDay(now);

  const day = useMemo(() => buildDay(p, s, now), [p, s, today]); // eslint-disable-line react-hooks/exhaustive-deps
  const predicted = useMemo(() => predictScore(p), [p]);
  const history = useMemo(() => predictionHistory(p, 8), [p]);
  const sections = useMemo(() => sectionSkills(p), [p]);
  const week = useMemo(() => weekAhead(s, now), [s, today]); // eslint-disable-line react-hooks/exhaustive-deps

  // remember that mistakes were due today, so the review stays on the list as done once cleared
  const due = Object.values(p.mistakes ?? {}).filter((m) => m.due <= now).length;
  useEffect(() => {
    if (due > 0 && s.dueDay !== today) ortPlan.set({ dueDay: today });
  }, [due, s.dueDay, today]);
  const allDone = day.tasks.length > 0 && day.tasks.every((t) => t.done);
  useEffect(() => {
    if (allDone) ortPlan.markDone(today);
  }, [allDone, today]);

  if (!s.date || editing) return <PlanSetup lang={lang} s={s} onDone={() => setEditing(false)} onCancel={s.date ? () => setEditing(false) : undefined} />;

  const left = day.left ?? 0;
  const ph = PHASE[day.phase];
  const doneN = day.tasks.filter((t) => t.done).length;
  const streak = (() => {
    let n = 0;
    const set = new Set(s.doneDays);
    // today counts once it is done; an unfinished today doesn't break the run yet
    for (let i = set.has(today) ? 0 : 1; ; i++) {
      if (!set.has(localDay(now - i * 864e5))) break;
      n++;
    }
    return n;
  })();
  const gap = predicted === null ? null : predicted - s.target;
  const labelOf = (t: PlanTask) =>
    t.kind === 'mistakes'
      ? L('Работа над ошибками', 'Mistake review')
      : t.kind === 'full'
        ? L('Полный пробный ОРТ', 'Full ORT mock')
        : t.kind === 'section'
          ? L(`Раздел: ${ORT_SECTIONS.find((x) => x.id === t.ref)?.ru}`, `Section: ${ORT_SECTIONS.find((x) => x.id === t.ref)?.en}`)
          : (() => {
              const d = ORT_DRILLS.find((x) => x.id === t.ref);
              return L(`Тип: ${d?.ru}`, `Kind: ${d?.en}`);
            })();
  const open = (t: PlanTask) => {
    if (t.kind === 'mistakes') window.dispatchEvent(new CustomEvent('open-practice-tab', { detail: 'mistakes' }));
    else if (t.kind === 'full') onFull();
    else if (t.kind === 'section') onSection(t.ref as OrtSectionId);
    else onDrill(t.ref as OrtDrill);
  };

  return (
    <section className="rounded-2xl border border-line bg-surface overflow-hidden">
      {/* head: countdown, target and the expected score */}
      <div className="relative p-5 sm:p-6 grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center border-b border-line">
        <div className="absolute inset-0 pointer-events-none opacity-70" style={{ background: 'radial-gradient(60% 120% at 0% 0%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 70%)' }} />
        <div className="relative flex items-end gap-3">
          <div className="font-serif font-extrabold text-[56px] leading-none tracking-tight text-ink tabular-nums">{Math.max(0, left)}</div>
          <div className="pb-1.5">
            <div className="text-sm text-ink-2">{day.phase === 'past' ? ph.ru && L(ph.ru, ph.en) : L(`${plural(left, 'день', 'дня', 'дней')} до ОРТ`, `day${left === 1 ? '' : 's'} to the ORT`)}</div>
            {day.phase !== 'past' && (
              <span className="inline-flex mt-1 items-center gap-1 rounded-full bg-accent/12 text-accent text-xs font-medium px-2 py-0.5">
                <Flag className="w-3 h-3" />
                {L(ph.ru, ph.en)}
              </span>
            )}
          </div>
        </div>
        <p className="relative text-sm text-ink-2 max-w-md">{L(ph.dru, ph.den)}</p>
        <div className="relative flex gap-2.5">
          <Stat icon={<Target className="w-3.5 h-3.5" />} label={L('Цель', 'Target')} value={String(s.target)} />
          <Stat
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label={L('Прогноз', 'Forecast')}
            value={predicted === null ? '—' : String(predicted)}
            tone={gap === null ? undefined : gap >= 0 ? 'good' : 'bad'}
          />
          <Button isIconOnly size="sm" variant="ghost" aria-label={L('Изменить план', 'Edit the plan')} onPress={() => setEditing(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* today */}
        <div className="p-5 sm:p-6 flex flex-col gap-3 lg:border-r border-line">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl text-ink">{L('Сегодня', 'Today')}</h3>
            <div className="flex items-center gap-3 text-xs text-ink-2">
              {streak > 0 && <span className="font-mono">🔥 {streak}</span>}
              {day.tasks.length > 0 && (
                <span className="font-mono">
                  {doneN}/{day.tasks.length}
                </span>
              )}
            </div>
          </div>
          {day.tasks.length > 0 && (
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ width: `${(doneN / day.tasks.length) * 100}%` }} />
            </div>
          )}
          {day.phase === 'past' ? (
            <Button variant="outline" className="self-start text-sm" onPress={() => setEditing(true)}>
              <RotateCcw className="w-4 h-4" />
              {L('Новая дата', 'New date')}
            </Button>
          ) : (
            <ul className="flex flex-col gap-2">
              {day.tasks.map((t, i) => (
                <li key={t.id} className={`plan-task group flex items-center gap-3 rounded-xl border p-3 transition-colors ${t.done ? 'border-line bg-muted/50' : 'border-line hover:border-accent'}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <span className={`grid place-items-center w-6 h-6 shrink-0 rounded-full border-2 transition-colors ${t.done ? 'bg-accent border-accent text-white' : 'border-line'}`}>{t.done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium leading-snug ${t.done ? 'text-ink-2 line-through decoration-ink-2/40' : 'text-ink'}`}>{labelOf(t)}</div>
                    <div className="text-xs text-ink-2 mt-0.5">
                      {L(t.why.ru, t.why.en)} · ~{t.minutes} {L('мин', 'min')}
                    </div>
                  </div>
                  {!t.done && (
                    <Button size="sm" variant={i === day.tasks.findIndex((x) => !x.done) ? 'primary' : 'outline'} className="text-xs shrink-0" onPress={() => open(t)}>
                      {L('Начать', 'Start')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {allDone && <p className="text-sm text-accent font-medium">{L('План на сегодня выполнен. Завтра — новый.', 'Today’s plan is done. A new one tomorrow.')}</p>}
          {/* the week ahead */}
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {week.map((d, i) => {
              const k = DAY_KIND[d.kind];
              const done = s.doneDays.includes(d.day);
              return (
                <div key={d.day} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 ${i === 0 ? 'ring-1 ring-accent' : ''}`}>
                  <span className="text-[10px] uppercase text-ink-2">{WD[lang][d.weekday]}</span>
                  <span className={`text-[10px] leading-none rounded-full px-1.5 py-1 w-full text-center truncate ${k.cls}`}>{done ? '✓' : L(k.ru, k.en)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* forecast */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 border-t lg:border-t-0 border-line">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-xl text-ink">{L('Прогноз балла', 'Score forecast')}</h3>
            <span className="text-xs text-ink-2">{L('8 недель', '8 weeks')}</span>
          </div>
          <ForecastChart history={history} target={s.target} lang={lang} />
          <div className="flex flex-col gap-2.5">
            {ORT_SECTIONS.map((x) => {
              const a = sections[x.id].acc;
              const goal = s.target / ORT_MAX;
              return (
                <div key={x.id} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink truncate">{L(x.ru, x.en)}</span>
                    <span className="font-mono text-ink-2">{a === null ? L('нет данных', 'no data') : `${Math.round(a * 100)}%`}</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-muted">
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ${a !== null && a >= goal ? 'bg-accent' : 'bg-accent/50'}`} style={{ width: `${(a ?? 0) * 100}%` }} />
                    <div className="absolute -top-0.5 -bottom-0.5 w-0.5 rounded bg-ink/50" style={{ left: `${goal * 100}%` }} title={L('нужно для цели', 'needed for the target')} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] leading-snug text-ink-2">
            {predicted === null
              ? L('Прогноз появится, когда попробуешь все четыре раздела — хотя бы тренировками по типам.', 'The forecast appears once you have tried all four sections, even just through drills.')
              : L(`Оценка по твоим пробникам и тренировкам, недавние весят больше. Официальная шкала ЦООМО не публикуется; порог — ${ORT_THRESHOLD}.`, `An estimate from your mocks and drills, recent ones count more. The official scale is not published; the pass mark is ${ORT_THRESHOLD}.`)}
          </p>
        </div>
      </div>
    </section>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; tone?: 'good' | 'bad' }> = ({ icon, label, value, tone }) => (
  <div className="rounded-xl border border-line bg-surface/80 backdrop-blur px-3 py-2 min-w-[84px]">
    <div className="flex items-center gap-1 text-[11px] text-ink-2">
      {icon}
      {label}
    </div>
    <div className={`font-mono text-xl tabular-nums ${tone === 'good' ? 'text-accent' : tone === 'bad' ? 'text-[#E5484D]' : 'text-ink'}`}>{value}</div>
  </div>
);

/** the expected score by week against the target line; the line draws itself in */
const ForecastChart: React.FC<{ history: (number | null)[]; target: number; lang: Lang }> = ({ history, target, lang }) => {
  const W = 320;
  const H = 120;
  const pad = { l: 28, r: 8, t: 10, b: 18 };
  const vals = history.filter((v): v is number => v !== null);
  const lo = Math.max(0, Math.min(ORT_THRESHOLD - 20, target - 30, ...vals) - 10);
  const hi = Math.min(ORT_MAX, Math.max(target + 20, ...vals) + 10);
  const x = (i: number) => pad.l + (i / (history.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const pts = history.map((v, i) => (v === null ? null : ([x(i), y(v)] as const)));
  const path = pts.reduce((d, pt, i) => (pt ? d + `${d && pts[i - 1] ? 'L' : 'M'}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}` : d), '');
  const last = [...pts].reverse().find(Boolean);
  const key = vals.join(',');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={lang === 'ru' ? 'Прогноз балла по неделям' : 'Forecast by week'}>
      {[lo, ORT_THRESHOLD, hi].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth="1" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" className="fill-ink-2 font-mono" fontSize="9">
            {Math.round(v)}
          </text>
        </g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} stroke="var(--color-accent)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.8" />
      <text x={W - pad.r} y={y(target) - 4} textAnchor="end" fill="var(--color-accent)" fontSize="9" fontWeight="600">
        {lang === 'ru' ? `цель ${target}` : `target ${target}`}
      </text>
      {path && <path key={key} d={path} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="plan-line" />}
      {pts.map((pt, i) => pt && <circle key={i} cx={pt[0]} cy={pt[1]} r={pt === last ? 4 : 2.5} fill={pt === last ? 'var(--color-accent)' : 'var(--color-surface, #fff)'} stroke="var(--color-accent)" strokeWidth="1.5" />)}
      {history.map((_, i) => (
        <text key={i} x={x(i)} y={H - 4} textAnchor="middle" className="fill-ink-2" fontSize="8">
          {i === history.length - 1 ? (lang === 'ru' ? 'сейчас' : 'now') : `-${history.length - 1 - i}${lang === 'ru' ? 'н' : 'w'}`}
        </text>
      ))}
      {!vals.length && (
        <text x={(W + pad.l) / 2} y={H / 2} textAnchor="middle" className="fill-ink-2" fontSize="11">
          {lang === 'ru' ? 'пока нет данных' : 'no data yet'}
        </text>
      )}
    </svg>
  );
};

/** first run: when is the exam, what score, how much time a day */
const PlanSetup: React.FC<{ lang: Lang; s: OrtPlanSettings; onDone: () => void; onCancel?: () => void }> = ({ lang, s, onDone, onCancel }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  // the main ORT session is usually in late May
  const defaultDate = () => {
    const d = new Date();
    const y = d.getMonth() > 4 || (d.getMonth() === 4 && d.getDate() > 20) ? d.getFullYear() + 1 : d.getFullYear();
    return `${y}-05-25`;
  };
  const [date, setDate] = useState(s.date ?? defaultDate());
  const [target, setTarget] = useState(s.target);
  const [minutes, setMinutes] = useState(s.minutes);
  const min = localDay();
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(date) && date > min;
  const goals: [number, string, string][] = [
    [ORT_THRESHOLD, 'порог', 'pass mark'],
    [150, 'бюджет в регионе', 'a regional grant'],
    [180, 'сильный балл', 'a strong score'],
    [210, 'топ-вузы', 'top universities'],
  ];
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(50% 90% at 100% 0%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 70%)' }} />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent text-white shrink-0">
            <CalendarDays className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-serif text-2xl text-ink">{L('Мой план к ОРТ', 'My ORT plan')}</h2>
            <p className="text-sm text-ink-2 max-w-xl">{L('Укажи дату и цель — каждый день здесь будет список заданий под твои слабые места и прогноз балла.', 'Set the date and a target: every day you get tasks aimed at your weak spots and a score forecast.')}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-2">{L('Дата экзамена', 'Exam date')}</span>
            <input type="date" value={date} min={min} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:border-accent" />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-2">
              {L('Цель', 'Target')}: <span className="font-mono text-ink">{target}</span> / {ORT_MAX}
            </span>
            <input type="range" min={ORT_THRESHOLD} max={ORT_MAX} step={5} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="accent-[var(--color-accent)] h-10" />
            <div className="flex flex-wrap gap-1">
              {goals.map(([v, ru, en]) => (
                <button key={v} type="button" onClick={() => setTarget(v)} className={`text-[11px] rounded-full px-2 py-0.5 border transition-colors cursor-pointer ${target === v ? 'border-accent text-accent' : 'border-line text-ink-2 hover:border-accent'}`}>
                  {v} · {L(ru, en)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-2">{L('Время в день', 'Time a day')}</span>
            <div className="flex gap-1.5">
              {([20, 40, 60, 90] as const).map((m) => (
                <Button key={m} size="sm" variant={minutes === m ? 'primary' : 'outline'} className="text-xs flex-1" onPress={() => setMinutes(m)}>
                  {m} {L('мин', 'min')}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button isDisabled={!ok} className="text-sm font-medium" onPress={() => (ortPlan.set({ date, target, minutes }), onDone())}>
            {s.date ? L('Сохранить', 'Save') : L('Составить план', 'Make the plan')}
          </Button>
          {onCancel && (
            <Button variant="ghost" className="text-sm" onPress={onCancel}>
              {L('Отмена', 'Cancel')}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
