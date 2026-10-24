import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Button, Card, Chip, ProgressBar } from '@heroui/react';
import { useFonts } from '../../ui';
import { clamp, CYAN, DIM, INK, Logo, Mono, prog, Stage, useIn } from '../kit';
import { THINK, timeline, VOICE_AT, type Timeline } from '../timeline';
import { MISTAKES, type Mistake } from './episodes';
import '../reel.css';

/* "Spot the mistake": a ~30 s vertical reel. The first frame (also the cover) already shows the wrong
   solution and the challenge; the viewer gets three seconds, then the error is circled and fixed.
   The last frames fade back into the first one, so a replay loops without a jump. */

const RED = '#FF5A5F';
const GREEN = '#3DD68C';

const Header: React.FC<{ m: Mistake; n: number }> = ({ m, n }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
    <Chip className="reel-chip" size="lg" variant="soft" style={{ background: `${m.color}2E`, color: m.color }}>
      <Chip.Label className="reel-chip-label">{m.subject}</Chip.Label>
    </Chip>
    <Mono style={{ fontSize: 28, color: RED }}>{`НАЙДИ ОШИБКУ · №${n}`}</Mono>
  </div>
);

/** the wrong solution on squared paper; `mark` 0→1 draws the red circle round the faulty line */
const Notebook: React.FC<{ m: Mistake; mark: number; compact?: boolean }> = ({ m, mark, compact }) => (
  <Card className="w-full" style={{ padding: compact ? 30 : 40, backgroundImage: 'linear-gradient(rgba(57,225,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(57,225,255,0.06) 1px, transparent 1px)', backgroundSize: '44px 44px' }}>
    <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: compact ? 14 : 22 }}>
      {!compact && <div style={{ fontSize: 42, lineHeight: 1.3, color: DIM }}>{m.condition}</div>}
      {m.solution.map((line, i) => {
        const bad = i === m.wrong;
        return (
          <div key={line} style={{ position: 'relative', alignSelf: 'flex-start' }}>
            <span className="font-mono" style={{ fontSize: compact ? 52 : 62, color: bad && mark > 0.5 ? RED : INK, whiteSpace: 'nowrap' }}>
              <span style={{ color: DIM, fontSize: '0.6em', marginRight: 18 }}>{`${i + 1})`}</span>
              {line}
            </span>
            {bad && mark > 0 && (
              <svg style={{ position: 'absolute', left: -14, top: -16, width: 'calc(100% + 28px)', height: 'calc(100% + 32px)', overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse cx="50" cy="50" rx="49" ry="46" fill="none" stroke={RED} strokeWidth="2.2" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - mark} style={{ strokeWidth: 7 }} />
              </svg>
            )}
          </div>
        );
      })}
    </Card.Content>
  </Card>
);

/* ---------- 1. the challenge: on screen from frame 0 ---------- */
const Board: React.FC<{ m: Mistake; n: number }> = ({ m, n }) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin(f / 4);
  return (
    <Stage style={{ padding: '120px 80px 260px', gap: 40 }}>
      <Header m={m} n={n} />
      <div className="font-display" style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, color: INK, textAlign: 'center', letterSpacing: '-0.02em' }}>
        В решении ошибка.
        <br />
        <span style={{ color: RED, textShadow: '0 0 40px rgba(255,90,95,0.45)' }}>Найдёшь?</span>
      </div>
      <Notebook m={m} mark={0} />
      <div style={{ transform: `scale(${pulse})` }}>
        <Chip className="reel-chip" size="lg" variant="primary" style={{ background: RED, color: '#fff' }}>
          <Chip.Label className="reel-chip-label">👀 Пиши номер строки в комментарии</Chip.Label>
        </Chip>
      </div>
    </Stage>
  );
};

