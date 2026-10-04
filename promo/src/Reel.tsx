import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Backdrop, bar, Chip, COL, ease, Frame, Kinetic, LogoMark, SANS, SERIF, useFonts, usePop } from './ui';
import { loadGLB, SimCanvas, useThree } from './render';
import { buildReaction, ReactionScene } from '../../src/lib/chem/reactionScene';
import { reactionById } from '../../src/lib/chem/reactions';
import { cellDivision } from '../../src/components/sims/engines/bio';
import { blood } from '../../src/components/sims/engines/bio2';
import { solarSystem } from '../../src/components/sims/engines/space';
import { dissociation } from '../../src/components/sims/engines/chem';
import { MODELS } from '../../src/lib/three/models';

/* Reel timeline in bars of the 128 BPM soundtrack (1 bar = 56.25 frames) */
const S = {
  hook: [0, bar(2)],
  logo: [bar(2), bar(4)],
  reaction: [bar(4), bar(6)],
  skeleton: [bar(6), bar(8)],
  mitosis: [bar(8), bar(10)],
  montage: [bar(10), bar(12)],
  stats: [bar(12), bar(14)],
  cta: [bar(14), 900],
} as const;
const len = (k: keyof typeof S) => S[k][1] - S[k][0];
/** start frame of each voice line (slightly after the cut, so the music hit lands first) */
const VOICE_AT = [S.hook[0] + 8, S.logo[0] + 10, S.reaction[0] + 8, S.skeleton[0] + 6, S.mitosis[0] + 6, S.montage[0] + 4, S.stats[0] + 4, S.cta[0] + 6];

