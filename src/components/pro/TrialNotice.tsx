import { Button } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { Gift, Hourglass, X } from 'lucide-react';
import { PRICES, localCurrency, money, startTrial, usePlan } from '../../lib/plan';
import { useSession } from '../../lib/supabase';

type Lang = 'ru' | 'en';
const DAY = 864e5;
const NEW_ACCOUNT_DAYS = 3;
const HIDE_KEY = 'stem-trial-ending-hidden';

/** gives a new account its free week of Pro on the first visit, and reminds when the week is about to end */
export const TrialNotice: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user } = useSession();
  const plan = usePlan();
  const [gift, setGift] = useState<Date | null>(null);
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDE_KEY) === new Date().toISOString().slice(0, 10);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!user || plan.loading || !plan.canTrial || !user.email_confirmed_at) return;
    if (Date.now() - new Date(user.created_at).getTime() > NEW_ACCOUNT_DAYS * DAY) return;
    const tried = `stem-trial-tried-${user.id}`;
    if (sessionStorage.getItem(tried)) return;
    sessionStorage.setItem(tried, '1');
    startTrial()
      .then((until) => {
        setGift(until);
        setTimeout(() => setGift(null), 12000);
      })
      .catch(() => {});
  }, [user, plan.loading, plan.canTrial]);

  const open = () => window.dispatchEvent(new Event('open-pro'));
  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, new Date().toISOString().slice(0, 10));
    } catch {
      // shown again next time
    }
  };

  if (gift)
    return (
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(440px,calc(100vw-32px))] rounded-2xl bg-surface border border-line shadow-2xl p-4 flex gap-3">
        <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ink">{L('Неделя Pro в подарок', 'A free week of Pro')}</p>
          <p className="mt-0.5 text-sm text-ink-2">
            {L(`До ${gift.toLocaleDateString('ru-RU')}: наставник без лимита, работа над ошибками и пробный ОРТ. Карта не нужна.`, `Until ${gift.toLocaleDateString('en-GB')}: unlimited mentor, mistake review and mock exams. No card needed.`)}
          </p>
          <Button size="sm" variant="ghost" className="mt-1 -ml-2 text-sm text-accent" onPress={() => { setGift(null); open(); }}>
            {L('Что входит в Pro →', 'What Pro includes →')}
          </Button>
        </div>
        <Button isIconOnly size="sm" variant="ghost" aria-label={L('Закрыть', 'Close')} onPress={() => setGift(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );

  if (!plan.trial || !plan.expiresAt || hidden) return null;
  const msLeft = plan.expiresAt.getTime() - Date.now();
  if (msLeft > 2 * DAY) return null;
  // calendar days until the end: 0 today, 1 tomorrow, 2 the day after
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(plan.expiresAt) - midnight(new Date())) / DAY);
  const perDay = money(PRICES.year / 365, localCurrency(), lang);
  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(520px,calc(100vw-32px))] rounded-2xl bg-surface border border-line shadow-2xl p-4 flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-[#FFF4DA] text-[#B5651D] flex items-center justify-center shrink-0">
        <Hourglass className="w-5 h-5" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-ink">{days <= 0 ? L('Pro закончится сегодня', 'Pro ends today') : days === 1 ? L('Pro закончится завтра', 'Pro ends tomorrow') : L('Pro закончится через 2 дня', 'Pro ends in 2 days')}</p>
        <p className="mt-0.5 text-sm text-ink-2">{L(`Оставь наставника и разбор ошибок: от ${perDay} в день.`, `Keep the mentor and mistake review: from ${perDay} a day.`)}</p>
      </div>
      <Button size="sm" className="text-sm font-medium" onPress={() => { hide(); open(); }}>
        {L('Продлить', 'Keep Pro')}
      </Button>
      <Button isIconOnly size="sm" variant="ghost" aria-label={L('Закрыть', 'Close')} onPress={hide}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TrialNotice;
