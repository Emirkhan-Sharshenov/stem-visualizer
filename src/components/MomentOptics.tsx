import { RangeSlider } from './ui/RangeSlider';
import { SimShell } from './ui/SimShell';
import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { drawStage, glow, pill, runStage, STAGE } from '../lib/stage';

interface MomentOpticsProps {
  lang: 'ru' | 'en';
}

type Mode = 'mirror' | 'refract' | 'prism';
type V = [number, number];
const OX = 400;
const OY = 190;
const LEN = 330;
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};
/** Snell's law for a direction d hitting a surface with normal nrm (pointing back towards d); null = total internal reflection */
function refract(d: V, nrm: V, n1: number, n2: number): V | null {
  const r = n1 / n2;
  const c = -dot(nrm, d);
  const k = 1 - r * r * (1 - c * c);
  if (k < 0) return null;
  return norm(add([d[0] * r, d[1] * r], nrm, r * c - Math.sqrt(k)));
}
const reflect = (d: V, nrm: V): V => add(d, nrm, -2 * dot(d, nrm));
/** where the ray p + t·d first crosses segment a–b */
function hit(p: V, d: V, a: V, b: V): number | null {
  const e: V = [b[0] - a[0], b[1] - a[1]];
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((a[0] - p[0]) * e[1] - (a[1] - p[1]) * e[0]) / den;
  const u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den;
  return t > 1e-6 && u >= 0 && u <= 1 ? t : null;
}
// visible colours with an exaggerated dispersion so the fan is easy to see
const SPECTRUM: [number, string][] = [[700, '255,60,60'], [620, '255,140,40'], [580, '255,230,60'], [530, '80,230,90'], [490, '60,200,255'], [450, '80,110,255'], [410, '170,90,255']];
const nGlass = (lam: number) => 1.5 + 14000 / (lam * lam);

