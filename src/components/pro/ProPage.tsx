import React, { useState } from 'react';
import { Check, Crown, GraduationCap, Loader2, Sparkles, Target, Bot, Route } from 'lucide-react';
import { PRICES, FREE_MENTOR_DAILY, inSom, openCheckout, paymentsEnabled, redeemCode, redeemErrorText, usePlan } from '../../lib/plan';
import { cloudEnabled, useSession } from '../../lib/supabase';

type Lang = 'ru' | 'en';
const YEAR_OFF = Math.round((1 - PRICES.year / (PRICES.month * 12)) * 100);

/** small lock overlay for Pro-only blocks */
export const ProGate: React.FC<{ lang: Lang; pro: boolean; onUpgrade: () => void; title: string; text: string; children: React.ReactNode }> = ({ lang, pro, onUpgrade, title, text, children }) => {
  if (pro) return <>{children}</>;
  return (
    <div className="relative rounded-xl overflow-hidden border border-line">
      <div className="pointer-events-none select-none blur-[3px] opacity-60 max-h-[340px] overflow-hidden">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-b from-transparent via-[rgba(250,250,247,0.85)] to-[rgba(250,250,247,0.97)]">
        <div className="max-w-sm text-center bg-surface border border-line rounded-xl p-5 shadow-lg">
          <span className="inline-flex w-10 h-10 rounded-full bg-[#FFF4DA] items-center justify-center text-[#B5651D]">
            <Crown className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-2 font-serif text-xl text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-2">{text}</p>
          <button onClick={onUpgrade} className="mt-3 h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
            {lang === 'ru' ? `Pro за ${PRICES.month} в месяц` : `Pro for ${PRICES.month}/mo`}
          </button>
        </div>
      </div>
    </div>
  );
};

