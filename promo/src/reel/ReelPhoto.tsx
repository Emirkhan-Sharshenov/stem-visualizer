import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Button, Card, Chip, Label, ProgressBar, Slider } from '@heroui/react';
import { useFonts } from '../ui';
import { clamp, CYAN, Logo, Mono, prog, Stage, useIn } from './kit';
import './reel.css';

/* "Snap a problem" — a 24 s vertical reel built from HeroUI components in the STEM Lab night theme.
   The voice is one ElevenLabs take (public/vo4/reel-voice.mp3); scene cuts follow its pauses. */

export const REEL_PHOTO_LEN = 720;
const VOICE_AT = 6; // the take starts 0.2 s in

// scene starts in frames, from the pauses of the take (+0.2 s)
const S = { hook: 0, camera: 60, steps: 118, answer: 237, model: 306, words: 418, end: 537 };
// spoken lines for the captions: [from, to, text]
const LINES: [number, number, string][] = [
  [6, 42, 'Не понял задачу?'],
  [64, 106, 'Просто сфотографируй её.'],
  [116, 224, 'Наставник прочитает условие и разберёт решение по шагам.'],
  [240, 294, 'А потом откроет живую модель.'],
  [309, 406, 'Двигай напряжение — и смотри, как меняется ток.'],
  [424, 527, 'Физика. Химия. Геометрия.'],
  [551, 645, 'Стэм Визуалайзер. Ссылка в профиле.'],
];