export const MomentOptics: React.FC<MomentOpticsProps> = ({ lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>('refract');
  const [angle, setAngle] = useState(40);
  const [n2, setN2] = useState(1.33);
  const [fromBelow, setFromBelow] = useState(false);
  const [shown, setShown] = useState({ out: 0, tir: false, crit: 0 });

  const live = useRef({ mode, angle, n2, fromBelow, lang });
  live.current = { mode, angle, n2, fromBelow, lang };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let report = 0;

    const beam = (pts: V[], rgb: string, a: number, t: number, width = 3) => {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(${rgb},${0.25 * a})`;
      ctx.lineWidth = width + 8;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${a})`;
      ctx.lineWidth = width;
      ctx.stroke();
      // light travelling along the beam
      ctx.strokeStyle = `rgba(255,255,255,${0.55 * a})`;
      ctx.lineWidth = width * 0.6;
      ctx.setLineDash([4, 26]);
      ctx.lineDashOffset = -t * 120;
      ctx.stroke();
      ctx.setLineDash([]);
    };
    const angleArc = (from: number, to: number, r: number, col: string, label: string) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(OX, OY, r, Math.min(from, to), Math.max(from, to));
      ctx.stroke();
      const m = (from + to) / 2;
      ctx.fillStyle = col;
      ctx.font = `600 12px ${STAGE.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, OX + Math.cos(m) * (r + 16), OY + Math.sin(m) * (r + 16));
    };

    return runStage(canvas, (dt, t, still) => {
      const { w, h } = fitCanvas(canvas, ctx);
      const L = live.current;
      const ru = L.lang === 'ru';
      const tt = still ? 0 : t;
      drawStage(ctx, w, h);
      const a = (L.angle * Math.PI) / 180;
      let out = 0;
      let tir = false;
      let crit = 0;

      if (L.mode !== 'prism') {
        const below = L.mode === 'refract' && L.fromBelow;
        const nTop = 1;
        const nBot = L.mode === 'refract' ? L.n2 : 1;
        // the media
        if (L.mode === 'refract') {
          const g = ctx.createLinearGradient(0, OY, 0, h);
          g.addColorStop(0, `rgba(80,160,255,${0.1 + (L.n2 - 1) * 0.12})`);
          g.addColorStop(1, `rgba(40,100,220,${0.18 + (L.n2 - 1) * 0.12})`);
          ctx.fillStyle = g;
          ctx.fillRect(0, OY, w, h - OY);
          ctx.strokeStyle = 'rgba(160,210,255,0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, OY);
          ctx.lineTo(w, OY);
          ctx.stroke();
        } else {
          const g = ctx.createLinearGradient(0, OY, 0, OY + 14);
          g.addColorStop(0, '#E8ECF5');
          g.addColorStop(1, '#7A8296');
          ctx.fillStyle = g;
          ctx.fillRect(110, OY, 580, 12);
          for (let x = 110; x < 690; x += 14) {
            ctx.strokeStyle = 'rgba(160,170,190,0.5)';
            ctx.beginPath();
            ctx.moveTo(x, OY + 12);
            ctx.lineTo(x - 10, OY + 26);
            ctx.stroke();
          }
        }
        // the normal
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.moveTo(OX, 20);
        ctx.lineTo(OX, h - 20);
        ctx.stroke();
        ctx.setLineDash([]);

        const n1 = below ? nBot : nTop;
        const n2b = below ? nTop : nBot;
        const src: V = below ? [OX - Math.sin(a) * LEN, OY + Math.cos(a) * LEN] : [OX - Math.sin(a) * LEN, OY - Math.cos(a) * LEN];
        const d = norm([OX - src[0], OY - src[1]]);
        const nrm: V = below ? [0, 1] : [0, -1];
        const refl = reflect(d, nrm);
        const refr = L.mode === 'refract' ? refract(d, nrm, n1, n2b) : null;
        // how much light is reflected (Schlick's approximation of Fresnel)
        const R0 = ((n1 - n2b) / (n1 + n2b)) ** 2;
        const cosI = Math.cos(a);
        let R = L.mode === 'mirror' ? 1 : R0 + (1 - R0) * (1 - cosI) ** 5;
        if (L.mode === 'refract' && !refr) R = 1;
        tir = L.mode === 'refract' && !refr;
        if (n1 > n2b) crit = (Math.asin(n2b / n1) * 180) / Math.PI;

        // the laser
        ctx.save();
        ctx.translate(src[0], src[1]);
        ctx.rotate(Math.atan2(d[1], d[0]));
        ctx.fillStyle = '#3A4058';
        ctx.beginPath();
        ctx.roundRect(-34, -9, 40, 18, 5);
        ctx.fill();
        ctx.fillStyle = '#FF5C7A';
        ctx.fillRect(4, -4, 4, 8);
        ctx.restore();
        beam([src, [OX, OY]], '255,90,110', 1, tt);
        beam([[OX, OY], add([OX, OY], refl, LEN)], '255,90,110', Math.max(0.15, R), tt);
        if (refr) beam([[OX, OY], add([OX, OY], refr, LEN)], '255,90,110', 1 - R * 0.8, tt);
        glow(ctx, OX, OY, 30, '255,120,140', 0.7);
        const inc = Math.atan2(-d[1], -d[0]);
        const normUp = below ? Math.PI / 2 : -Math.PI / 2;
        angleArc(normUp, inc, 46, '#FFB3C0', `${Math.round(L.angle)}°`);
        if (refr) {
          const outAng = Math.atan2(refr[1], refr[0]);
          out = (Math.acos(Math.abs(refr[1])) * 180) / Math.PI;
          angleArc(below ? -Math.PI / 2 : Math.PI / 2, outAng, 58, '#9FD8FF', `${Math.round(out)}°`);
        } else if (L.mode === 'mirror') out = L.angle;
        if (L.mode === 'mirror') pill(ctx, OX, 30, ru ? 'угол падения = углу отражения' : 'angle of incidence = angle of reflection', STAGE.ink);
        else if (tir) pill(ctx, OX, 30, ru ? `полное внутреннее отражение: угол больше ${Math.round(crit)}°` : `total internal reflection: past ${Math.round(crit)}°`, '#FFC46B');
        else pill(ctx, OX, 30, `n₁·sin α = n₂·sin β`, STAGE.ink);
        if (L.mode === 'refract') {
          pill(ctx, 70, OY - 22, ru ? 'воздух n = 1' : 'air n = 1', STAGE.soft, 'left');
          pill(ctx, 70, OY + 24, `${ru ? 'среда' : 'medium'} n = ${L.n2.toFixed(2)}`, '#9FD8FF', 'left');
        }
      } else {
        // a glass prism splitting white light
        const A: V = [420, 70];
        const B: V = [300, 290];
        const Cc: V = [540, 290];
        const g = ctx.createLinearGradient(B[0], 0, Cc[0], 0);
        g.addColorStop(0, 'rgba(200,220,255,0.14)');
        g.addColorStop(1, 'rgba(200,220,255,0.06)');
        ctx.fillStyle = g;
        ctx.strokeStyle = 'rgba(220,235,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.lineTo(Cc[0], Cc[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const P: V = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        const outward = norm([-(B[1] - A[1]), B[0] - A[0]]); // left face, pointing out of the glass
        const inn: V = [-outward[0], -outward[1]];
        const ca = Math.cos(-a);
        const sa = Math.sin(-a);
        const d: V = norm([inn[0] * ca - inn[1] * sa, inn[0] * sa + inn[1] * ca]);
        const src = add(P, d, -300);
        beam([src, P], '255,255,255', 1, tt, 4);
        let spread = 0;
        for (const [lam, rgb] of SPECTRUM) {
          const n = nGlass(lam);
          const d1 = refract(d, outward, 1, n);
          if (!d1) continue;
          const tAC = hit(P, d1, A, Cc);
          const tBC = hit(P, d1, B, Cc);
          const t1 = tAC ?? tBC;
          if (t1 === null) continue;
          const Q = add(P, d1, t1);
          const face = tAC !== null ? [A, Cc] : [B, Cc];
          const fo = norm([face[1][1] - face[0][1], -(face[1][0] - face[0][0])]);
          const outN: V = dot(fo, d1) > 0 ? [-fo[0], -fo[1]] : fo;
          const d2 = refract(d1, outN, n, 1);
          beam([P, Q], rgb, 0.6, tt, 1.6);
          if (d2) {
            beam([Q, add(Q, d2, 360)], rgb, 0.95, tt, 2.4);
            spread = Math.max(spread, Math.atan2(d2[1], d2[0]));
          } else {
            tir = true;
            beam([Q, add(Q, reflect(d1, outN), 160)], rgb, 0.6, tt, 1.6);
          }
        }
        pill(ctx, 400, 30, tir ? (ru ? 'часть света отражается внутри призмы' : 'some light reflects inside the prism') : ru ? 'фиолетовый преломляется сильнее красного' : 'violet bends more than red', tir ? '#FFC46B' : STAGE.ink);
        pill(ctx, 120, 350, ru ? 'дисперсия увеличена для наглядности' : 'dispersion exaggerated for clarity', STAGE.soft);
        void spread;
      }

      report += still ? 1 : dt;
      if (report > 0.1) {
        report = 0;
        setShown({ out, tir, crit });
      }
    });
  }, []);

  const ru = lang === 'ru';
  return (
    <SimShell
      badge={ru ? '8–11 класс · Физика' : 'Grades 8–11 · Physics'}
      formula={mode === 'mirror' ? 'α = γ' : 'n₁ sin α = n₂ sin β'}
      title={ru ? 'Лучи света: отражение, преломление и дисперсия' : 'Light rays: reflection, refraction and dispersion'}
      actions={
        <>
          {(['mirror', 'refract', 'prism'] as Mode[]).map((m) => (
            <Button key={m} variant={mode === m ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setMode(m)}>
              {m === 'mirror' ? (ru ? 'Зеркало' : 'Mirror') : m === 'refract' ? (ru ? 'Преломление' : 'Refraction') : ru ? 'Призма' : 'Prism'}
            </Button>
          ))}
          {mode === 'refract' && (
            <Button variant={fromBelow ? 'primary' : 'outline'} size="sm" className="font-semibold" onPress={() => setFromBelow(!fromBelow)}>
              {ru ? 'Из воды в воздух' : 'Water to air'}
            </Button>
          )}
        </>
      }
      readouts={[
        { label: ru ? 'Угол падения' : 'Angle in', value: `${angle}°`, color: '#D9534F' },
        { label: mode === 'mirror' ? (ru ? 'Угол отражения' : 'Angle out') : ru ? 'Угол преломления' : 'Angle refracted', value: mode === 'prism' ? '—' : shown.tir ? (ru ? 'нет' : 'none') : `${Math.round(shown.out)}°`, color: '#1E88C8' },
        ...(mode === 'refract' && fromBelow ? [{ label: ru ? 'Предельный угол' : 'Critical angle', value: `${Math.round(shown.crit)}°`, color: '#B7791F' }] : []),
      ]}
      controls={[
        { label: ru ? 'Угол падения' : 'Angle of incidence', value: `${angle}°`, color: '#D9534F', input: <RangeSlider value={angle} onChange={setAngle} min={0} max={mode === 'prism' ? 60 : 85} /> },
        ...(mode === 'refract'
          ? [
              {
                label: ru ? 'Показатель преломления среды' : 'Refractive index of the medium',
                value: ru ? n2.toFixed(2).replace('.', ',') : n2.toFixed(2),
                color: '#1E88C8',
                input: <RangeSlider value={n2} onChange={setN2} min={1} max={2.42} step={0.01} />,
                hint: ru ? 'Вода 1,33, стекло 1,5, алмаз 2,42. Чем больше n, тем сильнее луч прижимается к нормали.' : 'Water 1.33, glass 1.5, diamond 2.42. The larger n, the more the ray bends towards the normal.',
              },
            ]
          : []),
      ]}
      insight={{
        title: ru ? 'Попробуй' : 'Try this',
        text: ru
          ? 'Включи «Из воды в воздух» и увеличивай угол: после предельного угла свет перестаёт выходить и целиком отражается. Так свет бежит по оптоволокну. Алмаз блестит потому, что у него предельный угол всего 24°.'
          : 'Turn on “Water to air” and raise the angle: past the critical angle no light gets out and it all reflects. That is how light runs along optical fibre, and why a diamond, with a critical angle of just 24°, sparkles.',
      }}
    >
      <canvas ref={canvasRef} width={800} height={380} className="block w-full h-auto" aria-label={ru ? 'Лазерный луч, зеркало, граница сред и призма' : 'A laser beam, a mirror, an interface and a prism'} />
    </SimShell>
  );
};
