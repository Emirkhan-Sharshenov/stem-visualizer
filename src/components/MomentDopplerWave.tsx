import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { clamp01, drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentDopplerWaveProps {
  lang: 'ru' | 'en';
}

// the scene (canvas 800×340): a moving source and two listeners, one behind and one ahead
const CY = 170;
const C = 120; // the speed of sound in the drawing, px/s
const F_VIS = 2.2; // wavefronts per second on screen
const F0 = 440; // the real pitch of the source, Hz
const BEHIND = 50;
const AHEAD = 750;
const fmt = (x: number, d: number, ru: boolean) => (ru ? x.toFixed(d).replace('.', ',') : x.toFixed(d));

export const MomentDopplerWave: React.FC<MomentDopplerWaveProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mach, setMach] = useState(0.5);
  const live = useRef({ mach, lang });
  live.current = { mach, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const s = { x: 120, clock: 0, fronts: [] as { x: number; t: number }[], time: 0, flashA: 0, flashB: 0 };

    return runStage(canvas, (dt, _t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const v = L.mach * C;

      if (!still) {
        s.time += dt;
        s.x += v * dt;
        if (s.x > 690 || (v < 1 && s.x > 400)) {
          if (v >= 1) {
            s.x = 110;
            s.fronts = [];
          } else s.x = 400;
        }
        if (v < 1 && s.x < 400) s.x = 400;
        s.clock += dt;
        while (s.clock > 1 / F_VIS) {
          s.clock -= 1 / F_VIS;
          s.fronts.push({ x: s.x, t: s.time });
        }
        // a front reaching a listener makes their ear flash
        for (const f of s.fronts) {
          const r = C * (s.time - f.t);
          const r0 = r - C * dt;
          if (Math.abs(f.x - BEHIND) <= r && Math.abs(f.x - BEHIND) > r0) s.flashA = 1;
          if (Math.abs(AHEAD - f.x) <= r && Math.abs(AHEAD - f.x) > r0) s.flashB = 1;
        }
        s.flashA = Math.max(0, s.flashA - dt * 4);
        s.flashB = Math.max(0, s.flashB - dt * 4);
        s.fronts = s.fronts.filter((f) => C * (s.time - f.t) < 900);
      }

      drawStage(ctx, w, h, { x: s.x, y: CY });

      // the wavefronts: rings of sound spreading from where the source was when it sent them
      for (const f of s.fronts) {
        const r = C * (s.time - f.t);
        const fade = clamp01(1 - r / 800);
        ctx.strokeStyle = `rgba(139,124,255,${0.15 + 0.6 * fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, CY, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.stroke();
      }

      // faster than sound: the rings pile up into a cone, the sonic boom
      if (L.mach > 1.02) {
        const half = Math.asin(1 / L.mach);
        const len = 700;
        ctx.strokeStyle = 'rgba(255,170,90,0.85)';
        ctx.lineWidth = 3;
        for (const d of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s.x, CY);
          ctx.lineTo(s.x - Math.cos(half) * len, CY + d * Math.sin(half) * len);
          ctx.stroke();
        }
        glow(ctx, s.x, CY, 70, '255,170,90', 0.4);
        pill(ctx, 400, 26, ru ? `конус Маха: угол ${Math.round((half * 180) / Math.PI)}° — звуковой удар` : `Mach cone: ${Math.round((half * 180) / Math.PI)}° — sonic boom`, '#FFC46B');
      }

      // the source: a small siren car
      {
        const x = s.x;
        glow(ctx, x, CY, 40, '139,124,255', 0.5);
        ctx.fillStyle = '#E8ECFA';
        ctx.beginPath();
        ctx.roundRect(x - 24, CY - 12, 48, 22, 7);
        ctx.fill();
        ctx.fillStyle = Math.floor(s.time * 6) % 2 ? '#FF5C7A' : '#5FB8FF';
        ctx.beginPath();
        ctx.roundRect(x - 7, CY - 20, 14, 8, 3);
        ctx.fill();
        ctx.fillStyle = '#1B1F2C';
        for (const wx of [x - 14, x + 14]) {
          ctx.beginPath();
          ctx.arc(wx, CY + 12, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (v > 1) {
          ctx.strokeStyle = '#3DD6FF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + 30, CY - 30);
          ctx.lineTo(x + 30 + L.mach * 40, CY - 30);
          ctx.stroke();
        }
      }

      // listeners with ears that flash on every wave
      const ear = (x: number, flash: number, f: number, label: string) => {
        glow(ctx, x, CY, 50, '255,214,120', 0.6 * flash);
        ctx.fillStyle = flash > 0.2 ? '#FFD678' : '#9AA3C7';
        ctx.beginPath();
        ctx.arc(x, CY - 4, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 9, CY + 10, 18, 28);
        pill(ctx, x + (x < 400 ? 4 : -4), CY + 64, label, STAGE.soft, x < 400 ? 'left' : 'right');
        pill(ctx, x + (x < 400 ? 4 : -4), CY + 92, Number.isFinite(f) ? `${Math.round(f)} ${ru ? 'Гц' : 'Hz'}` : '—', '#FFD678', x < 400 ? 'left' : 'right');
      };
      const fBehind = (F0 * C) / (C + v);
      const fAhead = L.mach < 0.999 ? (F0 * C) / (C - v) : Infinity;
      ear(BEHIND, s.flashA, fBehind, ru ? 'позади: ниже' : 'behind: lower');
      ear(AHEAD, s.flashB, fAhead, ru ? 'впереди: выше' : 'ahead: higher');
    });
  }, []);

  const ru = lang === 'ru';
  const v = mach * 340;
  const fAhead = mach < 0.999 ? F0 / (1 - mach) : Infinity;
  const fBehind = F0 / (1 + mach);
  return (
    <SimShell
      badge={ru ? '9–11 класс · Физика' : 'Grades 9–11 · Physics'}
      formula="f′ = f · c / (c ∓ v)"
      title={ru ? 'Эффект Доплера: почему сирена меняет тон, проезжая мимо' : 'The Doppler effect: why a siren changes pitch as it passes'}
      readouts={[
        { label: ru ? 'Скорость источника' : 'Source speed', value: `${Math.round(v)} ${ru ? 'м/с' : 'm/s'}`, color: '#4A3BEB' },
        { label: ru ? 'Сирена' : 'Siren', value: `${F0} ${ru ? 'Гц' : 'Hz'}` },
        { label: ru ? 'Слышно впереди' : 'Heard ahead', value: Number.isFinite(fAhead) ? `${Math.round(fAhead)} ${ru ? 'Гц' : 'Hz'}` : ru ? 'удар' : 'boom', color: '#B7791F' },
        { label: ru ? 'Слышно позади' : 'Heard behind', value: `${Math.round(fBehind)} ${ru ? 'Гц' : 'Hz'}`, color: '#1E88C8' },
      ]}
      controls={[
        {
          label: ru ? 'Скорость в долях скорости звука' : 'Speed as a fraction of the speed of sound',
          value: `${fmt(mach, 2, ru)} c`,
          color: '#4A3BEB',
          input: <RangeSlider value={mach} onChange={setMach} min={0} max={1.6} step={0.05} />,
          hint: ru
            ? 'Впереди волны сжимаются — тон выше, позади растягиваются — тон ниже. При скорости звука все волны догоняют друг друга и складываются в ударную волну.'
            : 'Ahead the waves bunch up and the pitch rises; behind they stretch and it falls. At the speed of sound they all catch up into a shock wave.',
        },
      ]}
      insight={{
        title: ru ? 'Тот же эффект в космосе' : 'The same effect in space',
        text: ru
          ? 'Свет удаляющихся галактик растянут в сторону красного — по этому «красному смещению» Хаббл понял, что Вселенная расширяется.'
          : 'Light from receding galaxies is stretched towards red: from this redshift Hubble realised the Universe is expanding.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={340} className="block w-full h-auto" aria-label={ru ? 'Движущийся источник звука и двое слушателей' : 'A moving sound source and two listeners'} />
    </SimShell>
  );
};
