import { RangeSlider } from '../ui/RangeSlider';
import { Button } from '@heroui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bird, Factory, Pause, Play, RotateCcw, SkipForward, Trees } from 'lucide-react';
import { eatChance, Env, firstGeneration, isDark, Moth, nextGeneration, place, rng, stats } from './selection';
import { Formula } from '../Formula';
import { progress } from '../../lib/progress';
import { useScreenDetail } from '../../lib/pageContext';

type Lang = 'ru' | 'en';
const ASPECT = 0.62;
const PLAYER_TIME = 10;
const PLAYER_BITES = 15;

/** bark texture: base tone, vertical fissures and lichen (clean air) or soot */
function makeBark(env: Env, w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const rand = rng(env === 'clean' ? 7 : 11);
  ctx.fillStyle = env === 'clean' ? '#CFC9BA' : '#3A3633';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const len = 30 + rand() * h * 0.5;
    const y = rand() * h - len / 2;
    ctx.strokeStyle = env === 'clean' ? `rgba(90,80,65,${0.08 + rand() * 0.18})` : `rgba(15,12,10,${0.2 + rand() * 0.3})`;
    ctx.lineWidth = 1 + rand() * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + (rand() - 0.5) * 10, y + len / 3, x + (rand() - 0.5) * 10, y + (2 * len) / 3, x + (rand() - 0.5) * 8, y + len);
    ctx.stroke();
  }
  for (let i = 0; i < 90; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 4 + rand() * 22;
    ctx.fillStyle = env === 'clean' ? `rgba(${200 + rand() * 40},${205 + rand() * 40},${185 + rand() * 30},${0.35 + rand() * 0.3})` : `rgba(10,8,8,${0.25 + rand() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + rand() * 0.5), rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function drawMoth(ctx: CanvasRenderingContext2D, m: Moth, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(m.a);
  const dark = isDark(m.g);
  ctx.fillStyle = dark ? '#2B2926' : '#E6E0CF';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.1);
    ctx.quadraticCurveTo(side * size * 1.1, -size * 0.7, side * size * 1.05, size * 0.35);
    ctx.quadraticCurveTo(side * size * 0.5, size * 0.55, 0, size * 0.25);
    ctx.fill();
  }
  // speckles
  ctx.fillStyle = dark ? 'rgba(80,75,70,0.8)' : 'rgba(60,55,45,0.55)';
  for (let k = 0; k < 6; k++) {
    const sx = Math.sin(k * 2.1) * size * 0.7;
    const sy = Math.cos(k * 1.7) * size * 0.25;
    ctx.fillRect(sx, sy, size * 0.12, size * 0.12);
  }
  ctx.fillStyle = dark ? '#1A1817' : '#9C9483';
  ctx.fillRect(-size * 0.07, -size * 0.25, size * 0.14, size * 0.65);
  ctx.restore();
}

export const SelectionLab: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const rand = useRef(rng(2026));
  const [env, setEnv] = useState<Env>('soot');
  const [strength, setStrength] = useState(0.5);
  const [mu, setMu] = useState(0.002);
  const [moths, setMoths] = useState<Moth[]>(() => place(firstGeneration(0.95, rand.current), rand.current));
  const [gen, setGen] = useState(1);
  const [history, setHistory] = useState<{ dark: number; q: number; env: Env }[]>(() => {
    const s = stats(moths.map((m) => m.g));
    return [{ dark: s.dark, q: s.q, env: 'soot' }];
  });
  const [auto, setAuto] = useState(false);
  const [phase, setPhase] = useState<'show' | 'eaten'>('show');
  const [player, setPlayer] = useState<{ left: number; bites: number; dark: number; light: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => progress.recordLab('sandbox-selection'), []);

  const bark = useMemo(() => makeBark(env, 900, Math.round(900 * ASPECT)), [env]);

  // draw
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(width * dpr);
    cv.height = Math.round(width * ASPECT * dpr);
    const ctx = cv.getContext('2d')!;
    ctx.drawImage(bark, 0, 0, cv.width, cv.height);
    const size = Math.max(10 * dpr, cv.width * 0.02);
    for (const m of moths) {
      if (m.eaten && phase === 'show' && !player) continue;
      ctx.globalAlpha = m.eaten ? 0.3 : 1;
      drawMoth(ctx, m, m.x * cv.width, m.y * cv.height, size);
      ctx.globalAlpha = 1;
      if (m.eaten) {
        ctx.strokeStyle = '#E5484D';
        ctx.lineWidth = 3 * dpr;
        const x = m.x * cv.width;
        const y = m.y * cv.height;
        ctx.beginPath();
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.stroke();
      }
    }
  }, [moths, bark, width, phase, player]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ro = new ResizeObserver(() => setWidth(cv.clientWidth));
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);

  const breed = (current: Moth[]) => {
    const survivors = current.filter((m) => !m.eaten).map((m) => m.g);
    const next = nextGeneration(survivors, rand.current, mu);
    const s = stats(next);
    setMoths(place(next, rand.current));
    setGen((g) => g + 1);
    setHistory((h) => [...h, { dark: s.dark, q: s.q, env }].slice(-80));
    setPhase('show');
  };

  /** birds hunt, then the survivors breed */
  const generation = () => {
    const hunted = moths.map((m) => ({ ...m, eaten: rand.current() < eatChance(m.g, env, strength) }));
    setMoths(hunted);
    setPhase('eaten');
    setTimeout(() => breed(hunted), auto ? 700 : 900);
  };

  const live = useRef(generation);
  live.current = generation;
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => live.current(), 1500);
    return () => clearInterval(id);
  }, [auto]);

  // player mode timer
  useEffect(() => {
    if (!player) return;
    if (player.left <= 0 || player.bites >= PLAYER_BITES) {
      const id = setTimeout(() => {
        breed(moths);
        setPlayer(null);
      }, 1200);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setPlayer((p) => p && { ...p, left: p.left - 1 }), 1000);
    return () => clearTimeout(id);
  }, [player]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = (e: React.MouseEvent) => {
    if (!player || player.left <= 0 || player.bites >= PLAYER_BITES) return;
    const r = canvas.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const hitR = 0.05; // a fingertip, not a mouse pointer
    const idx = moths.findIndex((m) => !m.eaten && Math.hypot(m.x - x, (m.y - y) * ASPECT) < hitR);
    if (idx < 0) return;
    const m = moths[idx];
    setMoths(moths.map((q, i) => (i === idx ? { ...q, eaten: true } : q)));
    setPlayer({ ...player, bites: player.bites + 1, dark: player.dark + (isDark(m.g) ? 1 : 0), light: player.light + (isDark(m.g) ? 0 : 1) });
  };

  const reset = () => {
    rand.current = rng(Math.floor(Math.random() * 1e6) + 1);
    const first = place(firstGeneration(0.95, rand.current), rand.current);
    const s = stats(first.map((m) => m.g));
    setMoths(first);
    setGen(1);
    setHistory([{ dark: s.dark, q: s.q, env }]);
    setAuto(false);
    setPlayer(null);
    setPhase('show');
  };

  const cur = stats(moths.map((m) => m.g));

  // history chart
  const GW = 520;
  const GH = 170;
  const X = (i: number) => 30 + (i / Math.max(1, history.length - 1)) * (GW - 40);
  const Y = (v: number) => 10 + (1 - v) * (GH - 30);

  useScreenDetail(
    'lab',
    `Среда: ${env === 'soot' ? 'закопчённые тёмные стволы' : 'чистый лес, светлые стволы'}. Поколение ${gen}. Генотипы: CC ${cur.CC}, Cc ${cur.het}, cc ${cur.cc}; доля тёмных ${Math.round(cur.dark * 100)}%, p(C) = ${cur.p.toFixed(2)}, q(c) = ${cur.q.toFixed(2)}. Охотятся ${Math.round(strength * 100)}% птиц, мутации ${(mu * 100).toFixed(1)}%.${player ? ' Сейчас ученик играет за птицу и ловит бабочек.' : ''}`,
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-xl px-4 py-3">
        <div className="text-xs font-medium text-accent">{L('Естественный отбор: березовая пяденица', 'Natural selection: the peppered moth')}</div>
        <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">
          {L('В XIX веке копоть заводов Англии сделала стволы деревьев тёмными. Светлых бабочек на них стали замечать и съедать птицы, а тёмные выживали и оставляли потомство. За 50 лет тёмных стало 98%. Повтори это и попробуй сам поохотиться.', 'In 19th-century England factory soot darkened the tree trunks. Birds spotted and ate the light moths, while dark ones survived and bred. In 50 years 98% were dark. Replay it and try hunting yourself.')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-[#1F2126] relative">
            <canvas ref={canvas} onClick={onClick} className="block w-full" style={{ height: width * ASPECT, cursor: player ? 'crosshair' : 'default' }} />
            <div className="absolute left-2 top-2 flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-black/60" style={{ color: '#fff' }}>
                {L('Поколение', 'Generation')} {gen}
              </span>
              {player && (
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-[#E5484D]" style={{ color: '#fff' }}>
                  {player.left > 0 && player.bites < PLAYER_BITES
                    ? L(`Лови бабочек! ${player.left} с · съедено ${player.bites}/${PLAYER_BITES}`, `Catch moths! ${player.left} s · eaten ${player.bites}/${PLAYER_BITES}`)
                    : L(`Съедено: тёмных ${player.dark}, светлых ${player.light}`, `Eaten: ${player.dark} dark, ${player.light} light`)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="text-sm font-medium" onPress={() => setAuto(!auto)} isDisabled={!!player}>
              {auto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {auto ? L('Пауза', 'Pause') : L('Смена поколений', 'Run generations')}
            </Button>
            <Button variant="outline" className="text-sm" onPress={() => generation()} isDisabled={auto || !!player || phase === 'eaten'}>
              <SkipForward className="w-4 h-4" />
              {L('Одно поколение', 'One generation')}
            </Button>
            <Button variant="outline" className="text-sm" onPress={() => {
                setAuto(false);
                setPlayer({ left: PLAYER_TIME, bites: 0, dark: 0, light: 0 });
              }} isDisabled={!!player || phase === 'eaten'}>
              <Bird className="w-4 h-4" />
              {L('Ты — птица', 'You are the bird')}
            </Button>
            <Button variant="outline" className="text-sm" onPress={() => reset()}>
              <RotateCcw className="w-4 h-4" />
              {L('Заново', 'Restart')}
            </Button>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Доля тёмных бабочек по поколениям', 'Share of dark moths by generation')}</h3>
            <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full">
              {history.map((h, i) =>
                i > 0 ? <rect key={i} x={X(i - 1)} width={X(i) - X(i - 1) + 0.5} y={10} height={GH - 30} fill={h.env === 'soot' ? '#3A3633' : '#CFC9BA'} opacity="0.14" /> : null,
              )}
              {[0, 0.5, 1].map((v) => (
                <g key={v}>
                  <line x1={30} x2={GW - 10} y1={Y(v)} y2={Y(v)} stroke="#EEEEEA" />
                  <text x={24} y={Y(v) + 3} fontSize="10" textAnchor="end" fill="#8C8F98" fontFamily="JetBrains Mono, monospace">
                    {v * 100}%
                  </text>
                </g>
              ))}
              {history.length > 1 && (
                <>
                  <path d={history.map((h, i) => `${i ? 'L' : 'M'}${X(i)},${Y(h.dark)}`).join(' ')} fill="none" stroke="#2B2926" strokeWidth="2.5" />
                  <path d={history.map((h, i) => `${i ? 'L' : 'M'}${X(i)},${Y(1 - h.q)}`).join(' ')} fill="none" stroke="#F5A524" strokeWidth="2" strokeDasharray="5 4" />
                </>
              )}
              <text x={30} y={GH - 4} fontSize="10" fill="#8C8F98">
                — {L('тёмные', 'dark')}
              </text>
              <text x={100} y={GH - 4} fontSize="10" fill="#B5651D">
                - - {L('частота аллеля C', 'allele C frequency')}
              </text>
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Среда', 'Environment')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['clean', <Trees key="t" className="w-4 h-4" />, L('Чистый лес', 'Clean forest')],
                  ['soot', <Factory key="f" className="w-4 h-4" />, L('Заводская копоть', 'Factory soot')],
                ] as const
              ).map(([id, icon, label]) => (
                <Button variant="outline" className={`text-sm ${env === id ? 'text-accent font-medium' : 'text-ink-2'}`} key={id} onPress={() => setEnv(id)}>
                  {icon}
                  {label}
                </Button>
              ))}
            </div>
            <label className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                {L('Сколько птиц охотится', 'How many birds hunt')} <span className="font-mono text-ink">{Math.round(strength * 100)}%</span>
              </span>
              <RangeSlider value={strength} onChange={(v) => setStrength(v)} min={0} max={0.9} step={0.05} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-ink-2">
                {L('Частота мутаций', 'Mutation rate')} <span className="font-mono text-ink">{(mu * 100).toFixed(1)}%</span>
              </span>
              <RangeSlider value={mu} onChange={(v) => setMu(v)} min={0} max={0.02} step={0.001} />
            </label>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-sm flex flex-col gap-1.5">
            <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-1">{L('Популяция сейчас', 'Population now')}</h3>
            {[
              ['CC', L('тёмные', 'dark'), cur.CC],
              ['Cc', L('тёмные (носители c)', 'dark (carry c)'), cur.het],
              ['cc', L('светлые', 'light'), cur.cc],
            ].map(([g, label, n]) => (
              <div key={g as string} className="flex justify-between">
                <span className="text-ink-2">
                  <b className="font-mono text-ink">{g}</b> — {label}
                </span>
                <span className="font-mono text-ink">{n}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-1.5 mt-1">
              <span className="text-ink-2">{L('Частоты аллелей', 'Allele frequencies')}</span>
              <span className="font-mono text-ink">
                p(C) = {cur.p.toFixed(2)}, q(c) = {cur.q.toFixed(2)}
              </span>
            </div>
            {phase === 'eaten' && <p className="text-xs text-[#B42318]">{L(`Птицы съели ${moths.filter((m) => m.eaten).length}. Выжившие оставят потомство.`, `Birds ate ${moths.filter((m) => m.eaten).length}. Survivors will breed.`)}</p>}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-sm text-ink-2 flex flex-col gap-2">
            <div className="text-center overflow-x-auto text-ink">
              <Formula tex="p^{2} + 2pq + q^{2} = 1" display />
            </div>
            <p>{L('Закон Харди — Вайнберга: без отбора частоты аллелей не меняются. Отбор их сдвигает. Тёмная окраска (C) доминантна, поэтому светлый аллель c долго прячется в гетерозиготах Cc.', 'Hardy–Weinberg: without selection allele frequencies stay put; selection shifts them. Dark (C) is dominant, so the light allele c hides for a long time in Cc heterozygotes.')}</p>
            <p>{L('Попробуй: доведи тёмных до 90%, потом включи «Чистый лес» — так и было в Англии после законов о чистом воздухе.', 'Try it: get dark moths to 90%, then switch to the clean forest, as happened in England after the clean-air laws.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionLab;
