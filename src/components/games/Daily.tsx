import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Copy, Flame, Image, Send } from 'lucide-react';
import { Confetti } from '../fx/Confetti';
import { progress } from '../../lib/progress';
import { SITE, shareCard, useCard } from '../../lib/shareCard';
import { GameBar, Lang } from './common';
import { Reminders } from '../Reminders';
import { COUNT, ProblemRun, problems } from './ProblemRun';

/* The daily challenge: the same ten problems for everyone in the world today (the seed is the UTC date),
   one try a day (leaving midway uses it up), a streak of days and a Wordle-like result to share. */

const KEY = 'stem-daily-v1';
interface Day {
  marks: boolean[];
  secs: number;
}
interface Store {
  days: Record<string, Day>;
}

const today = () => new Date().toISOString().slice(0, 10);
const shift = (iso: string, n: number) => new Date(Date.parse(iso) + n * 86_400_000).toISOString().slice(0, 10);
const load = (): Store => {
  try {
    return { days: {}, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { days: {} };
  }
};
/** days in a row up to today (or up to yesterday, while today is not played yet) */
export const dailyStreak = (s: Store, day = today()) => {
  let d = s.days[day] ? day : shift(day, -1);
  let n = 0;
  while (s.days[d]) {
    n++;
    d = shift(d, -1);
  }
  return n;
};
export const dailyDone = () => !!load().days[today()];

const untilTomorrow = () => {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const m = Math.ceil((next - now.getTime()) / 60_000);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

export const Daily: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const day = today();
  const [store, setStore] = useState(load);
  const [playing, setPlaying] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(untilTomorrow);
  const list = useMemo(() => problems(Number(day.replace(/-/g, '')), lang), [day, lang]);
  const res = store.days[day];
  const streak = dailyStreak(store, day);
  const right = res ? res.marks.filter(Boolean).length : 0;
  const date = new Date(day).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  useEffect(() => {
    const id = setInterval(() => setLeft(untilTomorrow()), 30_000);
    return () => clearInterval(id);
  }, []);

  const finish = (marks: boolean[], secs: number) => {
    const next = { ...store, days: { ...store.days, [day]: { marks, secs } } };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode: the result shows, the streak is not kept */
    }
    setStore(next);
    setPlaying(false);
    setFresh(true);
    const r = marks.filter(Boolean).length;
    progress.recordGame('daily', r, r * 5 + Math.min(20, dailyStreak(next, day) * 2));
  };

  const link = `https://${SITE}/#/app?lab=games&daily=1`;
  const text = res
    ? `STEM Visualizer · ${L('Вызов дня', 'Daily challenge')} ${date}\n${res.marks.map((m) => (m ? '🟩' : '🟥')).join('')} ${right}/${COUNT} · ${res.secs} ${L('с', 's')}\n🔥 ${L(`серия ${streak}`, `streak ${streak}`)}\n${link}`
    : '';
  const card = useCard(res ? { kicker: L(`Вызов дня · ${date}`, `Daily challenge · ${date}`), big: `${right}/${COUNT}`, sub: L(`за ${res.secs} с · серия ${streak} 🔥`, `in ${res.secs} s · streak ${streak} 🔥`), marks: res.marks, call: L('А ты сможешь?', 'Can you do it?'), color: '#2F5BFF' } : null);

  const shareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt(L('Скопируй результат', 'Copy your result'), text);
    }
  };

  if (playing) return <ProblemRun lang={lang} title={L('Вызов дня', 'Daily challenge')} list={list} onExit={(m, secs) => finish([...m, ...Array(COUNT - m.length).fill(false)], secs)} onDone={finish} />;

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <GameBar lang={lang} title={L('Вызов дня', 'Daily challenge')} onExit={onExit} score={right} extra={streak > 0 ? <span className="text-sm font-medium text-[#F76B15] inline-flex items-center gap-1"><Flame className="w-4 h-4" /> {streak}</span> : null} />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col items-center text-center gap-3 anim-page">
        {fresh && right >= 8 && <Confetti count={50} />}
        <span className="w-14 h-14 rounded-2xl flex items-center justify-center bg-accent/10 text-accent">
          <CalendarDays className="w-7 h-7" />
        </span>
        <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-accent">{L(`Вызов дня · ${date}`, `Daily challenge · ${date}`)}</div>
        {res ? (
          <>
            <div className="font-serif text-5xl text-ink">
              {right}/{COUNT}
            </div>
            <p className="text-ink-2">{L(`за ${res.secs} с`, `in ${res.secs} s`)}</p>
            <div className="flex gap-1.5">
              {res.marks.map((m, k) => (
                <span key={k} className={`w-6 h-6 rounded-md ${m ? 'bg-[#30A46C]' : 'bg-[#E5484D]'}`} />
              ))}
            </div>
            <p className="text-sm text-ink-2 inline-flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#F76B15]" /> {L(`Серия: ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд`, `Streak: ${streak} day${streak === 1 ? '' : 's'}`)}
            </p>
            <p className="text-xs text-ink-3">{L(`Новый вызов через ${left}`, `Next challenge in ${left}`)}</p>
            <div className="w-full mt-2 grid grid-cols-2 gap-2">
              <button onClick={shareText} className="h-11 rounded-lg bg-accent hover:bg-accent-hover font-medium inline-flex items-center justify-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
                {copied ? <Copy className="w-4 h-4" /> : <Send className="w-4 h-4" />} {copied ? L('Скопировано', 'Copied') : L('Поделиться', 'Share')}
              </button>
              <button onClick={() => card && shareCard(card, text, `stem-daily-${day}.png`)} disabled={!card} className="h-11 rounded-lg border border-line hover:bg-muted text-sm font-medium text-ink inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <Image className="w-4 h-4" /> {L('В сторис', 'Story')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-serif text-2xl text-ink">{L('10 задач, одни на весь мир', 'Ten problems, the same for everyone')}</h3>
            <p className="text-ink-2">{L('Сегодня все решают одно и то же. Попытка одна, время идёт. Решай каждый день, чтобы не потерять серию.', 'Everyone solves the same set today. One try, against the clock. Play daily to keep your streak.')}</p>
            {streak > 0 && <p className="text-sm font-medium text-[#F76B15] inline-flex items-center gap-1"><Flame className="w-4 h-4" /> {L(`Серия ${streak} — не прерви её!`, `Streak ${streak}: keep it going!`)}</p>}
            <button onClick={() => setPlaying(true)} className="mt-2 h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover font-medium cursor-pointer" style={{ color: '#fff' }}>
              {L('Начать', 'Start')}
            </button>
          </>
        )}
      </div>
      {/* right after a result is when a reminder makes the most sense */}
      {res && <Reminders lang={lang} compact />}
    </div>
  );
};

export default Daily;
