import React from 'react';
import type { Question } from '../../lib/quiz';
import type { OrtQuestion } from '../../lib/ort/paper';
import { Formula } from '../Formula';
import { Figure } from './Quiz';

/* How the ORT test booklet sets out a task: the number, the question, material numbered I, II, III on lines of its own,
   comparisons in two boxed columns, analogies with the model pair in bold, gaps as dots, options as (А)…(Д). */

type Lang = 'ru' | 'en';

/** the option letters of the paper */
export const letter = (k: number, lang: Lang) => (lang === 'ru' ? 'АБВГД' : 'ABCDE')[k];

/** a question split into its lead and the statements numbered I, II, III */
function romanParts(text: string): { lead: string; items: string[] } {
  const parts = text.split(/\s(?=(?:I{1,3}|IV)\.\s)/);
  if (parts.length < 3) return { lead: text, items: [] };
  return { lead: parts[0], items: parts.slice(1).map((s) => s.replace(/[;.]\s*$/, '')) };
}

const gaps = (s: string) => s.replace(/_{3,}/g, '. . . . .');

/** the task itself, without its options */
export const OrtTaskBody: React.FC<{ q: Question & Partial<OrtQuestion>; lang: Lang; n?: number }> = ({ q, lang, n }) => {
  const num = n !== undefined ? <span className="font-semibold mr-2">{n}.</span> : null;
  if (q.columns) {
    return (
      <div className="flex flex-col gap-3">
        {q.columns.given ? (
          <p className="text-[17px] leading-relaxed text-ink">
            {num}
            {q.columns.given[lang]}
          </p>
        ) : (
          num && <p className="text-[17px] text-ink">{num}</p>
        )}
        {q.figure && <Figure svg={q.figure} />}
        <div className="grid grid-cols-2 gap-3 text-center">
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-2">{lang === 'ru' ? 'КОЛОНКА А' : 'COLUMN A'}</p>
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-2">{lang === 'ru' ? 'КОЛОНКА Б' : 'COLUMN B'}</p>
          <div className="border-2 border-ink/70 rounded-md px-3 py-4 text-lg text-ink flex items-center justify-center">{q.columns.a[lang]}</div>
          <div className="border-2 border-ink/70 rounded-md px-3 py-4 text-lg text-ink flex items-center justify-center">{q.columns.b[lang]}</div>
        </div>
      </div>
    );
  }
  if (q.kind === 'analogy') {
    return (
      <p className="text-xl text-ink">
        {num}
        <b className="tracking-wide">{q.prompt[lang]}</b>
      </p>
    );
  }
  const { lead, items } = romanParts(gaps(q.prompt[lang]));
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[17px] leading-relaxed text-ink">
        {num}
        {lead}
      </p>
      {items.length > 0 && (
        <ol className="flex flex-col gap-1 pl-6 text-[17px] text-ink">
          {items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {q.figure && <Figure svg={q.figure} />}
    </div>
  );
};

/** an option as the booklet prints it: (А) and the text */
export const OrtOption: React.FC<{ o: Question['options'][number]; k: number; lang: Lang }> = ({ o, k, lang }) => (
  <>
    <span className="font-semibold mr-2">({letter(k, lang)})</span>
    {o.tex ? <Formula tex={o.ru} /> : o[lang]}
  </>
);

/** a reading text as the booklet prints it: fixed lines, every fifth numbered in the margin */
export const NumberedText: React.FC<{ title: string; text: string }> = ({ title, text }) => {
  const WIDTH = 58;
  const lines: { s: string; indent: boolean }[] = [];
  for (const para of text.split('\n\n')) {
    let line = '';
    let first = true;
    for (const w of para.split(/\s+/)) {
      if (line && (line + ' ' + w).length > (first ? WIDTH - 3 : WIDTH)) {
        lines.push({ s: line, indent: first });
        first = false;
        line = w;
      } else line = line ? `${line} ${w}` : w;
    }
    if (line) lines.push({ s: line, indent: first });
  }
  return (
    <div className="overflow-x-auto">
      <h3 className="font-serif text-lg text-ink mb-2 pl-10">{title}</h3>
      <div className="text-[15px] leading-[1.75] text-ink">
        {lines.map((l, k) => (
          <div key={k} className="flex">
            <span className="w-10 shrink-0 pr-3 text-right text-xs leading-[1.75rem] text-ink-3 tabular-nums select-none">{(k + 1) % 5 === 0 ? k + 1 : ''}</span>
            <span className="whitespace-pre">{(l.indent ? '   ' : '') + l.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** the answer sheet: a row of circles per task; a corrected answer is drawn as a square, as the rules ask */
export const AnswerSheet: React.FC<{
  lang: Lang;
  title: string;
  questions: Question[];
  picked: (number | null)[];
  changed: boolean[];
  current: number;
  onPick: (task: number, option: number) => void;
}> = ({ lang, title, questions, picked, changed, current, onPick }) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-semibold tracking-[0.06em] text-ink-2">{title}</p>
    {/* numbers run down the columns, as on the printed sheet */}
    <ol className="columns-2 gap-x-4 sm:gap-x-6 lg:columns-3">
      {questions.map((q, t) => (
        <li key={q.id} className={`mb-1 flex items-center gap-1.5 rounded-md px-1 break-inside-avoid ${t === current ? 'bg-accent-soft' : ''}`}>
          <span className="w-7 text-right text-xs font-mono text-ink-2 tabular-nums">{t + 1}</span>
          {q.options.map((_, k) => {
            const on = picked[t] === k;
            const square = on && changed[t];
            return (
              <button
                key={k}
                type="button"
                aria-label={lang === 'ru' ? `Задание ${t + 1}, ответ ${letter(k, lang)}` : `Task ${t + 1}, answer ${letter(k, lang)}`}
                aria-pressed={on}
                onClick={() => onPick(t, k)}
                className={`w-7 h-7 shrink-0 border text-[11px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${square ? 'rounded-[3px]' : 'rounded-full'} ${on ? 'bg-ink text-surface border-ink' : 'border-line-strong text-ink-3 hover:border-ink'}`}
              >
                {letter(k, lang)}
              </button>
            );
          })}
        </li>
      ))}
    </ol>
  </div>
);
