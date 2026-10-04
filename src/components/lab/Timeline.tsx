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
        <button className={btn} aria-label={lang === 'ru' ? 'В начало' : 'Restart'} title={lang === 'ru' ? 'В начало' : 'Restart'} onClick={() => tl.seek(0)}>
          <SkipBack className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <button className={btn} aria-label={lang === 'ru' ? 'Назад' : 'Back'} title={lang === 'ru' ? 'Назад' : 'Back'} onClick={() => tl.seek(tl.timeRef.current - step)}>
          <StepBack className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <button
          onClick={tl.toggle}
          aria-label={tl.playing ? (lang === 'ru' ? 'Пауза' : 'Pause') : lang === 'ru' ? 'Пуск' : 'Play'}
          className="w-9 h-9 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center cursor-pointer"
          style={{ color: '#fff' }}
        >
          {tl.playing ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4 ml-0.5" strokeWidth={2} />}
        </button>
        <button className={btn} aria-label={lang === 'ru' ? 'Вперёд' : 'Forward'} title={lang === 'ru' ? 'Вперёд' : 'Forward'} onClick={() => tl.seek(tl.timeRef.current + step)}>
          <StepForward className="w-4 h-4" strokeWidth={1.75} />
        </button>

        <div className="relative flex-1 mx-2">
          <input
            type="range"
            min={0}
            max={tl.duration}
            step={0.01}
            value={tl.time}
            onChange={(e) => tl.seek(Number(e.target.value))}
            aria-label={lang === 'ru' ? 'Шкала времени' : 'Timeline'}
            className="w-full accent-[#2F5BFF] cursor-pointer"
          />
          {marks.map((m) => (
            <button
              key={m.t}
              onClick={() => tl.seek(m.t)}
              title={m.label[lang]}
              className={`absolute -top-1 w-1.5 h-1.5 rounded-full -translate-x-1/2 cursor-pointer ${dark ? 'bg-[#8fa4ff]' : 'bg-accent'}`}
              style={{ left: pct(m.t) }}
            />
          ))}
        </div>

        <span className={`hidden sm:inline font-mono text-xs w-16 text-right ${dark ? 'text-[#B5B8C0]' : 'text-ink-2'}`}>{fmt(tl.time)}</span>
        <select
          value={tl.speed}
          onChange={(e) => tl.setSpeed(Number(e.target.value))}
          aria-label={lang === 'ru' ? 'Скорость' : 'Speed'}
          className={`ml-1 h-8 rounded-md px-1.5 text-xs font-mono cursor-pointer ${dark ? 'bg-[#26282D] text-[#EDEDED] border border-[#34363C]' : 'bg-muted text-ink border border-line'}`}
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
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
