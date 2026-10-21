import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Delete, Send, Swords, Trophy, X } from 'lucide-react';
import { Confetti } from '../fx/Confetti';
import { progress } from '../../lib/progress';
import { GameBar, Lang } from './common';

/* Duel by link: ten problems made from one seed, so a friend who opens the link gets exactly the same ones.
   The link carries the seed and the challenger's result; nothing goes through a server. */

const COUNT = 10;
const NAME_KEY = 'stem-duel-name';

/** a small seeded generator (mulberry32) */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ten problems that get harder: arithmetic, percents, powers, equations, physics and geometry one-liners */
function problems(seed: number, lang: Lang): { q: string; a: number }[] {
  const r = rng(seed);
  const n = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const ru = lang === 'ru';
  const sup = '⁰¹²³⁴⁵';
  const make = (kind: number, v: number): { q: string; a: number } => {
    switch (kind) {
      case 0: {
        const a = n(12, 89), b = n(6, 49), x = n(6, 19), y = n(3, 9);
        return v === 0 ? { q: `${a} + ${b}`, a: a + b } : v === 1 ? { q: `${a + b} − ${b}`, a } : { q: `${x} × ${y}`, a: x * y };
      }
      case 1: {
        const p = [10, 15, 20, 25, 30, 40, 50, 75][n(0, 7)], x = [40, 60, 80, 120, 160, 200, 240, 360][n(0, 7)], k = n(11, 25);
        return v === 0 ? { q: `${p}% ${ru ? 'от' : 'of'} ${x}`, a: (p * x) / 100 } : { q: `${k}²`, a: k * k };
      }
      case 2: {
        const x = n(2, 12), k = n(2, 9), b = n(1, 30);
        return { q: `${k}x + ${b} = ${k * x + b},  x = ?`, a: x };
      }
      case 3: {
        const t = n(2, 6), s = n(3, 15) * t, m = n(2, 12), a = n(2, 5);
        return v === 0
          ? { q: ru ? `${s} м за ${t} с: v = ? м/с` : `${s} m in ${t} s: v = ? m/s`, a: s / t }
          : { q: ru ? `m = ${m} кг, a = ${a} м/с²: F = ? Н` : `m = ${m} kg, a = ${a} m/s²: F = ? N`, a: m * a };
      }
      case 4: {
        const [a, b, c] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]][n(0, 4)];
        const x = n(3, 8) * 10, y = n(2, 5) * 10;
        return v === 0
          ? { q: ru ? `Катеты ${a} и ${b}: гипотенуза = ?` : `Legs ${a} and ${b}: hypotenuse = ?`, a: c }
          : { q: ru ? `Углы треугольника ${x}° и ${y}°: третий = ?` : `Triangle angles ${x}° and ${y}°: third = ?`, a: 180 - x - y };
      }
      default: {
        const a = n(2, 5), b = n(2, 3);
        return { q: `${a}${sup[b]} + ${b}${sup[a]}`, a: a ** b + b ** a };
      }
    }
  };
  return [0, 0, 1, 1, 2, 2, 3, 3, 4, 5].map((kind) => make(kind, n(0, 2)));
}

export interface DuelChallenge {
  seed: number;
  right: number;
  secs: number;
  name: string;
}

export function parseDuel(raw: string | null): DuelChallenge | null {
  const m = raw?.match(/^(\d+)\.(\d+)\.(\d+)\.?(.*)$/);
  if (!m) return null;
  return { seed: Number(m[1]), right: Math.min(COUNT, Number(m[2])), secs: Number(m[3]), name: decodeURIComponent(m[4] || '').slice(0, 24) };
}

const duelLink = (d: DuelChallenge) => `${location.origin}${location.pathname}#/app?lab=games&duel=${d.seed}.${d.right}.${d.secs}.${encodeURIComponent(d.name)}`;
const beats = (a: { right: number; secs: number }, b: { right: number; secs: number }) => a.right > b.right || (a.right === b.right && a.secs < b.secs);

