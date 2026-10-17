import {
  Activity, Apple, Atom, Baby, Battery, Beaker, Bone, Boxes, Brain, Bug, Cog, Dna, Droplet, Droplets, Earth, Egg, Eye, Filter, Fish, Flame, FlaskConical, Flower2, Footprints, Fuel, Gauge, Gem, GitBranch, Hand, HeartPulse, Hexagon, Hourglass, Layers, Leaf, Lightbulb, Link, Magnet, Microscope, Mountain, PawPrint, Pickaxe, Pill, Puzzle, Rabbit, Radiation, Radio, Recycle, Rocket, Ruler, Scale, Shapes, Shell, Snail, Snowflake, Sparkles, Sprout, Sun, Syringe, Target, Telescope, TestTubes, Trees, Turtle, Users, Utensils, Waves, Wheat, Wind, Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Section } from '../../data/curriculum';

/* An icon for every textbook section, picked from its title. First match wins, so specific rules go first. */

const RULES: [RegExp, LucideIcon][] = [
  // words hidden inside other words go first: «углеВОДОРОДы», «НЕорганические», «многоКЛЕТочные», «обмен веществ и ЭНЕРГИИ»
  [/обмен веществ/, Recycle],
  [/углеводород/, Fuel],
  [/неорганическ/, FlaskConical],
  [/беспозвоноч/, Snail],
  [/жизнь растений/, Sprout],
  [/классификация растений/, Leaf],
  // physics
  [/вселенн|астрофиз/, Telescope],
  [/элементарн/, Sparkles],
  [/ядр/, Radiation],
  [/квантов/, Sun],
  [/относительност/, Hourglass],
  [/магнитн(?:ое|ые) (?:поле|явлен)|^магнит/, Magnet],
  [/индукц/, Cog],
  [/электромагнитн.*колеб/, Radio],
  [/волн|звук/, Waves],
  [/колеб/, Activity],
  [/оптик|свет/, Lightbulb],
  [/электромагнитн/, Magnet],
  [/электростат|электрическ|ток/, Zap],
  [/термодин|теплов/, Flame],
  [/агрегатн|молекулярная физ/, Snowflake],
  [/давлен/, Gauge],
  [/кинемат|движени/, Rocket],
  [/динамик|взаимодейств/, Target],
  [/сохранен|работа и мощн|энерги/, Battery],
  [/статик/, Scale],
  // chemistry
  [/кислородсодерж/, Apple],
  [/азотсодерж/, Egg],
  [/кислород|горени/, Flame],
  [/водород/, Wind],
  [/вода\.|раствор/, Droplets],
  [/периодическ|строение атома/, Atom],
  [/связь\. овр|химическая связь/, Link],
  [/диссоциац/, Beaker],
  [/химические реакц/, TestTubes],
  [/неметалл/, Gem],
  [/металл/, Pickaxe],
  [/углеводород/, Fuel],
  [/полимер/, Layers],
  [/генетическая связь/, GitBranch],
  [/органическ/, Hexagon],
  [/химия и жизнь/, Pill],
  [/строение вещества/, Boxes],
  [/неорганическ|вещества и их свойств|химические понятия/, FlaskConical],
  // biology
  [/кровообращ/, HeartPulse],
  [/кровь|внутренняя среда/, Droplet],
  [/опорно/, Bone],
  [/дыхани/, Wind],
  [/пищеварен/, Utensils],
  [/обмен веществ/, Recycle],
  [/выделени/, Filter],
  [/^кожа/, Hand],
  [/эндокрин/, Syringe],
  [/нервн/, Brain],
  [/анализатор|органы чувств/, Eye],
  [/развитие человека/, Baby],
  [/размножени/, Egg],
  [/молекулярный уровень|генетик|наслед/, Dna],
  [/химический состав клетки/, Beaker],
  [/клетк|клеточн/, Microscope],
  [/простейш/, Bug],
  [/беспозвоноч/, Snail],
  [/хордов/, Fish],
  [/эволюция животн|^эволюция/, Turtle],
  [/животн/, PawPrint],
  [/покрытосемен|растени/, Flower2],
  [/сообществ|экосистем|эколог/, Trees],
  [/биосфер/, Earth],
  [/сред.* обитания/, Mountain],
  [/происхождение человека|человек на земле/, Footprints],
  [/происхождение и развитие жизни/, Shell],
  [/изменчив/, Puzzle],
  [/селекци|биотехнол/, Wheat],
  [/популяц/, Users],
  [/организменн/, Rabbit],
  [/многообраз|классификац/, Shapes],
  [/общий обзор организма/, Users],
  [/наука о живом|общую биологию/, Sprout],
];

const FALLBACK: Record<string, LucideIcon> = { physics: Atom, chemistry: FlaskConical, biology: Leaf };

export function sectionIcon(s: Section): LucideIcon {
  const title = s.title.ru.toLowerCase();
  if (title === 'введение') return s.subject === 'physics' ? Ruler : s.subject === 'biology' ? Sprout : FlaskConical;
  return RULES.find(([re]) => re.test(title))?.[1] ?? FALLBACK[s.subject] ?? Atom;
}
