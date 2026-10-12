import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  tex: string;
  display?: boolean;
  className?: string;
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const Formula: React.FC<FormulaProps> = ({ tex, display = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode: display,
        strict: 'ignore',
        errorColor: 'currentColor',
        trust: false,
      });
    } catch {
      // never let one broken formul---a take the whole chat down: show the raw source
      return `<code>${escapeHtml(tex)}</code>`;
    }
  }, [tex, display]);
  return <span className={`${display ? 'leading-none' : ''} ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
};