import React, { lazy, Suspense, useState } from 'react';
import { Brain, CalendarDays, Radio, Calculator, Flame, FlaskConical, Grid3x3, Layers, Swords, Trophy } from 'lucide-react';
import { useProgress } from '../../lib/progress';
import type { Lang } from './common';
import { Duel, parseDuel } from './Duel';
import { Daily, dailyDone } from './Daily';

const BalanceGame = lazy(() => import('./BalanceGame'));
const MemoryGame = lazy(() => import('./MemoryGame'));
const MathSprint = lazy(() => import('./MathSprint'));
const ElementHunt = lazy(() => import('./ElementHunt'));
const FormulaCards = lazy(() => import('./FormulaCards'));
const LiveQuiz = lazy(() => import('./LiveQuiz'));

type GameId = 'live' | 'daily' | 'duel' | 'cards' | 'balance' | 'memory' | 'sprint' | 'elements';

const GAMES: { id: GameId; record: (g: Record<string, number>) => number; icon: React.ReactNode; color: string; subject: { ru: string; en: string }; title: { ru: string; en: string }; text: { ru: string; en: string }; time: { ru: string; en: string } }[] = [
  {
    id: 'live',
    record: (g) => g.live ?? 0,
    icon: <Radio className="w-7 h-7" />,
    color: '#8E4EC6',
    subject: { ru: 'Для класса', en: 'For the class' },
    title: { ru: 'Живой квиз', en: 'Live quiz' },
    text: { ru: 'Учитель выводит код на проектор, класс отвечает с телефонов на время. Таблица лидеров после каждого вопроса и пьедестал в конце.', en: 'The teacher shows a code on the projector, the class answers from phones against the clock. A leaderboard after every question and a podium at the end.' },
    time: { ru: 'вместе на уроке', en: 'together in class' },
  },
  {
    id: 'daily',
    record: (g) => g.daily ?? 0,
    icon: <CalendarDays className="w-7 h-7" />,
    color: '#2F5BFF',
    subject: { ru: 'Каждый день', en: 'Every day' },
    title: { ru: 'Вызов дня', en: 'Daily challenge' },
    text: { ru: '10 задач — одни и те же для всех в мире сегодня. Одна попытка, серия дней и результат, которым можно похвастаться.', en: 'Ten problems, the same for everyone in the world today. One try, a streak of days and a result to show off.' },
    time: { ru: '1 попытка в день', en: 'one try a day' },
  },
  {
    id: 'duel',
    record: (g) => (g.duel ? Math.floor(g.duel / 100) : 0),
    icon: <Swords className="w-7 h-7" />,
    color: '#F76B15',
    subject: { ru: 'С другом', en: 'With a friend' },
    title: { ru: 'Дуэль по ссылке', en: 'Duel by link' },
    text: { ru: 'Реши 10 задач на скорость и отправь ссылку другу: ему достанутся те же задачи. Кто решит больше и быстрее?', en: 'Solve 10 problems fast and send a friend the link: they get the same ones. Who solves more, faster?' },
    time: { ru: '≈ 1 минута', en: '≈ 1 minute' },
  },
  {
    id: 'cards',
    record: (g) => g.cards ?? 0,
    icon: <Layers className="w-7 h-7" />,
    color: '#0EA5A4',
    subject: { ru: 'Все предметы', en: 'All subjects' },
    title: { ru: 'Карточки формул', en: 'Formula cards' },
    text: { ru: 'Вспомни формулу по теме и переверни карточку. Интервальное повторение: забытое вернётся сегодня, выученное — через неделю.', en: 'Recall the formula for a topic and flip the card. Spaced repetition: forgotten cards return today, learnt ones in a week.' },
    time: { ru: '10 карточек', en: '10 cards' },
  },
  {
    id: 'balance',
    record: (g) => g.balance ?? 0,
    icon: <FlaskConical className="w-7 h-7" />,
    color: '#30A46C',
    subject: { ru: 'Химия', en: 'Chemistry' },
    title: { ru: 'Уравняй реакцию', en: 'Balance the equation' },
    text: { ru: 'Расставь коэффициенты, чтобы атомов слева и справа стало поровну. 30 реакций — от H₂O до обжига пирита.', en: 'Set coefficients so atoms match on both sides. 30 reactions, from H₂O to roasting pyrite.' },
    time: { ru: '2 минуты', en: '2 minutes' },
  },
  {
    id: 'memory',
    record: (g) => Math.max(0, ...Object.entries(g).filter(([k]) => k.startsWith('memory-')).map(([, v]) => v)),
    icon: <Brain className="w-7 h-7" />,
    color: '#8E4EC6',
    subject: { ru: 'Все предметы', en: 'All subjects' },
    title: { ru: 'Мемо: формулы', en: 'Memory: formulas' },
    text: { ru: 'Переворачивай карточки и находи пары «формула — тема». Чем меньше ходов, тем больше очков.', en: 'Flip cards and match formulas with topics. Fewer moves, more points.' },
    time: { ru: 'без таймера', en: 'no timer' },
  },
  {
    id: 'sprint',
    record: (g) => g.sprint ?? 0,
    icon: <Calculator className="w-7 h-7" />,
    color: '#2F5BFF',
    subject: { ru: 'Математика', en: 'Maths' },
    title: { ru: 'Устный счёт', en: 'Mental maths' },
    text: { ru: 'Примеры усложняются с каждой серией: таблица умножения, квадраты, проценты, отрицательные числа.', en: 'Examples get harder with every streak: times tables, squares, percents, negatives.' },
    time: { ru: '60 секунд', en: '60 seconds' },
  },
  {
    id: 'elements',
    record: (g) => g.elements ?? 0,
    icon: <Grid3x3 className="w-7 h-7" />,
    color: '#E5484D',
    subject: { ru: 'Химия', en: 'Chemistry' },
    title: { ru: 'Охота на элементы', en: 'Element hunt' },
    text: { ru: 'Символ ↔ название и «найди на таблице Менделеева». Первые 36 элементов и самые известные металлы.', en: 'Symbol ↔ name and “find it on the periodic table”. The first 36 elements and the famous metals.' },
    time: { ru: '60 секунд', en: '60 seconds' },
  },
];

