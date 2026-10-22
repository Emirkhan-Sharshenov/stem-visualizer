import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { ArrowRight, Check, Copy, Crown, Play, Presentation, Smartphone, Users, X } from 'lucide-react';
import type { StemCategory } from '../../types/stem';
import { SECTIONS } from '../../data/curriculum';
import { sectionTest, type Question } from '../../lib/quiz';
import { supabase } from '../../lib/supabase';
import { usePlan } from '../../lib/plan';
import { progress } from '../../lib/progress';
import { Confetti } from '../fx/Confetti';
import { Formula } from '../Formula';
import { GameBar, Lang } from './common';

/* A live quiz for a class, like Kahoot: the teacher shows the room code on the projector, students join from
   their phones, everyone answers the same question against the clock and the board updates after each one.
   It runs over a Supabase Realtime channel (broadcast + presence); nothing is stored in the database.
   The teacher's browser is the referee: it sends the questions, receives the answers and counts the points. */

const FREE_SEATS = 8;
const MAX_SEATS = 60;
const COLORS = ['#E5484D', '#2F5BFF', '#F5A524', '#30A46C'];
const SHAPES = ['▲', '◆', '●', '■'];
const ID_KEY = 'stem-live-id';
const NAME_KEY = 'stem-duel-name';

interface Opt {
  ru: string;
  en: string;
  tex?: boolean;
}
type State =
  | { phase: 'lobby' }
  | { phase: 'q'; idx: number; total: number; prompt: { ru: string; en: string }; options: Opt[]; dur: number; left: number }
  | { phase: 'reveal'; idx: number; total: number; correct: number; counts: number[]; scores: Record<string, number>; last: Record<string, boolean> }
  | { phase: 'end'; scores: Record<string, number>; names: Record<string, string> };
interface Msg {
  state: State;
  seats: string[];
}

