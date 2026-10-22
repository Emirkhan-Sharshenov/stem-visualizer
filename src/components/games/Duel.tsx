import { Button, Input } from '@heroui/react';
import React, { useMemo, useRef, useState } from 'react';
import { Copy, Image, Send, Swords, Trophy } from 'lucide-react';
import { Confetti } from '../fx/Confetti';
import { progress } from '../../lib/progress';
import { shareCard, useCard } from '../../lib/shareCard';
import { GameBar, Lang } from './common';
import { COUNT, ProblemRun, problems } from './ProblemRun';

/* Duel by link: ten problems made from one seed, so a friend who opens the link gets exactly the same ones.
   The link carries the seed and the challenger's result; nothing goes through a server. */

const NAME_KEY = 'stem-duel-name';

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
  const [run, setRun] = useState(0);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [secs, setSecs] = useState(0);
  const right = marks.filter(Boolean).length;
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState(false);
  const paid = useRef(false);

  const begin = () => {
    setRun((r) => r + 1);
    setPhase('play');
    paid.current = false;
  };
  const finish = (m: boolean[], s: number) => {
    const r = m.filter(Boolean).length;
    setMarks(m);
    setSecs(s);
    setPhase('done');
    if (!paid.current) {
      paid.current = true;
      // the game record is a score that ranks like the duel: answers first, then speed
      progress.recordGame('duel', Math.max(0, r * 100 - s), r * 4 + (rival && beats({ right: r, secs: s }, rival) ? 10 : 0));
    }
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
  const card = useCard(
    phase === 'done'
      ? { kicker: L('Дуэль · 10 задач', 'Duel · 10 problems'), big: `${right}/${COUNT}`, sub: L(`за ${secs} с`, `in ${secs} s`), marks, call: L('Сможешь лучше?', 'Can you beat it?'), color: '#F76B15' }
      : null,
  );
  const story = () => card && shareCard(card, L(`Мой результат в дуэли STEM Visualizer: ${right}/${COUNT} за ${secs} с. Сможешь лучше? ${duelLink(me)}`, `My STEM Visualizer duel: ${right}/${COUNT} in ${secs} s. Can you beat it? ${duelLink(me)}`), 'stem-duel.png');
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
          <Button size="lg" className="mt-2 font-medium" onPress={() => begin()}>
            {rival ? L('Принять вызов', 'Accept') : L('Начать', 'Start')}
          </Button>
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
          <Input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder={L('Твоё имя для соперника', 'Your name for the rival')}  />
          <Button size="lg" className="font-medium" onPress={() => share()}>
            {copied ? <Copy className="w-4 h-4" /> : <Send className="w-4 h-4" />} {copied ? L('Ссылка скопирована', 'Link copied') : rival ? L('Отправить ответный вызов', 'Send it back') : L('Вызвать друга', 'Challenge a friend')}
          </Button>
          <Button variant="outline" size="lg" className="text-sm font-medium" onPress={() => story()} isDisabled={!card}>
            <Image className="w-4 h-4" /> {L('Картинка в сторис', 'Story picture')}
          </Button>
          <Button variant="outline" size="lg" className="text-sm" onPress={() => newDuel()}>
            {L('Новая дуэль', 'New duel')}
          </Button>
          <Button variant="ghost" className="text-sm" onPress={() => onExit()}>
            {L('Другие игры', 'Other games')}
          </Button>
        </div>
      </div>
    );
  }

  return <ProblemRun key={run} lang={lang} title={L('Дуэль', 'Duel')} list={list} onExit={onExit} onDone={finish} />;
};

export default Duel;
