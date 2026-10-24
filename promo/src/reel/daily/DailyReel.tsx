import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Button, Card, Chip, ProgressBar } from '@heroui/react';
import { useFonts } from '../../ui';
import { clamp, CYAN, DIM, INK, Logo, Mono, Stage, useIn } from '../kit';
import { PROBLEMS, type DailyProblem } from './problems';
import '../reel.css';

/* "Problem of the day": a ~25 s vertical reel from HeroUI components in the STEM Lab night theme.
   The voice is one take per problem (public/vo5/<id>.mp3); it is cut after the question so the
   viewer gets three seconds to think, then resumes with the solution. */

const FPS = 30;
const VOICE_AT = 6;
const THINK = 90;

/** until the take is split: a guess of each line's place from its length */
function estimate(lines: DailyProblem['lines']): [number, number][] {
  let t = 0;
  return lines.map(([, text]) => {
    const len = text.split(/\s+/).length / 2.6;
    const span: [number, number] = [t, t + len];
    t += len + 0.45;
    return span;
  });
}

export function timeline(p: DailyProblem) {
  const v = p.voice ?? estimate(p.lines);
  const ask = p.lines.findIndex(([r]) => r === 'ask');
  const aEnd = v[ask][1];
  const bStart = v[ask + 1][0];
  const think = VOICE_AT + Math.round(aEnd * FPS) + 8;
  const bAt = think + THINK + 6;
  const at = (i: number, sec: number) => (i <= ask ? VOICE_AT + Math.round(sec * FPS) : bAt + Math.round((sec - bStart + 0.15) * FPS));
  const lines = v.map(([a, b], i) => [at(i, a), at(i, b)] as [number, number]);
  const first = (role: string) => lines[p.lines.findIndex(([r]) => r === role)][0];
  const problem = (p.lines.some(([r]) => r === 'cond') ? first('cond') : first('ask')) - 4;
  const answer = first('answer') - 4;
  const cta = first('cta') - 4;
  const total = lines[lines.length - 1][1] + 50;
  return {
    lines,
    steps: lines.filter((_, i) => p.lines[i][0] === 'step').map(([a]) => a),
    scenes: { hook: 0, problem, think, solve: bAt, answer, cta, total },
    audio: { aLen: Math.round((aEnd + 0.25) * FPS), bAt, bFrom: Math.max(0, Math.round((bStart - 0.15) * FPS)) },
  };
}
type Timeline = ReturnType<typeof timeline>;

const SubjectChip: React.FC<{ p: DailyProblem }> = ({ p }) => (
  <Chip className="reel-chip" size="lg" variant="soft" style={{ background: `${p.color}2E`, color: p.color }}>
    <Chip.Label className="reel-chip-label">{p.subject}</Chip.Label>
  </Chip>
);

const Header: React.FC<{ p: DailyProblem; n: number }> = ({ p, n }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%' }}>
    <SubjectChip p={p} />
    <Mono style={{ fontSize: 28 }}>{`ЗАДАЧА ДНЯ · №${n}`}</Mono>
  </div>
);

