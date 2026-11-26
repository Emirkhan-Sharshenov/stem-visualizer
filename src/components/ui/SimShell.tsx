import React from 'react';

export interface Readout {
  label: string;
  value: string;
  /** a colour for the value, e.g. the colour of the matching part on the stage */
  color?: string;
}

export interface Control {
  label: string;
  value: string;
  color?: string;
  input: React.ReactNode;
  hint?: string;
}

/**
 * The common frame of a simulation: a header (grade, formula, title, actions), live readouts as tiles,
 * a dark stage, and labelled controls. Lays itself out for a phone as well as a desktop.
 */
export const SimShell: React.FC<{
  badge: string;
  formula?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  readouts?: Readout[];
  /** the stage itself, usually a canvas; drawn on a dark ground */
  children: React.ReactNode;
  /** things placed over the stage, e.g. a toggle in a corner */
  overlay?: React.ReactNode;
  controls?: Control[];
  /** a short note under the controls: the one idea the model shows */
  insight?: { title: string; text: string };
}> = ({ badge, formula, title, subtitle, actions, readouts, children, overlay, controls, insight }) => (
  <section className="w-full rounded-3xl bg-surface border border-line overflow-hidden">
    <header className="px-5 sm:px-6 pt-5 pb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">{badge}</span>
          {formula && <span className="font-mono text-[13px] text-ink-2">{formula}</span>}
        </div>
        <h3 className="font-serif font-bold text-[19px] sm:text-[21px] leading-snug tracking-[-0.02em] text-ink">{title}</h3>
        {subtitle && <p className="text-sm text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>

    {readouts && readouts.length > 0 && (
      <div className="px-5 sm:px-6 pb-4 grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
        {readouts.map((r) => (
          <div key={r.label} className="rounded-2xl bg-muted px-3.5 py-2.5 flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-2 truncate">{r.label}</span>
            <span className="font-mono text-[17px] font-semibold tabular-nums truncate" style={{ color: r.color }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    )}

    <div className="lab-stage relative mx-3 sm:mx-4 rounded-2xl overflow-hidden bg-[#0A0C14]">
      {children}
      {overlay}
    </div>

    {controls && controls.length > 0 && (
      <div className="px-5 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-5">
        {controls.map((c) => (
          <label key={c.label} className="flex flex-col gap-2 min-w-0">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{c.label}</span>
              <span className="font-mono font-semibold tabular-nums" style={{ color: c.color }}>
                {c.value}
              </span>
            </span>
            {c.input}
            {c.hint && <span className="text-xs leading-relaxed text-ink-2">{c.hint}</span>}
          </label>
        ))}
      </div>
    )}

    {insight && (
      <div className="mx-3 sm:mx-4 mb-4 rounded-2xl bg-accent-soft px-4 py-3.5 flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-accent">{insight.title}</span>
        <p className="text-sm leading-relaxed text-ink">{insight.text}</p>
      </div>
    )}
    {!insight && !controls?.length && <div className="h-4" />}
  </section>
);
