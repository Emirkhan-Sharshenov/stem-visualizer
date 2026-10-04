import React, { useState } from 'react';
import { Flame, AlertTriangle, RefreshCw, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BreakTheModelProps {
  lang: 'ru' | 'en';
  onUnlockMilestone: (id: string) => void;
}

export type BreakChallenge = 'pauli' | 'orbit' | 'cyanide';

export const BreakTheModel: React.FC<BreakTheModelProps> = ({ lang, onUnlockMilestone }) => {
  const [activeChallenge, setActiveChallenge] = useState<BreakChallenge>('pauli');

  // Pauli state
  const [electronsIn1s, setElectronsIn1s] = useState<('up' | 'down')[]>(['up', 'down']);
  const [pauliError, setPauliError] = useState<string | null>(null);

  // Orbit state
  const [velocity, setVelocity] = useState<number>(100); // 100% is circular
  const [orbitResult, setOrbitResult] = useState<'stable' | 'crashed' | 'escaped'>('stable');

  // Cyanide state
  const [isPoisoned, setIsPoisoned] = useState<boolean>(false);
  const [atpLevel, setAtpLevel] = useState<number>(100);

  const handleAddElectron = (spin: 'up' | 'down') => {
    if (electronsIn1s.length >= 2) {
      setPauliError(
        lang === 'ru'
          ? 'НАРУШЕНИЕ ПРИНЦИПА ПАУЛИ! В одной квантовой ячейке (1s) не могут находиться более двух электронов, и они обязаны иметь противоположные спины (↑ и ↓)!'
          : 'PAULI EXCLUSION VIOLATION! An orbital can hold at most 2 electrons with opposing spins (↑ and ↓). Nature strictly forbids a third fermion in this state!'
      );
      onUnlockMilestone('broke_the_model');
      confetti({ particleCount: 50, spread: 70 });
      return;
    }
    setPauliError(null);
    setElectronsIn1s([...electronsIn1s, spin]);
  };

  const handleSimulateOrbit = () => {
    if (velocity < 65) {
      setOrbitResult('crashed');
      onUnlockMilestone('broke_the_model');
      confetti({ particleCount: 50, spread: 70 });
    } else if (velocity > 145) {
      setOrbitResult('escaped');
      onUnlockMilestone('broke_the_model');
      confetti({ particleCount: 50, spread: 70 });
    } else {
      setOrbitResult('stable');
    }
  };

  const handleTogglePoison = () => {
    const next = !isPoisoned;
    setIsPoisoned(next);
    if (next) {
      let lvl = 100;
      const interval = setInterval(() => {
        lvl -= 15;
        if (lvl <= 5) {
          setAtpLevel(5);
          clearInterval(interval);
        } else {
          setAtpLevel(lvl);
        }
      }, 150);
      onUnlockMilestone('broke_the_model');
      confetti({ particleCount: 50, spread: 70 });
    } else {
      setAtpLevel(100);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {lang === 'ru' ? 'Режим «Сломай модель» (Sandbox Challenge)' : '"Break the Model" Sandbox Mode'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'ru'
                ? 'Намеренно нарушь физические или химические законы, чтобы понять, ПОЧЕМУ они существуют!'
                : 'Intentionally violate physical or chemical laws to discover WHY nature enforces them!'}
            </p>
          </div>
        </div>

        {/* Challenge Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'pauli', label: { en: '1. Overload Orbital (Chemistry)', ru: '1. Перегрузи орбиталь (Химия)' } },
            { id: 'orbit', label: { en: '2. Crash the Orbit (Physics)', ru: '2. Разрушь орбиту (Физика)' } },
            { id: 'cyanide', label: { en: '3. Inhibit ATP (Biology)', ru: '3. Отключи АТФ (Биология)' } },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChallenge(c.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChallenge === c.id
                  ? 'bg-rose-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Challenge Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        {activeChallenge === 'pauli' && (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1 flex flex-col gap-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {lang === 'ru' ? 'ВЫЗОВ: ПРИНЦИП ЗАПРЕТА ПАУЛИ' : 'CHALLENGE: PAULI EXCLUSION PRINCIPLE'}
              </span>
              <h3 className="text-base font-bold text-slate-100">
                {lang === 'ru' ? 'Попробуй добавить третий электрон в орбиталь 1s' : 'Try adding a 3rd electron to the 1s orbital box'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {lang === 'ru'
                  ? 'В квантовой механике электроны являются фермионами со спином s = 1/2. Принцип Паули гласит: никакие два фермиона не могут находиться в одном и том же квантовом состоянии. Попробуй нарушить этот закон!'
                  : 'In quantum mechanics, electrons are fermions with half-integer spin (s = 1/2). The Pauli Exclusion Principle forbids any two fermions from having identical sets of quantum numbers (n, ℓ, m, s). Try violating this rule!'}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAddElectron('up')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {lang === 'ru' ? 'Добавить электрон ↑ (Spin Up)' : 'Add Electron ↑ (Spin Up)'}
                </button>
                <button
                  onClick={() => setElectronsIn1s(['up', 'down'])}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Сброс' : 'Reset'}
                </button>
              </div>

              {pauliError && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2.5 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{pauliError}</span>
                </div>
              )}
            </div>

            {/* Visual Quantum Box */}
            <div className="w-64 h-64 bg-slate-950 rounded-2xl border-2 border-indigo-500/40 p-6 flex flex-col items-center justify-between shadow-inner">
              <span className="text-xs font-mono text-slate-400 font-bold">1s Orbital Box [n=1, ℓ=0]</span>

              <div className="flex items-center justify-center gap-6 h-28 w-full border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                {electronsIn1s.map((spin, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-16 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-2xl shadow-lg"
                  >
                    {spin === 'up' ? '↑' : '↓'}
                  </div>
                ))}
                {electronsIn1s.length < 2 && (
                  <div className="text-slate-600 text-xs font-mono">{lang === 'ru' ? 'Свободно' : 'Empty'}</div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {lang === 'ru' ? 'Заполнение:' : 'Occupancy:'} {electronsIn1s.length} / 2 {lang === 'ru' ? 'электрона' : 'electrons'}
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 'orbit' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {lang === 'ru' ? 'ВЫЗОВ: ОРБИТАЛЬНАЯ НЕСТАБИЛЬНОСТЬ' : 'CHALLENGE: ORBITAL COLLAPSE OR ESCAPE'}
              </span>
              <h3 className="text-base font-bold text-slate-100">
                {lang === 'ru' ? 'Управляй скоростью спутника: урони его на планету или выброси в космос' : 'Control satellite orbital speed: crash it or eject it into deep space'}
              </h3>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-2/3">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'ru' ? 'Орбитальная скорость' : 'Orbital Velocity (% of circular speed)'}</span>
                  <span className="font-mono text-cyan-400 font-bold">{velocity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <button
                onClick={handleSimulateOrbit}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
              >
                {lang === 'ru' ? 'ЗАПУСТИТЬ ТРАЕКТОРИЮ' : 'SIMULATE TRAJECTORY'}
              </button>
            </div>

            {/* Visual feedback */}
            <div className="p-4 rounded-xl border bg-slate-950 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === 'ru' ? 'Состояние орбиты:' : 'Orbital State:'}</span>
              <span className={`font-bold font-mono text-sm ${
                orbitResult === 'stable' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {orbitResult === 'stable' && (lang === 'ru' ? 'Устойчивая круговая орбита (v = √(GM/r))' : 'Stable circular orbit (v = √(GM/r))')}
                {orbitResult === 'crashed' && (lang === 'ru' ? 'КАТАСТРОФА: Гравитация пересилила, спутник упал на планету!' : 'CRASH: Gravity overcame centripetal velocity!')}
                {orbitResult === 'escaped' && (lang === 'ru' ? 'ВЫБРОС В КОСМОС: Скорость превысила вторую космическую √(2)·v!' : 'ESCAPE: Velocity exceeded parabolic escape speed!')}
              </span>
            </div>
          </div>
        )}

        {activeChallenge === 'cyanide' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {lang === 'ru' ? 'ВЫЗОВ: БЛОКИРОВКА КЛЕТОЧНОГО ДЫХАНИЯ' : 'CHALLENGE: CELLULAR RESPIRATION SHUTDOWN'}
              </span>
              <h3 className="text-base font-bold text-slate-100">
                {lang === 'ru' ? 'Заблокируй цитохромоксидазу (Комплекс IV) цианидом' : 'Inhibit Cytochrome c Oxidase with Cyanide'}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleTogglePoison}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                  isPoisoned
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {isPoisoned
                  ? (lang === 'ru' ? 'Очистить ингибитор (Восстановить клетку)' : 'Clear Inhibitor (Restore Cell)')
                  : (lang === 'ru' ? 'Ввести цианид (Сломать градиент H+)' : 'Inject Cyanide (Inhibit H+ Pump)')}
              </button>
            </div>

            {/* ATP Gauge */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{lang === 'ru' ? 'Уровень синтеза АТФ в клетке' : 'Cellular ATP Generation Rate'}</span>
                <span className={`font-mono font-bold ${atpLevel < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {atpLevel}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${atpLevel < 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${atpLevel}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                {isPoisoned
                  ? (lang === 'ru'
                      ? 'Электроны застряли в дыхательной цепи. Протоны больше не перекачиваются в межмембранное пространство. Турбина АТФ-синтазы остановилась из-за отсутствия протон-движущей силы!'
                      : 'Electron flow is arrested at Complex IV. Proton pumping collapses. The ATP synthase turbine stalls due to zero electrochemical motive force!')
                  : (lang === 'ru'
                      ? 'Все комплексы дыхательной цепи работают штатно, непрерывно генерируя протонный градиент.'
                      : 'Normal state: H+ protons are actively pumped, powering steady rotary ATP synthesis.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
