import { MOLECULE_DATA } from './moleculeData';
import type { AtomRow, BondRow } from './build3d';

type T2 = { ru: string; en: string };
const tx = (ru: string, en: string): T2 => ({ ru, en });

export interface Species {
  formula: string;
  name: T2;
  atoms: AtomRow[];
  bonds: BondRow[];
}

const fromData = (id: keyof typeof MOLECULE_DATA): Species => {
  const d = MOLECULE_DATA[id];
  return { formula: d.formula, name: d.name, atoms: d.atoms, bonds: d.bonds };
};

/* Ionic and metallic species are drawn as simple formula units */
const S: Record<string, Species> = {
  CH4: fromData('methane'),
  O2: fromData('oxygen'),
  CO2: fromData('co2'),
  H2O: fromData('water'),
  NH3: fromData('ammonia'),
  N2: fromData('nitrogen'),
  HCl: fromData('hcl'),
  Cl2: fromData('chlorine'),
  C2H4: fromData('ethene'),
  C2H6: fromData('ethane'),
  CH3Cl: fromData('chloromethane'),
  H2O2: fromData('h2o2'),
  H2: { formula: 'H₂', name: tx('Водород', 'Hydrogen'), atoms: [['H', -0.37, 0, 0], ['H', 0.37, 0, 0]], bonds: [[0, 1, 1]] },
  Mg: { formula: 'Mg', name: tx('Магний', 'Magnesium'), atoms: [['Mg', 0, 0, 0]], bonds: [] },
  MgO: { formula: 'MgO', name: tx('Оксид магния', 'Magnesium oxide'), atoms: [['Mg', -1.0, 0, 0], ['O', 1.0, 0, 0]], bonds: [[0, 1, 1]] },
  Fe: { formula: 'Fe', name: tx('Железо', 'Iron'), atoms: [['Fe', 0, 0, 0]], bonds: [] },
  Fe2O3: {
    formula: 'Fe₂O₃',
    name: tx('Оксид железа(III)', 'Iron(III) oxide'),
    atoms: [['Fe', -1.25, 0, 0], ['Fe', 1.25, 0, 0], ['O', 0, 1.05, 0], ['O', 0, -1.05, 0], ['O', 0, 0, 1.15]],
    bonds: [[0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 2, 1], [1, 3, 1], [1, 4, 1]],
  },
  Na: { formula: 'Na', name: tx('Натрий', 'Sodium'), atoms: [['Na', 0, 0, 0]], bonds: [] },
  NaCl: { formula: 'NaCl', name: tx('Хлорид натрия', 'Sodium chloride'), atoms: [['Na', -1.2, 0, 0], ['Cl', 1.2, 0, 0]], bonds: [[0, 1, 1]] },
  Zn: { formula: 'Zn', name: tx('Цинк', 'Zinc'), atoms: [['Zn', 0, 0, 0]], bonds: [] },
  ZnCl2: { formula: 'ZnCl₂', name: tx('Хлорид цинка', 'Zinc chloride'), atoms: [['Cl', -2.1, 0, 0], ['Zn', 0, 0, 0], ['Cl', 2.1, 0, 0]], bonds: [[0, 1, 1], [1, 2, 1]] },
  NaOH: { formula: 'NaOH', name: tx('Гидроксид натрия', 'Sodium hydroxide'), atoms: [['Na', -1.9, 0, 0], ['O', 0, 0, 0], ['H', 0.96, 0, 0]], bonds: [[0, 1, 1], [1, 2, 1]] },
};

export interface Reaction {
  id: string;
  name: T2;
  equation: string;
  kinds: T2[];
  reactants: string[];
  products: string[];
  /** kJ per reaction as written; negative = released (exothermic) */
  dH: number;
  /** relative activation barrier 0..1 for the energy diagram */
  barrier: number;
  catalyst?: T2;
  /** electron transfer: each atom of `from` gives `n` electrons to the nearest `to` atom */
  electrons?: { from: string; to: string; n: number };
  oxidation?: { sym: string; from: string; to: string; role: 'ox' | 'red' }[];
  about: T2;
  notes?: { collide?: T2; rearrange?: T2; products?: T2 };
}

