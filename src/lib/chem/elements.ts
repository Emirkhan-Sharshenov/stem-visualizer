/** Display data for atoms in 3D chemistry models (CPK-style colours, radii in Å) */
export interface ElementInfo {
  name: { ru: string; en: string };
  color: string;
  /** ball-and-stick radius */
  r: number;
  /** van der Waals radius for space-filling view */
  vdw: number;
  text: { ru: string; en: string };
}

const e = (ru: string, en: string, color: string, r: number, vdw: number, tRu: string, tEn: string): ElementInfo => ({ name: { ru, en }, color, r, vdw, text: { ru: tRu, en: tEn } });

export const ELEMENTS: Record<string, ElementInfo> = {
  H: e('Водород', 'Hydrogen', '#F2F4F7', 0.25, 1.1, 'Один электрон, образует одну связь. Самый лёгкий и распространённый элемент Вселенной.', 'One electron, forms one bond. The lightest and most common element in the Universe.'),
  C: e('Углерод', 'Carbon', '#737985', 0.38, 1.7, 'Четырёхвалентен, образует цепи и кольца — основа органической химии и жизни.', 'Forms four bonds, building chains and rings: the basis of organic chemistry and life.'),
  N: e('Азот', 'Nitrogen', '#3F6FE0', 0.36, 1.55, 'Обычно три связи и неподелённая пара электронов.', 'Usually three bonds plus a lone pair of electrons.'),
  O: e('Кислород', 'Oxygen', '#E5484D', 0.35, 1.52, 'Две связи. Сильно электроотрицателен — оттягивает электроны, делая связи полярными.', 'Two bonds. Highly electronegative: it pulls electrons and makes bonds polar.'),
  S: e('Сера', 'Sulfur', '#F5C842', 0.45, 1.8, 'Жёлтый неметалл, степени окисления от −2 до +6.', 'A yellow non-metal with oxidation states from −2 to +6.'),
  P: e('Фосфор', 'Phosphorus', '#F08A24', 0.44, 1.8, 'Входит в ДНК, АТФ и кости.', 'Found in DNA, ATP and bones.'),
  Cl: e('Хлор', 'Chlorine', '#3CC46A', 0.45, 1.75, 'Галоген, сильный окислитель. В соединениях часто −1.', 'A halogen and strong oxidiser, often −1 in compounds.'),
  Na: e('Натрий', 'Sodium', '#AB6CF0', 0.55, 2.27, 'Щелочной металл: легко отдаёт один электрон, становясь ионом Na⁺.', 'An alkali metal: readily gives up one electron to become Na⁺.'),
  Mg: e('Магний', 'Magnesium', '#8ED16B', 0.5, 1.73, 'Отдаёт два электрона (Mg²⁺). Горит ослепительно белым пламенем.', 'Gives up two electrons (Mg²⁺). Burns with a dazzling white flame.'),
  Fe: e('Железо', 'Iron', '#D9733B', 0.5, 1.94, 'Металл со степенями окисления +2 и +3. Ржавчина — Fe₂O₃·nH₂O.', 'A metal with oxidation states +2 and +3. Rust is Fe₂O₃·nH₂O.'),
  Zn: e('Цинк', 'Zinc', '#8C93C7', 0.48, 1.39, 'Активный металл, вытесняет водород из кислот.', 'A reactive metal that displaces hydrogen from acids.'),
  Ca: e('Кальций', 'Calcium', '#5FD39A', 0.55, 2.31, 'Щёлочноземельный металл, основа костей и известняка.', 'An alkaline-earth metal, the basis of bones and limestone.'),
  Al: e('Алюминий', 'Aluminium', '#B7BCC6', 0.48, 1.84, 'Лёгкий металл, защищён плотной оксидной плёнкой.', 'A light metal protected by a tough oxide film.'),
  Si: e('Кремний', 'Silicon', '#E0C49A', 0.45, 2.1, 'Полупроводник, основа песка (SiO₂) и микросхем.', 'A semiconductor, the basis of sand (SiO₂) and microchips.'),
  K: e('Калий', 'Potassium', '#8F40D4', 0.6, 2.75, 'Щелочной металл, ещё активнее натрия.', 'An alkali metal, even more reactive than sodium.'),
  Cu: e('Медь', 'Copper', '#C8804A', 0.48, 1.4, 'Малоактивный металл, отличный проводник.', 'A fairly unreactive metal and an excellent conductor.'),
};

export const element = (sym: string) => ELEMENTS[sym] ?? e(sym, sym, '#B0B4BC', 0.4, 1.7, '', '');
