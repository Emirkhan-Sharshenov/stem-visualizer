import { Button, Card, Input } from '@heroui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { ArrowLeft, Check, Copy, Loader2, Send, Swords, Timer } from 'lucide-react';
import { supabase, useSession } from '../../../lib/supabase';
import { fwPvpResult } from '../../../lib/fwRating';
import type { Lang } from '../common';
import { Battle, type Online } from './FuncWar';
import { parseAnswer, raceQuestion } from './race';

/* An online "Бой функций" duel by link, over a Supabase Realtime channel (broadcast + presence; nothing stored).
   The host is blue and the one who opened the link is red. Both screens run the same simulation from the same
   seed, so only formulas travel over the wire. The first move goes to whoever first solves a quick function
   question; if nobody does in 30 s, the host's screen draws lots. */

type Msg =
  | { type: 'start'; seed: number; perSide: number; race: number; round: number }
  | { type: 'solved'; team: 0 | 1 }
  | { type: 'first'; team: 0 | 1; round: number }
  | { type: 'shot'; src: string };

const RACE_SECONDS = 30;
const newCode = () => String(10000 + Math.floor(Math.random() * 90000));
const seed = () => Math.floor(Math.random() * 1e9);
export const duelLink = (code: string) => `${window.location.origin}/#/app?lab=games&fw=${code}`;

/** a ranked game found in the queue: a fixed room, 1 v 1, the result goes to the rating */
export interface RankedRoom { code: string; host: boolean; opponent: string }

