import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Trophy, Users, Zap } from 'lucide-react';
import { useSession } from '../../lib/supabase';
import { navigate } from '../../router';
import { useProgress, XP } from '../../lib/progress';
import { classBoard, DEMOTE, myLeague, PROMOTE, setNickname, TIERS, topTotal, useBoard } from '../../lib/xp';

type Lang = 'ru' | 'en';
type Tab = 'league' | 'all' | 'class';

/** a shield in the tier's colour */
export const TierBadge: React.FC<{ tier: number; size?: number; dim?: boolean }> = ({ tier, size = 56, dim }) => {
  const t = TIERS[tier];
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" style={{ opacity: dim ? 0.35 : 1 }} aria-hidden>
      <path d="M50 4 L92 18 V56 C92 82 72 100 50 108 C28 100 8 82 8 56 V18 Z" fill={t.color} />
      <path d="M50 14 L82 25 V56 C82 76 67 90 50 97 C33 90 18 76 18 56 V25 Z" fill="#fff" fillOpacity="0.18" />
      <path d="M50 30 L56 46 L73 46 L59 56 L64 73 L50 63 L36 73 L41 56 L27 46 L44 46 Z" fill="#fff" />
    </svg>
  );
};

function timeLeft(ends: string, lang: Lang) {
  const ms = Math.max(0, new Date(ends).getTime() - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return lang === 'ru' ? (d ? `${d} д ${h} ч` : `${h} ч`) : d ? `${d}d ${h}h` : `${h}h`;
}

const Avatar: React.FC<{ nick: string; me?: boolean }> = ({ nick, me }) => {
  const hue = [...nick].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: me ? '#2F5BFF' : `hsl(${hue} 55% 88%)`, color: me ? '#fff' : `hsl(${hue} 45% 30%)` }}>
      {nick.slice(0, 1).toUpperCase()}
    </span>
  );
};

const Nickname: React.FC<{ lang: Lang; value: string; onSaved: () => void }> = ({ lang, value, onSaved }) => {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(value);
  const [err, setErr] = useState('');
  useEffect(() => setV(value), [value]);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  if (!edit)
    return (
      <button onClick={() => setEdit(true)} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        {L('Твой ник', 'Your nickname')}: <b className="text-ink">{value}</b>
        <Pencil className="w-3.5 h-3.5" />
      </button>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await setNickname(v);
          setEdit(false);
          setErr('');
          onSaved();
        } catch {
          setErr(L('2–20 символов: буквы, цифры, пробел, точка, дефис', '2–20 characters: letters, digits, space, dot, dash'));
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input value={v} onChange={(e) => setV(e.target.value)} maxLength={20} autoFocus className="h-9 w-48 rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-accent" />
      <button className="h-9 px-3 rounded-lg bg-accent text-sm font-medium inline-flex items-center gap-1 cursor-pointer" style={{ color: '#fff' }}>
        <Check className="w-4 h-4" />
        {L('Сохранить', 'Save')}
      </button>
      {err && <span className="text-xs text-[#B42318] w-full">{err}</span>}
    </form>
  );
};