export const Reel: React.FC = () => {
  useFonts();
  // voice lines generated in ElevenLabs: public/voice/01.mp3 … 08.mp3, each starts with its scene
  const files = getStaticFiles().map((f) => f.name);
  const lines = VOICE_AT.map((at, i) => ({ at, file: `voice/${String(i + 1).padStart(2, '0')}.mp3` })).filter((l) => files.includes(l.file));
  const hasVoice = lines.length > 0;
  return (
    <AbsoluteFill style={{ background: COL.bg }}>
      <Audio src={staticFile('music.wav')} volume={(f) => (hasVoice ? interpolate(f, [0, 10], [0, 0.45], { extrapolateRight: 'clamp' }) : 0.9)} />
      {lines.map((l) => (
        <Sequence key={l.file} from={l.at}>
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
      <Sequence from={S.hook[0]} durationInFrames={len('hook')}>
        <Hook />
      </Sequence>
      <Sequence from={S.logo[0]} durationInFrames={len('logo')}>
        <LogoReveal />
      </Sequence>
      <Sequence from={S.reaction[0]} durationInFrames={len('reaction')}>
        <ReactionShot />
      </Sequence>
      <Sequence from={S.skeleton[0]} durationInFrames={len('skeleton')}>
        <SkeletonShot />
      </Sequence>
      <Sequence from={S.mitosis[0]} durationInFrames={len('mitosis')}>
        <MitosisShot />
      </Sequence>
      <Sequence from={S.montage[0]} durationInFrames={len('montage')}>
        <Montage />
      </Sequence>
      <Sequence from={S.stats[0]} durationInFrames={len('stats')}>
        <Stats />
      </Sequence>
      <Sequence from={S.cta[0]} durationInFrames={len('cta')}>
        <CTA />
      </Sequence>
      <Flash at={S.reaction[0]} />
      <Flash at={S.cta[0]} soft />
    </AbsoluteFill>
  );
};

/* white flash on musical hits */
const Flash: React.FC<{ at: number; soft?: boolean }> = ({ at, soft }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 10) return null;
  return <AbsoluteFill style={{ background: '#FFFFFF', opacity: (soft ? 0.35 : 0.8) * (1 - f / 10), pointerEvents: 'none' }} />;
};

/** fades a whole scene in and out so cuts feel smooth */
const SceneFade: React.FC<{ children: React.ReactNode; dur: number; fadeIn?: number; fadeOut?: number }> = ({ children, dur, fadeIn = 6, fadeOut = 6 }) => {
  const f = useCurrentFrame();
  const o = Math.min(ease(f, 0, fadeIn), 1 - ease(f, dur - fadeOut, dur));
  const z = interpolate(f, [0, dur], [1.04, 1]);
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${z})` }}>{children}</AbsoluteFill>;
};

/* ---------- 1. hook ---------- */

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const formula = 'p = ρgh';
  const brk = ease(f, 52, 90);
  return (
    <SceneFade dur={len('hook')} fadeIn={1}>
      <Backdrop strength={0.6} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 360, paddingLeft: 90, paddingRight: 90 }}>
        <Kinetic text="Ты выучил формулу." size={96} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: SERIF, fontStyle: 'italic', fontSize: 230, color: COL.ink, textShadow: `0 0 60px ${COL.accent}` }}>
          {formula.split('').map((ch, i) => {
            const a = (i * 2.4) % (Math.PI * 2);
            const d = brk * (220 + i * 30);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  opacity: ease(f, 6 + i * 2, 18 + i * 2) * (1 - brk),
                  transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) rotate(${brk * (i % 2 ? 40 : -40)}deg)`,
                  filter: `blur(${brk * 14}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      <Sequence from={56}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 520, paddingLeft: 80, paddingRight: 80 }}>
          <Kinetic text="А видел, как она работает?" size={96} highlight={['работает']} />
        </AbsoluteFill>
      </Sequence>
    </SceneFade>
  );
};

/* ---------- 2. logo reveal ---------- */

const LogoReveal: React.FC = () => {
  const f = useCurrentFrame();
  const page = 1 - ease(f, 14, 40);
  const logo = usePop(26, 12);
  return (
    <SceneFade dur={len('logo')} fadeOut={2}>
      <Backdrop strength={0.7 + ease(f, 0, 110) * 0.6} />
      {/* textbook page dissolving into particles that fly into the logo */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 620,
            height: 820,
            borderRadius: 18,
            background: '#F4F1EA',
            opacity: page,
            transform: `perspective(1400px) rotateY(${(1 - page) * 50}deg) scale(${0.9 + page * 0.1})`,
            padding: 60,
            boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 44, color: '#222', marginBottom: 30 }}>§ 24. Давление жидкости</div>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{ height: 14, borderRadius: 7, background: '#CFCAC0', marginBottom: 22, width: `${70 + ((i * 37) % 30)}%` }} />
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {Array.from({ length: 70 }, (_, i) => {
          const k = ease(f, 14 + (i % 10), 46 + (i % 10));
          const sx = 230 + ((i * 97) % 620);
          const sy = 560 + ((i * 53) % 800);
          const x = sx + (540 - sx) * k;
          const y = sy + (820 - sy) * k;
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 10, height: 10, borderRadius: 9, background: i % 3 ? COL.accent2 : COL.accent, opacity: k > 0 && k < 1 ? 1 : 0, boxShadow: `0 0 18px ${COL.accent}` }} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 48, flexDirection: 'column' }}>
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`, filter: `drop-shadow(0 0 60px ${COL.accent})` }}>
          <LogoMark size={260} draw={ease(f, 30, 70)} />
        </div>
        <Sequence from={40} layout="none">
          <Kinetic text="STEM Visualizer" size={96} serif={false} stagger={4} />
        </Sequence>
        <Sequence from={58} layout="none">
          <Kinetic text="учебник, который оживает" size={70} highlight={['оживает']} />
        </Sequence>
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ---------- 3. chemical reaction in 3D ---------- */

