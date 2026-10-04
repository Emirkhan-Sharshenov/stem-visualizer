/* Periodic table data: Z | symbol | Russian name | English name | atomic mass | category | electronegativity (Pauling, '' if unknown) */
const RAW = `1|H|Водород|Hydrogen|1.008|nonmetal|2.20
2|He|Гелий|Helium|4.003|noble|
3|Li|Литий|Lithium|6.94|alkali|0.98
4|Be|Бериллий|Beryllium|9.012|alkaline|1.57
5|B|Бор|Boron|10.81|metalloid|2.04
6|C|Углерод|Carbon|12.011|nonmetal|2.55
7|N|Азот|Nitrogen|14.007|nonmetal|3.04
8|O|Кислород|Oxygen|15.999|nonmetal|3.44
9|F|Фтор|Fluorine|18.998|halogen|3.98
10|Ne|Неон|Neon|20.18|noble|
11|Na|Натрий|Sodium|22.99|alkali|0.93
12|Mg|Магний|Magnesium|24.305|alkaline|1.31
13|Al|Алюминий|Aluminium|26.982|post|1.61
14|Si|Кремний|Silicon|28.085|metalloid|1.90
15|P|Фосфор|Phosphorus|30.974|nonmetal|2.19
16|S|Сера|Sulfur|32.06|nonmetal|2.58
17|Cl|Хлор|Chlorine|35.45|halogen|3.16
18|Ar|Аргон|Argon|39.948|noble|
19|K|Калий|Potassium|39.098|alkali|0.82
20|Ca|Кальций|Calcium|40.078|alkaline|1.00
21|Sc|Скандий|Scandium|44.956|transition|1.36
22|Ti|Титан|Titanium|47.867|transition|1.54
23|V|Ванадий|Vanadium|50.942|transition|1.63
24|Cr|Хром|Chromium|51.996|transition|1.66
25|Mn|Марганец|Manganese|54.938|transition|1.55
26|Fe|Железо|Iron|55.845|transition|1.83
27|Co|Кобальт|Cobalt|58.933|transition|1.88
28|Ni|Никель|Nickel|58.693|transition|1.91
29|Cu|Медь|Copper|63.546|transition|1.90
30|Zn|Цинк|Zinc|65.38|transition|1.65
31|Ga|Галлий|Gallium|69.723|post|1.81
32|Ge|Германий|Germanium|72.63|metalloid|2.01
33|As|Мышьяк|Arsenic|74.922|metalloid|2.18
34|Se|Селен|Selenium|78.971|nonmetal|2.55
35|Br|Бром|Bromine|79.904|halogen|2.96
36|Kr|Криптон|Krypton|83.798|noble|3.00
37|Rb|Рубидий|Rubidium|85.468|alkali|0.82
38|Sr|Стронций|Strontium|87.62|alkaline|0.95
39|Y|Иттрий|Yttrium|88.906|transition|1.22
40|Zr|Цирконий|Zirconium|91.224|transition|1.33
41|Nb|Ниобий|Niobium|92.906|transition|1.6
42|Mo|Молибден|Molybdenum|95.95|transition|2.16
43|Tc|Технеций|Technetium|98|transition|1.9
44|Ru|Рутений|Ruthenium|101.07|transition|2.2
45|Rh|Родий|Rhodium|102.91|transition|2.28
46|Pd|Палладий|Palladium|106.42|transition|2.20
47|Ag|Серебро|Silver|107.87|transition|1.93
48|Cd|Кадмий|Cadmium|112.41|transition|1.69
49|In|Индий|Indium|114.82|post|1.78
50|Sn|Олово|Tin|118.71|post|1.96
51|Sb|Сурьма|Antimony|121.76|metalloid|2.05
52|Te|Теллур|Tellurium|127.6|metalloid|2.1
53|I|Иод|Iodine|126.9|halogen|2.66
54|Xe|Ксенон|Xenon|131.29|noble|2.60
55|Cs|Цезий|Caesium|132.91|alkali|0.79
56|Ba|Барий|Barium|137.33|alkaline|0.89
57|La|Лантан|Lanthanum|138.91|lanthanide|1.10
58|Ce|Церий|Cerium|140.12|lanthanide|1.12
59|Pr|Празеодим|Praseodymium|140.91|lanthanide|1.13
60|Nd|Неодим|Neodymium|144.24|lanthanide|1.14
61|Pm|Прометий|Promethium|145|lanthanide|
62|Sm|Самарий|Samarium|150.36|lanthanide|1.17
63|Eu|Европий|Europium|151.96|lanthanide|
64|Gd|Гадолиний|Gadolinium|157.25|lanthanide|1.20
65|Tb|Тербий|Terbium|158.93|lanthanide|
66|Dy|Диспрозий|Dysprosium|162.5|lanthanide|1.22
67|Ho|Гольмий|Holmium|164.93|lanthanide|1.23
68|Er|Эрбий|Erbium|167.26|lanthanide|1.24
69|Tm|Тулий|Thulium|168.93|lanthanide|1.25
70|Yb|Иттербий|Ytterbium|173.05|lanthanide|
71|Lu|Лютеций|Lutetium|174.97|lanthanide|1.27
72|Hf|Гафний|Hafnium|178.49|transition|1.3
73|Ta|Тантал|Tantalum|180.95|transition|1.5
74|W|Вольфрам|Tungsten|183.84|transition|2.36
75|Re|Рений|Rhenium|186.21|transition|1.9
76|Os|Осмий|Osmium|190.23|transition|2.2
77|Ir|Иридий|Iridium|192.22|transition|2.20
78|Pt|Платина|Platinum|195.08|transition|2.28
79|Au|Золото|Gold|196.97|transition|2.54
80|Hg|Ртуть|Mercury|200.59|transition|2.00
81|Tl|Таллий|Thallium|204.38|post|1.62
82|Pb|Свинец|Lead|207.2|post|2.33
83|Bi|Висмут|Bismuth|208.98|post|2.02
84|Po|Полоний|Polonium|209|post|2.0
85|At|Астат|Astatine|210|halogen|2.2
86|Rn|Радон|Radon|222|noble|
87|Fr|Франций|Francium|223|alkali|0.7
88|Ra|Радий|Radium|226|alkaline|0.9
89|Ac|Актиний|Actinium|227|actinide|1.1
90|Th|Торий|Thorium|232.04|actinide|1.3
91|Pa|Протактиний|Protactinium|231.04|actinide|1.5
92|U|Уран|Uranium|238.03|actinide|1.38
93|Np|Нептуний|Neptunium|237|actinide|1.36
94|Pu|Плутоний|Plutonium|244|actinide|1.28
95|Am|Америций|Americium|243|actinide|1.3
96|Cm|Кюрий|Curium|247|actinide|1.3
97|Bk|Берклий|Berkelium|247|actinide|1.3
98|Cf|Калифорний|Californium|251|actinide|1.3
99|Es|Эйнштейний|Einsteinium|252|actinide|1.3
100|Fm|Фермий|Fermium|257|actinide|1.3
101|Md|Менделевий|Mendelevium|258|actinide|1.3
102|No|Нобелий|Nobelium|259|actinide|1.3
103|Lr|Лоуренсий|Lawrencium|266|actinide|
104|Rf|Резерфордий|Rutherfordium|267|transition|
105|Db|Дубний|Dubnium|268|transition|
106|Sg|Сиборгий|Seaborgium|269|transition|
107|Bh|Борий|Bohrium|270|transition|
108|Hs|Хассий|Hassium|277|transition|
109|Mt|Мейтнерий|Meitnerium|278|transition|
110|Ds|Дармштадтий|Darmstadtium|281|transition|
111|Rg|Рентгений|Roentgenium|282|transition|
112|Cn|Коперниций|Copernicium|285|transition|
113|Nh|Нихоний|Nihonium|286|post|
114|Fl|Флеровий|Flerovium|289|post|
115|Mc|Московий|Moscovium|290|post|
116|Lv|Ливерморий|Livermorium|293|post|
117|Ts|Теннессин|Tennessine|294|halogen|
118|Og|Оганесон|Oganesson|294|noble|`;

