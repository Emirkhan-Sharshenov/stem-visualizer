import { Button, Input } from '@heroui/react';
import React, { useState } from 'react';
import { Check, Crown, Crosshair, FileText, Gift, GraduationCap, Loader2, Sparkles, Target, Bot, Route, Gauge, NotebookPen, Presentation } from 'lucide-react';
import { Currency, PRICES, FREE_MENTOR_DAILY, localCurrency, money, openCheckout, paymentsEnabled, planChanged, redeemCode, redeemErrorText, startTrial, usePlan } from '../../lib/plan';
import { cloudEnabled, useSession } from '../../lib/supabase';
import { AskParent, ChargeNote, CurrencySwitch } from './pricing';

type Lang = 'ru' | 'en';
/** public launch code (created by 0005_teacher_plan.sql) */
const YEAR_OFF = Math.round((1 - PRICES.year / (PRICES.month * 12)) * 100);

/** small lock overlay for Pro-only blocks */
export const ProGate: React.FC<{ lang: Lang; pro: boolean; onUpgrade: () => void; title: string; text: string; children: React.ReactNode }> = ({ lang, pro, onUpgrade, title, text, children }) => {
  const plan = usePlan();
  const [busy, setBusy] = useState(false);
  if (pro) return <>{children}</>;
  // never had Pro: the free week opens the block right here; otherwise the plans page
  const tryFree = async () => {
    setBusy(true);
    try {
      await startTrial();
    } catch {
      onUpgrade();
    } finally {
      setBusy(false);
    }
  };
  const perDay = money(PRICES.year / 365, localCurrency(), lang);
  return (
    <div className="relative rounded-xl overflow-hidden border border-line">
      <div className="pointer-events-none select-none blur-[3px] opacity-60 max-h-[340px] overflow-hidden">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, rgba(250,250,247,0.1), rgba(250,250,247,0.85) 45%, rgba(250,250,247,0.97))' }}>
        <div className="max-w-sm text-center bg-surface border border-line rounded-xl p-5 shadow-lg">
          <span className="inline-flex w-10 h-10 rounded-full bg-[#FFF4DA] items-center justify-center text-[#B5651D]">
            <Crown className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-2 font-serif text-xl text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-2">{text}</p>
          {plan.canTrial ? (
            <>
              <Button className="mt-3 text-sm font-medium" onPress={tryFree} isDisabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                {lang === 'ru' ? 'Открыть — неделя Pro бесплатно' : 'Unlock: a free week of Pro'}
              </Button>
              <p className="mt-1.5 text-xs text-ink-3">{lang === 'ru' ? 'Без карты, ничего не спишется' : 'No card, nothing is charged'}</p>
            </>
          ) : (
            <Button className="mt-3 text-sm font-medium" onPress={() => onUpgrade()}>
              {lang === 'ru' ? `Pro — от ${perDay} в день` : `Pro from ${perDay} a day`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/** plans, what Pro gives, and promo-code activation */
export const ProPage: React.FC<{ lang: Lang; onNavigate: (mode: 'practice' | 'progress' | 'teacher') => void }> = ({ lang, onNavigate }) => {
  const plan = usePlan();
  const { user, ready } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [period, setPeriod] = useState<'month' | 'year'>('year');
  const [paying, setPaying] = useState(false);
  const [cur, setCur] = useState<Currency>(localCurrency);
  const [trialBusy, setTrialBusy] = useState(false);

  const tryFree = async () => {
    setTrialBusy(true);
    setMsg(null);
    try {
      const until = await startTrial();
      setMsg({ ok: true, text: L(`Готово! Pro бесплатно до ${until.toLocaleDateString('ru-RU')}. Карта не нужна.`, `Done! Free Pro until ${until.toLocaleDateString('en-GB')}. No card needed.`) });
    } catch (e) {
      setMsg({ ok: false, text: redeemErrorText(e, lang) });
    } finally {
      setTrialBusy(false);
    }
  };

  const pay = async (tier: 'pro' | 'teacher' = 'pro') => {
    if (!ready) return;
    if (!user?.email) {
      window.location.hash = '#/login';
      return;
    }
    setPaying(true);
    setMsg(null);
    try {
      await openCheckout(
        tier === 'teacher' ? 'month' : period,
        user.email,
        () => {
          setMsg({ ok: true, text: L('Оплата прошла! Тариф включится в течение минуты.', 'Payment received! Your plan turns on within a minute.') });
          // the webhook lands a moment later
          [3000, 8000, 20000, 45000].forEach((ms) => setTimeout(planChanged, ms));
        },
        tier,
      );
    } catch {
      setMsg({ ok: false, text: L('Не удалось открыть оплату. Проверь интернет и попробуй ещё раз.', 'Could not open the checkout. Check your connection and try again.') });
    } finally {
      setPaying(false);
    }
  };
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  const redeem = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const until = await redeemCode(code);
      setMsg({ ok: true, text: L(`Готово! Pro активен до ${until.toLocaleDateString('ru-RU')}.`, `Done! Pro is active until ${until.toLocaleDateString('en-GB')}.`) });
      setCode('');
      planChanged();
    } catch (e) {
      setMsg({ ok: false, text: redeemErrorText(e, lang) });
    } finally {
      setBusy(false);
    }
  };

  const FREE = [
    L('Все 650+ тем и 60+ лабораторий', 'All 650+ topics and 60+ labs'),
    L('Тесты по темам и разделам, задачи, вопросы дня', 'Topic and section tests, problems, daily questions'),
    L('Карта курса и прогресс', 'Course map and progress'),
    L('Лиги, рейтинг и марафон задач', 'Leagues, rankings and the problem marathon'),
    L(`Наставник — ${FREE_MENTOR_DAILY} вопросов в день`, `Mentor: ${FREE_MENTOR_DAILY} questions a day`),
  ];
  const PRO = [
    { icon: <Bot className="w-4 h-4" />, t: L('ИИ-наставник без лимита', 'Unlimited AI mentor'), d: L('Объясняет то, что видно в модели', 'Explains what’s on screen') },
    { icon: <Target className="w-4 h-4" />, t: L('Пробные ОРТ, ОГЭ и ЕГЭ', 'Mock ORT, OGE and EGE'), d: L('Полный вариант на время с разбором', 'Full timed papers with review') },
    { icon: <Gauge className="w-4 h-4" />, t: L('Готовность к ОРТ', 'Exam readiness'), d: L('Процент по каждому предмету и слабые темы', 'A score per subject and your weak topics') },
    { icon: <NotebookPen className="w-4 h-4" />, t: L('Работа над ошибками', 'Mistake review'), d: L('Ошибки возвращаются через 1, 3 и 7 дней', 'Mistakes come back after 1, 3 and 7 days') },
    { icon: <Presentation className="w-4 h-4" />, t: L('Презентации по темам', 'Slides for any topic'), d: L('Готовый .pptx в 3 оформлениях за секунду', 'A ready .pptx in 3 themes in a second') },
    { icon: <Route className="w-4 h-4" />, t: L('Персональный план', 'Personal plan'), d: L('Что повторить по твоим ошибкам', 'What to revise based on your mistakes') },
    { icon: <FileText className="w-4 h-4" />, t: L('Контрольные до 3 вариантов', 'Tests in up to 3 variants'), d: L('Свои шапки, баллы, ключи и шаблоны', 'Own headers, points, keys and templates') },
    { icon: <Crosshair className="w-4 h-4" />, t: L('«Бой функций»: гайд и косметика', 'Function Wars: guide and cosmetics'), d: L('9 глав про продвинутые графики и 24 предмета внешнего вида — без преимуществ в бою', '9 chapters on advanced graphs and 24 cosmetic items — no edge in battle') },
  ];
  const TEACHER = [
    L('Всё из Pro', 'Everything in Pro'),
    L('Презентации к уроку: тест-слайды, ответы, заметки, целый раздел', 'Lesson slides: quiz, answers, speaker notes, whole sections'),
    L('Классы: ученики входят по коду', 'Classes that students join with a code'),
    L('Задания по темам и разделам со сроком', 'Topic and section assignments with due dates'),
    L('Контрольные до 8 вариантов, 40 заданий, без подписи сайта', 'Tests in up to 8 variants, 40 tasks, no site footer'),
    L('Таблица прогресса и ошибок учеников', 'Progress and mistakes of every student'),
    L('Сложные темы всего класса', 'The class’s trouble spots'),
  ];
  const price = period === 'month' ? PRICES.month : PRICES.year;

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4DA] text-[#B5651D] text-xs font-medium">
          <Crown className="w-3.5 h-3.5" strokeWidth={2} />
          STEM Visualizer Pro
        </span>
        <h1 className="mt-3 font-serif text-[40px] leading-tight text-ink">{L('Наставник, который видит твои ошибки и доводит до пятёрки', 'A tutor that sees your mistakes and gets you to the top mark')}</h1>
        <p className="mt-3 text-[16px] text-ink-2">
          {L(`Учебник, лаборатории и тесты бесплатны для всех. Pro разбирает каждую твою ошибку, отвечает на любые вопросы и готовит к экзамену — за ${money(PRICES.year / 365, cur, lang)} в день.`, `The textbook, labs and tests are free for everyone. Pro revisits every mistake you make, answers any question and gets you exam-ready, for ${money(PRICES.year / 365, cur, lang)} a day.`)}
        </p>
      </header>

      {!plan.pro && !plan.loading && (plan.canTrial || (ready && !user && cloudEnabled)) && (
        <div className="max-w-3xl mx-auto w-full rounded-2xl border-2 border-accent bg-surface px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[16px] font-medium text-ink">{L('Попробуй Pro неделю бесплатно', 'Try Pro free for a week')}</span>
              <span className="block text-sm text-ink-2">{L('Без карты. Через 7 дней Pro просто выключится, ничего не спишется.', 'No card. After 7 days Pro just switches off; nothing is charged.')}</span>
            </span>
          </span>
          {user ? (
            <Button className="text-sm font-medium" onPress={tryFree} isDisabled={trialBusy}>
              {trialBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              {L('Включить бесплатно', 'Start free week')}
            </Button>
          ) : (
            <Button className="text-sm font-medium" onPress={() => (window.location.hash = '#/register')}>
              {L('Зарегистрироваться', 'Sign up')}
            </Button>
          )}
        </div>
      )}

      {plan.pro && plan.expiresAt && (
        <div className="max-w-3xl mx-auto w-full rounded-xl bg-[#EAF6EF] border border-[#BFE3CC] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[15px] text-[#1E7A4C]">
            ✓ {plan.plan === 'teacher' ? L('Тариф «Учитель»', 'Teacher plan') + ' · ' : ''}{plan.trial ? L(`Пробная неделя Pro до ${plan.expiresAt.toLocaleDateString('ru-RU')}`, `Free Pro week until ${plan.expiresAt.toLocaleDateString('en-GB')}`) : L(`Pro активен до ${plan.expiresAt.toLocaleDateString('ru-RU')}`, `Pro is active until ${plan.expiresAt.toLocaleDateString('en-GB')}`)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" className="text-sm" onPress={() => onNavigate('practice')}>{L('Пробный экзамен', 'Mock exam')}</Button>
            <Button variant="outline" className="text-sm" onPress={() => onNavigate('progress')}>{L('Мой план', 'My plan')}</Button>
            {plan.plan === 'teacher' && <Button variant="outline" className="text-sm" onPress={() => onNavigate('teacher')}>{L('Кабинет учителя', 'Teacher dashboard')}</Button>}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-6xl mx-auto w-full items-start">
        <div className="bg-surface border border-line rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-ink">{L('Бесплатно', 'Free')}</h2>
          <div className="mt-2 font-serif text-4xl text-ink">
            $0
          </div>
          <p className="text-sm text-ink-3">{L('навсегда', 'forever')}</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {FREE.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[15px] text-ink">
                <Check className="mt-0.5 w-4 h-4 text-[#1E7A4C] shrink-0" strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl p-6 border-2 border-accent bg-surface shadow-xl">
          <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-accent text-xs font-medium" style={{ color: '#fff' }}>
            {L('Для подготовки к ОРТ', 'For exam prep')}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-2xl text-ink">Pro</h2>
            <div className="flex p-0.5 rounded-md bg-muted border border-line text-xs">
              {(['year', 'month'] as const).map((p) => (
                <Button variant={period === p ? 'outline' : 'ghost'} size="sm" className={`${period === p ? 'font-medium' : ''}`} key={p} onPress={() => setPeriod(p)}>
                  {p === 'month' ? L('месяц', 'month') : L(`год −${YEAR_OFF}%`, `year −${YEAR_OFF}%`)}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-2 font-serif text-4xl text-ink">
            {money(price, cur, lang)} <span className="text-lg text-ink-2">{L(period === 'month' ? 'в месяц' : 'в год', period === 'month' ? 'a month' : 'a year')}</span>
          </div>
          <p className="text-sm text-ink-3">
            {period === 'year'
              ? L(`${money(PRICES.year / 12, cur, lang)} в месяц · ${money(PRICES.year / 365, cur, lang)} в день`, `${money(PRICES.year / 12, cur, lang)} a month · ${money(PRICES.year / 365, cur, lang)} a day`)
              : L(`${money((PRICES.month * 12) / 365, cur, lang)} в день · отменить можно в любой момент`, `${money((PRICES.month * 12) / 365, cur, lang)} a day · cancel any time`)}
          </p>
          <div className="mt-3">
            <CurrencySwitch value={cur} onChange={setCur} lang={lang} />
          </div>
          <p className="mt-4 text-sm text-ink-2">{L('Всё из бесплатного, плюс:', 'Everything in Free, plus:')}</p>
          <ul className="mt-2 flex flex-col gap-3">
            {PRO.map((f) => (
              <li key={f.t} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">{f.icon}</span>
                <span>
                  <span className="block text-[15px] text-ink">{f.t}</span>
                  <span className="block text-xs text-ink-3">{f.d}</span>
                </span>
              </li>
            ))}
          </ul>
          {paymentsEnabled ? (
            <>
              <Button size="lg" fullWidth className="mt-6 text-sm font-medium" onPress={() => pay('pro')} isDisabled={paying || (plan.pro && !plan.trial)}>
                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan.pro && !plan.trial ? L('Pro уже подключён', 'You have Pro') : user ? L(`Оплатить картой — ${money(price, cur, lang)}`, `Pay by card — ${money(price, cur, lang)}`) : L('Войти и оплатить', 'Log in to pay')}
              </Button>
              <ChargeNote cur={cur} usd={price} lang={lang} />
              {user && !(plan.pro && !plan.trial) && <AskParent lang={lang} className="mt-4" />}
            </>
          ) : (
            <>
              <Button size="lg" fullWidth className="mt-6 opacity-60 text-sm font-medium" isDisabled>
                {L('Оплата картой — скоро', 'Card payment — coming soon')}
              </Button>
              <p className="mt-2 text-xs text-center text-ink-3">{L('Пока Pro подключается промокодом ниже', 'For now Pro is activated with a promo code below')}</p>
            </>
          )}
        </div>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-accent" strokeWidth={1.75} />
            <h2 className="font-serif text-2xl text-ink">{L('Учитель', 'Teacher')}</h2>
          </div>
          <div className="mt-2 font-serif text-4xl text-ink">
            {money(PRICES.teacher, cur, lang)} <span className="text-lg text-ink-2">{L('в месяц', 'a month')}</span>
          </div>
          <p className="text-sm text-ink-3">{L('для учителей и репетиторов', 'for teachers and tutors')}</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {TEACHER.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[15px] text-ink">
                <Check className="mt-0.5 w-4 h-4 text-accent shrink-0" strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" size="lg" fullWidth className="mt-6 text-sm font-medium" onPress={() => pay('teacher')} isDisabled={!paymentsEnabled || paying || plan.plan === 'teacher'}>
            {plan.plan === 'teacher' ? L('Тариф подключён', 'You have it') : paymentsEnabled ? (user ? L(`Оплатить — ${money(PRICES.teacher, cur, lang)}`, `Pay — ${money(PRICES.teacher, cur, lang)}`) : L('Войти и оплатить', 'Log in to pay')) : L('Оплата картой — скоро', 'Card payment — coming soon')}
          </Button>
          <p className="mt-2 text-xs text-center text-ink-3">{L('Для школ — промокоды на весь класс: напишите нам.', 'For schools: promo codes for a whole class, just ask.')}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full bg-surface border border-line rounded-2xl p-6">
        <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" strokeWidth={1.75} />
          {L('Есть промокод?', 'Have a promo code?')}
        </h2>
        <p className="mt-1 text-sm text-ink-3">{L('Для школ, подарков и оплаты без карты Visa/Mastercard.', 'For schools, gifts and paying without a Visa/Mastercard.')}</p>
        {!cloudEnabled ? (
          <p className="mt-2 text-sm text-ink-2">{L('Аккаунты ещё не подключены.', 'Accounts are not connected yet.')}</p>
        ) : !ready ? (
          <p className="mt-2 text-sm text-ink-2">{L('Проверяем вход…', 'Checking your session…')}</p>
        ) : !user ? (
          <p className="mt-2 text-sm text-ink-2">
            {L('Чтобы активировать код, ', 'To use a code, ')}
            <a href="#/login" className="text-accent hover:underline">
              {L('войди в аккаунт', 'log in')}
            </a>
            .
          </p>
        ) : (
          <div className="mt-3 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && redeem()}
              placeholder="STEM2026"
              className="flex-1 font-mono uppercase"
            />
            <Button size="lg" className="text-sm font-medium" onPress={() => redeem()} isDisabled={busy}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {L('Активировать', 'Activate')}
            </Button>
          </div>
        )}
        {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{msg.text}</p>}
      </div>
    </div>
  );
};

export default ProPage;
