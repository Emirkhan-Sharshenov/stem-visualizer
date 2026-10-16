/* Cleans up the mentor's answers before they are rendered: whatever notation the model used,
   formulas end up as $inline$ or $$display$$ KaTeX that reads like a textbook. */

const UNICODE_TEX: Record<string, string> = {
  '×': '\\times ', '·': '\\cdot ', '⋅': '\\cdot ', '÷': '\\div ', '−': '-', '–': '-', '≈': '\\approx ', '≠': '\\neq ',
  '≤': '\\le ', '≥': '\\ge ', '→': '\\rightarrow ', '⇄': '\\rightleftharpoons ', '⇌': '\\rightleftharpoons ', '°': '^\\circ ',
  '∞': '\\infty ', '√': '\\sqrt', '±': '\\pm ', '∝': '\\propto ', '↑': '\\uparrow ', '↓': '\\downarrow ',
  'Δ': '\\Delta ', 'δ': '\\delta ', 'α': '\\alpha ', 'β': '\\beta ', 'γ': '\\gamma ', 'ε': '\\varepsilon ', 'η': '\\eta ',
  'θ': '\\theta ', 'λ': '\\lambda ', 'μ': '\\mu ', 'ν': '\\nu ', 'π': '\\pi ', 'ρ': '\\rho ', 'σ': '\\sigma ', 'τ': '\\tau ',
  'φ': '\\varphi ', 'ω': '\\omega ', 'Ω': '\\Omega ', 'Σ': '\\Sigma ',
  '²': '^{2}', '³': '^{3}', '¹': '^{1}', '⁻': '^-',
  '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4', '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9',
};
const UNICODE_RE = /[×·⋅÷−–≈≠≤≥→⇄⇌°∞√±∝↑↓ΔδαβγεηθλμνπρστφωΩΣ²³¹⁻₀-₉]/g;

/** one formula's TeX: fix the usual model slips so KaTeX draws it cleanly */
export function tidyTex(src: string): string {
  let t = src.trim();
  t = t.replace(/\*\*/g, ''); // markdown bold inside math
  t = t.replace(/\\\\(?=[a-zA-Z])/g, '\\'); // \\frac -> \frac
  // м/с² inside \text{} would become a literal ^{2}: lift the power out of the text
  t = t.replace(/\\text\{([^{}]*?)([²³])\}/g, (_m, u: string, p: string) => `\\text{${u}}^{${p === '²' ? 2 : 3}}`);
  t = t.replace(UNICODE_RE, (c) => UNICODE_TEX[c] ?? c);
  t = t.replace(/\\sqrt\s*([A-Za-z0-9])/g, '\\sqrt{$1}');
  // 9,8 is a decimal number, not a list: no space after the comma
  t = t.replace(/(\d),(?=\d)/g, '$1{,}');
  // a * b -> a · b
  t = t.replace(/([\w})\]])\s*\*\s*(?=[\w\\({[])/g, '$1 \\cdot ');
  return t.trim();
}

/** fractions and roots in running text are too small at text size; draw them full size */
export function inlineTex(src: string): string {
  const t = tidyTex(src);
  return /\\(frac|sqrt|sum|int|lim|prod)/.test(t) ? `\\displaystyle ${t}` : t;
}

// units the model often leaves outside the formula: "$220$ В" -> "$220\ \text{В}$"
const UNITS = 'км/ч|м/с²|м/с\\^2|м/с|кг/м³|г/моль|моль/л|кДж|МДж|Дж|кВт|Вт|кПа|МПа|Па|кОм|Ом|мА|кВ|мВ|В|А|Кл|Тл|Гц|Н|кг|мг|г|км|см|мм|м|мин|ч|с|°C|К|моль|л|мл|%';
const NUM_UNIT = new RegExp(`\\$([-+]?\\d[\\d\\s.,]*)\\$\\s?(${UNITS})(?=[\\s.,;:!?)]|$)`, 'g');

/** whole-answer pass: one notation for maths, important formulas on their own line */
export function prepareAnswer(text: string): string {
  let s = text.replace(/\r\n?/g, '\n');
  s = s.replace(/```(?:latex|tex|math)?\s*([\s\S]*?)```/gi, (_m, m: string) => (/[\\^_=]/.test(m) ? `\n$$${m.trim()}$$\n` : m));
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_m, m: string) => `\n$$${m.trim()}$$\n`);
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, (_m, m: string) => `$${m.trim()}$`);
  s = s.replace(/`\$([^`$\n]+)\$`/g, '$$$1$$');
  s = s.replace(NUM_UNIT, (_m, n: string, u: string) => {
    const pow = /(²|\^2)$/.test(u) ? '^{2}' : u.endsWith('³') ? '^{3}' : '';
    return `$${n.trim()}\\ \\text{${u.replace(/(²|\^2|³)$/, '')}}${pow}$`;
  });
  // a line that is nothing but a formula is a display formula
  s = s
    .split('\n')
    .map((line) => {
      const m = line.match(/^\s*\$(?!\$)([^$\n]+)\$\s*([.,;:]?)\s*$/);
      return m ? `$$${m[1]}$$` : line;
    })
    .join('\n');
  return s;
}