/* ---------- 1. hook: the words split in two ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  // the word tears apart for a moment and snaps back
  const split = prog(f, 12, 8) - prog(f, 30, 10);
  const q = useIn(26);
  const word = (style: React.CSSProperties) => (
    <div className="font-display" style={{ position: 'absolute', inset: 0, fontSize: 118, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', textAlign: 'center', whiteSpace: 'nowrap', ...style }}>
      НЕ ПОНЯЛ
    </div>
  );
  return (
    <Stage>
      <div style={{ position: 'relative', width: '100%', height: 124, opacity: prog(f, 0, 8) }}>
        {word({ clipPath: 'inset(0 0 50% 0)', transform: `translateX(${-split * 18}px)`, color: '#DDE6FF' })}
        {word({ clipPath: 'inset(50% 0 0 0)', transform: `translateX(${split * 18}px)`, color: CYAN })}
      </div>
      <div className="font-display" style={{ fontSize: 110, fontWeight: 700, color: '#DDE6FF', opacity: q, transform: `translateY(${(1 - q) * 40}px)` }}>
        задачу?
      </div>
    </Stage>
  );
};

/* ---------- 2. camera finds the problem and snaps ---------- */
const Camera: React.FC = () => {
  const f = useCurrentFrame() + S.camera; // absolute frame, so the voice timing reads directly
  const inn = useIn(0);
  const lock = prog(f, 72, 16);
  const flash = interpolate(f, [100, 103, 112], [0, 1, 0], clamp);
  return (
    <Stage>
      <div style={{ width: 760, height: 1360, borderRadius: 70, border: '6px solid #2C3B5E', background: '#0A1122', padding: 28, display: 'flex', flexDirection: 'column', gap: 26, transform: `scale(${0.92 + inn * 0.08})`, opacity: inn, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Chip className="reel-chip" color="accent" variant="soft" size="lg">
            <Chip.Label className="reel-chip-label">● Камера · наставник</Chip.Label>
          </Chip>
        </div>
        <div style={{ flex: 1, borderRadius: 34, background: 'repeating-linear-gradient(0deg, #ECE6D6 0 46px, #DCD5C3 46px 48px)', padding: 54, position: 'relative', color: '#2A2620', fontFamily: 'Georgia, serif', fontSize: 40, lineHeight: 1.45 }}>
          <div style={{ fontSize: 30, color: '#7A715F' }}>§ 43. Закон Ома</div>
          <div style={{ marginTop: 160 }}>
            <b>№ 214.</b> Резистор сопротивлением 20&nbsp;Ом подключён к&nbsp;источнику напряжением 12&nbsp;В. Найдите силу тока в&nbsp;цепи.
          </div>
          <div style={{ marginTop: 120, fontSize: 32, color: '#8A8170' }}>№ 215. Как изменится сила тока, если…</div>
          {/* viewfinder closing on the problem */}
          <div style={{ position: 'absolute', left: 30 - (1 - lock) * 20, right: 30 - (1 - lock) * 20, top: 205 - (1 - lock) * 60, height: 330 + (1 - lock) * 120, border: `5px solid ${CYAN}`, borderRadius: 26, boxShadow: `0 0 0 2000px rgba(4,8,20,${0.45 * lock}), 0 0 40px rgba(57,225,255,0.5)` }} />
        </div>
        <div style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid #fff', alignSelf: 'center', background: f > 98 && f < 106 ? '#fff' : 'rgba(255,255,255,0.2)' }} />
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
      </div>
    </Stage>
  );
};

/* ---------- 3. the mentor reads the photo and works it out step by step ---------- */
const StepCard: React.FC<{ at: number; label: string; children: React.ReactNode }> = ({ at, label, children }) => {
  const s = useIn(at);
  return (
    <div style={{ width: '100%', opacity: s, transform: `translateY(${(1 - s) * 80}px)`, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Mono>{label}</Mono>
      <Card className="w-full" style={{ padding: 36 }}>
        <Card.Content>{children}</Card.Content>
      </Card>
    </div>
  );
};
const Steps: React.FC = () => {
  const f = useCurrentFrame() + S.steps;
  const toast = useIn(0);
  const read = interpolate(f, [S.steps + 4, S.steps + 34], [5, 100], clamp);
  return (
    <Stage>
      <AbsoluteFill style={{ padding: '120px 80px', gap: 34, justifyContent: 'flex-start' }}>
        <div style={{ opacity: toast, transform: `translateY(${(1 - toast) * -80}px)` }}>
          <Card style={{ padding: 30 }}>
            <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Chip className="reel-chip" color="accent" variant="primary" size="lg">
                  <Chip.Label className="reel-chip-label">Наставник</Chip.Label>
                </Chip>
                <span style={{ fontSize: 34, color: '#9AA7C7' }}>{read < 100 ? 'Читаю условие…' : 'Условие прочитано ✓'}</span>
              </div>
              <ProgressBar aria-label="Разбор фото" value={read} size="lg">
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            </Card.Content>
          </Card>
        </div>
        <StepCard at={40} label="ШАГ 1 · ДАНО">
          <div style={{ display: 'flex', gap: 60, fontSize: 52 }} className="font-mono">
            <span>R = 20 Ом</span>
            <span>U = 12 В</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 36, color: '#9AA7C7' }}>Найти: I</div>
        </StepCard>
        <StepCard at={68} label="ШАГ 2 · ФОРМУЛА">
          <div className="font-display" style={{ fontSize: 84, fontWeight: 700 }}>
            I = U / R
          </div>
        </StepCard>
        <StepCard at={92} label="ШАГ 3 · ПОДСТАНОВКА">
          <div className="font-mono" style={{ fontSize: 64 }}>
            I = 12 / 20
          </div>
        </StepCard>
      </AbsoluteFill>
    </Stage>
  );
};

/* ---------- 4. the answer and the button to the model ---------- */
const Answer: React.FC = () => {
  const f = useCurrentFrame() + S.answer;
  const a = useIn(0);
  const b = useIn(18);
  const press = interpolate(f, [282, 286, 292], [1, 0.94, 1], clamp);
  return (
    <Stage>
      <Mono>ОТВЕТ</Mono>
      <div className="font-display" style={{ fontSize: 230, fontWeight: 700, color: CYAN, textShadow: '0 0 60px rgba(57,225,255,0.55)', opacity: a, transform: `scale(${0.8 + a * 0.2})` }}>
        0,6 А
      </div>
      <Chip className="reel-chip" color="success" variant="soft" size="lg" style={{ opacity: a }}>
        <Chip.Label className="reel-chip-label">✓ Решено по шагам</Chip.Label>
      </Chip>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 40}px) scale(${press})`, marginTop: 40 }}>
        <Button size="lg" className="font-semibold" style={{ height: 120, padding: '0 64px', fontSize: 44, boxShadow: f > 282 ? '0 0 0 10px rgba(57,225,255,0.25), 0 0 60px rgba(57,225,255,0.5)' : '0 0 40px rgba(57,225,255,0.35)' }}>
          Открыть тему и модель →
        </Button>
      </div>
    </Stage>
  );
};

/* ---------- 5. Ohm's law, live ---------- */
const Readout: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <Card style={{ padding: 28, flex: 1 }}>
    <Card.Content style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 28, color: '#9AA7C7' }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 58, color: CYAN, textShadow: '0 0 24px rgba(57,225,255,0.6)', whiteSpace: 'nowrap' }}>
        {value}
        <span style={{ fontSize: 32, color: '#9AA7C7', marginLeft: 8 }}>{unit}</span>
      </span>
    </Card.Content>
  </Card>
);
const fmt = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const Model: React.FC = () => {
  const f = useCurrentFrame() + S.model;
  const inn = useIn(0);
  // the voltage is swept while the voice says "двигай напряжение"
  const U = interpolate(f, [326, 396], [6, 22], clamp);
  const I = U / 20;
  const glow = interpolate(I, [0.3, 1.1], [0.25, 1]);
  return (
    <Stage>
      <AbsoluteFill style={{ padding: '150px 80px', gap: 40, justifyContent: 'flex-start', opacity: inn }}>
        <Mono>// ЗАКОН ОМА · ФИЗИКА 8 КЛАСС</Mono>
        {/* the circuit: a lamp that brightens with the current */}
        <svg viewBox="0 0 920 520" width="100%" style={{ display: 'block' }}>
          <rect x="60" y="80" width="800" height="380" rx="30" fill="none" stroke="#2C3B5E" strokeWidth="10" />
          <rect x="60" y="80" width="800" height="380" rx="30" fill="none" stroke={CYAN} strokeWidth="10" strokeDasharray="30 40" strokeDashoffset={-f * (2 + I * 10)} opacity={0.9} />
          <rect x="20" y="220" width="80" height="100" rx="12" fill="#0F1729" stroke="#DDE6FF" strokeWidth="6" />
          <text x="60" y="282" fill="#DDE6FF" fontSize="34" textAnchor="middle" fontFamily="IBM Plex Mono">U</text>
          <rect x="380" y="40" width="160" height="80" rx="12" fill="#0F1729" stroke="#DDE6FF" strokeWidth="6" />
          <text x="460" y="93" fill="#DDE6FF" fontSize="34" textAnchor="middle" fontFamily="IBM Plex Mono">20 Ω</text>
          <circle cx="460" cy="460" r={70 + glow * 50} fill={`rgba(255,214,90,${0.18 * glow})`} />
          <circle cx="460" cy="460" r="52" fill={`rgba(255,214,90,${0.25 + 0.75 * glow})`} stroke="#DDE6FF" strokeWidth="6" />
        </svg>
        <div style={{ display: 'flex', gap: 22 }}>
          <Readout label="Напряжение" value={fmt(U)} unit="В" />
          <Readout label="Сопротивление" value="20,00" unit="Ом" />
          <Readout label="Сила тока" value={fmt(I)} unit="А" />
        </div>
        <Slider value={U} minValue={0} maxValue={24} step={0.1} aria-label="Напряжение источника" className="w-full">
          <Label style={{ fontSize: 34 }}>Напряжение источника</Label>
          <Slider.Output style={{ fontSize: 34 }}>{`${fmt(U)} В`}</Slider.Output>
          <Slider.Track style={{ height: 22 }}>
            <Slider.Fill />
            <Slider.Thumb style={{ width: 56, height: 56 }} />
          </Slider.Track>
        </Slider>
      </AbsoluteFill>
    </Stage>
  );
};

/* ---------- 6. "snap physics / chemistry / geometry" ---------- */
const WORDS: [number, string, string][] = [
  [424, 'физику', '#E5484D'],
  [462, 'химию', '#30A46C'],
  [501, 'геометрию', '#8E4EC6'],
];
const Words: React.FC = () => {
  const f = useCurrentFrame() + S.words;
  const i = WORDS.reduce((k, w, n) => (f >= w[0] ? n : k), 0);
  const t = prog(f, WORDS[i][0], 8);
  return (
    <Stage>
      <div className="font-display" style={{ fontSize: 80, fontWeight: 700, color: '#DDE6FF', whiteSpace: 'nowrap' }}>
        Сфотографируй
      </div>
      <div style={{ height: 150, overflow: 'hidden' }}>
        <div className="font-display" style={{ fontSize: 110, fontWeight: 700, whiteSpace: 'nowrap', color: WORDS[i][2], textShadow: `0 0 50px ${WORDS[i][2]}88`, transform: `translateY(${(1 - t) * 120}px)`, opacity: t }}>
          {WORDS[i][1]}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 30 }}>
        {WORDS.map(([at, w], n) => (
          <Chip className="reel-chip" key={w} size="lg" color={n <= i ? 'accent' : 'default'} variant={n === i ? 'primary' : 'soft'} style={{ opacity: f >= at - 4 ? 1 : 0.35 }}>
            <Chip.Label className="reel-chip-label">{['Физика', 'Химия', 'Геометрия'][n]}</Chip.Label>
          </Chip>
        ))}
      </div>
    </Stage>
  );
};

/* ---------- 7. end card ---------- */
const End: React.FC = () => {
  const f = useCurrentFrame() + S.end;
  const a = useIn(0);
  const b = useIn(20);
  const pulse = 1 + 0.03 * Math.sin((f - S.end) / 6);
  return (
    <Stage>
      <Logo style={{ opacity: a, transform: `scale(${0.7 + a * 0.3})` }} />
      <div className="font-display" style={{ fontSize: 72, fontWeight: 700, color: '#DDE6FF', whiteSpace: 'nowrap', opacity: a }}>
        STEM Visualizer
      </div>
      <div style={{ fontSize: 44, color: '#9AA7C7', opacity: a }}>Понимать, а не заучивать</div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px) scale(${pulse})`, marginTop: 30 }}>
        <Button size="lg" className="font-semibold" style={{ height: 120, padding: '0 70px', fontSize: 46, boxShadow: '0 0 50px rgba(57,225,255,0.5)' }}>
          Попробовать бесплатно
        </Button>
      </div>
      <Chip className="reel-chip" color="accent" variant="soft" size="lg" style={{ opacity: b }}>
        <Chip.Label className="reel-chip-label">stem-visualizer.pages.dev</Chip.Label>
      </Chip>
    </Stage>
  );
};

