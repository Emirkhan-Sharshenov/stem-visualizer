import React from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

/* Shared building blocks for lab side panels, in the light editorial style */

export const Panel: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <section className={`bg-surface border border-line rounded-xl p-5 ${className}`}>
    {title && <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-3">{title}</h3>}
    {children}
  </section>
);

export const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, format = (v) => String(v), onChange }) => (
  <label className="block">
    <span className="flex items-center justify-between text-sm">
      <span className="text-ink">{label}</span>
      <span className="font-mono text-ink">{format(value)}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-2 w-full accent-[#2F5BFF] cursor-pointer"
    />
  </label>
);

export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between text-sm text-ink">
    {label}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-accent' : 'bg-line-strong'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  </div>
);

export function Segmented<T extends string>({ value, options, onChange, className = '' }: { value: T; options: { id: T; label: React.ReactNode }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={`flex p-1 rounded-lg bg-muted border border-line overflow-x-auto ${className}`}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 shrink-0 h-8 px-3 rounded-md text-sm whitespace-nowrap transition-colors cursor-pointer ${
            value === o.id ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Metric: React.FC<{ label: string; value: React.ReactNode; tone?: 'default' | 'good' | 'bad' }> = ({ label, value, tone = 'default' }) => (
  <div className="rounded-lg bg-muted px-3 py-2 min-w-0">
    <div className="text-xs text-ink-2 truncate">{label}</div>
    <div className={`mt-0.5 font-mono text-lg truncate ${tone === 'good' ? 'text-[#1E7A4C]' : tone === 'bad' ? 'text-[#CC2F35]' : 'text-ink'}`}>{value}</div>
  </div>
);

export const Tip: React.FC<{ lang: 'ru' | 'en'; children: React.ReactNode }> = ({ lang, children }) => (
  <p className="text-[13.5px] leading-relaxed text-ink bg-muted rounded-lg px-3 py-2">
    <span className="text-accent font-medium">{lang === 'ru' ? 'Попробуй: ' : 'Try: '}</span>
    {children}
  </p>
);

export const PlayControls: React.FC<{ lang: 'ru' | 'en'; running: boolean; onToggle: () => void; onReset?: () => void }> = ({ lang, running, onToggle, onReset }) => (
  <div className="flex gap-2">
    <button
      onClick={onToggle}
      className="flex-1 h-9 px-3 rounded-lg border border-line bg-surface hover:bg-muted text-sm text-ink inline-flex items-center justify-center gap-1.5 cursor-pointer"
    >
      {running ? <Pause className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Play className="w-3.5 h-3.5" strokeWidth={1.75} />}
      {running ? (lang === 'ru' ? 'Пауза' : 'Pause') : lang === 'ru' ? 'Пуск' : 'Play'}
    </button>
    {onReset && (
      <button
        onClick={onReset}
        className="h-9 px-3 rounded-lg border border-line bg-surface hover:bg-muted text-sm text-ink inline-flex items-center gap-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
        {lang === 'ru' ? 'Сначала' : 'Restart'}
      </button>
    )}
  </div>
);

/** Clickable legend: colored dot + name; opens the same info card as clicking the model */
export function Legend<T extends { title: { ru: string; en: string } }>({
  lang,
  items,
  selectedTitle,
  onSelect,
}: {
  lang: 'ru' | 'en';
  items: { color: string; info: T }[];
  selectedTitle?: string;
  onSelect: (info: T) => void;
}) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.info.title.en}>
          <button
            onClick={() => onSelect(item.info)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-md text-left text-sm transition-colors cursor-pointer ${
              selectedTitle === item.info.title.en ? 'bg-accent-soft text-ink' : 'text-ink-2 hover:bg-muted hover:text-ink'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            {item.info.title[lang]}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Dark info card for 2D (SVG) stages, matching the 3D stage card */
export const InfoCard: React.FC<{ lang: 'ru' | 'en'; info: { title: { ru: string; en: string }; text: { ru: string; en: string } } | null; onClose: () => void }> = ({ lang, info, onClose }) => (
  <div
    className={`absolute z-20 left-3 right-3 bottom-3 sm:right-auto sm:w-[340px] rounded-xl bg-[#17181B]/95 border border-[#2c2f36] p-4 transition-all duration-300 ${
      info ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
    }`}
  >
    {info && (
      <>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-serif text-lg leading-snug text-[#EDEDED]">{info.title[lang]}</h4>
          <button
            onClick={onClose}
            aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
            className="shrink-0 w-7 h-7 -mr-1 -mt-1 rounded-md text-[#8C8F98] hover:text-white hover:bg-[#26282D] flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#B5B8C0]">{info.text[lang]}</p>
      </>
    )}
  </div>
);
