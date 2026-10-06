/* Reagents, ions and the solubility table for the chemistry lab. */

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export interface Ion {
  id: string;
  /** formula without charge, e.g. "SO4" */
  f: string;
  charge: number;
  /** polyatomic ions get brackets when there are several */
  poly?: boolean;
  /** colour of the ion in water, if any */
  color?: string;
}

export const IONS: Record<string, Ion> = {
  'H+': { id: 'H+', f: 'H', charge: 1 },
  'Na+': { id: 'Na+', f: 'Na', charge: 1 },
  'K+': { id: 'K+', f: 'K', charge: 1 },
  'NH4+': { id: 'NH4+', f: 'NH4', charge: 1, poly: true },
  'Ag+': { id: 'Ag+', f: 'Ag', charge: 1 },
  'Ca2+': { id: 'Ca2+', f: 'Ca', charge: 2 },
  'Ba2+': { id: 'Ba2+', f: 'Ba', charge: 2 },
  'Mg2+': { id: 'Mg2+', f: 'Mg', charge: 2 },
  'Zn2+': { id: 'Zn2+', f: 'Zn', charge: 2 },
  'Cu2+': { id: 'Cu2+', f: 'Cu', charge: 2, color: '#3E9BE0' },
  'Fe2+': { id: 'Fe2+', f: 'Fe', charge: 2, color: '#A8D08D' },
  'Fe3+': { id: 'Fe3+', f: 'Fe', charge: 3, color: '#D9A23F' },
  'Pb2+': { id: 'Pb2+', f: 'Pb', charge: 2 },
  'Al3+': { id: 'Al3+', f: 'Al', charge: 3 },
  'OH-': { id: 'OH-', f: 'OH', charge: -1, poly: true },
  'Cl-': { id: 'Cl-', f: 'Cl', charge: -1 },
  'I-': { id: 'I-', f: 'I', charge: -1 },
  'NO3-': { id: 'NO3-', f: 'NO3', charge: -1, poly: true },
  'CH3COO-': { id: 'CH3COO-', f: 'CH3COO', charge: -1, poly: true },
  'SO4 2-': { id: 'SO4 2-', f: 'SO4', charge: -2, poly: true },
  'CO3 2-': { id: 'CO3 2-', f: 'CO3', charge: -2, poly: true },
  'S2-': { id: 'S2-', f: 'S', charge: -2 },
  'PO4 3-': { id: 'PO4 3-', f: 'PO4', charge: -3, poly: true },
  'AlO2-': { id: 'AlO2-', f: '[Al(OH)4]', charge: -1, poly: false },
  'ZnO2 2-': { id: 'ZnO2 2-', f: '[Zn(OH)4]', charge: -2, poly: false },
};

/** metals, most active first (the electrochemical series); H sits between Pb and Cu */
export const ACTIVITY = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Pb', 'H', 'Cu', 'Ag'];
export const METAL_ION: Record<string, string> = { K: 'K+', Na: 'Na+', Ca: 'Ca2+', Mg: 'Mg2+', Al: 'Al3+', Zn: 'Zn2+', Fe: 'Fe2+', Pb: 'Pb2+', Cu: 'Cu2+', Ag: 'Ag+' };
export const METAL_COLOR: Record<string, string> = { Na: '#C9CDD3', K: '#C9CDD3', Ca: '#D8D8D0', Mg: '#D6D9DE', Al: '#C3C8CF', Zn: '#AEB6BF', Fe: '#7D8288', Pb: '#7E8590', Cu: '#C8743C', Ag: '#E3E5E8' };

export interface Solid {
  formula: string;
  color: string;
  name: T2;
  /** what it looks like */
  look: T2;
}

