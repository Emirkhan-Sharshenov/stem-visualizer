import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export const Formula: React.FC<FormulaProps> = ({ tex, display = false, className = '' }) => {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: display, strict: 'ignore' }),
    [tex, display],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
