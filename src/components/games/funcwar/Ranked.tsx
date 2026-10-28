import { Button, Card } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { ArrowLeft, Bot, Loader2, Medal, Trophy } from 'lucide-react';
import { supabase, useSession } from '../../../lib/supabase';
import { botFor, fwBotResult, fwMe, fwTop, type FwMe, type FwRow } from '../../../lib/fwRating';
import type { Lang } from '../common';
import { Battle } from './FuncWar';
import { OnlineDuel, type RankedRoom } from './OnlineDuel';

/* Ranked "Бой функций": wait in a shared queue for a live opponent; if nobody turns up in 20 s, a bot of your
   level steps in. Both kinds of game move your Elo rating (the server applies it, see 0011_funcwar_rating.sql). */

const SEARCH_SECONDS = 20;
const newCode = () => String(10000 + Math.floor(Math.random() * 90000));

/** the leaderboard, with my own line */
export const Leaderboard: React.FC<{ lang: Lang; me: FwMe | null; limit?: number }> = ({ lang, me, limit = 10 }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [rows, setRows] = useState<FwRow[] | null>(null);
  useEffect(() => {
    fwTop(limit).then(setRows).catch(() => setRows([]));
  }, [limit]);
  return (
    <div className="flex flex-col gap-1 text-sm">
      {rows === null ? (
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="text-ink-3">{L('Пока никто не сыграл рейтинговый бой. Стань первым!', 'Nobody has played a ranked battle yet. Be the first!')}</p>
      ) : (
        rows.map((r, i) => (
          <div key={i} className={`flex items-center gap-3 px-2 py-1.5 rounded-lg ${r.me ? 'bg-accent-soft' : ''}`}>
            <span className="w-6 font-mono text-ink-3 text-right">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
            <span className="flex-1 truncate text-ink">{r.nick}{r.me && L(' (ты)', ' (you)')}</span>
            <span className="font-mono text-xs text-ink-3">{L(`${r.wins}/${r.games} побед`, `${r.wins}/${r.games} won`)}</span>
            <span className="w-12 text-right font-mono text-ink">{r.rating}</span>
          </div>
        ))
      )}
      {me && me.games > 0 && rows && !rows.some((r) => r.me) && (
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-accent-soft">
          <span className="w-6 font-mono text-ink-3 text-right">{me.place}</span>
          <span className="flex-1 text-ink">{L('Ты', 'You')}</span>
          <span className="w-12 text-right font-mono text-ink">{me.rating}</span>
        </div>
      )}
    </div>
  );
};

