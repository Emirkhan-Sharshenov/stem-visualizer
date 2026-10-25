import { Button, Card } from '@heroui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Loader2, Lock, RefreshCw } from 'lucide-react';
import { loadAdminStats, useIsAdmin, type AdminStats as Stats } from '../../lib/admin';
import { topicById } from '../../data/curriculum';
import { useSession } from '../../lib/supabase';

type Lang = 'ru' | 'en';
const RANGES = [14, 30, 90];

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const shortDay = (iso: string, lang: Lang) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** a headline number with a caption and an optional note under it */
const Tile: React.FC<{ value: React.ReactNode; label: string; note?: string }> = ({ value, label, note }) => (
  <Card className="p-4">
    <Card.Content>
      <div className="font-mono text-3xl text-ink">{value}</div>
      <div className="mt-1 text-sm text-ink-2">{label}</div>
      {note && <div className="mt-0.5 text-xs text-ink-3">{note}</div>}
    </Card.Content>
  </Card>
);

/** one series of daily counts as thin bars, with a hover read-out; the title names the series */
const DailyBars: React.FC<{ title: string; data: { day: string; v: number }[]; lang: Lang; average?: boolean }> = ({ title, data, lang, average }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.v));
  const total = data.reduce((s, d) => s + d.v, 0);
  const W = 640;
  const H = 180;
  const slot = W / data.length;
  const bw = Math.max(2, slot - 2); // a 2px surface gap between bars
  const h = hover !== null ? data[hover] : null;
  return (
    <Card className="p-5">
      <Card.Content>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium text-ink">{title}</h3>
          <span className="text-xs text-ink-3">
            {/* the same person studies on many days, so a sum would count them twice: show the daily average */}
            {h ? `${shortDay(h.day, lang)}: ` : average ? (lang === 'ru' ? 'в среднем в день: ' : 'daily average: ') : lang === 'ru' ? 'за период: ' : 'in range: '}
            <span className="font-mono text-ink">{h ? h.v : average ? (total / data.length).toFixed(1).replace('.', lang === 'ru' ? ',' : '.') : total}</span>
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 22}`} className="mt-3 w-full h-auto" role="img" aria-label={`${title}: ${total}`} onMouseLeave={() => setHover(null)}>
          {/* recessive guide at the top value */}
          <line x1="0" x2={W} y1="1" y2="1" stroke="var(--sv-line)" strokeDasharray="3 4" />
          <text x={W} y="14" textAnchor="end" fontSize="11" fill="var(--sv-ink-3)" fontFamily="var(--font-mono)">{max}</text>
          <line x1="0" x2={W} y1={H} y2={H} stroke="var(--sv-line)" />
          {data.map((d, i) => {
            const bh = d.v ? Math.max(3, (d.v / max) * (H - 18)) : 0;
            const x = i * slot + (slot - bw) / 2;
            return (
              <g key={d.day} onMouseEnter={() => setHover(i)}>
                {/* hit target: the whole column, bigger than the bar */}
                <rect x={i * slot} y="0" width={slot} height={H} fill="transparent" />
                {bh > 0 && <path d={`M${x},${H} V${H - bh + 4} q0,-4 4,-4 h${Math.max(0, bw - 8)} q4,0 4,4 V${H} Z`} fill="var(--accent)" opacity={hover === null || hover === i ? 1 : 0.45} />}
              </g>
            );
          })}
          {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
            <text key={i} x={i * slot + slot / 2} y={H + 16} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} fontSize="11" fill="var(--sv-ink-3)">
              {shortDay(data[i].day, lang)}
            </text>
          ))}
        </svg>
      </Card.Content>
    </Card>
  );
};

/** a share of learners as a labelled bar */
const ShareRow: React.FC<{ label: string; n: number; of: number }> = ({ label, n, of }) => (
  <div>
    <div className="flex justify-between text-sm">
      <span className="text-ink-2">{label}</span>
      <span className="font-mono text-ink">
        {n} <span className="text-ink-3">· {pct(n, of)}%</span>
      </span>
    </div>
    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct(n, of)}%` }} />
    </div>
  </div>
);