export const REACTIONS: Reaction[] = [
  {
    id: 'methane_combustion',
    name: tx('Горение метана', 'Burning methane'),
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    kinds: [tx('горение', 'combustion'), tx('ОВР', 'redox'), tx('экзотермическая', 'exothermic')],
    reactants: ['CH4', 'O2', 'O2'],
    products: ['CO2', 'H2O', 'H2O'],
    dH: -890,
    barrier: 0.55,
    oxidation: [
      { sym: 'C', from: '−4', to: '+4', role: 'ox' },
      { sym: 'O', from: '0', to: '−2', role: 'red' },
    ],
    about: tx('Так горит природный газ в плите. Углерод метана окисляется кислородом до CO₂, водород — до воды; выделяется много тепла.', 'This is how natural gas burns on a stove. Oxygen oxidises methane’s carbon to CO₂ and its hydrogen to water, releasing lots of heat.'),
    notes: {
      collide: tx('Молекулы сталкиваются. Чтобы реакция пошла, нужен поджиг — энергия активации: спичка или искра.', 'The molecules collide. The reaction needs a kick to start, the activation energy, from a match or spark.'),
      rearrange: tx('Связи C–H и O=O рвутся, атомы перестраиваются: углерод забирает два кислорода, водороды — по одному.', 'C–H and O=O bonds break and the atoms regroup: carbon takes two oxygens, the hydrogens pair up with the rest.'),
      products: tx('Образуются CO₂ и пары воды. Новые связи прочнее старых — разница уходит в тепло и свет пламени: 890 кДж на моль метана.', 'CO₂ and water vapour form. The new bonds are stronger than the old ones; the difference leaves as heat and flame light, 890 kJ per mole of methane.'),
    },
  },
  {
    id: 'iron_rusting',
    name: tx('Ржавление железа', 'Iron rusting'),
    equation: '4Fe + 3O₂ → 2Fe₂O₃',
    kinds: [tx('медленное окисление', 'slow oxidation'), tx('ОВР', 'redox'), tx('соединение', 'synthesis')],
    reactants: ['Fe', 'Fe', 'Fe', 'Fe', 'O2', 'O2', 'O2'],
    products: ['Fe2O3', 'Fe2O3'],
    dH: -1648,
    barrier: 0.3,
    electrons: { from: 'Fe', to: 'O', n: 3 },
    oxidation: [
      { sym: 'Fe', from: '0', to: '+3', role: 'ox' },
      { sym: 'O', from: '0', to: '−2', role: 'red' },
    ],
    about: tx('Медленное окисление: тепло выделяется так же, как при горении, но годами, и мы его не замечаем. Вода и соль ускоряют ржавление.', 'Slow oxidation: as much heat as burning, but released over years so we never notice. Water and salt speed it up.'),
    notes: {
      collide: tx('Кислород воздуха контактирует с поверхностью железа (на деле нужна ещё влага).', 'Oxygen from the air touches the iron surface (in reality moisture is needed too).'),
      rearrange: tx('Каждый атом железа отдаёт 3 электрона (окисляется), каждый атом кислорода принимает 2 (восстанавливается).', 'Each iron atom gives up 3 electrons (oxidised); each oxygen atom takes 2 (reduced).'),
      products: tx('Получается оксид железа(III) — основа ржавчины. Защита: краска, смазка, цинкование, нержавеющие сплавы.', 'Iron(III) oxide forms, the basis of rust. Protection: paint, grease, galvanising, stainless alloys.'),
    },
  },
  {
    id: 'magnesium_burning',
    name: tx('Горение магния', 'Burning magnesium'),
    equation: '2Mg + O₂ → 2MgO',
    kinds: [tx('ОВР', 'redox'), tx('соединение', 'synthesis'), tx('экзотермическая', 'exothermic')],
    reactants: ['Mg', 'Mg', 'O2'],
    products: ['MgO', 'MgO'],
    dH: -1204,
    barrier: 0.45,
    electrons: { from: 'Mg', to: 'O', n: 2 },
    oxidation: [
      { sym: 'Mg', from: '0', to: '+2', role: 'ox' },
      { sym: 'O', from: '0', to: '−2', role: 'red' },
    ],
    about: tx('Магний горит ослепительно белым светом — раньше его использовали во фотовспышках. Магний — восстановитель, кислород — окислитель.', 'Magnesium burns with a dazzling white light, once used in camera flashes. Magnesium is the reducing agent, oxygen the oxidising agent.'),
    notes: { rearrange: tx('Магний отдаёт по 2 электрона кислороду: Mg⁰ − 2e⁻ → Mg²⁺ (окисление), O⁰ + 2e⁻ → O²⁻ (восстановление).', 'Each magnesium gives 2 electrons to oxygen: Mg⁰ − 2e⁻ → Mg²⁺ (oxidation), O⁰ + 2e⁻ → O²⁻ (reduction).') },
  },
  {
    id: 'hydrogen_combustion',
    name: tx('Горение водорода', 'Burning hydrogen'),
    equation: '2H₂ + O₂ → 2H₂O',
    kinds: [tx('горение', 'combustion'), tx('соединение', 'synthesis'), tx('ОВР', 'redox')],
    reactants: ['H2', 'H2', 'O2'],
    products: ['H2O', 'H2O'],
    dH: -572,
    barrier: 0.5,
    oxidation: [
      { sym: 'H', from: '0', to: '+1', role: 'ox' },
      { sym: 'O', from: '0', to: '−2', role: 'red' },
    ],
    about: tx('Смесь 2:1 — «гремучий газ», взрывается от искры. Единственный продукт — вода, поэтому водород считают чистым топливом будущего.', 'A 2:1 mix is explosive “oxyhydrogen”, set off by a spark. The only product is water, which is why hydrogen is seen as a clean future fuel.'),
  },
  {
    id: 'sodium_chlorine',
    name: tx('Натрий + хлор', 'Sodium + chlorine'),
    equation: '2Na + Cl₂ → 2NaCl',
    kinds: [tx('ОВР', 'redox'), tx('ионная связь', 'ionic bond')],
    reactants: ['Na', 'Na', 'Cl2'],
    products: ['NaCl', 'NaCl'],
    dH: -822,
    barrier: 0.25,
    electrons: { from: 'Na', to: 'Cl', n: 1 },
    oxidation: [
      { sym: 'Na', from: '0', to: '+1', role: 'ox' },
      { sym: 'Cl', from: '0', to: '−1', role: 'red' },
    ],
    about: tx('Мягкий металл и ядовитый газ дают поваренную соль. Натрий отдаёт электрон хлору — возникают ионы Na⁺ и Cl⁻, они притягиваются: ионная связь.', 'A soft metal and a toxic gas make table salt. Sodium hands an electron to chlorine, forming Na⁺ and Cl⁻ ions that attract: an ionic bond.'),
  },
  {
    id: 'zinc_acid',
    name: tx('Цинк + соляная кислота', 'Zinc + hydrochloric acid'),
    equation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    kinds: [tx('замещение', 'displacement'), tx('ОВР', 'redox')],
    reactants: ['Zn', 'HCl', 'HCl'],
    products: ['ZnCl2', 'H2'],
    dH: -153,
    barrier: 0.35,
    electrons: { from: 'Zn', to: 'H', n: 1 },
    oxidation: [
      { sym: 'Zn', from: '0', to: '+2', role: 'ox' },
      { sym: 'H', from: '+1', to: '0', role: 'red' },
    ],
    about: tx('Лабораторный способ получения водорода (аппарат Киппа). Металлы левее водорода в ряду активности вытесняют его из кислот.', 'The lab way to make hydrogen (Kipp’s apparatus). Metals left of hydrogen in the activity series push it out of acids.'),
  },
  {
    id: 'neutralization',
    name: tx('Нейтрализация', 'Neutralisation'),
    equation: 'HCl + NaOH → NaCl + H₂O',
    kinds: [tx('обмен', 'exchange'), tx('не ОВР', 'not redox')],
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H2O'],
    dH: -57,
    barrier: 0.08,
    about: tx('Кислота + щёлочь = соль + вода. Суть: H⁺ + OH⁻ → H₂O. Степени окисления не меняются — это реакция обмена.', 'Acid + alkali = salt + water. The essence is H⁺ + OH⁻ → H₂O. No oxidation states change: it’s an exchange reaction.'),
  },
  {
    id: 'ammonia_synthesis',
    name: tx('Синтез аммиака', 'Ammonia synthesis'),
    equation: 'N₂ + 3H₂ ⇌ 2NH₃',
    kinds: [tx('обратимая', 'reversible'), tx('каталитическая', 'catalytic'), tx('соединение', 'synthesis')],
    reactants: ['N2', 'H2', 'H2', 'H2'],
    products: ['NH3', 'NH3'],
    dH: -92,
    barrier: 0.7,
    catalyst: tx('железо (Fe), 450 °C, 200–300 атм', 'iron (Fe), 450 °C, 200–300 atm'),
    oxidation: [
      { sym: 'N', from: '0', to: '−3', role: 'red' },
      { sym: 'H', from: '0', to: '+1', role: 'ox' },
    ],
    about: tx('Процесс Габера: основа производства удобрений. Реакция обратима; по Ле Шателье давление и отвод аммиака сдвигают равновесие вправо.', 'The Haber process, the basis of fertiliser production. It’s reversible; by Le Chatelier, high pressure and removing ammonia push it to the right.'),
    notes: { collide: tx('Тройная связь N≡N очень прочная — без катализатора реакция почти не идёт.', 'The N≡N triple bond is very strong; without a catalyst the reaction barely happens.') },
  },
  {
    id: 'peroxide_decomposition',
    name: tx('Разложение пероксида', 'Peroxide decomposition'),
    equation: '2H₂O₂ → 2H₂O + O₂↑',
    kinds: [tx('разложение', 'decomposition'), tx('каталитическая', 'catalytic'), tx('ОВР', 'redox')],
    reactants: ['H2O2', 'H2O2'],
    products: ['H2O', 'H2O', 'O2'],
    dH: -196,
    barrier: 0.6,
    catalyst: tx('оксид марганца(IV) MnO₂ или фермент каталаза', 'manganese(IV) oxide MnO₂ or the enzyme catalase'),
    oxidation: [{ sym: 'O', from: '−1', to: '−2 и 0', role: 'red' }],
    about: tx('Лабораторный способ получения кислорода. Катализатор снижает энергию активации, но сам не расходуется.', 'A lab method for making oxygen. The catalyst lowers the activation energy without being used up.'),
  },
  {
    id: 'water_electrolysis',
    name: tx('Разложение воды', 'Splitting water'),
    equation: '2H₂O → 2H₂ + O₂',
    kinds: [tx('разложение', 'decomposition'), tx('эндотермическая', 'endothermic')],
    reactants: ['H2O', 'H2O'],
    products: ['H2', 'H2', 'O2'],
    dH: 572,
    barrier: 0.9,
    about: tx('Обратна горению водорода и требует столько же энергии — например, электрического тока (электролиз).', 'The reverse of burning hydrogen, needing the same energy back, for example from an electric current (electrolysis).'),
  },
  {
    id: 'ethene_hydrogenation',
    name: tx('Гидрирование этилена', 'Hydrogenating ethene'),
    equation: 'C₂H₄ + H₂ → C₂H₆',
    kinds: [tx('присоединение', 'addition'), tx('каталитическая', 'catalytic')],
    reactants: ['C2H4', 'H2'],
    products: ['C2H6'],
    dH: -137,
    barrier: 0.5,
    catalyst: tx('никель или платина', 'nickel or platinum'),
    about: tx('π-связь двойной связи C=C разрывается, и к атомам углерода присоединяются два атома водорода — алкен превращается в алкан.', 'The π part of the C=C double bond breaks and two hydrogens add to the carbons, turning an alkene into an alkane.'),
  },
  {
    id: 'methane_chlorination',
    name: tx('Хлорирование метана', 'Chlorinating methane'),
    equation: 'CH₄ + Cl₂ →(hν) CH₃Cl + HCl',
    kinds: [tx('замещение', 'substitution'), tx('радикальная', 'radical')],
    reactants: ['CH4', 'Cl2'],
    products: ['CH3Cl', 'HCl'],
    dH: -99,
    barrier: 0.45,
    catalyst: tx('свет (hν) — расщепляет Cl₂ на радикалы', 'light (hν), which splits Cl₂ into radicals'),
    about: tx('Типичная реакция алканов: атом водорода замещается на хлор по цепному радикальному механизму.', 'The typical alkane reaction: a hydrogen is swapped for chlorine by a radical chain mechanism.'),
  },
];

export const SPECIES = S;
export type ReactionId = (typeof REACTIONS)[number]['id'];
export const reactionById = (id: string) => REACTIONS.find((r) => r.id === id) ?? REACTIONS[0];
