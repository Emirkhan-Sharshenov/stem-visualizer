import type React from 'react';
import { BallUp, Cube, Parallel, Pythagoras, Salt, Skier, Train, type VisualProps } from './visuals';
import VOICE from './voice.json';

/* The seven "problem of the day" reels. `lines` are the voice lines (DAILY-PROBLEM-SCRIPT.md), one role each;
   `voice` holds where each line sits in the ElevenLabs take, in seconds, once the take is split. */

export type Role = 'hook' | 'cond' | 'ask' | 'step' | 'answer' | 'cta';

export interface DailyProblem {
  id: string;
  subject: 'Физика' | 'Химия' | 'Геометрия';
  color: string;
  topic: string;
  condition: string;
  find: string;
  steps: { label: string; math: string }[];
  answer: string;
  note?: string;
  Visual: React.FC<VisualProps>;
  lines: [Role, string][];
  voice?: [number, number][];
}

/** where each line sits in its take (split from the pauses, see voice.json) */
const withVoice = (p: Omit<DailyProblem, 'voice'>): DailyProblem => ({ ...p, voice: (VOICE as unknown as Record<string, [number, number][]>)[p.id] });

const HOOK: [Role, string] = ['hook', 'Задача дня. Решишь за три секунды?'];
const CTA: [Role, string] = ['cta', 'Сколько получилось у тебя? Пиши в комментариях. Ещё девять задач — в вызове дня, ссылка в профиле.'];
const PHYS = '#E5484D';