export type Category = 'alkali' | 'alkaline' | 'transition' | 'post' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide';

export interface El {
  z: number;
  sym: string;
  name: { ru: string; en: string };
  mass: number;
  cat: Category;
  en: number | null;
  period: number;
  group: number | null;
  /** grid position (1-based columns 1..18, rows 1..10 with f-block in rows 9 and 10) */
  col: number;
  row: number;
}

function place(z: number) {
  const starts = [1, 3, 11, 19, 37, 55, 87, 119];
  const period = starts.findIndex((s, i) => z >= s && z < starts[i + 1]) + 1;
  const i = z - starts[period - 1];
  if (period === 1) return { period, group: z === 1 ? 1 : 18, col: z === 1 ? 1 : 18, row: 1 };
  if (period <= 3) {
    const g = i < 2 ? i + 1 : i + 11;
    return { period, group: g, col: g, row: period };
  }
  if (period <= 5) return { period, group: i + 1, col: i + 1, row: period };
  // periods 6 and 7 with the f-block pulled out below
  if (i < 2) return { period, group: i + 1, col: i + 1, row: period };
  if (i < 17) return { period, group: null, col: i + 1, row: period + 3 };
  const g = i - 13;
  return { period, group: g, col: g, row: period };
}

export const ELEMENTS_TABLE: El[] = RAW.split('\n').map((l) => {
  const [z, sym, ru, en, mass, cat, eneg] = l.split('|');
  const zz = Number(z);
  return { z: zz, sym, name: { ru, en }, mass: Number(mass), cat: cat as Category, en: eneg ? Number(eneg) : null, ...place(zz) };
});