/* ---------- 1. hook ---------- */
const Hook: React.FC<{ p: DailyProblem; n: number }> = ({ p, n }) => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const b = useIn(14);
  const tick = Math.floor(f / 6) % 2;
  return (
    <Stage>
      <div style={{ opacity: a, transform: `scale(${0.9 + a * 0.1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <SubjectChip p={p} />
        <div className="font-display" style={{ fontSize: 132, fontWeight: 700, lineHeight: 1, color: INK, textAlign: 'center', letterSpacing: '-0.03em' }}>
          ЗАДАЧА
          <br />
          <span style={{ color: CYAN, textShadow: '0 0 50px rgba(57,225,255,0.5)' }}>ДНЯ</span>
        </div>
        <Mono style={{ fontSize: 34 }}>{`№${n} · ${p.topic.toUpperCase()}`}</Mono>
      </div>
      <div className="font-display" style={{ marginTop: 40, fontSize: 60, fontWeight: 700, color: INK, opacity: b, transform: `translateY(${(1 - b) * 40}px)`, whiteSpace: 'nowrap' }}>
        Решишь за <span style={{ color: CYAN }}>3</span> секунды{tick ? '?' : ' '}
      </div>
    </Stage>
  );
};

/* ---------- 2. the problem with its model at rest ---------- */
const ModelCard: React.FC<{ p: DailyProblem; solve: number }> = ({ p, solve }) => (
  <Card className="w-full" style={{ padding: 24 }}>
    <Card.Content>
      <p.Visual solve={solve} />
    </Card.Content>
  </Card>
);

const Problem: React.FC<{ p: DailyProblem; n: number }> = ({ p, n }) => {
  const a = useIn(0);
  const b = useIn(10);
  const c = useIn(24);
  return (
    <Stage style={{ padding: '120px 80px 260px', gap: 34 }}>
      <div style={{ width: '100%', opacity: a }}>
        <Header p={p} n={n} />
      </div>
      <div style={{ width: '100%', opacity: b, transform: `translateY(${(1 - b) * 60}px)` }}>
        <ModelCard p={p} solve={0} />
      </div>
      <div style={{ width: '100%', opacity: c, transform: `translateY(${(1 - c) * 60}px)` }}>
        <Card className="w-full" style={{ padding: 40 }}>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontSize: 50, lineHeight: 1.3, color: INK, fontWeight: 500 }}>{p.condition}</div>
            <div style={{ display: 'flex' }}>
              <Chip className="reel-chip" color="accent" variant="soft" size="lg">
                <Chip.Label className="reel-chip-label font-mono">{`Найти: ${p.find}`}</Chip.Label>
              </Chip>
            </div>
          </Card.Content>
        </Card>
      </div>
    </Stage>
  );
};

/* ---------- 3. three seconds to think ---------- */
const Think: React.FC<{ p: DailyProblem }> = ({ p }) => {
  const f = useCurrentFrame();
  const left = Math.max(1, 3 - Math.floor(f / 30));
  const within = (f % 30) / 30;
  const ring = interpolate(f, [0, THINK], [1, 0], clamp);
  const pop = 1 + 0.18 * Math.max(0, 1 - within * 4);
  const R = 230;
  return (
    <Stage>
      <Mono style={{ fontSize: 36 }}>ПОДУМАЙ</Mono>
      <div style={{ position: 'relative', width: 560, height: 560 }}>
        <svg width={560} height={560} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={280} cy={280} r={R} fill="none" stroke="#1B2A4A" strokeWidth={26} />
          <circle cx={280} cy={280} r={R} fill="none" stroke={CYAN} strokeWidth={26} strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - ring)} transform="rotate(-90 280 280)" style={{ filter: 'drop-shadow(0 0 18px rgba(57,225,255,0.6))' }} />
        </svg>
        <div className="font-display" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 300, fontWeight: 700, color: INK, transform: `scale(${pop})` }}>
          {left}
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 820 }}>
        <Card style={{ padding: 30 }}>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 40, lineHeight: 1.3, color: INK }}>{p.condition}</div>
            <ProgressBar aria-label="Время подумать" value={ring * 100} size="lg">
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          </Card.Content>
        </Card>
      </div>
    </Stage>
  );
};

/* ---------- 4. the solution, step by step, while the model plays ---------- */
const Step: React.FC<{ at: number; n: number; label: string; math: string }> = ({ at, n, label, math }) => {
  const s = useIn(at);
  return (
    <div style={{ width: '100%', opacity: s, transform: `translateY(${(1 - s) * 60}px)` }}>
      <Card style={{ padding: '26px 36px' }}>
        <Card.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Mono style={{ fontSize: 26 }}>{`ШАГ ${n} · ${label}`}</Mono>
          <span className="font-display" style={{ fontSize: 54, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
            {math}
          </span>
        </Card.Content>
      </Card>
    </div>
  );
};

const Solve: React.FC<{ p: DailyProblem; n: number; tl: Timeline }> = ({ p, n, tl }) => {
  const f = useCurrentFrame() + tl.scenes.solve;
  const solve = interpolate(f, [tl.steps[0], tl.scenes.answer - 6], [0, 1], clamp);
  return (
    <Stage style={{ padding: '120px 80px 260px', gap: 30 }}>
      <Header p={p} n={n} />
      <ModelCard p={p} solve={solve} />
      {p.steps.map((s, i) => (
        <Step key={s.label} at={(tl.steps[i] ?? tl.steps[0]) - tl.scenes.solve} n={i + 1} label={s.label} math={s.math} />
      ))}
    </Stage>
  );
};

/* ---------- 5. the answer ---------- */
const Answer: React.FC<{ p: DailyProblem }> = ({ p }) => {
  const a = useIn(0);
  const b = useIn(12);
  const long = p.answer.length > 6;
  return (
    <Stage>
      <Mono style={{ fontSize: 36 }}>ОТВЕТ</Mono>
      <div className="font-display" style={{ fontSize: long ? 140 : 230, fontWeight: 700, color: CYAN, textShadow: '0 0 60px rgba(57,225,255,0.55)', whiteSpace: 'nowrap', opacity: a, transform: `scale(${0.8 + a * 0.2})` }}>
        {p.answer}
      </div>
      <Chip className="reel-chip" color="success" variant="soft" size="lg" style={{ opacity: b }}>
        <Chip.Label className="reel-chip-label">✓ Так же? Значит, ты решил верно</Chip.Label>
      </Chip>
      {p.note && <div style={{ fontSize: 42, color: DIM, opacity: b }}>{p.note}</div>}
    </Stage>
  );
};

/* ---------- 6. call to action ---------- */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(0);
  const b = useIn(16);
  const c = useIn(34);
  const bob = Math.sin(f / 5) * 10;
  return (
    <Stage>
      <div className="font-display" style={{ fontSize: 84, fontWeight: 700, color: INK, textAlign: 'center', lineHeight: 1.1, opacity: a }}>
        Сколько
        <br />
        получилось?
      </div>
      <div style={{ fontSize: 50, color: DIM, opacity: a }}>
        Пиши в комментариях <span style={{ display: 'inline-block', transform: `translateY(${bob}px)` }}>👇</span>
      </div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 40}px)`, marginTop: 50 }}>
        <Button size="lg" className="font-semibold" style={{ height: 120, padding: '0 64px', fontSize: 44, boxShadow: '0 0 50px rgba(57,225,255,0.5)' }}>
          Вызов дня · ещё 9 задач
        </Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: c, marginTop: 40 }}>
        <Logo size={96} />
        <div className="font-display" style={{ fontSize: 52, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>
          STEM Visualizer
        </div>
      </div>
      <Chip className="reel-chip" color="accent" variant="soft" size="lg" style={{ opacity: c }}>
        <Chip.Label className="reel-chip-label">Ссылка в профиле</Chip.Label>
      </Chip>
    </Stage>
  );
};

