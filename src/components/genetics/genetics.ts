/* Mendelian genetics: alleles, gametes, Punnett squares and phenotypes for the school cross types. */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export type Mode = 'mono' | 'di' | 'incomplete' | 'sex' | 'blood';

/** a genotype: one pair of alleles per locus */
export type Genotype = [string, string][];

export interface Phenotype {
  key: string;
  name: T2;
  /** picture hints for drawing */
  look: Record<string, string | boolean>;
}

export interface ModeDef {
  id: Mode;
  title: T2;
  law: T2;
  hint: T2;
  /** genotypes a parent can have; [mother, father] lists for sex-linked */
  options: [Genotype[], Genotype[]];
  start: [Genotype, Genotype];
  /** allele order: dominant first */
  order: string[];
  phenotype: (g: Genotype) => Phenotype;
  /** printable allele */
  show: (a: string) => string;
  parents: [T2, T2];
}

const sortPair = (order: string[]) => (p: [string, string]): [string, string] => (order.indexOf(p[0]) <= order.indexOf(p[1]) ? p : [p[1], p[0]]);

export function gametes(g: Genotype): string[][] {
  return g.reduce<string[][]>((acc, pair) => {
    const opts = pair[0] === pair[1] ? [pair[0]] : [pair[0], pair[1]];
    return acc.flatMap((a) => opts.map((o) => [...a, o]));
  }, [[]]);
}

export function cross(m: ModeDef, a: Genotype, b: Genotype) {
  const ga = gametes(a);
  const gb = gametes(b);
  const cells = ga.map((x) => gb.map((y) => x.map((al, i) => sortPair(m.order)([al, y[i]])) as Genotype));
  return { ga, gb, cells };
}

export const key = (g: Genotype) => g.map((p) => p.join('')).join('|');

/** ratio of genotypes and phenotypes among equally likely cells */
export function ratios(m: ModeDef, cells: Genotype[][]) {
  const flat = cells.flat();
  const gen = new Map<string, { g: Genotype; n: number }>();
  const phen = new Map<string, { p: Phenotype; n: number }>();
  for (const g of flat) {
    const k = key(g);
    gen.set(k, { g, n: (gen.get(k)?.n ?? 0) + 1 });
    const p = m.phenotype(g);
    phen.set(p.key, { p, n: (phen.get(p.key)?.n ?? 0) + 1 });
  }
  const sortGen = [...gen.values()].sort((x, y) => cmpGen(m, x.g, y.g));
  const sortPhen = [...phen.values()].sort((x, y) => y.n - x.n);
  return { total: flat.length, gen: sortGen, phen: sortPhen };
}
function cmpGen(m: ModeDef, a: Genotype, b: Genotype) {
  for (let i = 0; i < a.length; i++) {
    const s = (p: [string, string]) => m.order.indexOf(p[0]) + m.order.indexOf(p[1]);
    if (s(a[i]) !== s(b[i])) return s(a[i]) - s(b[i]);
  }
  return 0;
}

