import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Image, X } from 'lucide-react';
import { topicById } from '../../data/curriculum';
import type { Progress } from '../../lib/progress';
import { shareCard, SITE, useCard } from '../../lib/shareCard';

/* "My year in STEM": the last twelve months as full-screen story slides (like Spotify Wrapped),
   ending with a picture to share. Everything is counted from the progress kept in the app. */

type Lang = 'ru' | 'en';
const DAY = 86_400_000;
const SLIDE_MS = 5500;
const SUBJ: Record<string, { ru: string; en: string; color: string }> = {
  physics: { ru: 'Физика', en: 'Physics', color: '#E5484D' },
  chemistry: { ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  biology: { ru: 'Биология', en: 'Biology', color: '#F5A524' },
  mathematics: { ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
  astronomy: { ru: 'Астрономия', en: 'Astronomy', color: '#4C6FFF' },
};
const MONTHS = {
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export function yearStats(p: Progress) {
  const since = Date.now() - 365 * DAY;
  const days = [...new Set(p.days)].filter((d) => Date.parse(d) >= since).sort();
  let longest = 0;
  let run = 0;
  days.forEach((d, i) => {
    run = i && Date.parse(d) - Date.parse(days[i - 1]) === DAY ? run + 1 : 1;
    longest = Math.max(longest, run);
  });
  const bySubject: Record<string, number> = {};
  for (const id of [...Object.keys(p.completed).filter((id) => p.completed[id]), ...Object.keys(p.quiz)]) {
    const s = topicById(id)?.subject;
    if (s) bySubject[s] = (bySubject[s] ?? 0) + 1;
  }
  const fav = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0]?.[0];
  const favShare = fav ? Math.round((bySubject[fav] / Object.values(bySubject).reduce((a, b) => a + b, 0)) * 100) : 0;
  const months = new Array(12).fill(0);
  days.forEach((d) => months[new Date(d).getMonth()]++);
  const tests = p.tests.filter((t) => t.at >= since);
  const testAvg = tests.length ? Math.round((tests.reduce((s, t) => s + t.score / t.total, 0) / tests.length) * 100) : 0;
  const problems = Object.values(p.problems).reduce((s, x) => s + x.ok, 0);
  const labs = Object.keys(p.labs).length;
  const topics = Object.values(p.completed).filter(Boolean).length;
  const games = Object.keys(p.games ?? {}).length;
  // the learner's type: what they did most of, weighted so each kind of work counts fairly
  const kinds = [
    ['solver', problems / 40],
    ['experimenter', labs / 6],
    ['explorer', topics / 15],
    ['player', games / 3],
    ['strategist', tests.length / 5],
  ] as const;
  const persona = [...kinds].sort((a, b) => b[1] - a[1])[0][0];
  return { days: days.length, longest, fav, favShare, busiest: months.indexOf(Math.max(...months)), tests: tests.length, testAvg, problems, labs, topics, xp: p.xp, persona };
}

const PERSONA = {
  solver: { icon: '🧮', ru: 'Решатель', en: 'The Solver', tru: 'Задачи — твоя стихия. Ты не веришь на слово, ты считаешь.', ten: 'Problems are your thing. You do not take it on trust, you work it out.' },
  experimenter: { icon: '🧪', ru: 'Экспериментатор', en: 'The Experimenter', tru: 'Ты меняешь параметры и смотришь, что будет. Так и делают учёные.', ten: 'You change the settings and watch what happens. That is how scientists work.' },
  explorer: { icon: '🧭', ru: 'Исследователь', en: 'The Explorer', tru: 'Тема за темой — ты разбираешься, как устроен мир.', ten: 'Topic by topic, you are working out how the world works.' },
  player: { icon: '🎮', ru: 'Игрок', en: 'The Player', tru: 'Учёба через игру — и рекорды это подтверждают.', ten: 'Learning through play, and your records prove it.' },
  strategist: { icon: '🎯', ru: 'Стратег', en: 'The Strategist', tru: 'Тесты, разбор ошибок, снова тесты. Ты готовишься всерьёз.', ten: 'Tests, mistakes reviewed, tests again. You prepare seriously.' },
};

/** a number that counts up when its slide appears */
const CountUp: React.FC<{ to: number; suffix?: string }> = ({ to, suffix = '' }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let id = 0;
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 1100);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [to]);
  return (
    <>
      {v.toLocaleString('ru-RU')}
      {suffix}
    </>
  );
};