const LeagueView: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { data, error, reload } = useBoard(myLeague, true);
  if (error) return <p className="text-sm text-[#B42318]">{L('Не получилось загрузить лигу. Обнови страницу.', 'Could not load the league. Refresh the page.')}</p>;
  if (!data) return <div className="h-80 rounded-xl bg-muted animate-pulse" />;
  const tier = TIERS[data.tier];
  const size = data.members.length;
  const canDrop = data.tier > 0 && size >= 10;
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4" style={{ background: tier.light }}>
          <TierBadge tier={data.tier} size={58} />
          <div className="min-w-0 flex-1">
            <div className="font-serif text-2xl text-ink">
              {L('Лига', 'League')}: {tier[lang]}
            </div>
            <div className="text-sm text-ink-2">
              {L('Неделя закончится через', 'Week ends in')} <b className="text-ink">{timeLeft(data.ends, lang)}</b>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-ink">{data.xp}</div>
            <div className="text-[11px] text-ink-2">{L('очков за неделю', 'points this week')}</div>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 py-3 border-b border-line">
          {TIERS.map((_, i) => (
            <TierBadge key={i} tier={i} size={i === data.tier ? 30 : 22} dim={i > data.tier} />
          ))}
        </div>
        <ol>
          {data.members.map((m, i) => {
            const up = i < PROMOTE && m.xp > 0 && data.tier < 5;
            const down = canDrop && i >= size - DEMOTE;
            return (
              <React.Fragment key={i}>
                {i === PROMOTE && data.tier < 5 && size > PROMOTE && (
                  <li className="px-5 py-1.5 text-[11px] font-medium text-[#1E7A4C] bg-[#EEF8F2] flex items-center gap-1">
                    <ArrowUp className="w-3.5 h-3.5" />
                    {L(`Выше — зона повышения в лигу «${TIERS[data.tier + 1].ru}»`, `Above: promotion to ${TIERS[data.tier + 1].en}`)}
                  </li>
                )}
                {canDrop && i === size - DEMOTE && (
                  <li className="px-5 py-1.5 text-[11px] font-medium text-[#B42318] bg-[#FFF4F0] flex items-center gap-1">
                    <ArrowDown className="w-3.5 h-3.5" />
                    {L('Ниже — зона понижения', 'Below: demotion zone')}
                  </li>
                )}
                <li className={`px-5 py-2.5 flex items-center gap-3 border-t border-line ${m.me ? 'bg-accent-soft' : ''}`}>
                  <span className={`w-6 text-center font-mono text-sm ${up ? 'text-[#1E7A4C] font-semibold' : down ? 'text-[#B42318]' : 'text-ink-3'}`}>{i + 1}</span>
                  <Avatar nick={m.nick} me={m.me} />
                  <span className={`flex-1 min-w-0 truncate text-[15px] ${m.me ? 'font-semibold text-ink' : 'text-ink'}`}>
                    {m.nick}
                    {m.me && <span className="text-ink-3 font-normal"> · {L('ты', 'you')}</span>}
                  </span>
                  <span className="font-mono text-sm text-ink">{m.xp}</span>
                </li>
              </React.Fragment>
            );
          })}
        </ol>
        {size <= 1 && <p className="px-5 py-4 text-sm text-ink-2 border-t border-line">{L('Пока в группе только ты. Как только другие ученики начнут решать задачи на этой неделе, они появятся здесь — позови друзей!', 'It is just you in the group so far. Others appear as soon as they earn points this week: invite your friends!')}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <Nickname lang={lang} value={data.nickname} onSaved={reload} />
          <p className="mt-2 text-xs text-ink-3">{L('Ник видят другие участники лиги. Фамилию и почту не показываем.', 'Other players see your nickname. We never show your surname or e-mail.')}</p>
        </div>
        <HowToEarn lang={lang} />
        <div className="bg-surface border border-line rounded-xl p-4 text-sm text-ink-2">
          {L(`Каждую неделю (с понедельника) ты попадаешь в группу до 30 учеников своей лиги. Первые ${PROMOTE} переходят в лигу выше, последние ${DEMOTE} — опускаются. Кто не набрал ни одного очка, тоже опускается.`, `Every week (from Monday) you join a group of up to 30 learners in your league. The top ${PROMOTE} move up, the bottom ${DEMOTE} move down, and so does anyone with no points.`)}
        </div>
      </div>
    </div>
  );
};

const HowToEarn: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const rows: [string, string][] = [
    [L('Верно решённая задача', 'Problem solved'), `+${XP.problem}`],
    [L('Повтор ошибки (Pro)', 'Mistake reviewed (Pro)'), `+${XP.review}`],
    [L('Вопросы дня', 'Questions of the day'), `+${XP.perDailyAnswer} ${L('за ответ', 'each')}`],
    [L('Тест, пробный ОРТ', 'Test, mock exam'), `+${XP.perTestAnswer} ${L('за ответ', 'each')}`],
    [L('Тема пройдена', 'Topic passed'), `+${XP.quizPass}`],
    [L('Марафон задач', 'Problem marathon'), `+${XP.perMarathon} ${L('за шаг серии', 'per step')}`],
    [L('Угаданный опыт', 'Prediction right'), `+${XP.prediction}`],
  ];
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Как получать очки', 'How to earn points')}</h3>
      <ul className="flex flex-col gap-1.5 text-sm">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3">
            <span className="text-ink-2">{k}</span>
            <span className="font-mono text-ink">{v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-ink-3">{L('Не больше 2000 очков в день.', 'Up to 2000 points a day.')}</p>
    </div>
  );
};

const AllTime: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { data } = useBoard(topTotal, true);
  if (!data) return <div className="h-80 rounded-xl bg-muted animate-pulse" />;
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      <ol className="bg-surface border border-line rounded-xl overflow-hidden">
        {data.top.length === 0 && <li className="px-5 py-4 text-sm text-ink-2">{L('Здесь пока пусто — стань первым!', 'Empty so far: be the first!')}</li>}
        {data.top.map((m, i) => (
          <li key={i} className={`px-5 py-2.5 flex items-center gap-3 ${i ? 'border-t border-line' : ''} ${m.me ? 'bg-accent-soft' : ''}`}>
            <span className="w-7 text-center font-mono text-sm text-ink-3">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
            <Avatar nick={m.nick} me={m.me} />
            <span className={`flex-1 min-w-0 truncate ${m.me ? 'font-semibold' : ''} text-ink`}>{m.nick}</span>
            <span className="font-mono text-sm text-ink">{m.xp}</span>
          </li>
        ))}
      </ol>
      <div className="bg-surface border border-line rounded-xl p-4">
        <div className="text-[11px] text-ink-2">{L('Твоё место за всё время', 'Your all-time place')}</div>
        <div className="font-mono text-3xl text-ink">{data.me ? `#${data.me.rank}` : '—'}</div>
        <div className="text-sm text-ink-2">{data.me ? `${data.me.xp} ${L('очков', 'points')}` : L('Реши первую задачу', 'Solve your first problem')}</div>
      </div>
    </div>
  );
};