/** insoluble products: cation|anion → precipitate (simplified school solubility table) */
export const INSOLUBLE: Record<string, Solid> = {
  'Ag+|Cl-': { formula: 'AgCl', color: '#F4F4F2', name: t('хлорид серебра', 'silver chloride'), look: t('белый творожистый осадок', 'white curdy precipitate') },
  'Ag+|I-': { formula: 'AgI', color: '#F2E27A', name: t('иодид серебра', 'silver iodide'), look: t('жёлтый осадок', 'yellow precipitate') },
  'Ag+|CO3 2-': { formula: 'Ag2CO3', color: '#EDE6C8', name: t('карбонат серебра', 'silver carbonate'), look: t('светло-жёлтый осадок', 'pale yellow precipitate') },
  'Ag+|PO4 3-': { formula: 'Ag3PO4', color: '#F3D34A', name: t('фосфат серебра', 'silver phosphate'), look: t('ярко-жёлтый осадок', 'bright yellow precipitate') },
  'Ag+|S2-': { formula: 'Ag2S', color: '#1B1B1B', name: t('сульфид серебра', 'silver sulfide'), look: t('чёрный осадок', 'black precipitate') },
  'Ag+|OH-': { formula: 'Ag2O', color: '#6B4A2B', name: t('оксид серебра', 'silver oxide'), look: t('бурый осадок', 'brown precipitate') },
  'Ba2+|SO4 2-': { formula: 'BaSO4', color: '#FAFAFA', name: t('сульфат бария', 'barium sulfate'), look: t('белый мелкокристаллический осадок', 'fine white precipitate') },
  'Ba2+|CO3 2-': { formula: 'BaCO3', color: '#F6F6F6', name: t('карбонат бария', 'barium carbonate'), look: t('белый осадок', 'white precipitate') },
  'Ba2+|PO4 3-': { formula: 'Ba3(PO4)2', color: '#F6F6F6', name: t('фосфат бария', 'barium phosphate'), look: t('белый осадок', 'white precipitate') },
  'Ca2+|CO3 2-': { formula: 'CaCO3', color: '#F7F7F5', name: t('карбонат кальция (мел)', 'calcium carbonate (chalk)'), look: t('белый осадок', 'white precipitate') },
  'Ca2+|PO4 3-': { formula: 'Ca3(PO4)2', color: '#F7F7F5', name: t('фосфат кальция', 'calcium phosphate'), look: t('белый осадок', 'white precipitate') },
  'Mg2+|OH-': { formula: 'Mg(OH)2', color: '#F2F2F2', name: t('гидроксид магния', 'magnesium hydroxide'), look: t('белый осадок', 'white precipitate') },
  'Mg2+|CO3 2-': { formula: 'MgCO3', color: '#F2F2F2', name: t('карбонат магния', 'magnesium carbonate'), look: t('белый осадок', 'white precipitate') },
  'Cu2+|OH-': { formula: 'Cu(OH)2', color: '#3F86D6', name: t('гидроксид меди(II)', 'copper(II) hydroxide'), look: t('голубой студенистый осадок', 'blue jelly-like precipitate') },
  'Cu2+|CO3 2-': { formula: 'CuCO3', color: '#3FA58C', name: t('карбонат меди(II)', 'copper(II) carbonate'), look: t('сине-зелёный осадок', 'blue-green precipitate') },
  'Cu2+|S2-': { formula: 'CuS', color: '#141414', name: t('сульфид меди(II)', 'copper(II) sulfide'), look: t('чёрный осадок', 'black precipitate') },
  'Cu2+|PO4 3-': { formula: 'Cu3(PO4)2', color: '#4AA3B8', name: t('фосфат меди(II)', 'copper(II) phosphate'), look: t('голубой осадок', 'blue precipitate') },
  'Fe2+|OH-': { formula: 'Fe(OH)2', color: '#8FA889', name: t('гидроксид железа(II)', 'iron(II) hydroxide'), look: t('серо-зелёный осадок', 'grey-green precipitate') },
  'Fe2+|S2-': { formula: 'FeS', color: '#1A1A1A', name: t('сульфид железа(II)', 'iron(II) sulfide'), look: t('чёрный осадок', 'black precipitate') },
  'Fe3+|OH-': { formula: 'Fe(OH)3', color: '#9A4E1E', name: t('гидроксид железа(III)', 'iron(III) hydroxide'), look: t('бурый осадок', 'rust-brown precipitate') },
  'Fe3+|PO4 3-': { formula: 'FePO4', color: '#E8D9A8', name: t('фосфат железа(III)', 'iron(III) phosphate'), look: t('желтоватый осадок', 'yellowish precipitate') },
  'Zn2+|OH-': { formula: 'Zn(OH)2', color: '#F4F4F4', name: t('гидроксид цинка', 'zinc hydroxide'), look: t('белый осадок', 'white precipitate') },
  'Zn2+|S2-': { formula: 'ZnS', color: '#F4F4EE', name: t('сульфид цинка', 'zinc sulfide'), look: t('белый осадок', 'white precipitate') },
  'Zn2+|CO3 2-': { formula: 'ZnCO3', color: '#F4F4F4', name: t('карбонат цинка', 'zinc carbonate'), look: t('белый осадок', 'white precipitate') },
  'Al3+|OH-': { formula: 'Al(OH)3', color: '#F0F3F6', name: t('гидроксид алюминия', 'aluminium hydroxide'), look: t('белый студенистый осадок', 'white jelly-like precipitate') },
  'Al3+|PO4 3-': { formula: 'AlPO4', color: '#F4F4F4', name: t('фосфат алюминия', 'aluminium phosphate'), look: t('белый осадок', 'white precipitate') },
  'Pb2+|I-': { formula: 'PbI2', color: '#F2C21B', name: t('иодид свинца', 'lead iodide'), look: t('золотисто-жёлтый осадок («золотой дождь»)', 'golden yellow precipitate (“golden rain”)') },
  'Pb2+|Cl-': { formula: 'PbCl2', color: '#F4F4F4', name: t('хлорид свинца', 'lead chloride'), look: t('белый осадок', 'white precipitate') },
  'Pb2+|SO4 2-': { formula: 'PbSO4', color: '#F4F4F4', name: t('сульфат свинца', 'lead sulfate'), look: t('белый осадок', 'white precipitate') },
  'Pb2+|S2-': { formula: 'PbS', color: '#161616', name: t('сульфид свинца', 'lead sulfide'), look: t('чёрный осадок', 'black precipitate') },
  'Pb2+|OH-': { formula: 'Pb(OH)2', color: '#F4F4F4', name: t('гидроксид свинца', 'lead hydroxide'), look: t('белый осадок', 'white precipitate') },
  'Pb2+|CO3 2-': { formula: 'PbCO3', color: '#F4F4F4', name: t('карбонат свинца', 'lead carbonate'), look: t('белый осадок', 'white precipitate') },
};