export const OnlineDuel: React.FC<{ lang: Lang; join?: string; onExit: () => void; ranked?: RankedRoom }> = ({ lang, join, onExit, ranked }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { user } = useSession();
  const host = ranked ? ranked.host : !join;
  const me: 0 | 1 = host ? 0 : 1;
  const [code] = useState(() => ranked?.code ?? join ?? newCode());
  const [perSide, setPerSide] = useState<number | null>(ranked ? 1 : null);
  const [phase, setPhase] = useState<'setup' | 'wait' | 'race' | 'battle'>(host && !ranked ? 'setup' : 'wait');
  const [peerUid, setPeerUid] = useState<string | null>(ranked?.opponent ?? null);
  const [note, setNote] = useState<React.ReactNode>(null);
  const [game, setGame] = useState<{ seed: number; perSide: number; race: number; round: number } | null>(null);
  const [first, setFirst] = useState<0 | 1 | null>(null);
  const [peer, setPeer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<'wrong' | 'sent' | null>(null);
  const [copied, setCopied] = useState(false);
  const [, tick] = useState(0);
  const ch = useRef<RealtimeChannel | null>(null);
  const shotListeners = useRef(new Set<(src: string) => void>());
  const decided = useRef(false);
  const raceStart = useRef(0);
  const gameRef = useRef(game);
  gameRef.current = game;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const send = useCallback((m: Msg) => ch.current?.send({ type: 'broadcast', event: m.type, payload: m }), []);

  /** the host settles who opens and tells both screens */
  const decide = useCallback((team: 0 | 1) => {
    if (!host || decided.current || !gameRef.current) return;
    decided.current = true;
    setFirst(team);
    send({ type: 'first', team, round: gameRef.current.round });
  }, [host, send]);

  const beginRace = useCallback((g: { seed: number; perSide: number; race: number; round: number }) => {
    decided.current = false;
    raceStart.current = performance.now();
    setGame(g);
    setFirst(null);
    setAnswer('');
    setVerdict(null);
    setPhase('race');
  }, []);

  // the room
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel(`fw-${code}`, { config: { broadcast: { self: false }, presence: { key: host ? 'host' : `guest-${seed()}` } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ uid?: string }>();
        const others = Object.keys(state).filter((k) => (host ? k !== 'host' : k === 'host'));
        setPeer(others.length > 0);
        const uid = others.map((k) => state[k]?.[0]?.uid).find(Boolean);
        if (uid) setPeerUid(uid);
        // the host (re)sends the start until the guest is in the race
        if (host && others.length && gameRef.current && phaseRef.current !== 'battle') send({ type: 'start', ...gameRef.current });
      })
      .on('broadcast', { event: 'start' }, ({ payload }) => {
        const m = payload as Extract<Msg, { type: 'start' }>;
        if (!host && (gameRef.current?.round ?? -1) < m.round) beginRace(m);
      })
      .on('broadcast', { event: 'solved' }, ({ payload }) => decide((payload as Extract<Msg, { type: 'solved' }>).team))
      .on('broadcast', { event: 'first' }, ({ payload }) => {
        const m = payload as Extract<Msg, { type: 'first' }>;
        if (!host && gameRef.current?.round === m.round) setFirst(m.team);
      })
      .on('broadcast', { event: 'shot' }, ({ payload }) => shotListeners.current.forEach((f) => f((payload as Extract<Msg, { type: 'shot' }>).src)))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ at: Date.now(), uid: user?.id });
      });
    ch.current = channel;
    return () => {
      // remove, not just unsubscribe: a channel of the same name is reused otherwise, still closed
      supabase!.removeChannel(channel);
      ch.current = null;
    };
  }, [code, host, send, decide, beginRace, user?.id]);

  // the host starts the race once the opponent is in
  useEffect(() => {
    if (host && phase === 'wait' && peer && perSide) {
      const g = { seed: seed(), perSide, race: seed(), round: 1 };
      beginRace(g);
      send({ type: 'start', ...g });
    }
  }, [host, phase, peer, perSide, beginRace, send]);

  // race clock; the host draws lots when it runs out
  const raceLeft = phase === 'race' && first === null ? Math.max(0, RACE_SECONDS - (performance.now() - raceStart.current) / 1000) : null;
  useEffect(() => {
    if (phase !== 'race') return;
    const id = setInterval(() => tick((n) => n + 1), 200);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (raceLeft === 0) decide(Math.random() < 0.5 ? 0 : 1);
  }, [raceLeft === 0, decide]); // eslint-disable-line react-hooks/exhaustive-deps

  // a short pause to show who opens, then the battle
  useEffect(() => {
    if (first === null || phase !== 'race') return;
    const id = setTimeout(() => setPhase('battle'), 1800);
    return () => clearTimeout(id);
  }, [first, phase]);

  const online: Online = {
    me,
    first: first ?? 0,
    sendShot: (src) => send({ type: 'shot', src }),
    onShot: (cb) => {
      shotListeners.current.add(cb);
      return () => shotListeners.current.delete(cb);
    },
    peerGone: !peer,
  };
  const onlineRef = useRef(online);
  onlineRef.current = online;
  // a stable object for the battle, so its shot listener is set up once per game
  const [stable] = useState<Online>(() => ({
    get me() { return onlineRef.current.me; },
    get first() { return onlineRef.current.first; },
    sendShot: (src: string) => onlineRef.current.sendShot(src),
    onShot: (cb: (src: string) => void) => onlineRef.current.onShot(cb),
    get peerGone() { return onlineRef.current.peerGone; },
  }));

  const submit = () => {
    const v = parseAnswer(answer);
    if (!game || v === null || first !== null) return;
    if (Math.abs(v - raceQuestion(game.race).answer) > 1e-6) {
      setVerdict('wrong');
      return;
    }
    setVerdict('sent');
    if (host) decide(0);
    else send({ type: 'solved', team: 1 });
  };

  const link = duelLink(code);
  const share = async () => {
    const text = L('Сразимся в «Бой функций»? Снаряд летит по графику твоей функции:', 'Fancy a round of Function Wars? Shots fly along the graph you type:');
    if (navigator.share && /Android|iPhone|iPad|iPod/.test(navigator.userAgent)) await navigator.share({ title: 'STEM Visualizer', text, url: link }).catch(() => {});
    else {
      await navigator.clipboard?.writeText(`${text} ${link}`).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!supabase)
    return (
      <div className="text-center py-12">
        <p className="text-ink-2">{L('Онлайн-дуэль работает только с подключённым сервером.', 'Online duels need the server connection.')}</p>
        <Button variant="ghost" className="mt-3" onPress={onExit}>{L('Назад', 'Back')}</Button>
      </div>
    );

  if (phase === 'battle' && game)
    return (
      <Battle
        key={game.round}
        lang={lang}
        mode={{ kind: 'online', seed: game.seed, perSide: game.perSide }}
        online={stable}
        onExit={onExit}
        title={ranked ? L('Рейтинговый бой', 'Ranked battle') : undefined}
        resultNote={note}
        onResult={ranked && peerUid ? (won) => {
          const day = new Date().toISOString().slice(0, 10);
          fwPvpResult(`${day}-${code}-${game.round}`, peerUid, won)
            .then((r) => setNote(r.pending
              ? L('Победа засчитается, когда соперник подтвердит результат (или через 10 минут).', 'The win counts once your opponent confirms it (or after 10 minutes).')
              : L(`Рейтинг: ${r.rating} (${r.delta >= 0 ? '+' : ''}${r.delta})`, `Rating: ${r.rating} (${r.delta >= 0 ? '+' : ''}${r.delta})`)))
            .catch(() => setNote(L('Не удалось записать результат.', 'Could not save the result.')));
        } : undefined}
        onRestart={host && !ranked ? () => {
          const g = { seed: seed(), perSide: game.perSide, race: seed(), round: game.round + 1 };
          beginRace(g);
          send({ type: 'start', ...g });
        } : undefined}
      />
    );

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Button variant="ghost" className="text-sm self-start" onPress={onExit}>
        <ArrowLeft className="w-4 h-4" /> {L('Меню', 'Menu')}
      </Button>
      <h1 className="font-serif text-3xl text-ink inline-flex items-center gap-2">
        <Swords className="w-7 h-7 text-accent" /> {L('Дуэль по ссылке', 'Duel by link')}
      </h1>

      {phase === 'setup' && (
        <Card className="p-5">
          <Card.Content className="flex flex-col gap-3">
            <p className="text-sm text-ink-2">{L('Сколько бойцов у каждой стороны? У каждого бойца по 3 жизни.', 'How many soldiers per side? Each soldier has 3 lives.')}</p>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <Button key={n} size="lg" variant={n === 2 ? 'primary' : 'outline'} className="flex-1 text-base font-medium" onPress={() => (setPerSide(n), setPhase('wait'))}>
                  {n} {L('на', 'v')} {n}
                </Button>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {phase === 'wait' && (
        <Card className="p-5">
          <Card.Content className="flex flex-col gap-3">
            {host ? (
              <>
                <p className="text-sm text-ink-2">{L(`Режим ${perSide} на ${perSide}. Отправь ссылку сопернику — бой начнётся, как только он её откроет.`, `${perSide} v ${perSide}. Send the link to your opponent; the battle starts as soon as they open it.`)}</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-line font-mono text-sm text-ink break-all">{link}</div>
                <div className="flex flex-wrap gap-2">
                  <Button className="text-sm font-medium" onPress={share}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? L('Скопировано', 'Copied') : L('Поделиться ссылкой', 'Share the link')}
                  </Button>
                  <a className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-line text-sm text-ink hover:border-accent" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(L('Сразимся в «Бой функций»?', 'Function Wars?'))}`} target="_blank" rel="noreferrer">
                    <Send className="w-4 h-4" /> Telegram
                  </a>
                  <a className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-line text-sm text-ink hover:border-accent" href={`https://wa.me/?text=${encodeURIComponent(`${L('Сразимся в «Бой функций»?', 'Function Wars?')} ${link}`)}`} target="_blank" rel="noreferrer">
                    <Send className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
                <p className="inline-flex items-center gap-2 text-sm text-ink-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> {L('Ждём соперника…', 'Waiting for your opponent…')}
                </p>
              </>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm text-ink-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {peer ? L('Соперник на месте, начинаем…', 'Your opponent is here, starting…') : L(`Подключаемся к дуэли ${code}…`, `Joining duel ${code}…`)}
              </p>
            )}
          </Card.Content>
        </Card>
      )}

      {phase === 'race' && game && (
        <Card className="p-5">
          <Card.Content className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">{L('Кто первым решит — тот стреляет первым', 'Solve it first to shoot first')}</h2>
              {raceLeft !== null && (
                <span className="inline-flex items-center gap-1 font-mono text-sm text-ink-2">
                  <Timer className="w-4 h-4" /> {Math.ceil(raceLeft)}
                </span>
              )}
            </div>
            <p className="text-lg text-ink">{lang === 'ru' ? raceQuestion(game.race).ru : raceQuestion(game.race).en}</p>
            {first === null ? (
              <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), submit())}>
                <Input value={answer} onChange={(e) => (setAnswer(e.target.value), setVerdict(null))} inputMode="numeric" placeholder={L('Ответ', 'Answer')} aria-label={L('Ответ', 'Answer')} className="flex-1 font-mono" disabled={verdict === 'sent'} autoFocus />
                <Button type="submit" size="lg" className="text-sm font-medium" isDisabled={verdict === 'sent' || !answer.trim()}>
                  {L('Ответить', 'Answer')}
                </Button>
              </form>
            ) : (
              <p className="text-lg font-medium" style={{ color: first === me ? '#1E7A4C' : '#CC2F35' }}>
                {first === me ? L('Ты первый! Стреляешь первым.', 'You were first! You shoot first.') : L('Соперник успел раньше — он стреляет первым.', 'Your opponent was faster and shoots first.')}
              </p>
            )}
            {verdict === 'wrong' && <p className="text-sm text-[#CC2F35]">{L('Неверно, попробуй ещё.', 'Not quite, try again.')}</p>}
            {verdict === 'sent' && first === null && <p className="text-sm text-ink-3">{L('Верно! Ждём, кто был быстрее…', 'Right! Checking who was faster…')}</p>}
            <p className="text-xs text-ink-3">{L(`Если за ${RACE_SECONDS} секунд никто не решит, первого выберет жребий.`, `If nobody solves it in ${RACE_SECONDS} s, lots decide.`)}</p>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default OnlineDuel;