const ClassView: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { data } = useBoard(classBoard, true);
  if (!data) return <div className="h-60 rounded-xl bg-muted animate-pulse" />;
  if (!data.length)
    return (
      <div className="bg-surface border border-line rounded-xl p-6 text-center max-w-lg">
        <Users className="w-8 h-8 mx-auto text-ink-3" />
        <p className="mt-2 text-ink">{L('Ты пока не состоишь в классе.', 'You are not in a class yet.')}</p>
        <p className="text-sm text-ink-2">{L('Попроси учителя код класса и введи его — тогда здесь появится рейтинг одноклассников.', 'Ask your teacher for the class code; then your classmates’ ranking shows up here.')}</p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-mode', { detail: 'classes' }))} className="mt-3 h-9 px-4 rounded-lg bg-accent text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
          {L('Ввести код класса', 'Enter a class code')}
        </button>
      </div>
    );
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      {data.map((c) => (
        <div key={c.id} className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-line flex items-center justify-between">
            <b className="text-ink">{c.name}</b>
            <span className="text-xs text-ink-3">{L('очки за неделю · всего', 'this week · total')}</span>
          </div>
          <ol>
            {c.members.map((m, i) => (
              <li key={i} className={`px-5 py-2 flex items-center gap-3 ${i ? 'border-t border-line' : ''} ${m.me ? 'bg-accent-soft' : ''}`}>
                <span className="w-6 text-center font-mono text-sm text-ink-3">{i + 1}</span>
                <Avatar nick={m.nick} me={m.me} />
                <span className="flex-1 min-w-0 truncate text-ink">{m.nick}</span>
                <span className="font-mono text-sm text-ink">{m.week}</span>
                <span className="font-mono text-xs text-ink-3 w-14 text-right">{m.total}</span>
              </li>
            ))}
            {c.members.length === 0 && <li className="px-5 py-3 text-sm text-ink-2">{L('В классе пока нет учеников.', 'No students yet.')}</li>}
          </ol>
        </div>
      ))}
    </div>
  );
};

export const RatingPage: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user, ready } = useSession();
  const { xp } = useProgress();
  const [tab, setTab] = useState<Tab>('league');
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[36px] leading-tight text-ink">{L('Рейтинг и лиги', 'Rankings and leagues')}</h1>
          <p className="mt-1 text-[15px] text-ink-2 max-w-2xl">{L('Решай задачи и тесты, набирай очки и поднимайся от Бронзы до Алмаза. Лиги обновляются каждый понедельник.', 'Solve problems and tests, earn points and climb from Bronze to Diamond. Leagues reset every Monday.')}</p>
        </div>
        <div className="rounded-xl bg-surface border border-line px-4 py-2 inline-flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#D6A419]" fill="#FFD60A" strokeWidth={1.75} />
          <span className="font-mono text-lg text-ink">{xp ?? 0}</span>
          <span className="text-xs text-ink-2">{L('очков на этом устройстве', 'points on this device')}</span>
        </div>
      </header>

      {ready && !user ? (
        <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="bg-surface border border-line rounded-xl p-6 flex flex-col sm:flex-row gap-5 items-center">
            <div className="flex -space-x-3">
              {[0, 2, 5].map((t) => (
                <TierBadge key={t} tier={t} size={52} />
              ))}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-serif text-2xl text-ink">{L('Войди, чтобы попасть в лигу', 'Sign in to join a league')}</h2>
              <p className="mt-1 text-sm text-ink-2">{L('Соревнуйся с учениками со всего Кыргызстана и с одноклассниками. Это бесплатно.', 'Compete with learners across the country and with your classmates. It is free.')}</p>
              <button onClick={() => navigate('login')} className="mt-3 h-10 px-5 rounded-lg bg-accent hover:bg-accent-hover text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer" style={{ color: '#fff' }}>
                <Trophy className="w-4 h-4" />
                {L('Войти', 'Sign in')}
              </button>
            </div>
          </div>
          <HowToEarn lang={lang} />
        </div>
      ) : user ? (
        <>
          <div className="flex p-1 rounded-lg bg-muted border border-line self-start">
            {(
              [
                ['league', L('Лига недели', 'This week')],
                ['all', L('За всё время', 'All time')],
                ['class', L('Мой класс', 'My class')],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`h-9 px-4 rounded-md text-sm whitespace-nowrap cursor-pointer ${tab === id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'league' ? <LeagueView lang={lang} /> : tab === 'all' ? <AllTime lang={lang} /> : <ClassView lang={lang} />}
        </>
      ) : (
        <div className="h-80 rounded-xl bg-muted animate-pulse" />
      )}
    </div>
  );
};

export default RatingPage;