export type ReagentKind = 'acid' | 'base' | 'salt' | 'metal' | 'oxide' | 'indicator' | 'water';

export interface Reagent {
  id: string;
  kind: ReagentKind;
  formula: string;
  name: T2;
  /** ions released per formula unit when dissolved */
  ions?: [string, number][];
  /** metals: element symbol */
  metal?: string;
  /** oxides */
  oxide?: { metal: string; ion: string; o: number; m: number; color: string };
  indicator?: 'phenol' | 'litmus' | 'methyl' | 'universal';
  /** colour of the liquid in the bottle */
  color?: string;
}

const sol = (id: string, kind: ReagentKind, formula: string, ru: string, en: string, ions: [string, number][], color?: string): Reagent => ({ id, kind, formula, name: t(ru, en), ions, color });

export const REAGENTS: Reagent[] = [
  sol('HCl', 'acid', 'HCl', 'Соляная кислота', 'Hydrochloric acid', [['H+', 1], ['Cl-', 1]]),
  sol('H2SO4', 'acid', 'H2SO4', 'Серная кислота', 'Sulfuric acid', [['H+', 2], ['SO4 2-', 1]]),
  sol('HNO3', 'acid', 'HNO3', 'Азотная кислота', 'Nitric acid', [['H+', 1], ['NO3-', 1]]),
  sol('CH3COOH', 'acid', 'CH3COOH', 'Уксусная кислота', 'Acetic acid', [['H+', 1], ['CH3COO-', 1]]),
  sol('H3PO4', 'acid', 'H3PO4', 'Фосфорная кислота', 'Phosphoric acid', [['H+', 3], ['PO4 3-', 1]]),
  sol('NaOH', 'base', 'NaOH', 'Гидроксид натрия', 'Sodium hydroxide', [['Na+', 1], ['OH-', 1]]),
  sol('KOH', 'base', 'KOH', 'Гидроксид калия', 'Potassium hydroxide', [['K+', 1], ['OH-', 1]]),
  sol('BaOH2', 'base', 'Ba(OH)2', 'Гидроксид бария', 'Barium hydroxide', [['Ba2+', 1], ['OH-', 2]]),
  sol('NaCl', 'salt', 'NaCl', 'Хлорид натрия', 'Sodium chloride', [['Na+', 1], ['Cl-', 1]]),
  sol('AgNO3', 'salt', 'AgNO3', 'Нитрат серебра', 'Silver nitrate', [['Ag+', 1], ['NO3-', 1]]),
  sol('BaCl2', 'salt', 'BaCl2', 'Хлорид бария', 'Barium chloride', [['Ba2+', 1], ['Cl-', 2]]),
  sol('CuSO4', 'salt', 'CuSO4', 'Сульфат меди(II)', 'Copper(II) sulfate', [['Cu2+', 1], ['SO4 2-', 1]], '#3E9BE0'),
  sol('FeCl3', 'salt', 'FeCl3', 'Хлорид железа(III)', 'Iron(III) chloride', [['Fe3+', 1], ['Cl-', 3]], '#D9A23F'),
  sol('FeSO4', 'salt', 'FeSO4', 'Сульфат железа(II)', 'Iron(II) sulfate', [['Fe2+', 1], ['SO4 2-', 1]], '#A8D08D'),
  sol('Na2CO3', 'salt', 'Na2CO3', 'Карбонат натрия (сода)', 'Sodium carbonate', [['Na+', 2], ['CO3 2-', 1]]),
  sol('Na2SO4', 'salt', 'Na2SO4', 'Сульфат натрия', 'Sodium sulfate', [['Na+', 2], ['SO4 2-', 1]]),
  sol('Na3PO4', 'salt', 'Na3PO4', 'Фосфат натрия', 'Sodium phosphate', [['Na+', 3], ['PO4 3-', 1]]),
  sol('Na2S', 'salt', 'Na2S', 'Сульфид натрия', 'Sodium sulfide', [['Na+', 2], ['S2-', 1]]),
  sol('KI', 'salt', 'KI', 'Иодид калия', 'Potassium iodide', [['K+', 1], ['I-', 1]]),
  sol('PbNO32', 'salt', 'Pb(NO3)2', 'Нитрат свинца', 'Lead nitrate', [['Pb2+', 1], ['NO3-', 2]]),
  sol('CaCl2', 'salt', 'CaCl2', 'Хлорид кальция', 'Calcium chloride', [['Ca2+', 1], ['Cl-', 2]]),
  sol('MgSO4', 'salt', 'MgSO4', 'Сульфат магния', 'Magnesium sulfate', [['Mg2+', 1], ['SO4 2-', 1]]),
  sol('ZnCl2', 'salt', 'ZnCl2', 'Хлорид цинка', 'Zinc chloride', [['Zn2+', 1], ['Cl-', 2]]),
  sol('AlCl3', 'salt', 'AlCl3', 'Хлорид алюминия', 'Aluminium chloride', [['Al3+', 1], ['Cl-', 3]]),
  sol('NH4Cl', 'salt', 'NH4Cl', 'Хлорид аммония', 'Ammonium chloride', [['NH4+', 1], ['Cl-', 1]]),
  ...(['Na', 'Mg', 'Al', 'Zn', 'Fe', 'Cu'] as const).map(
    (m): Reagent => ({
      id: m,
      kind: 'metal',
      formula: m,
      metal: m,
      name: {
        Na: t('Натрий', 'Sodium'),
        Mg: t('Магний', 'Magnesium'),
        Al: t('Алюминий', 'Aluminium'),
        Zn: t('Цинк', 'Zinc'),
        Fe: t('Железо', 'Iron'),
        Cu: t('Медь', 'Copper'),
      }[m],
    }),
  ),
  { id: 'CaO', kind: 'oxide', formula: 'CaO', name: t('Оксид кальция', 'Calcium oxide'), oxide: { metal: 'Ca', ion: 'Ca2+', o: 1, m: 1, color: '#F2F2EE' } },
  { id: 'CuO', kind: 'oxide', formula: 'CuO', name: t('Оксид меди(II)', 'Copper(II) oxide'), oxide: { metal: 'Cu', ion: 'Cu2+', o: 1, m: 1, color: '#1E1E1E' } },
  { id: 'Fe2O3', kind: 'oxide', formula: 'Fe2O3', name: t('Оксид железа(III)', 'Iron(III) oxide'), oxide: { metal: 'Fe', ion: 'Fe3+', o: 3, m: 2, color: '#8E3B1F' } },
  { id: 'MgO', kind: 'oxide', formula: 'MgO', name: t('Оксид магния', 'Magnesium oxide'), oxide: { metal: 'Mg', ion: 'Mg2+', o: 1, m: 1, color: '#F4F4F4' } },
  { id: 'phenol', kind: 'indicator', formula: 'ф/ф', name: t('Фенолфталеин', 'Phenolphthalein'), indicator: 'phenol' },
  { id: 'litmus', kind: 'indicator', formula: 'лакмус', name: t('Лакмус', 'Litmus'), indicator: 'litmus' },
  { id: 'methyl', kind: 'indicator', formula: 'м/о', name: t('Метилоранж', 'Methyl orange'), indicator: 'methyl' },
  { id: 'universal', kind: 'indicator', formula: 'УИ', name: t('Универсальный индикатор', 'Universal indicator'), indicator: 'universal' },
  { id: 'H2O', kind: 'water', formula: 'H2O', name: t('Вода', 'Water') },
];