/* ---------- 2. three seconds ---------- */
const Think: React.FC<{ m: Mistake }> = ({ m }) => {
  const f = useCurrentFrame();
  const left = Math.max(1, 3 - Math.floor(f / 30));
  const ring = interpolate(f, [0, THINK], [1, 0], clamp);
  const pop = 1 + 0.18 * Math.max(0, 1 - ((f % 30) / 30) * 4);
  const R = 200;
  return (
    <Stage style={{ gap: 40 }}>
      <Mono style={{ fontSize: 36, color: RED }}>ГДЕ ОШИБКА?</Mono>
      <div style={{ position: 'relative', width: 480, height: 480 }}>
        <svg width={480} height={480} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={240} cy={240} r={R} fill="none" stroke="#1B2A4A" strokeWidth={24} />
          <circle cx={240} cy={240} r={R} fill="none" stroke={RED} strokeWidth={24} strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - ring)} transform="rotate(-90 240 240)" style={{ filter: 'drop-shadow(0 0 18px rgba(255,90,95,0.6))' }} />
        </svg>
        <div className="font-display" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 260, fontWeight: 700, color: INK, transform: `scale(${pop})` }}>
          {left}
        </div>
      </div>
      <Notebook m={m} mark={0} compact />
      <div style={{ width: '100%' }}>
        <ProgressBar aria-label="Время подумать" value={ring * 100} size="lg" color="danger">
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
    </Stage>
  );
};