const Reaction3D: React.FC<{ t: number; spin: number }> = ({ t, spin }) => {
  const rx = useRef<ReactionScene | null>(null);
  const { canvasRef, ready, render, three } = useThree(1080, 1080, (scene, camera) => {
    const r = buildReaction(reactionById('methane_combustion'));
    rx.current = r;
    scene.add(r.group);
    const d = Math.max(9, r.radius * 1.55);
    camera.position.set(0, d * 0.2, d);
    camera.lookAt(0, 0, 0);
  });
  useLayoutEffect(() => {
    if (!ready || !rx.current || !three.current) return;
    rx.current.update(t);
    rx.current.group.rotation.y = spin;
    render();
  });
  return <canvas ref={canvasRef} style={{ width: 1080, height: 1080 }} />;
};

const ReactionShot: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len('reaction')], [2.1, 8.4]);
  const phase = t < 3.4 ? 'Сближение' : t < 4.6 ? 'Разрыв связей' : t < 5.4 ? 'Новые связи' : 'Продукты';
  return (
    <SceneFade dur={len('reaction')} fadeIn={1}>
      <Backdrop hue="#F76B15" hue2={COL.accent} strength={0.8} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 250, paddingLeft: 70, paddingRight: 70 }}>
        <Kinetic text="Смотри, как рвутся связи" size={92} highlight={['рвутся']} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', top: 90 }}>
        <Reaction3D t={t} spin={f * 0.006} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: "flex-end", paddingBottom: 330, gap: 22, flexDirection: 'column' }}>
        <Chip color={COL.chemistry} size={34}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>CH₄ + 2O₂ → CO₂ + 2H₂O</span>
        </Chip>
        <Chip color="#F5A524" size={28}>
          {phase}
        </Chip>
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ---------- 4. skeleton explode ---------- */

const Skeleton3D: React.FC<{ explode: number; spin: number }> = ({ explode, spin }) => {
  const parts = useRef<{ obj: THREE.Object3D; home: THREE.Vector3; dir: THREE.Vector3 }[]>([]);
  const root = useRef<THREE.Group | null>(null);
  const { canvasRef, ready, render } = useThree(1080, 1300, async (scene, camera) => {
    const g = await loadGLB('models/skeleton.glb');
    const box = new THREE.Box3().setFromObject(g);
    const size = box.getSize(new THREE.Vector3());
    const s = 3.2 / size.y;
    g.scale.setScalar(s);
    const c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x * s, -c.y * s, -c.z * s);
    const holder = new THREE.Group();
    holder.add(g);
    scene.add(holder);
    holder.updateMatrixWorld(true);
    root.current = holder;
    const mid = new THREE.Box3().setFromObject(holder).getCenter(new THREE.Vector3());
    Object.keys(MODELS.skeleton.parts).forEach((name) => {
      const obj = g.getObjectByName(name);
      if (!obj) return;
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) m.material = new THREE.MeshStandardMaterial({ color: '#EDE3CF', roughness: 0.55 });
      });
      const pc = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      const dir = pc.sub(mid);
      dir.y *= 0.3;
      parts.current.push({ obj, home: obj.position.clone(), dir: dir.multiplyScalar(1 / s) });
    });
    camera.position.set(0, 0.5, 6.3);
    camera.lookAt(0, 0.55, 0);
  });
  useLayoutEffect(() => {
    if (!ready || !root.current) return;
    root.current.rotation.y = spin;
    parts.current.forEach((p) => p.obj.position.copy(p.home).addScaledVector(p.dir, explode * 1.5));
    render();
  });
  return <canvas ref={canvasRef} style={{ width: 1080, height: 1300 }} />;
};

