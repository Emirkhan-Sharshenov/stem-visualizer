import React from 'react';
import { readUiLang, setUiLang, type UiLang } from '../../lib/ky';

const LANGS: [UiLang, string, string][] = [
  ['ru', 'РУ', 'Русский'],
  ['ky', 'КЫ', 'Кыргызча'],
  ['en', 'EN', 'English'],
];

/** three languages side by side; the current one is highlighted */
export const LangSwitch: React.FC<{ className?: string }> = ({ className = '' }) => {
  const cur = readUiLang();
  return (
    <div role="radiogroup" aria-label="Язык · Тил · Language" data-no-ky className={`inline-flex items-center rounded-full border border-line bg-surface p-0.5 ${className}`}>
      {LANGS.map(([id, short, name]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={cur === id}
          title={name}
          onClick={() => setUiLang(id)}
          className={`h-7 min-w-8 px-2 rounded-full font-mono text-[11px] font-semibold transition-colors cursor-pointer ${cur === id ? 'bg-accent text-white' : 'text-ink-2 hover:text-ink'}`}
        >
          {short}
        </button>
      ))}
    </div>
  );
};