/** the owner's statistics: sign-ups, study days, returns, plans and popular topics */
export const AdminStats: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user, ready } = useSession();
  const admin = useIsAdmin();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    setError(false);
    loadAdminStats(days)
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  }, [days]);
  useEffect(() => {
    if (admin) load();
  }, [admin, load]);

  if (!ready || (user && !admin && !error && busy)) return <div className="h-[50vh] rounded-xl bg-muted animate-pulse" />;
  if (!admin)
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <Lock className="w-8 h-8 mx-auto text-ink-3" strokeWidth={1.5} />
        <h1 className="mt-3 font-serif text-2xl text-ink">{L('Раздел только для администраторов', 'Admins only')}</h1>
        <p className="mt-2 text-sm text-ink-2">{user ? L('У этого аккаунта нет доступа к статистике.', 'This account has no access to the statistics.') : L('Войди в аккаунт администратора.', 'Log in with an admin account.')}</p>
      </div>
    );

  const t = stats?.totals;
  const r = stats?.returning;
  const p = stats?.plans;
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink inline-flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-accent" strokeWidth={1.75} />
            {L('Статистика', 'Statistics')}
          </h1>
          <p className="mt-1 text-sm text-ink-3">{L('Видна только администраторам. Дни считаются по UTC.', 'Visible to admins only. Days are in UTC.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-md bg-muted border border-line" role="group" aria-label={L('Период', 'Range')}>
            {RANGES.map((d) => (
              <Button key={d} size="sm" variant={days === d ? 'outline' : 'ghost'} className={days === d ? 'font-medium' : ''} onPress={() => setDays(d)}>
                {L(`${d} дн.`, `${d} d`)}
              </Button>
            ))}
          </div>
          <Button isIconOnly size="sm" variant="ghost" aria-label={L('Обновить', 'Refresh')} onPress={load} isDisabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {error && <p className="text-sm text-[#CC2F35]">{L('Не удалось загрузить статистику. Попробуй обновить.', 'Could not load the statistics. Try refreshing.')}</p>}
      {!stats ? (
        <div className="h-[40vh] rounded-xl bg-muted animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile value={t!.users} label={L('аккаунтов всего', 'accounts')} note={L(`сегодня +${t!.new_today}, за неделю +${t!.new_7d}`, `+${t!.new_today} today, +${t!.new_7d} this week`)} />
            <Tile value={r!.active_today} label={L('занимались сегодня', 'studied today')} note={L(`за 7 дней — ${r!.active_7d}`, `${r!.active_7d} in 7 days`)} />
            <Tile value={`${pct(r!.days2, r!.learners)}%`} label={L('вернулись хотя бы раз', 'came back at least once')} note={L(`${r!.days2} из ${r!.learners} с прогрессом`, `${r!.days2} of ${r!.learners} with progress`)} />
            <Tile value={p!.paid_active} label={L('платных Pro сейчас', 'paid Pro now')} note={L(`пробных недель идёт: ${p!.trial_active}`, `${p!.trial_active} free weeks running`)} />
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            <DailyBars title={L('Регистрации по дням', 'Sign-ups per day')} data={stats.daily.map((d) => ({ day: d.day, v: d.signups }))} lang={lang} />
            <DailyBars title={L('Занимались по дням', 'Learners studying per day')} data={stats.daily.map((d) => ({ day: d.day, v: d.active }))} lang={lang} average />
          </div>

          <div className="grid lg:grid-cols-3 gap-3">
            <Card className="p-5">
              <Card.Content className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-ink">{L('Сколько дней занимались', 'Days of study')}</h3>
                <ShareRow label={L('2 дня и больше', '2+ days')} n={r!.days2} of={r!.learners} />
                <ShareRow label={L('3 дня и больше', '3+ days')} n={r!.days3} of={r!.learners} />
                <ShareRow label={L('7 дней и больше', '7+ days')} n={r!.days7} of={r!.learners} />
              </Card.Content>
            </Card>
            <Card className="p-5">
              <Card.Content className="flex flex-col gap-2 text-sm">
                <h3 className="font-medium text-ink">{L('Тарифы', 'Plans')}</h3>
                {[
                  [L('Пробная неделя идёт', 'Free week running'), p!.trial_active],
                  [L('Пробная неделя закончилась', 'Free week ended'), p!.trial_ended],
                  [L('Платный Pro сейчас', 'Paid Pro now'), p!.paid_active],
                  [L('Покупали когда-либо', 'Ever paid'), p!.paid_ever],
                  [L('По промокоду', 'By promo code'), p!.promo_active],
                  [L('Тариф «Учитель»', 'Teacher plan'), p!.teacher_active],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between border-b border-line last:border-0 py-1">
                    <span className="text-ink-2">{k}</span>
                    <span className="font-mono text-ink">{v}</span>
                  </div>
                ))}
              </Card.Content>
            </Card>
            <Card className="p-5">
              <Card.Content className="flex flex-col gap-2 text-sm">
                <h3 className="font-medium text-ink">{L('Аудитория', 'Audience')}</h3>
                {[
                  [L('Подтвердили почту', 'Confirmed e-mail'), `${t!.confirmed} · ${pct(t!.confirmed, t!.users)}%`],
                  [L('Учителей', 'Teachers'), t!.teachers],
                  [L('Включили напоминания', 'Push reminders on'), t!.push],
                  [L('С прогрессом в облаке', 'With cloud progress'), r!.learners],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between border-b border-line last:border-0 py-1">
                    <span className="text-ink-2">{k}</span>
                    <span className="font-mono text-ink">{v}</span>
                  </div>
                ))}
              </Card.Content>
            </Card>
          </div>

          <Card className="p-5">
            <Card.Content>
              <h3 className="text-sm font-medium text-ink">{L('Темы, которые чаще отмечают понятыми', 'Topics most often marked as understood')}</h3>
              {stats.top_topics.length ? (
                <ol className="mt-3 flex flex-col gap-1.5 text-sm">
                  {stats.top_topics.map((x, i) => {
                    const topic = topicById(x.id);
                    return (
                      <li key={x.id} className="flex justify-between gap-3">
                        <span className="text-ink-2 truncate">
                          <span className="font-mono text-ink-3 mr-2">{i + 1}.</span>
                          {topic ? topic.title[lang] : x.id}
                        </span>
                        <span className="font-mono text-ink">{x.n}</span>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-ink-3">{L('Пока никто не отметил тему понятой.', 'Nobody has marked a topic as understood yet.')}</p>
              )}
            </Card.Content>
          </Card>

          <details className="text-sm">
            <summary className="cursor-pointer text-ink-2">{L('Таблица по дням', 'Table by day')}</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="text-ink-3">
                  <tr>
                    <th className="py-1 pr-4">{L('День', 'Day')}</th>
                    <th className="py-1 pr-4">{L('Регистрации', 'Sign-ups')}</th>
                    <th className="py-1">{L('Занимались', 'Studied')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...stats.daily].reverse().map((d) => (
                    <tr key={d.day} className="border-t border-line text-ink">
                      <td className="py-1 pr-4">{d.day}</td>
                      <td className="py-1 pr-4">{d.signups}</td>
                      <td className="py-1">{d.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
};

export default AdminStats;
