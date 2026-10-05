import { Board, DEFAULTS, Part, PartType } from './solver';

type T2 = { ru: string; en: string };
const t = (ru: string, en: string): T2 => ({ ru, en });

export interface CircuitPreset {
  id: string;
  title: T2;
  laws: T2;
  hint: T2;
  /** part to select first */
  focus?: string;
  make: () => Board;
}

function builder() {
  const b: Board = {};
  const put = (key: string, type: PartType, patch: Partial<Part> = {}) => {
    b[key] = { ...DEFAULTS[type], ...patch };
  };
  /** wires along a rectangle's border, (x1,y1) top-left to (x2,y2) bottom-right */
  const loop = (x1: number, y1: number, x2: number, y2: number) => {
    for (let x = x1; x < x2; x++) {
      put(`h:${x},${y1}`, 'wire');
      put(`h:${x},${y2}`, 'wire');
    }
    for (let y = y1; y < y2; y++) {
      put(`v:${x1},${y}`, 'wire');
      put(`v:${x2},${y}`, 'wire');
    }
  };
  /** a meter drawn in parallel with the horizontal part at h:x,y, one row below (or above with dy = -1) */
  const across = (x: number, y: number, dy: 1 | -1, type: PartType = 'voltmeter') => {
    const yy = y + dy;
    const top = Math.min(y, yy);
    put(`v:${x},${top}`, 'wire');
    put(`v:${x + 1},${top}`, 'wire');
    put(`h:${x},${yy}`, type);
  };
  return { b, put, loop, across };
}