/* ---------- captions of the spoken solution, for sound-off viewing ---------- */
const Captions: React.FC<{ p: DailyProblem; tl: Timeline }> = ({ p, tl }) => {
  const f = useCurrentFrame();
  const i = tl.lines.findIndex(([a, b], k) => p.lines[k][0] === 'step' && f >= a && f <= b + 6);
  if (i < 0) return null;
  const [a, b] = tl.lines[i];
  const o = interpolate(f, [a, a + 5, b + 2, b + 6], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170 }}>
      <div className="reel-root" style={{ background: 'transparent', maxWidth: 900, textAlign: 'center', fontSize: 44, fontWeight: 600, lineHeight: 1.25, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.85)', opacity: o }}>
        {p.lines[i][1]}
      </div>
    </AbsoluteFill>
  );
};

export const DailyReel: React.FC<{ n: number }> = ({ n }) => {
  useFonts();
  const p = PROBLEMS[n - 1];
  const tl = timeline(p);
  const S = tl.scenes;
  const scenes: [number, number, React.ReactNode][] = [
    [S.hook, S.problem, <Hook p={p} n={n} />],
    [S.problem, S.think, <Problem p={p} n={n} />],
    [S.think, S.solve, <Think p={p} />],
    [S.solve, S.answer, <Solve p={p} n={n} tl={tl} />],
    [S.answer, S.cta, <Answer p={p} />],
    [S.cta, S.total, <Cta />],
  ];
  const voice = staticFile(`vo5/${p.id}.mp3`);
  return (
    <AbsoluteFill style={{ background: '#070B16' }}>
      {scenes.map(([from, to, el], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          {el}
        </Sequence>
      ))}
      <Captions p={p} tl={tl} />
      {p.voice && (
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
      {[S.problem, S.think, S.solve, S.answer, S.cta].map((at) => (
        <Sequence key={at} from={at - 4} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
      {[0, 30, 60].map((d) => (
        <Sequence key={d} from={S.think + d} durationInFrames={20}>
          <Audio src={staticFile('sfx/tick.wav')} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={S.answer + 4} durationInFrames={40}>
        <Audio src={staticFile('sfx/ding.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const dailyLength = (n: number) => timeline(PROBLEMS[n - 1]).scenes.total;
export const DAILY_COUNT = PROBLEMS.length;
