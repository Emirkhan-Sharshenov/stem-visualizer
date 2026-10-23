import { Button } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { Bot, CalendarCheck, Flame, Loader2, NotebookPen, Puzzle, Target, Trophy, BookOpen } from 'lucide-react';
import type { Lang } from '../i18n/landing';
import { Currency, PRICES, localCurrency, money, openCheckout, paymentsEnabled } from '../lib/plan';
import { dayStreak, type Progress } from '../lib/progress';
import { supabase } from '../lib/supabase';
import { ChargeNote, CurrencySwitch } from '../components/pro/pricing';

interface Card {
  name: string | null;
  grade: number | null;
  email: string;
  plan: 'pro' | 'teacher' | null;
  source: string | null;
  expires_at: string | null;
  progress: Partial<Progress>;
  mistakes: number;
}

/** "s***1@gmail.com": enough for the parent to recognise the account */
const maskEmail = (e: string) => e.replace(/^(.)(.*)(.@)/, (_, a: string, mid: string, b: string) => a + '*'.repeat(Math.min(mid.length, 5)) + b);

/** what a parent sees from the learner's secret link: the progress, what Pro adds, and a pay button */
export const Parent: React.FC<{ lang: Lang; onToggleLang: () => void }> = ({ lang, onToggleLang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const readToken = () => window.location.hash.replace(/^#\/?parent\//, '').split('?')[0];
  // the route stays "parent" when only the token changes, so follow the address here
  const [token, setToken] = useState(readToken);
  useEffect(() => {
    const onHash = () => setToken(readToken());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [card, setCard] = useState<Card | null | 'missing'>(null);
  const [period, setPeriod] = useState<'month' | 'year'>('year');
  const [cur, setCur] = useState<Currency>(localCurrency);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!supabase || !/^[0-9a-f]{32}$/.test(token)) {
      setCard('missing');
      return;
    }
    supabase.rpc('parent_card', { p_token: token }).then(({ data }) => setCard((data as Card | null) ?? 'missing'));
  }, [token]);

  if (card === null)
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ink-3" />
      </div>
    );
  if (card === 'missing')
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-serif text-3xl">{L('Ссылка не работает', 'This link doesn’t work')}</h1>
          <p className="mt-2 text-ink-2">{L('Попросите ребёнка отправить её ещё раз из раздела Pro.', 'Ask your child to send it again from the Pro section.')}</p>
          <Button className="mt-5" onPress={() => (window.location.hash = '/')}>{L('На главную', 'Home')}</Button>
        </div>
      </div>
    );

  const p = card.progress;
  const days = p.days ?? [];
  const tests = p.tests ?? [];
  const solved = Object.values(p.problems ?? {}).reduce((n, x) => n + (x?.ok ?? 0), 0);
  const topics = Object.values(p.completed ?? {}).filter(Boolean).length;
  const testAvg = tests.length ? Math.round((tests.reduce((s, t) => s + t.score / Math.max(1, t.total), 0) / tests.length) * 100) : null;
  const lastDay = days.length ? [...days].sort().at(-1)! : null;
  const name = card.name || L('Ваш ребёнок', 'Your child');
  const paidPro = !!card.plan && card.source !== 'trial';
  const trialUntil = card.plan && card.source === 'trial' && card.expires_at ? new Date(card.expires_at) : null;

  const usd = period === 'month' ? PRICES.month : PRICES.year;
  const perDay = money((period === 'month' ? PRICES.month * 12 : PRICES.year) / 365, cur, lang);

  const STATS = [
    { icon: <CalendarCheck className="w-4 h-4" />, v: days.length, t: L('дней занятий', 'days of study') },
    { icon: <Flame className="w-4 h-4" />, v: dayStreak({ days } as Progress), t: L('дней подряд сейчас', 'day streak now') },
    { icon: <BookOpen className="w-4 h-4" />, v: topics, t: L('тем разобрано', 'topics understood') },
    { icon: <Puzzle className="w-4 h-4" />, v: solved, t: L('задач решено', 'problems solved') },
    { icon: <Trophy className="w-4 h-4" />, v: testAvg === null ? '—' : `${testAvg}%`, t: L(`средний балл, тестов: ${tests.length}`, `average score, ${tests.length} tests`) },
    { icon: <NotebookPen className="w-4 h-4" />, v: card.mistakes, t: L('ошибок ждут разбора', 'mistakes to revisit') },
  ];
  const PRO = [
    { icon: <NotebookPen className="w-4 h-4" />, t: L('Работа над ошибками', 'Mistake review'), d: L('Каждая ошибка возвращается через 1, 3 и 7 дней, пока ребёнок не решит её сам.', 'Every mistake comes back after 1, 3 and 7 days until your child solves it alone.') },
    { icon: <Bot className="w-4 h-4" />, t: L('Наставник без лимита', 'Unlimited mentor'), d: L('Объясняет тему и задачу по шагам, в том числе по фото из учебника.', 'Explains topics and problems step by step, even from a photo of the textbook.') },
    { icon: <Target className="w-4 h-4" />, t: L('Подготовка к экзаменам', 'Exam prep'), d: L('Пробные варианты на время и процент готовности по каждому предмету.', 'Timed mock papers and a readiness score for each subject.') },
  ];

  const pay = async () => {
    setPaying(true);
    setMsg(null);
    try {
      await openCheckout(period, card.email, () => setMsg({ ok: true, text: L(`Спасибо! Pro включится у ${name} в течение минуты.`, `Thank you! Pro turns on for ${name} within a minute.`) }));
    } catch {
      setMsg({ ok: false, text: L('Не удалось открыть оплату. Проверьте интернет и попробуйте ещё раз.', 'Could not open the checkout. Check your connection and try again.') });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <a href="#/" className="font-display text-sm tracking-wide text-ink">STEM Visualizer</a>
          <Button size="sm" variant="ghost" onPress={onToggleLang}>{lang === 'ru' ? 'EN' : 'RU'}</Button>
        </div>

        <header>
          <p className="text-sm text-ink-3">{L('Успехи ученика', 'Progress report')}</p>
          <h1 className="mt-1 font-serif text-[34px] leading-tight">
            {L(`${name} занимается в STEM Visualizer`, `${name} is studying with STEM Visualizer`)}
          </h1>
          <p className="mt-2 text-ink-2">
            {card.grade ? L(`${card.grade} класс. `, `Grade ${card.grade}. `) : ''}
            {lastDay ? L(`Последнее занятие: ${new Date(lastDay).toLocaleDateString('ru-RU')}.`, `Last studied on ${new Date(lastDay).toLocaleDateString('en-GB')}.`) : L('Занятий пока не было.', 'No study sessions yet.')}
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.t} className="bg-surface border border-line rounded-xl p-4">
              <span className="text-accent">{s.icon}</span>
              <div className="mt-2 font-mono text-2xl text-ink">{s.v}</div>
              <div className="text-xs text-ink-3">{s.t}</div>
            </div>
          ))}
        </div>

        {paidPro ? (
          <div className="rounded-xl bg-[#EAF6EF] border border-[#BFE3CC] px-5 py-4 text-[15px] text-[#1E7A4C]">
            ✓ {L(`Pro уже подключён до ${new Date(card.expires_at!).toLocaleDateString('ru-RU')}.`, `Pro is active until ${new Date(card.expires_at!).toLocaleDateString('en-GB')}.`)}
          </div>
        ) : (
          <section className="bg-surface border-2 border-accent rounded-2xl p-6">
            <h2 className="font-serif text-2xl">{L('Pro: занятия, которые доводят до результата', 'Pro: study that gets results')}</h2>
            {trialUntil && <p className="mt-1 text-sm text-ink-2">{L(`Сейчас у ${name} пробная неделя Pro до ${trialUntil.toLocaleDateString('ru-RU')}.`, `${name} is on a free Pro week until ${trialUntil.toLocaleDateString('en-GB')}.`)}</p>}
            <ul className="mt-4 flex flex-col gap-3">
              {PRO.map((f) => (
                <li key={f.t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">{f.icon}</span>
                  <span>
                    <span className="block text-[15px] text-ink">{f.t}</span>
                    <span className="block text-sm text-ink-3">{f.d}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-0.5 rounded-md bg-muted border border-line text-xs">
                {(['year', 'month'] as const).map((x) => (
                  <Button key={x} size="sm" variant={period === x ? 'outline' : 'ghost'} className={period === x ? 'font-medium' : ''} onPress={() => setPeriod(x)}>
                    {x === 'year' ? L('на год', 'yearly') : L('на месяц', 'monthly')}
                  </Button>
                ))}
              </div>
              <CurrencySwitch value={cur} onChange={setCur} lang={lang} />
            </div>
            <div className="mt-3 font-serif text-4xl">
              {money(usd, cur, lang)} <span className="text-lg text-ink-2">{period === 'year' ? L('в год', 'a year') : L('в месяц', 'a month')}</span>
            </div>
            <p className="text-sm text-ink-3">{L(`${perDay} в день — меньше одного занятия с репетитором в месяц`, `${perDay} a day, less than one tutoring lesson a month`)}</p>

            {paymentsEnabled ? (
              <Button size="lg" fullWidth className="mt-5 text-sm font-medium" onPress={pay} isDisabled={paying}>
                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                {L(`Оплатить Pro для ${name}`, `Pay for ${name}’s Pro`)}
              </Button>
            ) : (
              <Button size="lg" fullWidth className="mt-5 opacity-60 text-sm font-medium" isDisabled>
                {L('Оплата картой — скоро', 'Card payment — coming soon')}
              </Button>
            )}
            <ChargeNote cur={cur} usd={usd} lang={lang} />
            <p className="mt-1 text-xs text-center text-ink-3">{L(`Pro подключится к аккаунту ${maskEmail(card.email)}. Отменить продление можно в любой момент.`, `Pro goes to the account ${maskEmail(card.email)}. You can cancel renewal at any time.`)}</p>
            {msg && <p className={`mt-3 text-sm text-center ${msg.ok ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{msg.text}</p>}
          </section>
        )}

        <p className="text-xs text-ink-3 text-center">
          {L('Учебник, лаборатории и тесты остаются бесплатными. ', 'The textbook, labs and tests stay free. ')}
          <a href="#/" className="text-accent hover:underline">{L('Что такое STEM Visualizer', 'About STEM Visualizer')}</a>
        </p>
      </div>
    </div>
  );
};

export default Parent;