export const Ranked: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user, ready } = useSession();
  const [me, setMe] = useState<FwMe | null>(null);
  const [phase, setPhase] = useState<'search' | 'pvp' | 'bot'>('search');
  const [room, setRoom] = useState<RankedRoom | null>(null);
  const [left, setLeft] = useState(SEARCH_SECONDS);
  const [note, setNote] = useState<React.ReactNode>(null);
  const [botSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const ch = useRef<RealtimeChannel | null>(null);
  const matched = useRef(false);

  useEffect(() => {
    if (user) fwMe().then((m) => setMe(m ?? { rating: 1000, games: 0, wins: 0, place: null })).catch(() => setMe({ rating: 1000, games: 0, wins: 0, place: null }));
  }, [user]);

  // the queue: everyone waiting tracks themselves in one presence channel; pairs form in order of arrival,
  // and the earlier of two opens the room and tells the other its code
  useEffect(() => {
    if (!supabase || !user || !me || phase !== 'search') return;
    matched.current = false;
    const channel = supabase.channel('fw-queue', { config: { broadcast: { self: false }, presence: { key: user.id } } });
    const leave = () => {
      supabase!.removeChannel(channel);
      ch.current = null;
    };
    const go = (r: RankedRoom) => {
      if (matched.current) return;
      matched.current = true;
      setRoom(r);
      setPhase('pvp');
      leave();
    };
    channel
      .on('presence', { event: 'sync' }, () => {
        if (matched.current) return;
        const waiting = Object.values(channel.presenceState<{ uid: string; at: number }>())
          .map((v) => v[0])
          .filter(Boolean)
          .sort((a, b) => a.at - b.at || a.uid.localeCompare(b.uid));
        const i = waiting.findIndex((w) => w.uid === user.id);
        if (i >= 0 && i % 2 === 0 && waiting[i + 1]) {
          const code = newCode();
          channel.send({ type: 'broadcast', event: 'match', payload: { host: user.id, guest: waiting[i + 1].uid, code } });
          go({ code, host: true, opponent: waiting[i + 1].uid });
        }
      })
      .on('broadcast', { event: 'match' }, ({ payload }) => {
        const m = payload as { host: string; guest: string; code: string };
        if (m.guest === user.id) go({ code: m.code, host: false, opponent: m.host });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ uid: user.id, at: Date.now(), rating: me.rating });
      });
    ch.current = channel;
    const started = Date.now();
    const id = setInterval(() => {
      const l = Math.max(0, SEARCH_SECONDS - (Date.now() - started) / 1000);
      setLeft(l);
      if (l <= 0 && !matched.current) {
        matched.current = true;
        clearInterval(id);
        leave();
        setPhase('bot');
      }
    }, 250);
    return () => {
      clearInterval(id);
      if (ch.current) leave();
    };
  }, [user, me, phase]);

  if (!ready) return <div className="h-[40vh] rounded-xl bg-muted animate-pulse" />;
  if (!user)
    return (
      <div className="max-w-md flex flex-col gap-3">
        <Button variant="ghost" className="text-sm self-start" onPress={onExit}>
          <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
        </Button>
        <p className="text-ink-2">{L('Рейтинговые бои — для тех, кто вошёл в аккаунт: так рейтинг сохраняется и попадает в таблицу.', 'Ranked battles need an account, so your rating is saved and shows on the table.')}</p>
        <a href="#/login" className="text-accent hover:underline">{L('Войти или зарегистрироваться →', 'Log in or sign up →')}</a>
      </div>
    );

  if (phase === 'pvp' && room) return <OnlineDuel lang={lang} ranked={room} onExit={onExit} />;

  if (phase === 'bot' && me) {
    const bot = botFor(me.rating);
    return (
      <Battle
        lang={lang}
        mode={{ kind: 'bot', level: bot.level, seed: botSeed, perSide: 1, lives: 3 }}
        title={L(`Рейтинговый бой · бот «${bot.ru}» (${bot.rating})`, `Ranked · bot “${bot.en}” (${bot.rating})`)}
        onExit={onExit}
        resultNote={note}
        onResult={(won) =>
          fwBotResult(bot.rating, won)
            .then((r) => setNote(r.capped
              ? L('Сегодня уже 15 рейтинговых боёв с ботами — этот не засчитан. С живыми соперниками ограничения нет.', 'You’ve had 15 ranked bot games today; this one didn’t count. Live opponents have no such limit.')
              : L(`Рейтинг: ${r.rating} (${r.delta >= 0 ? '+' : ''}${r.delta})`, `Rating: ${r.rating} (${r.delta >= 0 ? '+' : ''}${r.delta})`)))
            .catch(() => setNote(L('Не удалось записать результат.', 'Could not save the result.')))
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Button variant="ghost" className="text-sm self-start" onPress={onExit}>
        <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
      </Button>
      <Card className="p-6">
        <Card.Content className="flex flex-col items-center text-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <h1 className="font-serif text-2xl text-ink">{L('Ищем соперника…', 'Finding an opponent…')}</h1>
          <p className="text-sm text-ink-2">
            {me ? L(`Твой рейтинг: ${me.rating}. Бой 1 на 1, у бойца 3 жизни.`, `Your rating: ${me.rating}. 1 v 1, three lives.`) : '…'}
          </p>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${(left / SEARCH_SECONDS) * 100}%` }} />
          </div>
          <p className="text-xs text-ink-3 inline-flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            {me && L(`Если за ${Math.ceil(left)} с никого не найдём — сыграешь с ботом «${botFor(me.rating).ru}» (${botFor(me.rating).rating}), он тоже меняет рейтинг.`, `If nobody shows up in ${Math.ceil(left)} s you’ll face the bot “${botFor(me.rating).en}” (${botFor(me.rating).rating}); it counts too.`)}
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};

/** the ranked card in the game menu: my rating, the table and the play button */
export const RankedCard: React.FC<{ lang: Lang; onPlay: () => void }> = ({ lang, onPlay }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user } = useSession();
  const [me, setMe] = useState<FwMe | null>(null);
  useEffect(() => {
    if (user) fwMe().then(setMe).catch(() => {});
  }, [user]);
  return (
    <Card className="p-5 border-2 border-accent">
      <Card.Content className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F5A524]" /> {L('Рейтинговый бой', 'Ranked battle')}
            </h2>
            <p className="mt-1 text-sm text-ink-2">{L('1 на 1 с живым соперником, а если никого нет — с ботом твоего уровня. Победы поднимают рейтинг.', '1 v 1 with a live opponent, or a bot of your level when nobody is around. Wins raise your rating.')}</p>
          </div>
          {user && me && (
            <div className="text-right">
              <div className="font-mono text-3xl text-ink">{me.rating}</div>
              <div className="text-xs text-ink-3 inline-flex items-center gap-1">
                <Medal className="w-3.5 h-3.5" /> {me.games ? L(`${me.place}-е место · ${me.wins}/${me.games}`, `#${me.place} · ${me.wins}/${me.games}`) : L('ещё без боёв', 'no games yet')}
              </div>
            </div>
          )}
          <Button size="lg" className="text-sm font-medium" onPress={onPlay}>
            {L('Найти соперника', 'Find an opponent')}
          </Button>
        </div>
        <Leaderboard lang={lang} me={me} />
      </Card.Content>
    </Card>
  );
};

export default Ranked;