export const YearRecap: React.FC<{ lang: Lang; progress: Progress; onClose: () => void }> = ({ lang, progress, onClose }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const s = useMemo(() => yearStats(progress), [progress]);
  const per = PERSONA[s.persona];
  const fav = s.fav ? SUBJ[s.fav] : null;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides: { bg: string; body: React.ReactNode }[] = [
    {
      bg: 'linear-gradient(160deg,#1B2A8C,#2F5BFF 55%,#7AA2FF)',
      body: (
        <>
          <p className="text-lg opacity-80">{L('Твой год в', 'Your year in')}</p>
          <h2 className="mt-1 font-serif text-5xl leading-tight">STEM Visualizer</h2>
          <p className="mt-6 text-xl opacity-90">{L('Посмотрим, что ты успел за 12 месяцев', 'Let us see what you did in 12 months')} 👀</p>
        </>
      ),
    },
    {
      bg: 'linear-gradient(160deg,#7A1F0B,#F76B15 60%,#FFB86B)',
      body: (
        <>
          <p className="text-lg opacity-80">{L('Ты учился', 'You studied on')}</p>
          <div className="font-serif text-[120px] leading-none mt-2"><CountUp to={s.days} /></div>
          <p className="text-2xl">{L('дней', 'days')}</p>
          <p className="mt-8 text-xl opacity-90">🔥 {L(`Самая длинная серия — ${s.longest} ${s.longest === 1 ? 'день' : s.longest < 5 ? 'дня' : 'дней'} подряд`, `Longest streak: ${s.longest} days in a row`)}</p>
          <p className="mt-2 text-lg opacity-80">{L(`Самый активный месяц — ${MONTHS.ru[s.busiest]}`, `Busiest month: ${MONTHS.en[s.busiest]}`)}</p>
        </>
      ),
    },
    {
      bg: fav ? `linear-gradient(160deg,#111,${fav.color} 70%)` : 'linear-gradient(160deg,#111,#444)',
      body: (
        <>
          <p className="text-lg opacity-80">{L('Понятых тем', 'Topics understood')}</p>
          <div className="font-serif text-[120px] leading-none mt-2"><CountUp to={s.topics} /></div>
          {fav && (
            <p className="mt-8 text-2xl">
              {L('Любимый предмет — ', 'Favourite subject: ')}
              <b>{fav[lang]}</b>
              <span className="block mt-1 text-lg opacity-80">{L(`${s.favShare}% всего, что ты изучал`, `${s.favShare}% of everything you studied`)}</span>
            </p>
          )}
        </>
      ),
    },
    {
      bg: 'linear-gradient(160deg,#0B3D2E,#30A46C 60%,#8FE3B5)',
      body: (
        <>
          <p className="text-lg opacity-80">{L('Решено задач', 'Problems solved')}</p>
          <div className="font-serif text-[120px] leading-none mt-2"><CountUp to={s.problems} /></div>
          <p className="mt-8 text-xl">{L(`Тестов: ${s.tests}${s.tests ? ` · средний результат ${s.testAvg}%` : ''}`, `Tests: ${s.tests}${s.tests ? ` · average ${s.testAvg}%` : ''}`)}</p>
          <p className="mt-2 text-xl">{L(`Лабораторий открыто: ${s.labs}`, `Labs opened: ${s.labs}`)}</p>
        </>
      ),
    },
    {
      bg: 'linear-gradient(160deg,#2A0E4A,#8E4EC6 60%,#D3A6FF)',
      body: (
        <>
          <p className="text-lg opacity-80">{L('Ты —', 'You are')}</p>
          <div className="text-[96px] leading-none mt-3">{per.icon}</div>
          <h2 className="mt-3 font-serif text-5xl">{per[lang]}</h2>
          <p className="mt-5 text-xl opacity-90 max-w-sm mx-auto">{lang === 'ru' ? per.tru : per.ten}</p>
          <p className="mt-6 text-lg opacity-80">{L(`И ${s.xp.toLocaleString('ru-RU')} XP за год`, `And ${s.xp.toLocaleString('en-GB')} XP this year`)}</p>
        </>
      ),
    },
  ];
  const last = i === slides.length;

  // slides move on by themselves; holding a finger pauses them
  useEffect(() => {
    if (last || paused) return;
    const t = setTimeout(() => setI((x) => x + 1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, last, paused]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((x) => Math.min(slides.length, x + 1));
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, slides.length]);

  const card = useCard({
    kicker: L('Мой год в STEM Visualizer', 'My year in STEM Visualizer'),
    big: per.icon,
    sub: per[lang],
    stats: [
      { value: String(s.days), label: L('дней учёбы', 'days of study') },
      { value: String(s.topics), label: L('тем понято', 'topics') },
      { value: String(s.problems), label: L('задач решено', 'problems') },
      { value: `${s.longest} 🔥`, label: L('лучшая серия', 'best streak') },
    ],
    color: '#8E4EC6',
  });

  return (
    <Dialog onClose={onClose} label={L('Твой год в STEM Visualizer', 'Your year in STEM Visualizer')} size="full" className="p-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full sm:w-[420px] sm:h-[min(860px,94vh)] sm:rounded-3xl overflow-hidden text-center" style={{ color: '#fff', background: last ? '#0A0D18' : slides[i].bg, transition: 'background 600ms' }}>
        {/* progress bars */}
        <style>{'@keyframes recap-fill{from{width:0}to{width:100%}}'}</style>
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {slides.map((_, k) => (
            <div key={k} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                key={`${k}-${i}`}
                className="h-full bg-white"
                style={k === i && !last ? { animation: `recap-fill ${SLIDE_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' } : { width: k < i ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <Button variant="ghost" isIconOnly className="absolute top-6 right-3 z-20 w-9" onPress={() => onClose()} aria-label={L('Закрыть', 'Close')}>
          <X className="w-5 h-5" />
        </Button>

        {!last ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-8 select-none"
            onPointerDown={() => setPaused(true)}
            onPointerUp={(e) => {
              setPaused(false);
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setI((x) => (e.clientX - r.left < r.width / 3 ? Math.max(0, x - 1) : x + 1));
            }}
            onPointerLeave={() => setPaused(false)}
          >
            <div key={i} className="anim-page">{slides[i].body}</div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 anim-page">
            <p className="text-white/70">{L('Твой год в одной картинке', 'Your year in one picture')}</p>
            <div className="text-[80px] leading-none">{per.icon}</div>
            <h2 className="font-serif text-4xl">{per[lang]}</h2>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {[
                [s.days, L('дней учёбы', 'days of study')],
                [s.topics, L('тем понято', 'topics')],
                [s.problems, L('задач решено', 'problems')],
                [s.longest, L('лучшая серия', 'best streak')],
              ].map(([v, l]) => (
                <div key={String(l)} className="rounded-2xl bg-white/10 py-3">
                  <div className="font-serif text-3xl">{v}</div>
                  <div className="text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="lg" className="mt-2 font-medium" onPress={() => card && shareCard(card, L(`Мой год в STEM Visualizer: ${s.days} дней учёбы, ${s.topics} тем, ${s.problems} задач. Я — ${per.ru} ${per.icon} https://${SITE}`, `My year in STEM Visualizer: ${s.days} days, ${s.topics} topics, ${s.problems} problems. I am ${per.en} ${per.icon} https://${SITE}`), 'stem-my-year.png')} isDisabled={!card}>
              <Image className="w-5 h-5" /> {L('Поделиться в сторис', 'Share to stories')}
            </Button>
            <Button variant="ghost" className="text-sm" onPress={() => setI(0)}>
              {L('Посмотреть ещё раз', 'Watch again')}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default YearRecap;