/* ---------- captions for sound-off viewing ---------- */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const line = LINES.find(([a, b]) => f >= a && f <= b + 6);
  if (!line || f >= S.words) return null; // the last scenes show their words on screen
  const o = interpolate(f, [line[0], line[0] + 5, line[1] + 2, line[1] + 6], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150 }}>
      <div className="reel-root" style={{ background: 'transparent', maxWidth: 900, textAlign: 'center', fontSize: 46, fontWeight: 600, lineHeight: 1.25, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.85)', opacity: o }}>
        {line[2]}
      </div>
    </AbsoluteFill>
  );
};

export const ReelPhoto: React.FC = () => {
  useFonts();
  const scenes: [number, number, React.FC][] = [
    [S.hook, S.camera, Hook],
    [S.camera, S.steps, Camera],
    [S.steps, S.answer, Steps],
    [S.answer, S.model, Answer],
    [S.model, S.words, Model],
    [S.words, S.end, Words],
    [S.end, REEL_PHOTO_LEN, End],
  ];
  return (
    <AbsoluteFill style={{ background: '#070B16' }}>
      {scenes.map(([from, to, C], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          <C />
        </Sequence>
      ))}
      <Captions />
      <Sequence from={VOICE_AT}>
        <Audio src={staticFile('vo4/reel-voice.mp3')} />
      </Sequence>
      <Audio src={staticFile('music-labs.wav')} volume={(f) => interpolate(f, [0, 10, 690, 720], [0, 0.16, 0.16, 0], clamp)} />
      {[S.camera, S.steps, S.answer, S.model, S.words, S.end].map((at) => (
        <Sequence key={at} from={at - 4} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
        </Sequence>
      ))}
      <Sequence from={100} durationInFrames={20}>
        <Audio src={staticFile('sfx/tick.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={282} durationInFrames={20}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};
