import { Formula } from './Formula';
import React, { useEffect, useRef, useState } from 'react';
import { fitCanvas } from '../lib/canvas';
import { Play, Pause, RotateCcw, Info, Sliders, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { SimEngineType } from '../types/stem';

interface PhysicsLaboratoryEngineProps {
  engineType: SimEngineType;
  title: string;
  formula?: string;
  lang: 'ru' | 'en';
  initialParams?: Record<string, any>;
}

type ExperimentId = 
  | 'kinematics'
  | 'hooke'
  | 'archimedes'
  | 'lenses'
  | 'mkt'
  | 'photoelectric'
  | 'friction'
  | 'rutherford';

export const PhysicsLaboratoryEngine: React.FC<PhysicsLaboratoryEngineProps> = ({
  engineType,
  title,
  formula,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slider1, setSlider1] = useState<number>(50); // Primary param
  const [slider2, setSlider2] = useState<number>(50); // Secondary param
  const [speed, setSpeed] = useState<number>(1.0);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Map incoming engineType to active experiment
  const mapEngineToExperiment = (type: SimEngineType): ExperimentId => {
    if (type === 'hooke_spring') return 'hooke';
    if (type === 'archimedes_buoyancy' || type === 'pascal_vessels' || type === 'hydraulic_press') return 'archimedes';
    if (type === 'lenses_ray_tracing' || type === 'light_reflection_mirror' || type === 'eye_optics_vision') return 'lenses';
    if (type === 'mkt_ideal_gas_laws' || type === 'thermodynamics_first_law' || type === 'heat_engines_carnot') return 'mkt';
    if (type === 'photoelectric_effect' || type === 'bohr_atom_lasers') return 'photoelectric';
    if (type === 'friction_dynamometer') return 'friction';
    if (type === 'rutherford_alpha_atom' || type === 'nuclear_fission_reactor') return 'rutherford';
    return 'kinematics';
  };

  const [activeExp, setActiveExp] = useState<ExperimentId>(() => mapEngineToExperiment(engineType));

  // Sync if prop changes
  useEffect(() => {
    setActiveExp(mapEngineToExperiment(engineType));
  }, [engineType]);

  // Helper function to draw rounded pill label with shadow
  const drawTag = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    bgColor: string,
    textColor: string = '#ffffff'
  ) => {
    if (!showLabels) return;
    ctx.save();
    ctx.font = 'bold 10px monospace';
    const textW = ctx.measureText(text).width;
    const padX = 7;
    const padY = 4;
    const h = 18;
    const w = textW + padX * 2;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x - padX, y - h + 2, w, h, [4]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y - 2);
    ctx.restore();
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const { w, h } = fitCanvas(canvas, ctx);

      // Dark sci-fi background with subtle grid
      ctx.fillStyle = '#111214';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#17181B';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      if (isPlaying) {
        t += 0.03 * speed;
      }

      const cx = w / 2;
      const cy = h / 2;

      // =========================================================================
      // 1. KINEMATICS & VELOCITY (Равноускоренное движение и скорость)
      // =========================================================================
      if (activeExp === 'kinematics') {
        const accel = (slider1 - 20) / 10; // m/s^2 (-1.0 to 8.0)
        const mass = Math.round(slider2 * 20); // kg
        const currentV = Math.abs(accel * (t % 8));
        const carPos = 70 + ((t * (slider1 / 20) * 22) % (w - 140));

        // Road with asphalt dashed line
        ctx.strokeStyle = '#34363C';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(40, cy + 45);
        ctx.lineTo(w - 40, cy + 45);
        ctx.stroke();

        ctx.strokeStyle = '#e2e8f0';
        ctx.setLineDash([12, 12]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, cy + 45);
        ctx.lineTo(w - 40, cy + 45);
        ctx.stroke();
        ctx.setLineDash([]);

        // Mileage tick marks with explicit labels
        for (let m = 60; m < w - 40; m += 70) {
          ctx.strokeStyle = '#4A4D55';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(m, cy + 45);
          ctx.lineTo(m, cy + 57);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(`${(m - 60) / 7}м`, m - 8, cy + 70);
        }

        // Car Body
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(carPos - 35, cy + 10, 70, 26, [6]);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(carPos + 5, cy + 13, 20, 12, [3]);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#17181B';
        ctx.beginPath();
        ctx.arc(carPos - 20, cy + 39, 8, 0, Math.PI * 2);
        ctx.arc(carPos + 20, cy + 39, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Velocity Vector Arrow (Green)
        const vLen = Math.min(110, currentV * 12 + 15);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(carPos + 35, cy + 23);
        ctx.lineTo(carPos + 35 + vLen, cy + 23);
        ctx.stroke();
        // Arrow head
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(carPos + 35 + vLen + 8, cy + 23);
        ctx.lineTo(carPos + 35 + vLen, cy + 17);
        ctx.lineTo(carPos + 35 + vLen, cy + 29);
        ctx.fill();

        // Acceleration Vector Arrow (Blue, below)
        if (Math.abs(accel) > 0.1) {
          const aLen = accel * 14;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(carPos, cy - 8);
          ctx.lineTo(carPos + aLen, cy - 8);
          ctx.stroke();
        }

        // On-screen Element Tags
        drawTag(ctx, `Автомобиль m = ${mass} кг`, carPos - 35, cy + 5, 'rgba(2, 132, 199, 0.85)');
        drawTag(ctx, `Скорость v = ${currentV.toFixed(1)} м/с`, carPos + 35, cy + 20, 'rgba(34, 197, 94, 0.85)');
        drawTag(ctx, `Ускорение a = ${accel.toFixed(1)} м/с²`, 60, cy - 60, 'rgba(56, 189, 248, 0.85)');
        drawTag(ctx, `Пройденный путь: s = v₀t + at²/2`, 60, cy - 35, 'rgba(23, 24, 27, 0.9)');
      }

      // =========================================================================
      // 2. HOOKE'S LAW & SPRING (Закон Гука: F = -k·Δx)
      // =========================================================================
      else if (activeExp === 'hooke') {
        const kRigidity = slider1 * 5; // N/m (250 to 500)
        const stretchPx = ((slider2 - 50) / 50) * 90; // px stretch (-90 to +90)
        const restX = cx - 40;
        const massX = restX + stretchPx;

        // Fixed Wall Mount
        ctx.fillStyle = '#4A4D55';
        ctx.fillRect(50, cy - 70, 24, 140);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, cy - 70, 24, 140);

        // Spring coils
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(74, cy);
        const coils = 14;
        const coilStep = (massX - 74) / coils;
        for (let c = 0; c < coils; c++) {
          const xCoil = 74 + c * coilStep;
          const yOffset = c % 2 === 0 ? -20 : 20;
          ctx.lineTo(xCoil + coilStep / 2, cy + yOffset);
        }
        ctx.lineTo(massX, cy);
        ctx.stroke();

        // Mass Block
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(massX, cy - 30, 60, 60, [6]);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Equilibrium reference dotted line (x = 0)
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(restX, cy - 80);
        ctx.lineTo(restX, cy + 80);
        ctx.stroke();
        ctx.setLineDash([]);

        // Restoring Force Vector (Red arrow pointing back to restX)
        const deltaX_m = stretchPx / 100; // meters
        const restoringForce = -kRigidity * deltaX_m;
        if (Math.abs(stretchPx) > 4) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(massX + 30, cy);
          ctx.lineTo(massX + 30 + restoringForce * 0.4, cy);
          ctx.stroke();
          // Arrow head
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          const headX = massX + 30 + restoringForce * 0.4;
          const dir = restoringForce > 0 ? 1 : -1;
          ctx.moveTo(headX + dir * 8, cy);
          ctx.lineTo(headX, cy - 6);
          ctx.lineTo(headX, cy + 6);
          ctx.fill();
        }

        // On-screen Element Tags
        drawTag(ctx, 'Неподвижная опора', 50, cy - 75, 'rgba(71, 85, 105, 0.9)');
        drawTag(ctx, `Пружина k = ${kRigidity} Н/м`, (74 + massX) / 2 - 40, cy - 30, 'rgba(51, 65, 85, 0.9)');
        drawTag(ctx, `Груз m`, massX + 10, cy - 35, 'rgba(217, 119, 6, 0.9)');
        drawTag(ctx, `Равновесие (x = 0)`, restX - 45, cy + 95, 'rgba(2, 132, 199, 0.9)');
        drawTag(ctx, `Сила упругости F_упр = ${Math.abs(restoringForce).toFixed(1)} Н`, cx - 60, cy - 90, 'rgba(239, 68, 68, 0.9)');
        drawTag(ctx, `Деформация Δx = ${(stretchPx / 2).toFixed(1)} см`, cx - 50, cy + 115, 'rgba(56, 189, 248, 0.9)');
      }

      // =========================================================================
      // 3. ARCHIMEDES BUOYANCY (Закон Архимеда и плавание тел)
      // =========================================================================
      else if (activeExp === 'archimedes') {
        const liquidDensity = Math.round(slider1 * 20); // 200 to 2000 kg/m3 (water=1000)
        const bodyDensity = Math.round(slider2 * 25); // 250 to 2500 kg/m3
        const tankX = cx - 140;
        const tankY = cy - 80;
        const tankW = 280;
        const tankH = 180;
        const waterSurfaceY = tankY + 40;

        // Water in tank
        ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
        ctx.fillRect(tankX, waterSurfaceY, tankW, tankH - 40);

        // Glass Tank Outline
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.strokeRect(tankX, tankY, tankW, tankH);

        // Buoyancy calculation
        const isFloater = bodyDensity <= liquidDensity;
        const submersionFrac = Math.min(1.0, bodyDensity / liquidDensity);
        const blockW = 60;
        const blockH = 60;

        const blockY = isFloater
          ? waterSurfaceY - (1 - submersionFrac) * blockH
          : tankY + tankH - blockH; // bottom

        // Floating/Sinking Block
        ctx.fillStyle = isFloater ? '#d97706' : '#64748b';
        ctx.fillRect(cx - blockW / 2, blockY, blockW, blockH);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - blockW / 2, blockY, blockW, blockH);

        // Vector: Gravity Down (Red)
        const fGravLen = 35;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, blockY + blockH / 2);
        ctx.lineTo(cx, blockY + blockH / 2 + fGravLen);
        ctx.stroke();

        // Vector: Buoyancy Up (Cyan)
        const fArchLen = isFloater ? fGravLen : (liquidDensity / bodyDensity) * fGravLen;
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(cx, blockY + blockH / 2);
        ctx.lineTo(cx, blockY + blockH / 2 - fArchLen);
        ctx.stroke();

        // On-screen Element Tags
        drawTag(ctx, `Жидкость (ρ_ж = ${liquidDensity} кг/м³)`, tankX + 15, waterSurfaceY + 20, 'rgba(2, 132, 199, 0.85)');
        drawTag(ctx, `Тело (ρ = ${bodyDensity} кг/м³)`, cx - 50, blockY - 10, isFloater ? 'rgba(217, 119, 6, 0.9)' : 'rgba(100, 116, 139, 0.9)');
        drawTag(ctx, `F_арх = ρ_ж·g·V`, cx + 35, blockY + 10, 'rgba(56, 189, 248, 0.9)');
        drawTag(ctx, `F_тяж = m·g`, cx + 35, blockY + 45, 'rgba(239, 68, 68, 0.9)');
        drawTag(
          ctx,
          isFloater ? 'Тело плавает (F_арх = mg)' : 'Тело тонет на дно (mg > F_арх)',
          cx - 85,
          tankY + tankH + 24,
          isFloater ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'
        );
      }

      // =========================================================================
      // 4. LENSES & OPTICS (Тонкая собирающая линза и построение лучей)
      // =========================================================================
      else if (activeExp === 'lenses') {
        const F = 60 + (slider1 / 100) * 50; // Focal length
        const d = 80 + (slider2 / 100) * 110; // Object distance
        const hObj = 45;

        // Optical Axis
        ctx.strokeStyle = '#4A4D55';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(30, cy);
        ctx.lineTo(w - 30, cy);
        ctx.stroke();

        // Convex Lens in Center
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 90);
        ctx.lineTo(cx, cy + 90);
        ctx.stroke();
        // Lens double arrows
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 80);
        ctx.lineTo(cx, cy - 90);
        ctx.lineTo(cx + 8, cy - 80);
        ctx.moveTo(cx - 8, cy + 80);
        ctx.lineTo(cx, cy + 90);
        ctx.lineTo(cx + 8, cy + 80);
        ctx.stroke();

        // Focal Points F, 2F, F', 2F'
        const points = [
          { x: cx - F, label: 'F' },
          { x: cx - 2 * F, label: '2F' },
          { x: cx + F, label: "F'" },
          { x: cx + 2 * F, label: "2F'" },
        ];
        points.forEach((p) => {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(p.x, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '10px monospace';
          ctx.fillText(p.label, p.x - 6, cy + 18);
        });

        // Object Arrow (Left, Red)
        const objX = cx - d;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX, cy);
        ctx.lineTo(objX, cy - hObj);
        ctx.stroke();
        // Object arrow head
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(objX, cy - hObj);
        ctx.lineTo(objX - 5, cy - hObj + 10);
        ctx.lineTo(objX + 5, cy - hObj + 10);
        ctx.fill();

        // Lens formula: 1/f = 1/F - 1/d  => f = (F*d)/(d - F)
        if (d > F) {
          const imgD = (F * d) / (d - F);
          const imgH = -(hObj * imgD) / d;
          const imgX = cx + imgD;

          // Ray 1: Parallel to axis, refracts through F'
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(objX, cy - hObj);
          ctx.lineTo(cx, cy - hObj);
          ctx.lineTo(imgX, cy - imgH);
          ctx.stroke();

          // Ray 2: Passes straight through Optical Center O
          ctx.strokeStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(objX, cy - hObj);
          ctx.lineTo(imgX, cy - imgH);
          ctx.stroke();

          // Inverted Real Image (Green)
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(imgX, cy);
          ctx.lineTo(imgX, cy - imgH);
          ctx.stroke();
          // Image arrow head
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(imgX, cy - imgH);
          ctx.lineTo(imgX - 5, cy - imgH - 10);
          ctx.lineTo(imgX + 5, cy - imgH - 10);
          ctx.fill();

          drawTag(ctx, 'Действительное перевернутое изображение', imgX - 60, cy - imgH + 20, 'rgba(34, 197, 94, 0.9)');
        }

        // On-screen Element Tags
        drawTag(ctx, `Собирающая линза (F = ${F.toFixed(0)} мм)`, cx - 60, cy - 98, 'rgba(2, 132, 199, 0.9)');
        drawTag(ctx, `Светящийся предмет`, objX - 45, cy - hObj - 12, 'rgba(239, 68, 68, 0.9)');
        drawTag(ctx, 'Луч 1: Параллелен оси → через фокус F\'', 40, cy - 90, 'rgba(34, 197, 94, 0.85)');
        drawTag(ctx, 'Луч 2: Через оптический центр без преломления', 40, cy - 70, 'rgba(234, 179, 8, 0.85)');
      }

      // =========================================================================
      // 5. IDEAL GAS & MKT (Идеальный газ: поршень, молекулы, уравнение Менделеева)
      // =========================================================================
      else if (activeExp === 'mkt') {
        const tempK = Math.round(slider1 * 4 + 100); // 100 to 500 K
        const volFrac = slider2 / 100; // 0.1 to 1.0
        const cylW = 120 + volFrac * 180;
        const cylH = 140;
        const cylX = cx - 140;
        const cylY = cy - 70;

        // Cylinder Body
        ctx.fillStyle = '#17181B';
        ctx.fillRect(cylX, cylY, cylW, cylH);
        ctx.strokeStyle = '#4A4D55';
        ctx.lineWidth = 4;
        ctx.strokeRect(cylX, cylY, 320, cylH);

        // Movable Piston
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cylX + cylW, cylY, 18, cylH);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cylX + cylW + 18, cy - 8, 80, 16);

        // Bouncing Gas Molecules
        const molSpeed = Math.sqrt(tempK / 250) * 3.5;
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < 30; i++) {
          const mx = cylX + 10 + ((i * 47 + t * 40 * molSpeed) % (cylW - 20));
          const my = cylY + 10 + ((i * 31 + Math.sin(t + i) * 35 + 50) % (cylH - 20));
          ctx.beginPath();
          ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        const pressureAtm = ((tempK * 0.8) / cylW).toFixed(2);

        // On-screen Element Tags
        drawTag(ctx, `Цилиндр с газом`, cylX + 10, cylY - 12, 'rgba(23, 24, 27, 0.9)');
        drawTag(ctx, `Подвижный поршень`, cylX + cylW - 10, cylY - 12, 'rgba(100, 116, 139, 0.9)');
        drawTag(ctx, `Температура T = ${tempK} K (${tempK - 273}°C)`, cylX + 10, cylY + cylH + 24, 'rgba(217, 119, 6, 0.9)');
        drawTag(ctx, `Давление p = ${pressureAtm} атм`, cylX + 160, cylY + cylH + 24, 'rgba(239, 68, 68, 0.9)');
        drawTag(ctx, 'Молекулы в хаотическом броуновском движении', cx - 110, cy - 85, 'rgba(56, 189, 248, 0.85)');
      }

      // =========================================================================
      // 6. PHOTOELECTRIC EFFECT (Фотоэффект: hν = A + Ek)
      // =========================================================================
      else if (activeExp === 'photoelectric') {
        const photonEnergyEv = 1.5 + (slider1 / 100) * 3.5; // 1.5 to 5.0 eV
        const workFunctionEv = 1.8 + (slider2 / 100) * 1.5; // 1.8 to 3.3 eV
        const hasEmission = photonEnergyEv >= workFunctionEv;
        const eKineticEv = Math.max(0, photonEnergyEv - workFunctionEv);

        const plateX = cx - 130;
        const plateY = cy - 40;
        const plateW = 260;
        const plateH = 22;

        // Metal Cathode Plate
        ctx.fillStyle = '#4A4D55';
        ctx.fillRect(plateX, plateY, plateW, plateH);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(plateX, plateY, plateW, plateH);

        // Incoming Photons
        const photonColor = photonEnergyEv > 3.2 ? '#a855f7' : photonEnergyEv > 2.4 ? '#22c55e' : '#ef4444';
        ctx.fillStyle = photonColor;
        ctx.shadowColor = photonColor;
        ctx.shadowBlur = 8;
        for (let i = 0; i < 5; i++) {
          const offset = (t * 50 + i * 40) % 140;
          const px = plateX + 30 + i * 45 - offset * 0.3;
          const py = plateY - 100 + offset;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Emitted photoelectrons flying upward
        if (hasEmission) {
          ctx.fillStyle = '#38bdf8';
          for (let i = 0; i < 5; i++) {
            const offset = (t * 35 * Math.sqrt(eKineticEv) + i * 30) % 100;
            const ex = plateX + 35 + i * 45;
            const ey = plateY - 5 - offset;
            ctx.beginPath();
            ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // On-screen Element Tags
        drawTag(ctx, `Входящие кванты света hν = ${photonEnergyEv.toFixed(2)} эВ`, cx - 110, cy - 110, photonColor);
        drawTag(ctx, `Металл-катод (Работа выхода А = ${workFunctionEv.toFixed(2)} эВ)`, plateX, plateY + 38, 'rgba(71, 85, 105, 0.9)');
        drawTag(
          ctx,
          hasEmission
            ? `Фототок ЕСТЬ! E_кин = ${eKineticEv.toFixed(2)} эВ`
            : `Фотоэффекта НЕТ (частота ниже красной границы)`,
          cx - 100,
          cy + 75,
          hasEmission ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'
        );
      }

      // =========================================================================
      // 7. FRICTION & DYNAMOMETER
      // =========================================================================
      else if (activeExp === 'friction') {
        const mu = (slider1 / 100) * 0.8; // friction coeff
        const normalForce = slider2 * 2; // N
        const frictionForce = mu * normalForce;
        const blockX = cx - 40;

        // Table Surface
        ctx.strokeStyle = '#4A4D55';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(60, cy + 40);
        ctx.lineTo(w - 60, cy + 40);
        ctx.stroke();

        // Wooden Block
        ctx.fillStyle = '#d97706';
        ctx.fillRect(blockX, cy - 20, 80, 60);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(blockX, cy - 20, 80, 60);

        // Forces vectors: Normal N up, mg down, Friction left, Pull right
        // Normal N
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx, cy - 50);
        ctx.stroke();

        // Gravity mg
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx, cy + 70);
        ctx.stroke();

        // Friction Left
        ctx.strokeStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(blockX, cy + 30);
        ctx.lineTo(blockX - frictionForce * 0.6, cy + 30);
        ctx.stroke();

        // On-screen Element Tags
        drawTag(ctx, `Деревянный брусок`, blockX, cy - 28, 'rgba(217, 119, 6, 0.9)');
        drawTag(ctx, `Сила реакции опоры N = ${normalForce} Н`, cx - 60, cy - 58, 'rgba(56, 189, 248, 0.9)');
        drawTag(ctx, `Сила тяжести mg = ${normalForce} Н`, cx - 50, cy + 85, 'rgba(239, 68, 68, 0.9)');
        drawTag(ctx, `Сила трения F_тр = μN = ${frictionForce.toFixed(1)} Н`, blockX - 110, cy + 10, 'rgba(234, 179, 8, 0.9)');
        drawTag(ctx, `Коэффициент трения μ = ${mu.toFixed(2)}`, cx - 60, cy + 115, 'rgba(23, 24, 27, 0.9)');
      }

      // =========================================================================
      // 8. RUTHERFORD SCATTERING (Опыт Резерфорда: открытие атомного ядра)
      // =========================================================================
      else {
        const nucleusZ = Math.round(slider1 * 0.8 + 20); // Z=20 to 100
        const alphaEnergy = slider2 * 0.1 + 2; // MeV

        // Heavy Gold Nucleus at Center (Z e+)
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Alpha particles flying past nucleus and scattering by Coulomb law
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < 8; i++) {
          const impactParam = (i - 3.5) * 20; // b
          const progress = ((t * 40 * alphaEnergy + i * 35) % (w + 100)) - 50;
          const px = 60 + progress;
          const distToNucleus = Math.hypot(px - cx, impactParam);
          const deflection = (nucleusZ * 30) / (distToNucleus * alphaEnergy);
          const py = cy + impactParam + (px > cx - 30 ? (impactParam > 0 ? deflection : -deflection) : 0);

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // On-screen Element Tags
        drawTag(ctx, `Золотое ядро атома (Заряд +${nucleusZ}e)`, cx - 75, cy - 22, 'rgba(217, 119, 6, 0.95)');
        drawTag(ctx, `Поток α-частиц (Ядра гелия ⁴He²⁺)`, 60, cy - 70, 'rgba(56, 189, 248, 0.9)');
        drawTag(ctx, `Кулоновское отталкивание F = k·(q₁q₂)/r²`, cx - 90, cy + 70, 'rgba(239, 68, 68, 0.9)');
        drawTag(ctx, `99.9% частиц летят насквозь, доказывая пустоту атома!`, cx - 110, cy + 95, 'rgba(34, 197, 94, 0.9)');
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [activeExp, slider1, slider2, isPlaying, speed, showLabels]);

  const experimentsList: { id: ExperimentId; labelRu: string; labelEn: string }[] = [
    { id: 'kinematics', labelRu: 'Кинематика и скорость', labelEn: 'Kinematics & Velocity' },
    { id: 'hooke', labelRu: 'Закон Гука (Пружина)', labelEn: "Hooke's Law (Spring)" },
    { id: 'archimedes', labelRu: 'Закон Архимеда (Плавание)', labelEn: "Archimedes' Buoyancy" },
    { id: 'lenses', labelRu: 'Тонкая линза (Лучи)', labelEn: 'Thin Lens Optics' },
    { id: 'mkt', labelRu: 'Идеальный газ и МКТ', labelEn: 'Ideal Gas Laws' },
    { id: 'photoelectric', labelRu: 'Фотоэффект Эйнштейна', labelEn: 'Photoelectric Effect' },
    { id: 'friction', labelRu: 'Сила трения (Динамометр)', labelEn: 'Friction Force' },
    { id: 'rutherford', labelRu: 'Опыт Резерфорда (Ядро)', labelEn: "Rutherford Atom" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              {lang === 'ru' ? 'Лаборатория физических моментов' : 'Physical Moments Lab'}
            </span>
            {formula && (
              <span className="text-sm text-slate-300">
                <Formula tex={formula} />
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">{title}</h3>
        </div>

        {/* Controls: Play/Pause, Reset, Labels Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showLabels
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {showLabels
              ? (lang === 'ru' ? 'Подписи элементов ВКЛ' : 'Labels ON')
              : (lang === 'ru' ? 'Подписи элементов ВЫКЛ' : 'Labels OFF')}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            title={isPlaying ? 'Пауза' : 'Пуск'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              setSlider1(50);
              setSlider2(50);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            title={lang === 'ru' ? 'Сброс' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Experiment Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
          {lang === 'ru' ? 'Опыты:' : 'Experiments:'}
        </span>
        {experimentsList.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setActiveExp(exp.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
              activeExp === exp.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {lang === 'ru' ? exp.labelRu : exp.labelEn}
          </button>
        ))}
      </div>

      {/* Main Canvas Viewport */}
      <div className="lab-stage relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-inner">
        <canvas ref={canvasRef} width={800} height={300} className="block w-full h-auto max-h-[480px] object-contain" />
      </div>

      {/* Interactive Controls with Clear Descriptive Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {activeExp === 'kinematics'
                ? (lang === 'ru' ? 'Ускорение движения a:' : 'Acceleration a:')
                : activeExp === 'hooke'
                ? (lang === 'ru' ? 'Жесткость пружины k:' : 'Spring Rigidity k:')
                : activeExp === 'archimedes'
                ? (lang === 'ru' ? 'Плотность жидкости ρ_ж:' : 'Fluid Density ρ_f:')
                : activeExp === 'lenses'
                ? (lang === 'ru' ? 'Фокусное расстояние линзы F:' : 'Focal Length F:')
                : activeExp === 'mkt'
                ? (lang === 'ru' ? 'Температура газа T:' : 'Gas Temperature T:')
                : activeExp === 'photoelectric'
                ? (lang === 'ru' ? 'Энергия фотона hν:' : 'Photon Energy hν:')
                : activeExp === 'friction'
                ? (lang === 'ru' ? 'Коэффициент трения μ:' : 'Friction Coefficient μ:')
                : (lang === 'ru' ? 'Заряд атомного ядра Z:' : 'Nuclear Charge Z:')}
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {activeExp === 'kinematics'
                ? `${((slider1 - 20) / 10).toFixed(1)} м/с²`
                : activeExp === 'hooke'
                ? `${slider1 * 5} Н/м`
                : activeExp === 'archimedes'
                ? `${Math.round(slider1 * 20)} кг/м³`
                : activeExp === 'lenses'
                ? `${(60 + (slider1 / 100) * 50).toFixed(0)} мм`
                : activeExp === 'mkt'
                ? `${Math.round(slider1 * 4 + 100)} K`
                : activeExp === 'photoelectric'
                ? `${(1.5 + (slider1 / 100) * 3.5).toFixed(2)} эВ`
                : activeExp === 'friction'
                ? `${((slider1 / 100) * 0.8).toFixed(2)}`
                : `+${Math.round(slider1 * 0.8 + 20)}e`}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={slider1}
            onChange={(e) => setSlider1(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {activeExp === 'kinematics'
                ? (lang === 'ru' ? 'Масса тела m:' : 'Body Mass m:')
                : activeExp === 'hooke'
                ? (lang === 'ru' ? 'Деформация пружины Δx:' : 'Spring Deformation Δx:')
                : activeExp === 'archimedes'
                ? (lang === 'ru' ? 'Плотность тела ρ_тела:' : 'Body Density ρ_body:')
                : activeExp === 'lenses'
                ? (lang === 'ru' ? 'Расстояние до предмета d:' : 'Object Distance d:')
                : activeExp === 'mkt'
                ? (lang === 'ru' ? 'Объем сосуда V:' : 'Cylinder Volume V:')
                : activeExp === 'photoelectric'
                ? (lang === 'ru' ? 'Работа выхода катода А:' : 'Work Function A:')
                : activeExp === 'friction'
                ? (lang === 'ru' ? 'Сила прижатия N (масса):' : 'Normal Force N:')
                : (lang === 'ru' ? 'Энергия α-частицы E:' : 'Alpha Energy E:')}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {activeExp === 'kinematics'
                ? `${Math.round(slider2 * 20)} кг`
                : activeExp === 'hooke'
                ? `${(((slider2 - 50) / 50) * 45).toFixed(1)} см`
                : activeExp === 'archimedes'
                ? `${Math.round(slider2 * 25)} кг/м³`
                : activeExp === 'lenses'
                ? `${(80 + (slider2 / 100) * 110).toFixed(0)} мм`
                : activeExp === 'mkt'
                ? `${(slider2 / 10 + 2).toFixed(1)} л`
                : activeExp === 'photoelectric'
                ? `${(1.8 + (slider2 / 100) * 1.5).toFixed(2)} эВ`
                : activeExp === 'friction'
                ? `${Math.round(slider2 * 2)} Н`
                : `${(slider2 * 0.1 + 2).toFixed(1)} МэВ`}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={slider2}
            onChange={(e) => setSlider2(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Legend & Guide so students never get confused */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'ru' ? 'Что изображено на экране (Подсказка для школьника):' : "What's on screen (Student Guide):"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            {lang === 'ru' ? 'Зеленый: Скорость v⃗, лучи света, фототок' : 'Green: Velocity v, light rays, photocurrent'}
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
            {lang === 'ru' ? 'Красный: Сила упругости, тяжесть, нагрев' : 'Red: Restoring force, gravity, heat'}
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
            {lang === 'ru' ? 'Синий: Вода, ускорение a⃗, электроны' : 'Blue: Water, acceleration a, electrons'}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
            {lang === 'ru' ? 'Желтый: Кванты hν, фокусы F, сила трения' : 'Yellow: Quanta hν, focal points, friction'}
          </span>
        </div>
      </div>
    </div>
  );
};