export const CATEGORY_INFO: Record<Category, { ru: string; en: string; color: string }> = {
  alkali: { ru: 'Щелочные металлы', en: 'Alkali metals', color: '#F07AA0' },
  alkaline: { ru: 'Щёлочноземельные', en: 'Alkaline earth metals', color: '#F5A524' },
  transition: { ru: 'Переходные металлы', en: 'Transition metals', color: '#8FA4FF' },
  post: { ru: 'Другие металлы', en: 'Post-transition metals', color: '#9AA5B8' },
  metalloid: { ru: 'Полуметаллы', en: 'Metalloids', color: '#3DBFA0' },
  nonmetal: { ru: 'Неметаллы', en: 'Non-metals', color: '#5FD39A' },
  halogen: { ru: 'Галогены', en: 'Halogens', color: '#E8D25A' },
  noble: { ru: 'Благородные газы', en: 'Noble gases', color: '#B07AFF' },
  lanthanide: { ru: 'Лантаноиды', en: 'Lanthanides', color: '#E89A6A' },
  actinide: { ru: 'Актиноиды', en: 'Actinides', color: '#D97777' },
};

/** electrons per shell from the Aufbau (Madelung) filling order; Cr and Cu-type exceptions are ignored */
export function shells(z: number) {
  const order = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1], [6, 0], [4, 3], [5, 2], [6, 1], [7, 0], [5, 3], [6, 2], [7, 1]];
  const out: number[] = [];
  let left = z;
  for (const [n, l] of order) {
    if (left <= 0) break;
    const k = Math.min(4 * l + 2, left);
    out[n - 1] = (out[n - 1] ?? 0) + k;
    left -= k;
  }
  return Array.from(out, (v) => v ?? 0);
}

/** valence electrons on the outer shell for main-group elements */
export function valence(e: El) {
  if (e.group === null) return null;
  if (e.group <= 2) return e.group;
  if (e.group >= 13) return e.group - 10;
  return null;
}