export const CIRCUITS: CircuitPreset[] = [
  {
    id: 'simple',
    title: t('Простая цепь', 'Simple circuit'),
    laws: t('Закон Ома для участка и для полной цепи', 'Ohm’s law for a part and for the whole circuit'),
    hint: t('Замкни ключ. Амперметр включён последовательно, вольтметр — параллельно лампе. Проверь: I = ε / (R + r), U = I·R.', 'Close the switch. The ammeter is in series, the voltmeter across the lamp. Check: I = ε / (R + r), U = I·R.'),
    focus: 'v:7,2',
    make: () => {
      const { b, put, loop } = builder();
      loop(1, 1, 7, 4);
      put('h:3,1', 'battery');
      put('h:5,1', 'switch', { on: true });
      put('v:7,2', 'lamp');
      put('h:4,4', 'ammeter');
      put('h:7,2', 'wire');
      put('h:7,3', 'wire');
      put('v:8,2', 'voltmeter');
      return b;
    },
  },
  {
    id: 'series',
    title: t('Последовательное соединение', 'Series connection'),
    laws: t('Ток везде одинаковый, напряжения складываются', 'Same current everywhere, voltages add up'),
    hint: t('Сравни показания вольтметров: U = U₁ + U₂, а U₁ / U₂ = R₁ / R₂. Поменяй сопротивления и посмотри, как делится напряжение.', 'Compare the voltmeters: U = U₁ + U₂ and U₁ / U₂ = R₁ / R₂. Change the resistances and watch the voltage split.'),
    focus: 'h:2,4',
    make: () => {
      const { b, put, loop, across } = builder();
      loop(1, 1, 7, 4);
      put('h:3,1', 'battery', { emf: 6, r: 0 });
      put('v:7,2', 'ammeter');
      put('h:2,4', 'resistor', { R: 10 });
      put('h:5,4', 'resistor', { R: 20 });
      across(2, 4, 1);
      across(5, 4, 1);
      return b;
    },
  },
  {
    id: 'parallel',
    title: t('Параллельное соединение', 'Parallel connection'),
    laws: t('Напряжение одинаковое, токи складываются', 'Same voltage, currents add up'),
    hint: t('Общий ток равен сумме токов ветвей: I = I₁ + I₂. Лампа с меньшим сопротивлением горит ярче. Выкрути одну лампу — вторая продолжит гореть.', 'The main current is the sum of the branches: I = I₁ + I₂. The lower-resistance lamp is brighter. Remove one lamp: the other keeps shining.'),
    focus: 'h:2,1',
    make: () => {
      const { b, put } = builder();
      for (let x = 1; x < 7; x++) {
        put(`h:${x},1`, 'wire');
        put(`h:${x},4`, 'wire');
      }
      put('v:1,1', 'wire');
      put('v:1,2', 'battery', { emf: 6, r: 0, dir: -1 });
      put('v:1,3', 'wire');
      put('h:2,1', 'ammeter');
      put('v:4,1', 'wire');
      put('v:4,2', 'lamp', { R: 6 });
      put('v:4,3', 'ammeter');
      put('v:7,1', 'wire');
      put('v:7,2', 'lamp', { R: 12 });
      put('v:7,3', 'ammeter');
      return b;
    },
  },
  {
    id: 'rheostat',
    title: t('Реостат и лампа', 'Rheostat and lamp'),
    laws: t('Закон Ома + закон Джоуля–Ленца', 'Ohm’s law + Joule–Lenz law'),
    hint: t('Уменьшай сопротивление реостата: ток растёт, лампа горит ярче — её мощность P = I²R. Если перестараться, лампа перегорит.', 'Lower the rheostat: the current grows and the lamp gets brighter, since its power is P = I²R. Overdo it and the lamp burns out.'),
    focus: 'h:2,4',
    make: () => {
      const { b, put, loop } = builder();
      loop(1, 1, 7, 4);
      put('h:3,1', 'battery', { emf: 12, r: 0.5 });
      put('v:7,2', 'lamp', { R: 8 });
      put('h:2,4', 'rheostat', { R: 20 });
      put('h:5,4', 'ammeter');
      return b;
    },
  },
  {
    id: 'emf',
    title: t('ЭДС и внутреннее сопротивление', 'EMF and internal resistance'),
    laws: t('Закон Ома для полной цепи: U = ε − Ir', 'Ohm’s law for a full circuit: U = ε − Ir'),
    hint: t('Вольтметр стоит прямо на батарейке. Чем больше ток, тем меньше он показывает: часть напряжения «теряется» внутри батарейки. Разомкни ключ — вольтметр покажет саму ЭДС.', 'The voltmeter sits right on the battery. The more current flows, the less it reads, because some voltage is lost inside the battery. Open the switch and it shows the EMF itself.'),
    focus: 'h:3,1',
    make: () => {
      const { b, put, loop, across } = builder();
      loop(1, 1, 7, 4);
      put('h:3,1', 'battery', { emf: 6, r: 2 });
      across(3, 1, -1);
      put('h:5,1', 'switch', { on: true });
      put('v:7,2', 'rheostat', { R: 4 });
      put('h:4,4', 'ammeter');
      return b;
    },
  },
  {
    id: 'mixed',
    title: t('Смешанное соединение', 'Mixed connection'),
    laws: t('Последовательное + параллельное, правила Кирхгофа', 'Series + parallel, Kirchhoff’s rules'),
    hint: t('R₁ стоит последовательно с парой R₂ ∥ R₃. Посчитай общее сопротивление R = R₁ + R₂R₃/(R₂ + R₃) и сравни ток с амперметром.', 'R₁ is in series with the pair R₂ ∥ R₃. Work out R = R₁ + R₂R₃/(R₂ + R₃) and compare the current with the ammeter.'),
    focus: 'h:2,4',
    make: () => {
      const { b, put } = builder();
      for (let x = 1; x < 7; x++) put(`h:${x},4`, 'wire');
      for (let x = 1; x < 4; x++) put(`h:${x},1`, 'wire');
      put('v:1,1', 'wire');
      put('v:1,2', 'battery', { emf: 9, r: 0, dir: -1 });
      put('v:1,3', 'wire');
      put('h:2,4', 'resistor', { R: 4 });
      put('h:4,1', 'ammeter');
      // two branches between (5,1)-(7,1) and (5,3)… drawn as a ladder
      put('h:5,1', 'wire');
      put('h:6,1', 'wire');
      put('v:5,1', 'wire');
      put('v:5,2', 'resistor', { R: 6 });
      put('v:5,3', 'wire');
      put('v:7,1', 'wire');
      put('v:7,2', 'resistor', { R: 12 });
      put('v:7,3', 'wire');
      return b;
    },
  },
  {
    id: 'empty',
    title: t('Пустая плата', 'Empty board'),
    laws: t('Собери свою цепь', 'Build your own circuit'),
    hint: t('Выбери деталь и нажми между двумя точками. Провода удобно тянуть пальцем от точки к точке. Нажми на деталь, чтобы изменить её.', 'Pick a part and tap between two dots. Drag from dot to dot to lay wires. Tap a part to change it.'),
    make: () => ({}),
  },
];