/** plans, what Pro gives, and promo-code activation */
export const ProPage: React.FC<{ lang: Lang; onNavigate: (mode: 'practice' | 'progress' | 'teacher') => void }> = ({ lang, onNavigate }) => {
  const plan = usePlan();
  const { user } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    if (!user?.email) {
      window.location.hash = '#/login';
      return;
    }
    setPaying(true);
    setMsg(null);
    try {
      await openCheckout(period, user.email, () => {
        setMsg({ ok: true, text: L('Оплата прошла! Pro включится в течение минуты.', 'Payment received! Pro turns on within a minute.') });
        // the webhook lands a moment later
        [3000, 8000, 20000, 45000].forEach((ms) => setTimeout(plan.refresh, ms));
      });
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
      plan.refresh();
    } catch (e) {
      setMsg({ ok: false, text: redeemErrorText(e, lang) });
    } finally {
      setBusy(false);
    }
  };

  const FREE = [
    L('Все 486 тем и 60+ лабораторий', 'All 486 topics and 60+ labs'),
    L('Тесты по темам и разделам, задачи, вопросы дня', 'Topic and section tests, problems, daily questions'),
    L('Карта курса и прогресс', 'Course map and progress'),
    L(`Наставник — ${FREE_MENTOR_DAILY} вопросов в день`, `Mentor: ${FREE_MENTOR_DAILY} questions a day`),
  ];
  const PRO = [
    { icon: <Bot className="w-4 h-4" />, t: L('ИИ-наставник без лимита', 'Unlimited AI mentor'), d: L('Объясняет то, что видно в модели', 'Explains what’s on screen') },
    { icon: <Target className="w-4 h-4" />, t: L('Пробные ОРТ-экзамены', 'ORT-style mock exams'), d: L('Полный вариант на время с разбором', 'Full timed papers with review') },
    { icon: <Route className="w-4 h-4" />, t: L('Персональный план', 'Personal plan'), d: L('Что повторить по твоим ошибкам', 'What to revise based on your mistakes') },
    { icon: <GraduationCap className="w-4 h-4" />, t: L('Кабинет учителя', 'Teacher dashboard'), d: L('Классы по коду, задания со сроком, прогресс учеников', 'Classes with join codes, assignments, student progress') },
  ];
  const price = period === 'month' ? PRICES.month : PRICES.year;

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4DA] text-[#B5651D] text-xs font-medium">
          <Crown className="w-3.5 h-3.5" strokeWidth={2} />
          STEM Visualizer Pro
        </span>
        <h1 className="mt-3 font-serif text-[40px] leading-tight text-ink">{L('Учиться — бесплатно. Pro — когда нужен наставник.', 'Learning is free. Pro is for when you want a tutor.')}</h1>
        <p className="mt-3 text-[16px] text-ink-2">
          {L('Весь учебник, лаборатории и тесты открыты всем школьникам. Платно только то, что стоит нам денег: ИИ-наставник и подготовка к экзаменам.', 'The whole textbook, labs and tests are open to every student. Only what costs us money is paid: the AI mentor and exam prep.')}
        </p>
      </header>

      {plan.pro && plan.expiresAt && (
        <div className="max-w-3xl mx-auto w-full rounded-xl bg-[#EAF6EF] border border-[#BFE3CC] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[15px] text-[#1E7A4C]">
            ✓ {L(`Pro активен до ${plan.expiresAt.toLocaleDateString('ru-RU')}`, `Pro is active until ${plan.expiresAt.toLocaleDateString('en-GB')}`)}
          </span>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('practice')} className="h-9 px-3 rounded-lg bg-surface border border-line text-sm text-ink cursor-pointer">{L('Пробный ОРТ', 'Mock exam')}</button>
            <button onClick={() => onNavigate('progress')} className="h-9 px-3 rounded-lg bg-surface border border-line text-sm text-ink cursor-pointer">{L('Мой план', 'My plan')}</button>
            <button onClick={() => onNavigate('teacher')} className="h-9 px-3 rounded-lg bg-surface border border-line text-sm text-ink cursor-pointer">{L('Кабинет учителя', 'Teacher dashboard')}</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        <div className="bg-surface border border-line rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-ink">{L('Бесплатно', 'Free')}</h2>
          <div className="mt-2 font-serif text-4xl text-ink">
            0 <span className="text-lg text-ink-2">{L('сом', 'KGS')}</span>
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
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink">Pro</h2>
            <div className="flex p-0.5 rounded-md bg-muted border border-line text-xs">
              {(['month', 'year'] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 h-7 rounded cursor-pointer ${period === p ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2'}`}>
                  {p === 'month' ? L('месяц', 'month') : L(`год −${YEAR_OFF}%`, `year −${YEAR_OFF}%`)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 font-serif text-4xl text-ink">
            ${price} <span className="text-lg text-ink-2">{L(period === 'month' ? 'в месяц' : 'в год', period === 'month' ? 'a month' : 'a year')}</span>
          </div>
          <p className="text-sm text-ink-3">
            {L(`≈ ${inSom(price)} сом`, `≈ ${inSom(price)} KGS`)}
            {period === 'year' ? L(` · ${(PRICES.year / 12).toFixed(2)} в месяц`, ` · ${(PRICES.year / 12).toFixed(2)} a month`) : L(' · отменить можно в любой момент', ' · cancel any time')}
          </p>
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
              <button onClick={pay} disabled={paying || plan.pro} className="mt-6 w-full h-11 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan.pro ? L('Pro уже подключён', 'You have Pro') : user ? L(`Оплатить картой — ${price}`, `Pay by card — ${price}`) : L('Войти и оплатить', 'Log in to pay')}
              </button>
              <p className="mt-2 text-xs text-center text-ink-3">{L('Visa и Mastercard любого банка. Оплата через Freemius — безопасно, данные карты к нам не попадают.', 'Any Visa or Mastercard. Paid via Freemius, so your card details never reach us.')}</p>
            </>
          ) : (
            <>
              <button disabled className="mt-6 w-full h-11 rounded-lg bg-accent opacity-60 text-sm font-medium cursor-not-allowed" style={{ color: '#fff' }}>
                {L('Оплата картой — скоро', 'Card payment — coming soon')}
              </button>
              <p className="mt-2 text-xs text-center text-ink-3">{L('Пока Pro подключается промокодом ниже', 'For now Pro is activated with a promo code below')}</p>
            </>
          )}
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
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && redeem()}
              placeholder="STEM2026"
              className="flex-1 h-11 px-3 rounded-lg bg-surface border border-line font-mono text-[15px] text-ink outline-none focus:border-accent uppercase"
            />
            <button onClick={redeem} disabled={busy} className="h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {L('Активировать', 'Activate')}
            </button>
          </div>
        )}
        {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-[#1E7A4C]' : 'text-[#CC2F35]'}`}>{msg.text}</p>}
      </div>
    </div>
  );
};

export default ProPage;