const myId = () => {
  try {
    let id = sessionStorage.getItem(ID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
};
const savedName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
};
const joinLink = (code: string) => `${location.origin}${location.pathname}#/app?lab=games&live=${code}`;
const channelFor = (code: string, key: string) => supabase!.channel(`live-${code}`, { config: { broadcast: { self: false }, presence: { key } } });

const OptText: React.FC<{ o: Opt; lang: Lang }> = ({ o, lang }) => (o.tex ? <Formula tex={o.ru} /> : <>{o[lang]}</>);

/** places by score, best first */
const ranking = (scores: Record<string, number>, names: Record<string, string>) =>
  Object.keys(names)
    .map((id) => ({ id, name: names[id], score: scores[id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

/* ---------- teacher ---------- */

const Host: React.FC<{ lang: Lang; onExit: () => void }> = ({ lang, onExit }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const seatsMax = plan.pro ? MAX_SEATS : FREE_SEATS;
  const [subject, setSubject] = useState<StemCategory>('physics');
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [count, setCount] = useState(10);
  const [dur, setDur] = useState(20);
  const [code, setCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ id: string; name: string; at: number }[]>([]);
  const [state, setState] = useState<State>({ phase: 'lobby' });
  const [questions, setQuestions] = useState<Question[]>([]);
  // the channel handlers live as long as the room, so they read the questions through a ref
  const qRef = useRef<Question[]>([]);
  const [, bump] = useState(0);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(0);
  const ch = useRef<RealtimeChannel | null>(null);
  const answers = useRef<Record<string, { choice: number; ms: number }>>({});
  const scores = useRef<Record<string, number>>({});
  const endsAt = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const sections = useMemo(() => SECTIONS.filter((s) => s.subject === subject && s.topics.length).sort((a, b) => a.grade - b.grade), [subject]);
  const seats = players.slice(0, seatsMax).map((p) => p.id);
  const seatsRef = useRef(seats);
  seatsRef.current = seats;
  const names = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p.name])), [players]);

  /** sends the state to everyone; a question goes out with the time still left */
  const send = (s: State) => {
    setState(s);
    const out = s.phase === 'q' ? { ...s, left: Math.max(0, endsAt.current - Date.now()) } : s;
    ch.current?.send({ type: 'broadcast', event: 'state', payload: { state: out, seats: seatsRef.current } satisfies Msg });
  };

  const open = () => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section || !supabase) return;
    const qs = sectionTest(section, Math.floor(Math.random() * 1e6)).slice(0, count);
    setQuestions(qs);
    qRef.current = qs;
    const c = String(Math.floor(10000 + Math.random() * 90000));
    const channel = channelFor(c, 'host');
    channel
      .on('presence', { event: 'sync' }, () => {
        const st = channel.presenceState<{ name: string; at: number; host?: boolean }>();
        const list = Object.entries(st)
          .map(([id, metas]) => ({ id, name: metas[0]?.name ?? '?', at: metas[0]?.at ?? 0, host: metas[0]?.host }))
          .filter((p) => !p.host)
          .sort((a, b) => a.at - b.at);
        setPlayers((prev) => {
          // a student who drops out stays on the board with their points
          const keep = prev.filter((p) => !list.some((q) => q.id === p.id) && scores.current[p.id] !== undefined);
          return [...list, ...keep].sort((a, b) => a.at - b.at);
        });
      })
      .on('presence', { event: 'join' }, () => {
        // whoever joins (or comes back) gets the current screen
        setTimeout(() => send(stateRef.current), 300);
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        const s = stateRef.current;
        const a = payload as { id: string; idx: number; choice: number; ms: number };
        if (s.phase !== 'q' || a.idx !== s.idx || answers.current[a.id] || !seatsRef.current.includes(a.id)) return;
        answers.current[a.id] = { choice: a.choice, ms: a.ms };
        bump((n) => n + 1); // re-render the answer counter
        if (seatsRef.current.every((id) => answers.current[id])) reveal();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ name: 'host', at: Date.now(), host: true });
      });
    ch.current = channel;
    scores.current = {};
    setCode(c);
    setState({ phase: 'lobby' });
  };

  useEffect(
    () => () => {
      ch.current?.unsubscribe();
    },
    [],
  );

  const ask = (idx: number) => {
    const q = questions[idx];
    answers.current = {};
    endsAt.current = Date.now() + dur * 1000;
    send({ phase: 'q', idx, total: questions.length, prompt: q.prompt, options: q.options, dur, left: dur * 1000 });
  };
  const reveal = () => {
    const s = stateRef.current;
    if (s.phase !== 'q') return;
    const q = qRef.current[s.idx];
    const counts = q.options.map(() => 0);
    const last: Record<string, boolean> = {};
    for (const [id, a] of Object.entries(answers.current)) {
      counts[a.choice] = (counts[a.choice] ?? 0) + 1;
      const ok = a.choice === q.correct;
      last[id] = ok;
      // a right answer is worth 500 to 1000 points, more the faster it came
      if (ok) scores.current[id] = (scores.current[id] ?? 0) + Math.round(500 + 500 * Math.max(0, 1 - a.ms / (s.dur * 1000)));
    }
    send({ phase: 'reveal', idx: s.idx, total: s.total, correct: q.correct, counts, scores: { ...scores.current }, last });
  };
  const next = () => {
    const s = stateRef.current;
    if (s.phase === 'lobby') ask(0);
    else if (s.phase === 'reveal') {
      if (s.idx + 1 < questions.length) ask(s.idx + 1);
      else send({ phase: 'end', scores: { ...scores.current }, names: Object.fromEntries(players.filter((p) => seats.includes(p.id)).map((p) => [p.id, p.name])) });
    }
  };

  // the clock of the current question
  useEffect(() => {
    if (state.phase !== 'q') return;
    const id = setInterval(() => {
      const l = endsAt.current - Date.now();
      setLeft(Math.max(0, l));
      if (l <= 0) {
        clearInterval(id);
        reveal();
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.phase === 'q' ? state.idx : -1]);

  if (!supabase) return <p className="text-ink-2">{L('Живой квиз работает только онлайн.', 'The live quiz needs the online version.')}</p>;

  if (!code)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {(['physics', 'chemistry', 'biology', 'mathematics'] as StemCategory[]).map((s) => (
            <button key={s} onClick={() => (setSubject(s), setSectionId(null))} className={`h-9 px-3.5 rounded-full border text-sm cursor-pointer ${subject === s ? 'bg-ink border-ink' : 'border-line text-ink hover:bg-muted'}`} style={subject === s ? { color: '#fff', background: '#16171A' } : undefined}>
              {{ physics: L('Физика', 'Physics'), chemistry: L('Химия', 'Chemistry'), biology: L('Биология', 'Biology'), mathematics: L('Математика', 'Maths') }[s as 'physics']}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto soft-scroll pr-1">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setSectionId(s.id)} className={`text-left rounded-xl border p-3 cursor-pointer ${sectionId === s.id ? 'border-accent bg-accent/5' : 'border-line bg-surface hover:bg-muted'}`}>
              <div className="text-[11px] text-ink-3">{L(`${s.grade} класс`, `Grade ${s.grade}`)}</div>
              <div className="text-sm font-medium text-ink">{s.title[lang]}</div>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-2">
          <label className="inline-flex items-center gap-2">
            {L('Вопросов', 'Questions')}
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="h-9 rounded-lg border border-line bg-surface px-2 text-ink">
              {[5, 10, 15].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className="inline-flex items-center gap-2">
            {L('Секунд на ответ', 'Seconds each')}
            <select value={dur} onChange={(e) => setDur(Number(e.target.value))} className="h-9 rounded-lg border border-line bg-surface px-2 text-ink">
              {[10, 20, 30, 45].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <button onClick={open} disabled={!sectionId} className="h-12 rounded-xl bg-accent hover:bg-accent-hover font-medium inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40" style={{ color: '#fff' }}>
          <Play className="w-4 h-4" /> {L('Создать комнату', 'Open a room')}
        </button>
        {!plan.pro && <p className="text-xs text-ink-3 text-center">{L(`Бесплатно — до ${FREE_SEATS} учеников в комнате. С тарифом «Учитель» — весь класс, до ${MAX_SEATS}.`, `Free: up to ${FREE_SEATS} students per room. With the Teacher plan: the whole class, up to ${MAX_SEATS}.`)}</p>}
      </div>
    );

  const answered = Object.keys(answers.current).length;
  const board = ranking(state.phase === 'end' ? state.scores : scores.current, Object.fromEntries(players.filter((p) => seats.includes(p.id)).map((p) => [p.id, p.name])));

  return (
    <div className="flex flex-col gap-4">
      {state.phase === 'lobby' && (
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col items-center text-center gap-3">
          <p className="text-ink-2">{L('Ученики открывают сайт → «Игры» → «Живой квиз» → «Войти по коду»', 'Students open the site → Games → Live quiz → Join with a code')}</p>
          <div className="font-mono text-6xl sm:text-8xl font-bold tracking-[0.12em] text-ink">{code}</div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(joinLink(code));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                prompt(L('Ссылка для учеников', 'Link for students'), joinLink(code));
              }
            }}
            className="text-sm text-accent inline-flex items-center gap-1.5 cursor-pointer hover:underline"
          >
            <Copy className="w-4 h-4" /> {copied ? L('Ссылка скопирована', 'Link copied') : L('Скопировать ссылку для чата класса', 'Copy the link for the class chat')}
          </button>
          <div className="mt-2 inline-flex items-center gap-2 text-ink">
            <Users className="w-5 h-5" /> <span className="font-medium">{seats.length}</span>
            {players.length > seats.length && <span className="text-sm text-[#CC2F35]">{L(`(+${players.length - seats.length} не поместились)`, `(+${players.length - seats.length} over the limit)`)}</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {players.map((p) => (
              <span key={p.id} className={`px-3 h-9 inline-flex items-center rounded-full text-sm font-medium anim-page ${seats.includes(p.id) ? 'bg-accent/10 text-ink' : 'bg-muted text-ink-3 line-through'}`}>
                {p.name}
              </span>
            ))}
          </div>
          <button onClick={next} disabled={!seats.length} className="mt-3 h-12 px-8 rounded-xl bg-accent hover:bg-accent-hover font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-40" style={{ color: '#fff' }}>
            <Play className="w-4 h-4" /> {L('Начать', 'Start')}
          </button>
        </div>
      )}

      {state.phase === 'q' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-ink-2">
            <span>{L(`Вопрос ${state.idx + 1} из ${state.total}`, `Question ${state.idx + 1} of ${state.total}`)}</span>
            <span className="font-mono">{L(`ответили ${answered} из ${seats.length}`, `${answered} of ${seats.length} answered`)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-accent transition-[width] duration-200 ease-linear" style={{ width: `${(left / (state.dur * 1000)) * 100}%` }} />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10 text-center">
            <div className="font-mono text-5xl text-ink mb-3">{Math.ceil(left / 1000)}</div>
            <h3 className="font-serif text-2xl sm:text-4xl text-ink leading-snug">{state.prompt[lang]}</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {state.options.map((o, k) => (
              <div key={k} className="rounded-xl p-4 sm:p-5 text-lg font-medium flex items-center gap-3" style={{ background: COLORS[k], color: '#fff' }}>
                <span className="text-xl">{SHAPES[k]}</span> <OptText o={o} lang={lang} />
              </div>
            ))}
          </div>
          <button onClick={reveal} className="self-end h-10 px-4 rounded-lg border border-line text-sm text-ink hover:bg-muted cursor-pointer">
            {L('Показать ответ', 'Show answer')}
          </button>
        </div>
      )}

      {state.phase === 'reveal' && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
            <h3 className="font-serif text-xl sm:text-2xl text-ink text-center">{questions[state.idx].prompt[lang]}</h3>
            <div className="mt-5 grid gap-3 items-end h-40 max-w-xl mx-auto" style={{ gridTemplateColumns: `repeat(${questions[state.idx].options.length}, 1fr)` }}>
              {questions[state.idx].options.map((o, k) => {
                const max = Math.max(1, ...state.counts);
                return (
                  <div key={k} className="flex flex-col items-center justify-end gap-1 h-full">
                    <span className="font-mono text-ink">{state.counts[k] ?? 0}</span>
                    <div className="w-full rounded-t-lg transition-[height] duration-700" style={{ height: `${Math.max(6, ((state.counts[k] ?? 0) / max) * 100)}%`, background: COLORS[k], opacity: k === state.correct ? 1 : 0.35 }} />
                    <span className="text-lg" style={{ color: COLORS[k] }}>
                      {SHAPES[k]} {k === state.correct && <Check className="inline w-4 h-4" />}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[#1E7A4C] font-medium">
              {L('Верно: ', 'Correct: ')}
              <OptText o={questions[state.idx].options[state.correct]} lang={lang} />
            </p>
          </div>
          <Board lang={lang} board={board.slice(0, 5)} />
          <button onClick={next} className="self-end h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover font-medium inline-flex items-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
            {state.idx + 1 < state.total ? L('Следующий вопрос', 'Next question') : L('Итоги', 'Results')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {state.phase === 'end' && (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col items-center gap-4">
          <Confetti count={70} />
          <h3 className="font-serif text-3xl text-ink">{L('Итоги', 'Results')}</h3>
          <Podium board={board} />
          <Board lang={lang} board={board.slice(3, 10)} start={4} />
          <button onClick={onExit} className="h-11 px-5 rounded-lg border border-line text-sm text-ink hover:bg-muted cursor-pointer">
            {L('Закончить', 'Finish')}
          </button>
        </div>
      )}
    </div>
  );
};

const Board: React.FC<{ lang: Lang; board: { id: string; name: string; score: number }[]; start?: number; me?: string }> = ({ board, start = 1, me }) =>
  board.length ? (
    <ol className="w-full rounded-xl border border-line bg-surface divide-y divide-line">
      {board.map((p, k) => (
        <li key={p.id} className={`flex items-center gap-3 px-4 h-11 ${p.id === me ? 'bg-accent/10' : ''}`}>
          <span className="w-6 font-mono text-ink-3">{k + start}</span>
          <span className="flex-1 truncate text-ink font-medium">{p.name}</span>
          <span className="font-mono text-ink">{p.score}</span>
        </li>
      ))}
    </ol>
  ) : null;

const Podium: React.FC<{ board: { id: string; name: string; score: number }[] }> = ({ board }) => (
  <div className="flex items-end justify-center gap-3 w-full max-w-md">
    {[1, 0, 2].map((k) =>
      board[k] ? (
        <div key={k} className="flex-1 flex flex-col items-center gap-1 anim-page">
          {k === 0 && <Crown className="w-7 h-7 text-[#F5A524]" />}
          <span className="text-sm font-medium text-ink truncate max-w-full">{board[k].name}</span>
          <span className="font-mono text-xs text-ink-2">{board[k].score}</span>
          <div className="w-full rounded-t-xl flex items-start justify-center pt-2 font-serif text-2xl" style={{ height: [130, 95, 70][k], background: ['#F5A524', '#A0A7B4', '#C47F45'][k], color: '#fff' }}>
            {k + 1}
          </div>
        </div>
      ) : (
        <div key={k} className="flex-1" />
      ),
    )}
  </div>
);

/* ---------- student ---------- */

const Player: React.FC<{ lang: Lang; initialCode?: string }> = ({ lang, initialCode }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const id = useMemo(myId, []);
  const [code, setCode] = useState(initialCode ?? '');
  const [name, setName] = useState(savedName);
  const [joined, setJoined] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [got, setGot] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [silent, setSilent] = useState(false);
  const ch = useRef<RealtimeChannel | null>(null);
  const paid = useRef(false);

  const join = () => {
    if (!supabase || code.length !== 5 || !name.trim()) return;
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* the name is only for this game */
    }
    const channel = channelFor(code, id);
    channel
      .on('broadcast', { event: 'state' }, ({ payload }) => {
        const m = payload as Msg;
        setMsg((prev) => {
          if (m.state.phase === 'q' && (prev?.state.phase !== 'q' || prev.state.idx !== m.state.idx)) setPicked(null);
          return m;
        });
        setGot(Date.now());
        setSilent(false);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ name: name.trim().slice(0, 20), at: Date.now() });
      });
    ch.current = channel;
    setJoined(true);
    // no teacher answers in a few seconds: probably a wrong code
    setTimeout(() => setSilent(true), 6000);
  };
  useEffect(
    () => () => {
      ch.current?.unsubscribe();
    },
    [],
  );
  useEffect(() => {
    if (msg?.state.phase !== 'q') return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [msg?.state.phase]);

  const s = msg?.state;
  const seated = !msg || msg.seats.includes(id);
  // the player's own result, once, at the end
  useEffect(() => {
    if (s?.phase !== 'end' || paid.current) return;
    paid.current = true;
    const score = s.scores[id] ?? 0;
    progress.recordGame('live', Math.round(score / 100), Math.min(40, Math.round(score / 250)));
  }, [s, id]);

  if (!supabase) return <p className="text-ink-2">{L('Живой квиз работает только онлайн.', 'The live quiz needs the online version.')}</p>;

  if (!joined)
    return (
      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" placeholder={L('Код комнаты', 'Room code')} className="h-16 text-center font-mono text-4xl tracking-[0.2em] rounded-xl border border-line bg-surface outline-none focus:border-accent" />
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder={L('Твоё имя', 'Your name')} className="h-12 px-3 text-center rounded-xl border border-line bg-surface outline-none focus:border-accent text-ink" />
        <button onClick={join} disabled={code.length !== 5 || !name.trim()} className="h-12 rounded-xl bg-accent hover:bg-accent-hover font-medium cursor-pointer disabled:opacity-40" style={{ color: '#fff' }}>
          {L('Войти', 'Join')}
        </button>
      </div>
    );

  const myScore = s && (s.phase === 'reveal' || s.phase === 'end') ? s.scores[id] ?? 0 : null;
  const place = s && (s.phase === 'reveal' || s.phase === 'end') ? Object.values(s.scores).filter((v) => v > (s.scores[id] ?? 0)).length + 1 : null;

  if (!seated)
    return <Center icon={<X className="w-8 h-8 text-[#CC2F35]" />} title={L('Комната заполнена', 'The room is full')} text={L('В бесплатной комнате мест больше нет. Попроси учителя подключить тариф «Учитель» — тогда войдёт весь класс.', 'No free seats left. With the Teacher plan the whole class can join.')} />;
  if (!s || s.phase === 'lobby')
    return <Center icon={<Smartphone className="w-8 h-8 text-accent" />} title={L(`Ты в игре, ${name}!`, `You're in, ${name}!`)} text={!s && silent ? L('Учитель пока не отвечает. Проверь код комнаты.', 'No teacher yet: check the room code.') : L('Смотри на экран — сейчас учитель начнёт.', 'Watch the screen: the teacher will start soon.')} />;
  if (s.phase === 'q') {
    const left = Math.max(0, s.left - (now - got));
    if (picked !== null) return <Center icon={<Check className="w-8 h-8 text-[#30A46C]" />} title={L('Ответ принят', 'Answer sent')} text={L('Ждём остальных…', 'Waiting for the others…')} />;
    if (left <= 0) return <Center icon={<X className="w-8 h-8 text-ink-3" />} title={L('Время вышло', 'Time is up')} text={L('Ждём ответ…', 'Waiting for the answer…')} />;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-ink-2">
          <span>
            {s.idx + 1}/{s.total}
          </span>
          <span className="font-mono text-lg text-ink">{Math.ceil(left / 1000)}</span>
        </div>
        <p className="text-center font-serif text-xl text-ink leading-snug">{s.prompt[lang]}</p>
        <div className="grid grid-cols-2 gap-2">
          {s.options.map((o, k) => (
            <button
              key={k}
              onClick={() => {
                setPicked(k);
                ch.current?.send({ type: 'broadcast', event: 'answer', payload: { id, idx: s.idx, choice: k, ms: s.dur * 1000 - left } });
              }}
              className="min-h-[110px] rounded-2xl p-3 text-base font-medium flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
              style={{ background: COLORS[k], color: '#fff' }}
            >
              <span className="text-2xl">{SHAPES[k]}</span>
              <OptText o={o} lang={lang} />
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (s.phase === 'reveal') {
    const ok = s.last[id];
    return <Center icon={ok ? <Check className="w-10 h-10 text-[#30A46C]" /> : <X className="w-10 h-10 text-[#CC2F35]" />} title={ok ? L('Верно!', 'Correct!') : picked === null ? L('Без ответа', 'No answer') : L('Мимо', 'Wrong')} text={L(`${myScore} очков · ${place} место`, `${myScore} points · place ${place}`)} />;
  }
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 flex flex-col items-center gap-3 text-center">
      {place !== null && place <= 3 && <Confetti count={60} />}
      {place === 1 && <Crown className="w-10 h-10 text-[#F5A524]" />}
      <div className="font-serif text-5xl text-ink">{L(`${place} место`, `Place ${place}`)}</div>
      <p className="text-ink-2">{L(`${myScore} очков`, `${myScore} points`)}</p>
      <Board lang={lang} board={ranking(s.scores, s.names).slice(0, 5)} me={id} />
    </div>
  );
};

const Center: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-2xl border border-line bg-surface p-8 flex flex-col items-center text-center gap-2 anim-page">
    {icon}
    <h3 className="font-serif text-2xl text-ink">{title}</h3>
    <p className="text-ink-2">{text}</p>
  </div>
);

/* ---------- entry ---------- */

export const LiveQuiz: React.FC<{ lang: Lang; onExit: () => void; code?: string }> = ({ lang, onExit, code }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [role, setRole] = useState<'host' | 'player' | null>(code ? 'player' : null);
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <GameBar lang={lang} title={L('Живой квиз', 'Live quiz')} onExit={onExit} score={0} />
      {role === 'host' && <Host lang={lang} onExit={onExit} />}
      {role === 'player' && <Player lang={lang} initialCode={code} />}
      {!role && (
        <div className="grid sm:grid-cols-2 gap-3">
          <button onClick={() => setRole('player')} className="lift text-left rounded-2xl border border-line bg-surface p-6 cursor-pointer">
            <Smartphone className="w-8 h-8 text-accent" />
            <h3 className="mt-3 font-serif text-2xl text-ink">{L('Войти по коду', 'Join with a code')}</h3>
            <p className="mt-1 text-sm text-ink-2">{L('Учитель показал код на экране — вводи и играй с телефона.', 'The teacher shows a code on the screen: enter it and play from your phone.')}</p>
          </button>
          <button onClick={() => setRole('host')} className="lift text-left rounded-2xl border border-line bg-surface p-6 cursor-pointer">
            <Presentation className="w-8 h-8 text-[#F76B15]" />
            <h3 className="mt-3 font-serif text-2xl text-ink">{L('Провести квиз', 'Host a quiz')}</h3>
            <p className="mt-1 text-sm text-ink-2">{L('Для учителя: выбери раздел, выведи код на проектор, и весь класс отвечает одновременно.', 'For teachers: pick a unit, show the code on the projector and the whole class answers at once.')}</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveQuiz;