const SkeletonShot: React.FC = () => {
  const f = useCurrentFrame();
  const explode = ease(f, 18, 70);
  const labels = [
    { n: 'Череп', x: 110, y: 620, d: 40 },
    { n: 'Рёбра', x: 760, y: 860, d: 48 },
    { n: 'Позвоночник', x: 70, y: 1000, d: 56 },
    { n: 'Таз', x: 790, y: 1150, d: 64 },
  ];
  return (
    <SceneFade dur={len('skeleton')}>
      <Backdrop hue={COL.biology} hue2={COL.accent} strength={0.7} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', top: 170 }}>
        <Skeleton3D explode={explode} spin={-0.5 + f * 0.012} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 250, paddingLeft: 70, paddingRight: 70 }}>
        <Kinetic text="Разбери скелет по костям" size={92} highlight={['костям']} />
      </AbsoluteFill>
      {labels.map((l) => {
        const s = popAt(f, l.d);
        return (
          <div key={l.n} style={{ position: 'absolute', left: l.x, top: l.y, transform: `scale(${s})`, opacity: s }}>
            <Chip color={COL.biology} size={30}>
              {l.n}
            </Chip>
          </div>
        );
      })}
    </SceneFade>
  );
};

// a spring without hooks (labels are mapped in a loop)
function popAt(f: number, delay: number) {
  const x = Math.max(0, f - delay) / 10;
  return x <= 0 ? 0 : Math.min(1.08, 1 - Math.exp(-x * 2.2) * Math.cos(x * 3));
}

/* ---------- 5. mitosis with rewind ---------- */

const MARKS = [
  { t: 3, n: 'Профаза' },
  { t: 5, n: 'Метафаза' },
  { t: 7, n: 'Анафаза' },
  { t: 9, n: 'Телофаза' },
];

