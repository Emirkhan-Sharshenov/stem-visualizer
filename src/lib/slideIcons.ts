import {
  Apple, Atom, BatteryCharging, Beaker, Bird, Bone, Box, Brain, Bug, Calculator, ChartLine, ChartSpline, Circle, Cog, Compass, Cylinder, Dices, Divide, Dna, Droplets, Ear, Egg, Eye, FlaskConical, Flame, Flower2,
  Footprints, Gauge, Gem, Hash, HeartPulse, Hexagon, Leaf, Lightbulb, Magnet, Microscope, MoveUpRight, Orbit, PawPrint, Percent, Pi, Pill, Radiation, Radical, Rocket, Ruler, Shield, Sigma, Snowflake, Sparkles,
  Sprout, Square, Sun, Superscript, Telescope, TestTubes, Thermometer, Timer, Trees, Triangle, Users, Volume2, Waves, Weight, Wind, Zap, Fish, Grid3x3, type LucideIcon,
} from 'lucide-react';

/* A picture for a slide, chosen from its words. The first rule that matches wins, so narrow words go first. */

export const SLIDE_ICONS = {
  Apple, Atom, BatteryCharging, Beaker, Bird, Bone, Box, Brain, Bug, Calculator, ChartLine, ChartSpline, Circle, Cog, Compass, Cylinder, Dices, Divide, Dna, Droplets, Ear, Egg, Eye, FlaskConical, Flame, Flower2,
  Footprints, Gauge, Gem, Hash, HeartPulse, Hexagon, Leaf, Lightbulb, Magnet, Microscope, MoveUpRight, Orbit, PawPrint, Percent, Pi, Pill, Radiation, Radical, Rocket, Ruler, Shield, Sigma, Snowflake, Sparkles,
  Sprout, Square, Sun, Superscript, Telescope, TestTubes, Thermometer, Timer, Trees, Triangle, Users, Volume2, Waves, Weight, Wind, Zap, Fish, Grid3x3,
} satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof SLIDE_ICONS;

