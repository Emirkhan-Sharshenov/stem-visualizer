import { Choice } from '../ui/Choice';
import { RangeSlider } from '../ui/RangeSlider';
import { Button, Tooltip } from '@heroui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, StepBack, StepForward } from 'lucide-react';

export interface TimelineMark {
  t: number;
  label: { ru: string; en: string };
}

export interface TimelineApi {
  time: number;
  /** always-current time for render loops */
  timeRef: React.MutableRefObject<number>;
  duration: number;
  playing: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setSpeed: (s: number) => void;
}

/**
 * A shared clock for process simulations: play, pause, rewind, scrub and change speed.
 * Simulations render from `timeRef.current`, so every moment can be revisited exactly.
 */
export function useTimeline(duration: number, { loop = true, autoplay = true } = {}): TimelineApi {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(1);
  const timeRef = useRef(0);
  const state = useRef({ playing: autoplay, speed: 1, duration, loop });
  state.current = { playing, speed, duration, loop };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      if (!s.playing) return;
      let t = timeRef.current + dt * s.speed;
      if (t >= s.duration) {
        if (s.loop) t %= s.duration;
        else {
          t = s.duration;
          setPlaying(false);
        }
      }
      timeRef.current = t;
      // The scrubber doesn't need 60 fps; keep React re-renders light
      if (now - lastUi > 50) {
        lastUi = now;
        setTime(t);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seek = useCallback((t: number) => {
    const clamped = Math.max(0, Math.min(state.current.duration, t));
    timeRef.current = clamped;
    setTime(clamped);
  }, []);

  return {
    time,
    timeRef,
    duration,
    playing,
    speed,
    play: () => {
      if (timeRef.current >= state.current.duration) seek(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    toggle: () => setPlaying((p) => !p),
    seek,
    setSpeed,
  };
}

const SPEEDS = [0.25, 0.5, 1, 2];

export const Timeline: React.FC<{ lang: 'ru' | 'en'; tl: TimelineApi; marks?: TimelineMark[]; step?: number; dark?: boolean }> = ({ lang, tl, marks = [], step = 0.5, dark = false }) => {
  const fmt = (t: number) => `${t.toFixed(1)} ${lang === 'ru' ? 'с' : 's'}`;
  const btn = `w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
    dark ? 'text-[#B5B8C0] hover:text-white hover:bg-[#26282D]' : 'text-ink-2 hover:text-ink hover:bg-muted'
  }`;
  const pct = (t: number) => `${(t / tl.duration) * 100}%`;
  const activeMark = [...marks].reverse().find((m) => tl.time >= m.t);

  return (
    <div className={`rounded-xl px-3 py-2.5 ${dark ? 'bg-[#1A1C21]/95 border border-[#2c2f36]' : 'bg-surface border border-line'}`}>
      <div className="flex items-center gap-1">
        <Button isIconOnly size="sm" variant="ghost" aria-label={lang === 'ru' ? 'В начало' : 'Restart'} onPress={() => tl.seek(0)}>
          <SkipBack className="w-4 h-4" strokeWidth={1.75} />
        </Button>
        <Button isIconOnly size="sm" variant="ghost" aria-label={lang === 'ru' ? 'Назад' : 'Back'} onPress={() => tl.seek(tl.timeRef.current - step)}>
          <StepBack className="w-4 h-4" strokeWidth={1.75} />
        </Button>
        <Button isIconOnly className="w-9" onPress={() => tl.toggle()} aria-label={tl.playing ? (lang === 'ru' ? 'Пауза' : 'Pause') : lang === 'ru' ? 'Пуск' : 'Play'}>
          {tl.playing ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4 ml-0.5" strokeWidth={2} />}
        </Button>
        <Button isIconOnly size="sm" variant="ghost" aria-label={lang === 'ru' ? 'Вперёд' : 'Forward'} onPress={() => tl.seek(tl.timeRef.current + step)}>
          <StepForward className="w-4 h-4" strokeWidth={1.75} />
        </Button>

        <div className="relative flex-1 mx-2">
          <RangeSlider value={tl.time} onChange={(v) => tl.seek(v)} min={0} max={tl.duration} step={0.01} aria-label={lang === 'ru' ? 'Шкала времени' : 'Timeline'} />
          {marks.map((m) => (
            <Tooltip key={m.t}><Tooltip.Trigger><Button aria-label={m.label[lang]} variant={dark ? 'ghost' : 'primary'} className="absolute -top-1 w-1.5" onPress={() => tl.seek(m.t)} style={{ left: pct(m.t) }} /></Tooltip.Trigger><Tooltip.Content>{m.label[lang]}</Tooltip.Content></Tooltip>
          ))}
        </div>

        <span className={`hidden sm:inline font-mono text-xs w-16 text-right ${dark ? 'text-[#B5B8C0]' : 'text-ink-2'}`}>{fmt(tl.time)}</span>
        <Choice
          aria-label={lang === 'ru' ? 'Скорость' : 'Speed'}
          className="ml-1 w-24"
          value={String(tl.speed)}
          onChange={(v) => tl.setSpeed(Number(v))}
          options={SPEEDS.map((s) => ({ value: String(s), label: `${s}×` }))}
        />
      </div>
      {marks.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {marks.map((m) => (
            <button
              key={m.t}
              onClick={() => tl.seek(m.t)}
              className={`px-2 py-0.5 rounded-full text-[11.5px] cursor-pointer transition-colors ${
                activeMark === m
                  ? 'bg-accent text-white'
                  : dark
                    ? 'bg-[#26282D] text-[#B5B8C0] hover:text-white'
                    : 'bg-muted text-ink-2 hover:text-ink'
              }`}
              style={activeMark === m ? { color: '#fff' } : undefined}
            >
              {m.label[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