const MitosisShot: React.FC = () => {
  const f = useCurrentFrame();
  // play → fast rewind → play again
  const t = f < 52 ? interpolate(f, [0, 52], [3.4, 10.2]) : f < 70 ? interpolate(f, [52, 70], [10.2, 5.2]) : interpolate(f, [70, len('mitosis')], [5.2, 8.6]);
  const rewinding = f >= 52 && f < 70;
  const current = [...MARKS].reverse().find((m) => t >= m.t);
  return (
    <SceneFade dur={len('mitosis')}>
      <Backdrop hue={COL.chemistry} hue2={COL.accent} strength={0.7} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 250, paddingLeft: 70, paddingRight: 70 }}>
        <Kinetic text="Останови. Перемотай. Пойми." size={88} highlight={['Перемотай.']} stagger={6} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', top: 60 }}>
        <Frame w={1000} h={562} glow={COL.chemistry} tilt={interpolate(f, [0, len('mitosis')], [-8, 6])}>
          <div style={{ filter: rewinding ? 'saturate(1.6) hue-rotate(-12deg)' : 'none' }}>
            <SimCanvas sim={cellDivision} mode="mitosis" t={t} width={1000} />
          </div>
          {rewinding && (
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
              <Chip color="#F5A524" size={30}>
                ⏪ перемотка
              </Chip>
            </div>
          )}
        </Frame>
      </AbsoluteFill>
      {/* timeline UI like on the site */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 400 }}>
        <div style={{ width: 1000, padding: '26px 30px', borderRadius: 28, background: 'rgba(26,28,33,0.92)', border: '2px solid #2c2f36', fontFamily: SANS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: COL.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{rewinding ? '⏪' : '❚❚'}</div>
            <div style={{ flex: 1, height: 10, borderRadius: 9, background: '#34363C', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(t / 14) * 100}%`, borderRadius: 9, background: COL.accent }} />
              <div style={{ position: 'absolute', top: -9, left: `calc(${(t / 14) * 100}% - 14px)`, width: 28, height: 28, borderRadius: 99, background: '#fff', boxShadow: `0 0 20px ${COL.accent}` }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {MARKS.map((m) => (
              <span key={m.n} style={{ padding: '8px 18px', borderRadius: 99, fontSize: 26, background: current === m ? COL.accent : '#26282D', color: current === m ? '#fff' : '#B5B8C0' }}>
                {m.n}
              </span>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ---------- 6. subject montage ---------- */

const CUTS = [
  { subject: 'Физика', color: COL.physics, sim: solarSystem, mode: 'orbits', t0: 4, t1: 9, params: { speed: 1.2 } },
  { subject: 'Химия', color: COL.chemistry, sim: dissociation, mode: 'dissolve', t0: 5, t1: 11 },
  { subject: 'Биология', color: COL.biology, sim: blood, mode: 'composition', t0: 1, t1: 6 },
];

const Montage: React.FC = () => {
  const f = useCurrentFrame();
  const per = len('montage') / CUTS.length;
  const i = Math.min(CUTS.length - 1, Math.floor(f / per));
  const lf = f - i * per;
  const c = CUTS[i];
  const punch = interpolate(lf, [0, 8], [1.12, 1], { extrapolateRight: 'clamp' });
  const whip = interpolate(lf, [0, 6], [140, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Backdrop hue={c.color} hue2={COL.accent} strength={0.9} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 300 }}>
        <div key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: '-0.04em', color: c.color, transform: `scale(${punch}) translateX(${whip}px)`, textShadow: `0 0 80px ${c.color}88` }}>
          {c.subject}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', top: 80 }}>
        <div style={{ transform: `scale(${punch}) translateX(${-whip * 0.6}px)` }}>
          <Frame w={1000} h={562} glow={c.color} tilt={6 - lf * 0.2}>
            <SimCanvas sim={c.sim} mode={c.mode} t={interpolate(lf, [0, per], [c.t0, c.t1])} params={c.params} width={1000} />
          </Frame>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 420 }}>
        <div style={{ display: 'flex', gap: 18 }}>
          {CUTS.map((k, n) => (
            <div key={k.subject} style={{ width: 90, height: 10, borderRadius: 9, background: n <= i ? k.color : '#2c2f36' }} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 7. numbers ---------- */

const Stats: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { big: `${Math.round(interpolate(f, [0, 34], [0, 480], { extrapolateRight: 'clamp' }))}+`, small: 'тем с живой симуляцией', color: COL.accent2, d: 0 },
    { big: '5–11', small: 'классы школьной программы', color: COL.chemistry, d: 28 },
    { big: '3D', small: 'модели, реакции, процессы', color: COL.biology, d: 56 },
  ];
  return (
    <SceneFade dur={len('stats')}>
      <Backdrop strength={0.8} />
      <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 110, gap: 70, top: -60 }}>
        {rows.map((r) => {
          const s = popAt(f, r.d);
          return (
            <div key={r.small} style={{ opacity: Math.min(1, s), transform: `translateX(${(1 - Math.min(1, s)) * -120}px)` }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, lineHeight: 0.95, letterSpacing: '-0.05em', color: r.color, textShadow: `0 0 70px ${r.color}66` }}>{r.big}</div>
              <div style={{ fontFamily: SERIF, fontSize: 58, color: COL.ink, marginTop: 6 }}>{r.small}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

/* ---------- 8. call to action ---------- */

const CTA: React.FC = () => {
  const f = useCurrentFrame();
  const logo = usePop(0, 10);
  const bounce = Math.abs(Math.sin(f / 7)) * 18;
  return (
    <AbsoluteFill style={{ opacity: 1 - ease(f, len('cta') - 8, len('cta')) }}>
      <Backdrop strength={1.2} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40, top: -80 }}>
        <div style={{ transform: `scale(${logo})`, filter: `drop-shadow(0 0 70px ${COL.accent})` }}>
          <LogoMark size={220} />
        </div>
        <Kinetic text="STEM Visualizer" size={92} serif={false} delay={6} />
        <Kinetic text="Понимать, а не заучивать" size={76} highlight={['понимать', 'заучивать']} delay={14} />
        <div style={{ transform: `scale(${popAt(f, 30)})`, marginTop: 10 }}>
          <Chip color={COL.chemistry} size={44}>
            Бесплатно для школьников
          </Chip>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 330, flexDirection: 'column', gap: 18, opacity: ease(f, 42, 52) }}>
        <div style={{ fontSize: 70, color: COL.accent2, transform: `translateY(${-bounce}px)` }}>↑</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 48, color: COL.ink }}>Ссылка в шапке профиля</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