const LIST: Omit<DailyProblem, 'voice'>[] = [
  {
    id: 'zd-01',
    subject: 'Физика',
    color: PHYS,
    topic: 'Механика · 9 класс',
    condition: 'Мяч бросили вертикально вверх со скоростью 20 м/с. На какую высоту он поднимется?',
    find: 'h — ?',
    steps: [
      { label: 'ИДЕЯ', math: 'Eк → Eп' },
      { label: 'ФОРМУЛА', math: 'h = v² / 2g' },
      { label: 'СЧИТАЕМ', math: 'h = 400 / 20' },
    ],
    answer: '20 м',
    Visual: BallUp,
    lines: [
      HOOK,
      ['cond', 'Мяч бросили вертикально вверх со скоростью двадцать метров в секунду.'],
      ['ask', 'На какую высоту он поднимется?'],
      ['step', 'Вся кинетическая энергия переходит в потенциальную.'],
      ['step', 'Высота — это квадрат скорости, делённый на два «же».'],
      ['step', 'Четыреста делим на двадцать.'],
      ['answer', 'Ответ — двадцать метров.'],
      CTA,
    ],
  },
  {
    id: 'zd-02',
    subject: 'Физика',
    color: PHYS,
    topic: 'Электричество · 8 класс',
    condition: 'Два резистора по 6 Ом соединили параллельно. Каким стало общее сопротивление?',
    find: 'R — ?',
    steps: [
      { label: 'ИДЕЯ', math: 'два пути для тока' },
      { label: 'ФОРМУЛА', math: 'R = R₁ / n' },
      { label: 'СЧИТАЕМ', math: 'R = 6 / 2' },
    ],
    answer: '3 Ом',
    Visual: Parallel,
    lines: [
      HOOK,
      ['cond', 'Два резистора по шесть ом соединили параллельно.'],
      ['ask', 'Каким стало общее сопротивление?'],
      ['step', 'У тока теперь два пути, и пройти ему легче.'],
      ['step', 'Одинаковые резисторы параллельно — делим сопротивление на их число.'],
      ['step', 'Шесть делим на два.'],
      ['answer', 'Ответ — три ома.'],
      CTA,
    ],
  },
  {
    id: 'zd-03',
    subject: 'Химия',
    color: '#30A46C',
    topic: 'Растворы · 8 класс',
    condition: 'Сколько граммов соли в 200 г 15-процентного раствора?',
    find: 'm(соли) — ?',
    steps: [
      { label: 'ИДЕЯ', math: 'ω = m(соли) / m(р-ра)' },
      { label: 'ПЕРЕВОДИМ', math: '15 % = 0,15' },
      { label: 'СЧИТАЕМ', math: '0,15 · 200' },
    ],
    answer: '30 г',
    Visual: Salt,
    lines: [
      HOOK,
      ['ask', 'Сколько граммов соли в двухстах граммах пятнадцатипроцентного раствора?'],
      ['step', 'Массовая доля — это какая часть раствора приходится на соль.'],
      ['step', 'Пятнадцать процентов — это ноль целых пятнадцать сотых.'],
      ['step', 'Умножаем на двести.'],
      ['answer', 'Ответ — тридцать граммов.'],
      CTA,
    ],
  },
  {
    id: 'zd-04',
    subject: 'Физика',
    color: PHYS,
    topic: 'Движение · 7 класс',
    condition: 'Поезд едет со скоростью 72 км/ч. Сколько метров он проедет за 10 секунд?',
    find: 's — ?',
    steps: [
      { label: 'ПЕРЕВОДИМ', math: '72 км/ч : 3,6' },
      { label: 'СКОРОСТЬ', math: 'v = 20 м/с' },
      { label: 'СЧИТАЕМ', math: 's = 20 · 10' },
    ],
    answer: '200 м',
    Visual: Train,
    lines: [
      HOOK,
      ['cond', 'Поезд едет со скоростью семьдесят два километра в час.'],
      ['ask', 'Сколько метров он проедет за десять секунд?'],
      ['step', 'Сначала переводим скорость в метры в секунду: делим на три и шесть.'],
      ['step', 'Получается двадцать метров в секунду.'],
      ['step', 'Умножаем на десять секунд.'],
      ['answer', 'Ответ — двести метров.'],
      CTA,
    ],
  },
  {
    id: 'zd-05',
    subject: 'Геометрия',
    color: '#8E4EC6',
    topic: 'Теорема Пифагора · 8 класс',
    condition: 'Катеты прямоугольного треугольника — 6 и 8. Чему равна гипотенуза?',
    find: 'c — ?',
    steps: [
      { label: 'ТЕОРЕМА', math: 'c² = a² + b²' },
      { label: 'СЧИТАЕМ', math: '36 + 64 = 100' },
      { label: 'КОРЕНЬ', math: 'c = √100' },
    ],
    answer: '10',
    note: 'Египетский треугольник 6-8-10',
    Visual: Pythagoras,
    lines: [
      HOOK,
      ['cond', 'Катеты прямоугольного треугольника — шесть и восемь.'],
      ['ask', 'Чему равна гипотенуза?'],
      ['step', 'По теореме Пифагора: шесть в квадрате плюс восемь в квадрате.'],
      ['step', 'Тридцать шесть плюс шестьдесят четыре — сто.'],
      ['step', 'Корень из ста.'],
      ['answer', 'Ответ — десять. Это египетский треугольник, его стоит запомнить.'],
      CTA,
    ],
  },
  {
    id: 'zd-06',
    subject: 'Физика',
    color: PHYS,
    topic: 'Плотность · 7 класс',
    condition: 'Кубик с ребром 2 см весит 21,6 г. Из какого он металла?',
    find: 'ρ — ?',
    steps: [
      { label: 'ОБЪЁМ', math: 'V = 2³ = 8 см³' },
      { label: 'ФОРМУЛА', math: 'ρ = m / V' },
      { label: 'СЧИТАЕМ', math: '21,6 / 8 = 2,7' },
    ],
    answer: 'Алюминий',
    Visual: Cube,
    lines: [
      HOOK,
      ['cond', 'Кубик с ребром два сантиметра весит двадцать один и шесть десятых грамма.'],
      ['ask', 'Из какого он металла?'],
      ['step', 'Объём кубика — два в кубе, восемь кубических сантиметров.'],
      ['step', 'Плотность — масса, делённая на объём.'],
      ['step', 'Двадцать один и шесть делим на восемь — два и семь.'],
      ['answer', 'Ответ — алюминий.'],
      CTA,
    ],
  },
  {
    id: 'zd-07',
    subject: 'Физика',
    color: PHYS,
    topic: 'Давление · 7 класс',
    condition: 'Лыжник массой 60 кг стоит на лыжах площадью 0,3 м². Какое давление он оказывает на снег?',
    find: 'p — ?',
    steps: [
      { label: 'СИЛА', math: 'F = 60 · 10 = 600 Н' },
      { label: 'ФОРМУЛА', math: 'p = F / S' },
      { label: 'СЧИТАЕМ', math: 'p = 600 / 0,3' },
    ],
    answer: '2000 Па',
    Visual: Skier,
    lines: [
      HOOK,
      ['cond', 'Лыжник массой шестьдесят килограммов стоит на лыжах площадью ноль целых три десятых квадратного метра.'],
      ['ask', 'Какое давление он оказывает на снег?'],
      ['step', 'Сила — это вес: шестьдесят умножаем на десять, шестьсот ньютонов.'],
      ['step', 'Давление — сила, делённая на площадь.'],
      ['step', 'Шестьсот делим на ноль целых три десятых.'],
      ['answer', 'Ответ — две тысячи паскалей.'],
      CTA,
    ],
  },
];

export const PROBLEMS: DailyProblem[] = LIST.map(withVoice);