/* ---------- 3. the error circled, then the fix step by step ---------- */
const Fix: React.FC<{ m: Mistake; tl: Timeline }> = ({ m, tl }) => {
  const f = useCurrentFrame();
  const mark = prog(f, 4, 18);
  return (
    <Stage style={{ padding: '120px 80px 260px', gap: 28 }}>
      <Mono style={{ fontSize: 34, color: RED, opacity: mark }}>✗ ОШИБКА ЗДЕСЬ</Mono>
      <Notebook m={m} mark={mark} compact />
      {m.fix.map((s, i) => (
        <FixStep key={s.label} at={(tl.steps[i] ?? tl.steps[0]) - tl.scenes.solve} n={i + 1} label={s.label} math={s.math} />
      ))}
    </Stage>
  );
};
const FixStep: React.FC<{ at: number; n: number; label: string; math: string }> = ({ at, n, label, math }) => {
  const s = useIn(at);
  return (
    <div style={{ width: '100%', opacity: s, transform: `translateY(${(1 - s) * 60}px)` }}>
      <Card style={{ padding: '24px 36px', border: `2px solid ${GREEN}55` }}>
        <Card.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Mono style={{ fontSize: 26, color: GREEN }}>{`✓ ${n} · ${label}`}</Mono>
          <span className="font-display" style={{ fontSize: 50, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            {math}
          </span>
        </Card.Content>
      </Card>
    </div>
  );
};

/* ---------- 4. wrong answer struck out, the right one ---------- */
const Answer: React.FC<{ m: Mistake }> = ({ m }) => {
  const f = useCurrentFrame();
  const strike = prog(f, 4, 10);
  const a = useIn(12);
  const long = m.answer.length > 5;
  return (
    <Stage>
      <div className="font-display" style={{ position: 'relative', fontSize: 110, fontWeight: 700, color: RED, opacity: 0.85, whiteSpace: 'nowrap' }}>
        {m.wrongAnswer}
        <div style={{ position: 'absolute', left: -12, right: -12, top: '52%', height: 12, borderRadius: 6, background: RED, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
      </div>
      <Mono style={{ fontSize: 36, color: GREEN, opacity: a }}>ПРАВИЛЬНО</Mono>
      <div className="font-display" style={{ fontSize: long ? 170 : 230, fontWeight: 700, color: GREEN, textShadow: '0 0 60px rgba(61,214,140,0.5)', whiteSpace: 'nowrap', opacity: a, transform: `scale(${0.8 + a * 0.2})` }}>
        {m.answer}
      </div>
    </Stage>
  );
};

/* ---------- 5. call to action, then a fade back to the first frame for the loop ---------- */
const Cta: React.FC<{ m: Mistake; n: number; len: number }> = ({ m, n, len }) => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const b = useIn(14);
  const c = useIn(30);
  const back = interpolate(f, [len - 14, len], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Stage>
        <div className="font-display" style={{ fontSize: 110, fontWeight: 700, color: INK, opacity: a }}>
          Попался? 😏
        </div>
        <div style={{ fontSize: 48, color: DIM, opacity: a, textAlign: 'center', textWrap: 'balance', maxWidth: 860 }}>Отправь другу — найдёт ли он ошибку?</div>
        <div style={{ opacity: b, transform: `translateY(${(1 - b) * 40}px)`, marginTop: 40 }}>
          <Button size="lg" className="font-semibold" style={{ height: 120, padding: '0 64px', fontSize: 44, boxShadow: '0 0 50px rgba(57,225,255,0.5)' }}>
            ↗ Отправить другу
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: c, marginTop: 40 }}>
          <Logo size={96} />
          <div className="font-display" style={{ fontSize: 52, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            STEM Visualizer
          </div>
        </div>
        <Chip className="reel-chip" color="accent" variant="soft" size="lg" style={{ opacity: c }}>
          <Chip.Label className="reel-chip-label">Ещё задачи — ссылка в профиле</Chip.Label>
        </Chip>
      </Stage>
      <AbsoluteFill style={{ opacity: back }}>
        <Board m={m} n={n} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- captions of the explanation ---------- */
const Captions: React.FC<{ m: Mistake; tl: Timeline }> = ({ m, tl }) => {
  const f = useCurrentFrame();
  const i = tl.lines.findIndex(([a, b], k) => m.lines[k][0] === 'step' && f >= a && f <= b + 6);
  if (i < 0) return null;
  const [a, b] = tl.lines[i];
  const o = interpolate(f, [a, a + 5, b + 2, b + 6], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170 }}>
      <div className="reel-root" style={{ background: 'transparent', maxWidth: 900, textAlign: 'center', fontSize: 44, fontWeight: 600, lineHeight: 1.25, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.85)', opacity: o }}>
        {m.lines[i][1]}
      </div>
    </AbsoluteFill>
  );
};

export const MistakeReel: React.FC<{ n: number }> = ({ n }) => {
  useFonts();
  const m = MISTAKES[n - 1];
  const tl = timeline(m);
  const S = tl.scenes;
  const scenes: [number, number, React.ReactNode][] = [
    [0, S.think, <Board m={m} n={n} />],
    [S.think, S.solve, <Think m={m} />],
    [S.solve, S.answer, <Fix m={m} tl={tl} />],
    [S.answer, S.cta, <Answer m={m} />],
    [S.cta, S.total, <Cta m={m} n={n} len={S.total - S.cta} />],
  ];
  const voice = staticFile(`vo6/${m.id}.mp3`);
  return (
    <AbsoluteFill style={{ background: '#070B16' }}>
      {scenes.map(([from, to, el], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          {el}
        </Sequence>
      ))}
      <Captions m={m} tl={tl} />
      {m.voice && (
        <>
          <Sequence from={VOICE_AT} durationInFrames={tl.audio.aLen}>
            <Audio src={voice} />
          </Sequence>
          <Sequence from={tl.audio.bAt}>
            <Audio src={voice} trimBefore={tl.audio.bFrom} />
          </Sequence>
        </>
      )}
      <Audio src={staticFile('music-labs.wav')} volume={(f) => interpolate(f, [0, 10, S.total - 30, S.total], [0, 0.14, 0.14, 0], clamp)} />
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
      <Sequence from={S.solve + 4} durationInFrames={30}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={S.answer + 14} durationInFrames={40}>
        <Audio src={staticFile('sfx/ding.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const mistakeLength = (n: number) => timeline(MISTAKES[n - 1]).scenes.total;
export const MISTAKE_COUNT = MISTAKES.length;