export const Duel: React.FC<{ lang: Lang; onExit: () => void; challenge?: DuelChallenge | null }> = ({ lang, onExit, challenge }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [seed, setSeed] = useState(() => challenge?.seed ?? Math.floor(Math.random() * 1e9));
  const [rival, setRival] = useState(challenge ?? null);
  const list = useMemo(() => problems(seed, lang), [seed, lang]);
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const [secs, setSecs] = useState(0);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const paid = useRef(false);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => field.current?.focus(), [i, phase]);

  const begin = () => {
    setI(0);
    setRight(0);
    setInput('');
    setT0(performance.now());
    setNow(performance.now());
    setPhase('play');
    paid.current = false;
  };
  const submit = () => {
    if (input.trim() === '' || input === '-') return;
    const ok = Math.abs(Number(input.replace(',', '.')) - list[i].a) < 1e-9;
    const r = right + (ok ? 1 : 0);
    setRight(r);
    setFlash(ok ? 'right' : 'wrong');
    setTimeout(() => setFlash('idle'), 300);
    setInput('');
    if (i + 1 < COUNT) setI(i + 1);
    else {
      const s = Math.round((performance.now() - t0) / 1000);
      setSecs(s);
      setPhase('done');
      if (!paid.current) {
        paid.current = true;
        // the game record is a score that ranks like the duel: answers first, then speed
        progress.recordGame('duel', Math.max(0, r * 100 - s), r * 4 + (rival && beats({ right: r, secs: s }, rival) ? 10 : 0));
      }
    }
  };
  const press = (k: string) => {
    if (k === 'del') setInput((s) => s.slice(0, -1));
    else if (k === 'ok') submit();
    else if (k === '-') setInput((s) => (s.startsWith('-') ? s.slice(1) : '-' + s));
    else setInput((s) => (s.length < 6 ? s + k : s));
  };
  const me = { seed, right, secs, name: name.trim() || L('Друг', 'A friend') };
  const share = async () => {
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* not saved, still shareable */
    }
    const url = duelLink(me);
    const text = L(`Вызываю тебя на дуэль в STEM Visualizer: у меня ${right}/${COUNT} за ${secs} с. Сможешь лучше?`, `I challenge you to a duel in STEM Visualizer: ${right}/${COUNT} in ${secs} s. Can you beat it?`);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'STEM Visualizer', text, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt(L('Скопируй ссылку', 'Copy the link'), url);
    }
  };
  const newDuel = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setRival(null);
    setPhase('intro');
  };

  if (phase === 'intro')
    return (
      <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
        <GameBar lang={lang} title={L('Дуэль', 'Duel')} onExit={onExit} score={0} />
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col items-center text-center gap-3 anim-page">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F76B15]/15 text-[#F76B15]">
            <Swords className="w-7 h-7" />
          </span>
          {rival ? (
            <>
              <h3 className="font-serif text-2xl text-ink">{L(`${rival.name || 'Друг'} вызывает тебя на дуэль`, `${rival.name || 'A friend'} challenges you`)}</h3>
              <p className="text-ink-2">{L(`Результат соперника: ${rival.right} из ${COUNT} за ${rival.secs} с. Задачи у вас одинаковые.`, `Their result: ${rival.right} of ${COUNT} in ${rival.secs} s. You get the same problems.`)}</p>
            </>
          ) : (
            <>
              <h3 className="font-serif text-2xl text-ink">{L('Дуэль с другом', 'Duel a friend')}</h3>
              <p className="text-ink-2">{L('Реши 10 задач как можно быстрее, а потом отправь ссылку другу: ему достанутся те же задачи. Сначала считаются верные ответы, при равенстве побеждает тот, кто быстрее.', 'Solve 10 problems as fast as you can, then send a friend the link: they get the same ones. Correct answers count first, then speed.')}</p>
            </>
          )}
          <button onClick={begin} className="mt-2 h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover font-medium cursor-pointer" style={{ color: '#fff' }}>
            {rival ? L('Принять вызов', 'Accept') : L('Начать', 'Start')}
          </button>
        </div>
      </div>
    );

  if (phase === 'done') {
    const won = rival ? beats(me, rival) : null;
    const tie = rival && rival.right === right && rival.secs === secs;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col items-center text-center gap-3 max-w-xl mx-auto w-full anim-page">
        {won && <Confetti count={60} />}
        <Trophy className={`w-10 h-10 ${won ? 'text-[#F5A524]' : 'text-ink-3'}`} />
        <div className="font-serif text-5xl text-ink">
          {right}/{COUNT}
        </div>
        <p className="text-ink-2">{L(`за ${secs} с`, `in ${secs} s`)}</p>
        {rival && (
          <div className="w-full grid grid-cols-2 gap-2 mt-1">
            {[
              { who: L('Ты', 'You'), r: me, win: won && !tie },
              { who: rival.name || L('Соперник', 'Rival'), r: rival, win: !won && !tie },
            ].map((x) => (
              <div key={x.who} className={`rounded-xl border p-3 ${x.win ? 'border-[#30A46C] bg-[#EAF6EF]' : 'border-line'}`}>
                <div className="text-xs text-ink-3 truncate">{x.who}</div>
                <div className="font-mono text-base text-ink whitespace-nowrap">
                  {x.r.right}/{COUNT} · {x.r.secs} {L('с', 's')}
                </div>
              </div>
            ))}
            <p className="col-span-2 font-medium text-ink mt-1">{tie ? L('Ничья!', 'A draw!') : won ? L('Победа! +10 XP', 'You win! +10 XP') : L('В этот раз соперник сильнее', 'They win this time')}</p>
          </div>
        )}
        <div className="w-full mt-2 flex flex-col gap-2">
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder={L('Твоё имя для соперника', 'Your name for the rival')} className="h-11 px-3 rounded-lg border border-line bg-paper text-ink outline-none focus:border-accent" />
          <button onClick={share} className="h-11 rounded-lg bg-accent hover:bg-accent-hover font-medium inline-flex items-center justify-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
            {copied ? <Copy className="w-4 h-4" /> : <Send className="w-4 h-4" />} {copied ? L('Ссылка скопирована', 'Link copied') : rival ? L('Отправить ответный вызов', 'Send it back') : L('Вызвать друга', 'Challenge a friend')}
          </button>
          <button onClick={newDuel} className="h-11 rounded-lg border border-line hover:bg-muted text-sm text-ink cursor-pointer">
            {L('Новая дуэль', 'New duel')}
          </button>
          <button onClick={onExit} className="h-9 text-sm text-ink-3 hover:text-ink cursor-pointer">
            {L('Другие игры', 'Other games')}
          </button>
        </div>
      </div>
    );
  }

  const p = list[i];
  const elapsed = Math.max(0, Math.round((now - t0) / 1000));
  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
      <GameBar lang={lang} title={L('Дуэль', 'Duel')} onExit={onExit} score={right} extra={<span className="font-mono text-sm text-ink-2">{i + 1}/{COUNT} · {elapsed} с</span>} />
      <div className={`rounded-2xl border-2 bg-surface p-6 flex flex-col items-center gap-4 transition-colors ${flash === 'right' ? 'border-[#30A46C] bg-[#EAF6EF]' : flash === 'wrong' ? 'border-[#E5484D] bg-[#FDF0EF] anim-wrong' : 'border-line'}`}>
        <div className="flex gap-1">
          {list.map((_, k) => (
            <span key={k} className={`w-2 h-2 rounded-full ${k < i ? 'bg-accent' : k === i ? 'bg-ink' : 'bg-muted'}`} />
          ))}
        </div>
        <div key={p.q} className="font-serif text-3xl sm:text-4xl text-ink text-center anim-q">{p.q}</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="w-full flex justify-center"
        >
          <input ref={field} value={input} onChange={(e) => setInput(e.target.value.replace(/[^0-9,.\-]/g, '').slice(0, 7))} inputMode="none" className="w-48 h-14 text-center font-mono text-3xl rounded-xl border border-line bg-paper outline-none focus:border-accent" aria-label={L('Ответ', 'Answer')} />
        </form>
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', 'del'].map((k) => (
            <button key={k} type="button" onClick={() => press(k)} className="h-12 rounded-xl border border-line bg-paper hover:bg-muted active:scale-95 transition-transform text-xl font-mono text-ink cursor-pointer flex items-center justify-center">
              {k === 'del' ? <Delete className="w-5 h-5" /> : k === '-' ? '±' : k}
            </button>
          ))}
          <button type="button" onClick={() => press('ok')} className="col-span-3 h-12 rounded-xl bg-accent hover:bg-accent-hover text-base font-medium cursor-pointer inline-flex items-center justify-center gap-1.5" style={{ color: '#fff' }}>
            {flash === 'wrong' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />} {L('Ответить', 'Answer')}
          </button>
        </div>
        <p className="text-xs text-ink-3">{L('Ответ можно дать один раз — потом сразу следующая задача.', 'One answer per problem, then the next one.')}</p>
      </div>
    </div>
  );
};

export default Duel;