type Rule = [RegExp, IconName];
const BIO: Rule[] = [
  [/сердц|кров[ьио]|пульс|сосуд|артери|вен[аы]|heart|blood/, 'HeartPulse'],
  [/мозг|нерв|рефлекс|нейрон|brain|nerv|neuron/, 'Brain'],
  [/(^|[^а-яё])кост|скелет|мышц|позвоноч|bone|skelet|muscle/, 'Bone'],
  [/днк|рнк|(^|[^а-яё])ген(ы|а|ов|ом)?([^а-яё]|$)|генет|наслед|хромосом|мутац|dna|gene|heredit/, 'Dna'],
  [/клетк|ткан[ьи]|органоид|микроскоп|cell|tissue|microscop/, 'Microscope'],
  [/иммун|бактери|вирус|болезн|инфекц|immun|bacteri|virus|disease/, 'Shield'],
  [/лекарств|медицин|прививк|medicine|vaccin/, 'Pill'],
  [/фотосинт|хлорофил|лист[ьяе]|photosynth|leaf/, 'Leaf'],
  [/цвет[оку]|цветк|опылен|семя|семен|плод|flower|seed|pollin/, 'Flower2'],
  [/прораст|(^|[^а-яё])росток|(^|[^а-яё])(корен|корн[еия])|стебл|побег|root|stem|sprout/, 'Sprout'],
  [/лес[аеу ]|деревь|экосистем|биоценоз|экологи|пищев(ая|ые) цеп|forest|ecosystem|ecolog/, 'Trees'],
  [/насеком|членистоног|паук|бабочк|insect|spider|butterfl/, 'Bug'],
  [/рыб[аыу]|fish/, 'Fish'],
  [/птиц|bird/, 'Bird'],
  [/млекопит|звер|животн|mammal|animal/, 'PawPrint'],
  [/пищеварен|питан|витамин|желуд|кишечн|food|digest|vitamin/, 'Apple'],
  [/дыхан|лёгк|легки|вдох|breath|lung/, 'Wind'],
  [/эволюц|отбор|дарвин|evolution|selection|darwin/, 'Footprints'],
  [/размнож|зародыш|эмбрион|онтогенез|яйцеклет|reproduc|embryo/, 'Egg'],
  [/глаз|зрени|eye|vision/, 'Eye'],
  [/(^|[^а-яё])ух[оа]|слух|hearing/, 'Ear'],
  [/человек|популяц|люд[иея]|human|population/, 'Users'],
];
const MATH: Rule[] = [
  [/тригоном|синус|косинус|тангенс|радиан|trigonom|sine|cosine/, 'Pi'],
  [/производн|интеграл|первообразн|предел|derivat|integral|limit/, 'Sigma'],
  [/вероятн|комбинатор|случайн|кубик|probabil|combinator/, 'Dices'],
  [/прогресси|последовательност|sequence|progression/, 'ChartLine'],
  [/график|функци|парабол|гипербол|graph|function|parabola/, 'ChartSpline'],
  [/вектор|vector/, 'MoveUpRight'],
  [/координат|coordinat/, 'Compass'],
  [/цилиндр|конус|шар[аеу ]|сфер|cylinder|cone|sphere/, 'Cylinder'],
  [/объём|объем|призм|пирамид|куб[аеу ]|параллелепипед|многогранник|volume|prism|pyramid|cube/, 'Box'],
  [/треугольн|пифагор|катет|гипотенуз|triangle|pythagor|hypotenuse/, 'Triangle'],
  [/окружност|круг[аеу ]|circle/, 'Circle'],
  [/квадрат|прямоугольн|четырёхугольн|ромб|трапеци|площад|square|rectangl|area/, 'Square'],
  [/процент|percent/, 'Percent'],
  [/дроб|fraction|ratio|пропорц/, 'Divide'],
  [/(^|[^а-яё])(корен|корн[яеиь])|радикал|√|radical|square root/, 'Radical'],
  [/степен|exponent|power of/, 'Superscript'],
  [/уравнен|неравенств|выражен|вычисл|equation|inequalit|expression/, 'Calculator'],
  [/делимост|натуральн|делител|кратн|divisib|natural number/, 'Hash'],
];
const PHYS: Rule[] = [
  [/ядр[аоеу]|радиоакт|распад|изотоп|nucle|radioact|isotope/, 'Radiation'],
  [/космос|космич|орбит|спутник|планет|галакт|звёзд|звезд|orbit|satellite|planet|galax|star/, 'Orbit'],
  [/солнц|солнеч|sun|solar/, 'Sun'],
  [/ракет|реактивн|rocket|jet/, 'Rocket'],
  [/магнит|индукц|magnet|induct/, 'Magnet'],
  [/батаре|аккумулят|эдс|гальванич|электролиз|battery|cell voltage|electroly/, 'BatteryCharging'],
  [/(^|[^а-яё])ток|напряжен|электр|заряд|(^|[^а-яё])цеп[ьи]|сопротивлен|current|voltage|charge|circuit|resist/, 'Zap'],
  [/ламп|свет[аеу ]?|освещ|light|lamp/, 'Lightbulb'],
  [/линз|оптик|отражен|преломлен|зеркал|lens|optic|reflect|refract/, 'Eye'],
  [/звук|громк|шум|эхо|sound|noise|echo/, 'Volume2'],
  [/волн|колебан|частот|маятник|wave|oscillat|frequenc|pendulum/, 'Waves'],
  [/плавлен|лёд|льд|замерза|кристаллизац|melt|ice|freez/, 'Snowflake'],
  [/горен|топлив|пламя|сгоран|сжига|burn|fuel|flame|combust/, 'Flame'],
  [/температур|тепл|нагрев|теплов|temperat|heat|thermal/, 'Thermometer'],
  [/давлен|pressure/, 'Gauge'],
  [/(^|[^а-яё])масс|(^|[^а-яё])вес[ау ]|тяжест|mass|weight|gravity/, 'Weight'],
  [/рычаг|блок[аи]? |механизм|шестер|lever|pulley|mechanism/, 'Cog'],
  [/время|период|секунд|time|period/, 'Timer'],
  [/измерен|длин[аыу]|погрешн|прибор|measur|length|error/, 'Ruler'],
  [/сил[аыуе]|ньютон|force|newton/, 'MoveUpRight'],
  [/энерги|работ[аыу]|мощност|energy|work|power/, 'Sparkles'],
];
const CHEM: Rule[] = [
  [/периодическ|менделеев|таблиц[аеуы] (химическ|элемент)|групп[аы] и период/, 'Grid3x3'],
  [/кислот|основани|щёлоч|щелоч|индикатор|\bph\b|acid|alkali|base/, 'TestTubes'],
  [/металл|сплав|metal|alloy/, 'Gem'],
  [/молекул|химическ(ая|ой|ие) связ|решётк|решетк|кристалл|углерод|органич|углеводород|алкан|алкен|алкин|спирт|бензол|полимер|molecul|bond|lattice|carbon|organic|alkane|polymer/, 'Hexagon'],
  [/раствор|вод[аыуе]|жидкост|влаг|solution|water|liquid/, 'Droplets'],
  [/(^|[^а-яё])газ|воздух|ветер|атмосфер|gas|air|wind|atmospher/, 'Wind'],
  [/сол[ьие]|осад[ок]|salt|precipit/, 'Beaker'],
  [/реакци|реагент|реактив|реакц|reaction|reagent/, 'FlaskConical'],
  [/атом|электрон|протон|нейтрон|atom|electron|proton|neutron/, 'Atom'],
];

// a topic's own subject is searched first, so «галогены» in chemistry never turns into genetics
const BY_SUBJECT: Record<string, Rule[][]> = {
  biology: [BIO, CHEM, PHYS, MATH],
  chemistry: [CHEM, PHYS, BIO, MATH],
  physics: [PHYS, CHEM, MATH, BIO],
  mathematics: [MATH, PHYS, CHEM, BIO],
  astronomy: [PHYS, MATH, CHEM, BIO],
};

const FALLBACK: Record<string, IconName> = { physics: 'Atom', chemistry: 'FlaskConical', biology: 'Leaf', mathematics: 'Sigma', astronomy: 'Telescope' };

/** the first text that matches a rule decides; e.g. a point's title, then its text, then the topic's title */
export function iconFor(texts: string[], subject: string): IconName {
  const groups = BY_SUBJECT[subject] ?? [PHYS, CHEM, BIO, MATH];
  for (const t of texts) {
    const s = ` ${t.toLowerCase()} `;
    for (const g of groups) {
      const hit = g.find(([re]) => re.test(s));
      if (hit) return hit[1];
    }
  }
  return FALLBACK[subject] ?? 'Sparkles';
}