export const reagent = (id: string) => REAGENTS.find((r) => r.id === id)!;

/** ions whose salts make water acidic or basic (hydrolysis), for the pH of salt solutions */
export const HYDROLYSIS: Record<string, number> = { 'CO3 2-': 11.5, 'S2-': 12, 'PO4 3-': 12, 'CH3COO-': 8.5, 'Cu2+': 4.5, 'Fe3+': 2.5, 'Fe2+': 5, 'Zn2+': 5, 'Al3+': 3.5, 'NH4+': 5, 'Pb2+': 4.5 };

export function indicatorColor(kind: NonNullable<Reagent['indicator']>, pH: number): { color: string; name: T2 } {
  switch (kind) {
    case 'phenol':
      return pH >= 8.2 ? { color: '#E0338A', name: t('малиновый', 'crimson') } : { color: 'transparent', name: t('бесцветный', 'colourless') };
    case 'litmus':
      return pH < 5 ? { color: '#E5484D', name: t('красный', 'red') } : pH > 8 ? { color: '#3B6FD8', name: t('синий', 'blue') } : { color: '#8E5CC4', name: t('фиолетовый', 'violet') };
    case 'methyl':
      return pH < 3.1 ? { color: '#E5484D', name: t('розово-красный', 'pink-red') } : pH < 4.4 ? { color: '#F2994A', name: t('оранжевый', 'orange') } : { color: '#F2C94C', name: t('жёлтый', 'yellow') };
    case 'universal': {
      const stops = ['#D7263D', '#E8562A', '#F08A24', '#F6C13A', '#D9DF3B', '#9DCF46', '#4CAF50', '#2E9E7E', '#2C8FB5', '#2D6CC5', '#3B4DB8', '#4A3AA8', '#5B2E96', '#6A2483'];
      const i = Math.max(0, Math.min(13, Math.round(pH) - 1));
      return { color: stops[i], name: t(`цвет pH ≈ ${Math.round(pH)}`, `colour of pH ≈ ${Math.round(pH)}`) };
    }
  }
}
