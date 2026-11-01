import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Button, Card, Chip, ProgressBar } from '@heroui/react';
import { useFonts } from '../../ui';
import { clamp, CYAN, DIM, INK, Logo, Mono, Stage, useIn } from '../kit';
import { THINK, timeline, type Role, type Timeline } from '../timeline';
import '../reel.css';

/* "Argue about it": a vertical reel built around one claim most people reject. The first frame (also the cover)
   asks yes or no, the viewer gets three seconds, then the proof. The last frames fade back into the first one, so a
   replay loops. Captions and music carry it until the voice (DEBATE-SCRIPT.md) is in public/vo8/debate-01.mp3. */

const GREEN = '#3DD68C';
const RED = '#FF5A5F';

const LINES: [Role, string][] = [
  ['hook', 'Ноль целых девять в периоде — это ровно один. Верно или нет?'],
  ['ask', 'У тебя три секунды: да или нет?'],
  ['step', 'Назовём это число икс.'],
  ['step', 'Умножим на десять: запятая сдвинется вправо.'],
  ['step', 'Вычтем икс: все девятки после запятой исчезнут, останется девять.'],
  ['step', 'Девять икс равно девяти. Значит, икс — это один.'],
  ['step', 'Проверка: треть — это ноль целых три в периоде. Умножь на три — и получишь то же самое.'],
  ['answer', 'Да, ровно один. Это две записи одного числа: между ними нет ни одного другого.'],
  ['cta', 'Ты ответил верно? Отправь тому, кто уверен, что нет.'],
];
const STEPS = [
  { label: 'Пусть', math: 'x = 0,999…' },
  { label: 'Умножаем на 10', math: '10x = 9,999…' },
  { label: 'Вычитаем x', math: '10x − x = 9' },
  { label: 'Делим на 9', math: '9x = 9  →  x = 1' },
  { label: 'Проверка: 1/3 = 0,333…', math: '0,333… · 3 = 0,999…' },
];
// without a voice the opening must not linger: the claim reads in two seconds. A take's split replaces these spans
const VOICE: [number, number][] = [[0, 2], [2.2, 3.2], [3.4, 5], [5.2, 8], [8.2, 11.4], [11.6, 14.4], [14.6, 19], [19.2, 23.2], [23.4, 26.4]];
const TL = timeline({ lines: LINES, voice: VOICE });

const Claim: React.FC<{ size?: number }> = ({ size = 150 }) => (
  <div className="font-display" style={{ fontSize: size, fontWeight: 700, color: INK, letterSpacing: '-0.03em', whiteSpace: 'nowrap', textShadow: '0 0 60px rgba(57,225,255,0.35)' }}>
    0,999… = 1
  </div>
);

/* ---------- 1. the claim: on screen from frame 0 ---------- */
const Board: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin(f / 4);
  // the two answers take turns to nudge, so the first seconds aren't a still picture
  const yes = 1 + 0.05 * Math.max(0, Math.sin(f / 5));
  const no = 1 + 0.05 * Math.max(0, -Math.sin(f / 5));
  return (
    <Stage style={{ padding: '120px 80px 260px', gap: 56 }}>
      <Mono style={{ fontSize: 34 }}>МАТЕМАТИКА · СПОР</Mono>
      <Claim />
      <div className="font-display" style={{ fontSize: 104, fontWeight: 700, color: CYAN, textAlign: 'center' }}>
        Верно или нет?
      </div>
      <div style={{ display: 'flex', gap: 36, width: '100%' }}>
        <Button size="lg" className="font-semibold" style={{ flex: 1, height: 170, fontSize: 72, background: GREEN, color: '#04101E', transform: `scale(${yes})` }}>
          Да
        </Button>
        <Button size="lg" className="font-semibold" style={{ flex: 1, height: 170, fontSize: 72, background: RED, color: '#fff', transform: `scale(${no})` }}>
          Нет
        </Button>
      </div>
      <div style={{ transform: `scale(${pulse})` }}>
        <Chip className="reel-chip" size="lg" variant="soft" color="accent">
          <Chip.Label className="reel-chip-label">👇 Ответь в комментариях до конца ролика</Chip.Label>
        </Chip>
      </div>
    </Stage>
  );
};

/* ---------- 2. three seconds ---------- */
const Think: React.FC = () => {
  const f = useCurrentFrame();
  const left = Math.max(1, 3 - Math.floor(f / 30));
  const ring = interpolate(f, [0, THINK], [1, 0], clamp);
  const pop = 1 + 0.18 * Math.max(0, 1 - ((f % 30) / 30) * 4);
  const R = 200;
  return (
    <Stage style={{ gap: 48 }}>
      <Claim size={150} />
      <div style={{ position: 'relative', width: 480, height: 480 }}>
        <svg width={480} height={480} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={240} cy={240} r={R} fill="none" stroke="#1B2A4A" strokeWidth={24} />
          <circle cx={240} cy={240} r={R} fill="none" stroke={CYAN} strokeWidth={24} strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - ring)} transform="rotate(-90 240 240)" />
        </svg>
        <div className="font-display" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 260, fontWeight: 700, color: INK, transform: `scale(${pop})` }}>
          {left}
        </div>
      </div>
      <Mono style={{ fontSize: 40 }}>ДА ИЛИ НЕТ?</Mono>
      <div style={{ width: '100%' }}>
        <ProgressBar aria-label="Время подумать" value={ring * 100} size="lg" color="accent">
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
    </Stage>
  );
};