/** short arcade games for practice; every game gives XP for the league */
export const GamesPage: React.FC<{ lang: Lang; duel?: string | null; daily?: boolean; live?: string | null }> = ({ lang, duel, daily, live }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  // a duel link opens straight into the challenge
  const [challenge] = useState(() => parseDuel(duel ?? null));
  const [game, setGame] = useState<GameId | null>(live ? 'live' : challenge ? 'duel' : daily ? 'daily' : null);
  const p = useProgress();
  const records = p.games ?? {};
  const exit = () => setGame(null);

  if (game)
    return (
      <Suspense fallback={<div className="h-[60vh] rounded-xl bg-muted animate-pulse" />}>
        {game === 'live' && <LiveQuiz lang={lang} onExit={exit} code={live && /^\d{5}$/.test(live) ? live : undefined} />}
        {game === 'daily' && <Daily lang={lang} onExit={exit} />}
        {game === 'duel' && <Duel lang={lang} onExit={exit} challenge={challenge} />}
        {game === 'cards' && <FormulaCards lang={lang} onExit={exit} />}
        {game === 'balance' && <BalanceGame lang={lang} onExit={exit} />}
        {game === 'memory' && <MemoryGame lang={lang} onExit={exit} />}
        {game === 'sprint' && <MathSprint lang={lang} onExit={exit} />}
        {game === 'elements' && <ElementHunt lang={lang} onExit={exit} />}
      </Suspense>
    );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-[34px] leading-tight text-ink">{L('Игры', 'Games')}</h1>
        <p className="mt-1 text-[15px] text-ink-2 max-w-2xl">{L('Короткие игры на пару минут: тренируют то, что нужно на ОРТ, и приносят XP в твою лигу.', 'Two-minute games that train what the exam needs and earn XP for your league.')}</p>
      </header>
      <div className="grid sm:grid-cols-2 gap-4 anim-stagger">
        {GAMES.map((g) => {
          const rec = g.record(records);
          return (
            <button key={g.id} onClick={() => setGame(g.id)} className="lift text-left rounded-2xl border border-line bg-surface overflow-hidden cursor-pointer group">
              <div className="h-28 relative flex items-center px-6" style={{ background: `linear-gradient(135deg, ${g.color}, ${g.color}bb)` }}>
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute right-10 bottom-[-30px] w-20 h-20 rounded-full bg-white/10" />
                <span className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ color: '#fff' }}>
                  {g.icon}
                </span>
                {g.id === 'daily' && !dailyDone() && (
                  <span className="ml-auto inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-white/90 text-xs font-medium text-ink animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-[#F76B15]" /> {L('новый вызов', 'new today')}
                  </span>
                )}
                {rec > 0 && !(g.id === 'daily' && !dailyDone()) && (
                  <span className="ml-auto inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-white/90 text-xs font-medium text-ink">
                    <Trophy className="w-3.5 h-3.5 text-[#F5A524]" /> {L('рекорд', 'best')} {rec}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: g.color }}>
                  {g.subject[lang]} · {g.time[lang]}
                </div>
                <h3 className="mt-1 font-serif text-xl text-ink">{g.title[lang]}</h3>
                <p className="mt-1 text-sm text-ink-2 leading-snug">{g.text[lang]}</p>
                <span className="mt-3 inline-flex text-sm font-medium text-accent group-hover:underline">{L('Играть →', 'Play →')}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GamesPage;