/** shortest whole-number ratio, e.g. [3,1] or [9,3,3,1] */
export function simplify(ns: number[]) {
  const g = ns.reduce((a, b) => gcd(a, b));
  return ns.map((n) => n / g);
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export const fmtGen = (m: ModeDef, g: Genotype) => g.map((p) => p.map(m.show).join('')).join('');

/* ---------- the five cross types ---------- */

const gen1 = (...pairs: string[]): Genotype => pairs.map((p) => [p[0], p[1]] as [string, string]);

const pea = (color: boolean | null, smooth: boolean | null): Record<string, string | boolean> => ({ kind: 'pea', color: color === null ? '' : color ? 'yellow' : 'green', smooth: smooth ?? true });

export const MODES: ModeDef[] = [
  {
    id: 'mono',
    title: t('Моногибридное скрещивание', 'Monohybrid cross'),
    law: t('Законы Менделя: единообразие F₁ и расщепление 3 : 1 в F₂', 'Mendel’s laws: uniform F₁ and a 3 : 1 split in F₂'),
    hint: t('Скрести AA × aa — все потомки жёлтые (Aa). Потом нажми «Скрестить потомков между собой» — в F₂ будет 3 жёлтых : 1 зелёный.', 'Cross AA × aa: all offspring are yellow (Aa). Then cross the offspring: F₂ splits 3 yellow : 1 green.'),
    options: [[gen1('AA'), gen1('Aa'), gen1('aa')], [gen1('AA'), gen1('Aa'), gen1('aa')]],
    start: [gen1('AA'), gen1('aa')],
    order: ['A', 'a'],
    show: (a) => a,
    parents: [t('Растение 1', 'Plant 1'), t('Растение 2', 'Plant 2')],
    phenotype: (g) => {
      const y = g[0].includes('A');
      return { key: y ? 'Y' : 'G', name: y ? t('жёлтые семена', 'yellow seeds') : t('зелёные семена', 'green seeds'), look: pea(y, true) };
    },
  },
  {
    id: 'di',
    title: t('Дигибридное скрещивание', 'Dihybrid cross'),
    law: t('Независимое наследование: 9 : 3 : 3 : 1', 'Independent assortment: 9 : 3 : 3 : 1'),
    hint: t('Цвет (A — жёлтый, a — зелёный) и форма (B — гладкая, b — морщинистая) наследуются независимо. AaBb × AaBb даёт 16 клеток и расщепление 9 : 3 : 3 : 1.', 'Colour (A yellow, a green) and shape (B smooth, b wrinkled) are inherited independently. AaBb × AaBb gives 16 cells and a 9 : 3 : 3 : 1 split.'),
    options: [
      ['AABB', 'AaBb', 'AAbb', 'aaBB', 'aabb', 'AaBB', 'AABb', 'Aabb', 'aaBb'].map((s) => gen1(s.slice(0, 2), s.slice(2))),
      ['AABB', 'AaBb', 'AAbb', 'aaBB', 'aabb', 'AaBB', 'AABb', 'Aabb', 'aaBb'].map((s) => gen1(s.slice(0, 2), s.slice(2))),
    ],
    start: [gen1('Aa', 'Bb'), gen1('Aa', 'Bb')],
    order: ['A', 'a', 'B', 'b'],
    show: (a) => a,
    parents: [t('Растение 1', 'Plant 1'), t('Растение 2', 'Plant 2')],
    phenotype: (g) => {
      const y = g[0].includes('A');
      const s = g[1].includes('B');
      return {
        key: `${y ? 'Y' : 'G'}${s ? 'S' : 'W'}`,
        name: t(`${y ? 'жёлтые' : 'зелёные'} ${s ? 'гладкие' : 'морщинистые'}`, `${y ? 'yellow' : 'green'} ${s ? 'smooth' : 'wrinkled'}`),
        look: pea(y, s),
      };
    },
  },
  {
    id: 'incomplete',
    title: t('Неполное доминирование', 'Incomplete dominance'),
    law: t('Промежуточный признак у гетерозигот: 1 : 2 : 1', 'Heterozygotes are in between: 1 : 2 : 1'),
    hint: t('У ночной красавицы Rr — розовые цветы: ни красный, ни белый не доминирует полностью. В F₂ расщепление по фенотипу совпадает с генотипом: 1 : 2 : 1.', 'In four-o’clocks Rr gives pink flowers: neither red nor white fully dominates. F₂ splits 1 : 2 : 1 for both phenotype and genotype.'),
    options: [[gen1('RR'), gen1('Rr'), gen1('rr')], [gen1('RR'), gen1('Rr'), gen1('rr')]],
    start: [gen1('RR'), gen1('rr')],
    order: ['R', 'r'],
    show: (a) => a,
    parents: [t('Растение 1', 'Plant 1'), t('Растение 2', 'Plant 2')],
    phenotype: (g) => {
      const n = g[0].filter((a) => a === 'R').length;
      return n === 2
        ? { key: 'R', name: t('красные цветы', 'red flowers'), look: { kind: 'flower', color: '#E5484D' } }
        : n === 1
          ? { key: 'P', name: t('розовые цветы', 'pink flowers'), look: { kind: 'flower', color: '#F28CB4' } }
          : { key: 'W', name: t('белые цветы', 'white flowers'), look: { kind: 'flower', color: '#F4F4F4' } };
    },
  },
  {
    id: 'sex',
    title: t('Сцепленное с полом: дальтонизм', 'Sex-linked: colour blindness'),
    law: t('Ген в X-хромосоме: у мужчин проявляется рецессивный аллель', 'The gene sits on X: in men a single recessive allele shows'),
    hint: t('Мать-носительница XᴰXᵈ и здоровый отец XᴰY: половина сыновей — дальтоники, а все дочери здоровы (половина — носительницы).', 'A carrier mother XᴰXᵈ and a healthy father XᴰY: half the sons are colour-blind, all daughters see normally (half are carriers).'),
    options: [
      [[['XD', 'XD']], [['XD', 'Xd']], [['Xd', 'Xd']]],
      [[['XD', 'Y']], [['Xd', 'Y']]],
    ],
    start: [[['XD', 'Xd']], [['XD', 'Y']]],
    order: ['XD', 'Xd', 'Y'],
    show: (a) => (a === 'XD' ? 'Xᴰ' : a === 'Xd' ? 'Xᵈ' : 'Y'),
    parents: [t('Мать', 'Mother'), t('Отец', 'Father')],
    phenotype: (g) => {
      const male = g[0].includes('Y');
      const sick = male ? g[0][0] === 'Xd' : g[0][0] === 'Xd' && g[0][1] === 'Xd';
      const carrier = !male && !sick && g[0].includes('Xd');
      return {
        key: `${male ? 'M' : 'F'}${sick ? 's' : carrier ? 'c' : 'h'}`,
        name: male
          ? sick
            ? t('мальчик-дальтоник', 'colour-blind boy')
            : t('здоровый мальчик', 'healthy boy')
          : sick
            ? t('девочка-дальтоник', 'colour-blind girl')
            : carrier
              ? t('девочка-носительница', 'carrier girl')
              : t('здоровая девочка', 'healthy girl'),
        look: { kind: 'person', male, sick, carrier },
      };
    },
  },
  {
    id: 'blood',
    title: t('Группы крови (АВ0)', 'Blood groups (ABO)'),
    law: t('Кодоминирование: Iᴬ и Iᴮ проявляются вместе', 'Codominance: Iᴬ and Iᴮ both show'),
    hint: t('Аллели Iᴬ и Iᴮ доминируют над i⁰, но друг друга не подавляют: IᴬIᴮ — IV группа. У родителей со II и III группой могут родиться дети с любой из четырёх групп.', 'Iᴬ and Iᴮ dominate i⁰ but not each other, so IᴬIᴮ is group AB. Parents with A and B groups can have children of all four groups.'),
    options: [
      ['ii', 'Ai', 'AA', 'Bi', 'BB', 'AB'].map((s) => [[s[0], s[1]] as [string, string]]),
      ['ii', 'Ai', 'AA', 'Bi', 'BB', 'AB'].map((s) => [[s[0], s[1]] as [string, string]]),
    ],
    start: [[['A', 'i']], [['B', 'i']]],
    order: ['A', 'B', 'i'],
    show: (a) => (a === 'A' ? 'Iᴬ' : a === 'B' ? 'Iᴮ' : 'i⁰'),
    parents: [t('Мать', 'Mother'), t('Отец', 'Father')],
    phenotype: (g) => {
      const has = (x: string) => g[0].includes(x);
      const grp = has('A') && has('B') ? 'IV (AB)' : has('A') ? 'II (A)' : has('B') ? 'III (B)' : 'I (0)';
      const color = { 'IV (AB)': '#AB8AFF', 'II (A)': '#E5484D', 'III (B)': '#5B8CFF', 'I (0)': '#30A46C' }[grp];
      return { key: grp, name: t(`${grp.split(' ')[0]} группа ${grp.split(' ')[1]}`, `group ${grp.split(' ')[1].replace(/[()]/g, '')}`), look: { kind: 'blood', label: grp.split(' ')[0], color } };
    },
  },
];

/** random offspring: pick one gamete from each parent */
export function sample(m: ModeDef, a: Genotype, b: Genotype, n: number) {
  const counts = new Map<string, { p: Phenotype; n: number }>();
  for (let i = 0; i < n; i++) {
    const child = a.map((pa, k) => sortPair(m.order)([pa[Math.random() < 0.5 ? 0 : 1], b[k][Math.random() < 0.5 ? 0 : 1]])) as Genotype;
    const p = m.phenotype(child);
    counts.set(p.key, { p, n: (counts.get(p.key)?.n ?? 0) + 1 });
  }
  return counts;
}