/* ---------- 3. the proof, one line at a time ---------- */
const Step: React.FC<{ at: number; n: number; label: string; math: string }> = ({ at, n, label, math }) => {
  const s = useIn(at);
  return (
    <div style={{ width: '100%', opacity: s, transform: `translateY(${(1 - s) * 60}px)` }}>
      <Card style={{ padding: '26px 36px', border: `2px solid ${GREEN}55` }}>
        <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Mono style={{ fontSize: 32, color: GREEN }}>{`${n} · ${label}`}</Mono>
          <span className="font-mono" style={{ fontSize: n === 5 ? 62 : 72, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>
            {math}
          </span>
        </Card.Content>
      </Card>
    </div>
  );
};
const Proof: React.FC<{ tl: Timeline }> = ({ tl }) => (
  <Stage style={{ padding: '110px 80px 300px', gap: 22 }}>
    {STEPS.map((s, i) => (
      <Step key={s.label} at={tl.steps[i] - tl.scenes.solve} n={i + 1} label={s.label} math={s.math} />
    ))}
  </Stage>
);

/* ---------- 4. the verdict ---------- */
const Verdict: React.FC = () => {
  const a = useIn(2);
  const b = useIn(16);
  return (
    <Stage style={{ gap: 44 }}>
      <div className="font-display" style={{ fontSize: 300, fontWeight: 700, color: GREEN, textShadow: '0 0 70px rgba(61,214,140,0.5)', opacity: a, transform: `scale(${0.8 + a * 0.2})` }}>
        Да
      </div>
      <Claim size={150} />
      <div style={{ fontSize: 54, lineHeight: 1.25, color: DIM, textAlign: 'center', textWrap: 'balance', opacity: b, maxWidth: 880 }}>Это не «почти один». Это один.</div>
    </Stage>
  );
};

/* ---------- 5. call to action, then a fade back to the first frame for the loop ---------- */
const Cta: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const b = useIn(14);
  const c = useIn(30);
  const back = interpolate(f, [len - 14, len], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Stage>
        <div className="font-display" style={{ fontSize: 100, fontWeight: 700, color: INK, textAlign: 'center', lineHeight: 1.1, opacity: a }}>
          Ты ответил верно?
        </div>
        <div style={{ opacity: b, transform: `translateY(${(1 - b) * 40}px)`, marginTop: 30 }}>
          <Button size="lg" className="font-semibold" style={{ height: 130, padding: '0 56px', fontSize: 44, boxShadow: '0 0 50px rgba(57,225,255,0.5)' }}>
            ↗ Отправь тому, кто уверен, что нет
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: c, marginTop: 40 }}>
          <Logo size={96} />
          <div className="font-display" style={{ fontSize: 52, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            STEM Visualizer
          </div>
        </div>
      </Stage>
      <AbsoluteFill style={{ opacity: back }}>
        <Board />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- captions of every line, so it works with the sound off ---------- */
const Captions: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const f = useCurrentFrame();
  const i = tl.lines.findIndex(([a, b], k) => LINES[k][0] !== 'ask' && LINES[k][0] !== 'hook' && f >= a && f <= b + 6);
  if (i < 0) return null;
  const [a, b] = tl.lines[i];
  const o = interpolate(f, [a, a + 5, b + 2, b + 6], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170 }}>
      <div className="reel-root" style={{ background: 'transparent', maxWidth: 900, textAlign: 'center', fontSize: 44, fontWeight: 600, lineHeight: 1.25, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.85)', opacity: o }}>
        {LINES[i][1]}
      </div>
    </AbsoluteFill>
  );
};

export const DebateReel: React.FC = () => {
  useFonts();
  const S = TL.scenes;
  const scenes: [number, number, React.ReactNode][] = [
    [0, S.think, <Board />],
    [S.think, S.solve, <Think />],
    [S.solve, S.answer, <Proof tl={TL} />],
    [S.answer, S.cta, <Verdict />],
    [S.cta, S.total, <Cta len={S.total - S.cta} />],
  ];
  return (
    <AbsoluteFill style={{ background: '#070B16' }}>
      {scenes.map(([from, to, el], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          {el}
        </Sequence>
      ))}
      <Captions tl={TL} />
      <Audio src={staticFile('music-math.wav')} volume={(f) => interpolate(f, [0, 10, S.total - 30, S.total], [0, 0.22, 0.22, 0], clamp)} />
      {[S.think, S.solve, S.answer, S.cta].map((at) => (
        <Sequence key={at} from={at - 4} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
      {[0, 30, 60].map((d) => (
        <Sequence key={d} from={S.think + d} durationInFrames={20}>
          <Audio src={staticFile('sfx/tick.wav')} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={S.answer + 2} durationInFrames={40}>
        <Audio src={staticFile('sfx/ding.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DEBATE_LEN = TL.scenes.total;
