import { Button } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sprout } from 'lucide-react';
import { SimShell } from './ui/SimShell';

interface MomentMendelProps {
  lang: 'ru' | 'en';
}

type Geno = 'AA' | 'Aa' | 'aa';
const PURPLE = '#9B7BFF';
const WHITE = '#F4F2FF';
const isPurple = (g: string) => g.includes('A');
const norm = (a: string, b: string) => (a === 'A' ? a + b : b + a) as Geno;

/** a pea flower: five petals round a yellow heart on a stem */
const Flower: React.FC<{ purple: boolean; size?: number; className?: string }> = ({ purple, size = 44, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" className={className} aria-hidden="true">
    <path d="M22 40V26" stroke="#3FA55B" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M22 34c-4 0-7-2-8-5 4-.5 7 1 8 5z" fill="#4CBF6A" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx="22" cy="10.5" rx="5.2" ry="7.4" transform={`rotate(${a} 22 18)`} fill={purple ? PURPLE : WHITE} stroke={purple ? '#6E54E0' : '#C9C4E6'} strokeWidth="0.8" />
    ))}
    <circle cx="22" cy="18" r="3.6" fill="#FFD25E" />
  </svg>
);

export const MomentMendel: React.FC<MomentMendelProps> = ({ lang }) => {
  const ru = lang === 'ru';
  const [mother, setMother] = useState<Geno>('Aa');
  const [father, setFather] = useState<Geno>('Aa');
  const [field, setField] = useState<Geno[]>([]);
  const [growing, setGrowing] = useState(false);
  const timer = useRef<number | null>(null);

  const mg = mother.split('');
  const fg = father.split('');
  const cells = mg.flatMap((m) => fg.map((f) => norm(m, f)));
  const purpleCells = cells.filter(isPurple).length;

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setGrowing(false);
  };
  useEffect(() => stop, []);
  // changing a parent starts a fresh field
  useEffect(() => {
    stop();
    setField([]);
  }, [mother, father]);

  const plant = () => {
    stop();
    setField([]);
    setGrowing(true);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const one = () => norm(mg[Math.random() < 0.5 ? 0 : 1], fg[Math.random() < 0.5 ? 0 : 1]);
    if (reduced) {
      setField(Array.from({ length: 100 }, one));
      setGrowing(false);
      return;
    }
    // two plants per tick; the whole bed is drawn up front so the updater stays pure
    const bed = Array.from({ length: 100 }, one);
    let n = 0;
    timer.current = window.setInterval(() => {
      n = Math.min(100, n + 2);
      setField(bed.slice(0, n));
      if (n >= 100) stop();
    }, 45);
  };

  const p = field.filter(isPurple).length;
  const wht = field.length - p;
  const expected = purpleCells / 4;

  const picker = (who: string, value: Geno, set: (g: Geno) => void) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#9AA3C7]">{who}</span>
      <div className="flex gap-1.5">
        {(['AA', 'Aa', 'aa'] as Geno[]).map((g) => (
          <button
            key={g}
            onClick={() => set(g)}
            aria-pressed={value === g}
            className={`h-10 px-3 rounded-xl font-mono font-bold text-[15px] transition-[background-color,transform] active:scale-[0.96] cursor-pointer ${value === g ? 'bg-[#5B4BFF] text-white' : 'bg-white/[0.07] text-[#C6CBE3] hover:bg-white/[0.12]'}`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <SimShell
      badge={ru ? '9–10 класс · Генетика' : 'Grades 9–10 · Genetics'}
      formula={ru ? 'Aa × Aa → 3 : 1' : 'Aa × Aa → 3 : 1'}
      title={ru ? 'Законы Менделя: почему белый цветок возвращается через поколение' : "Mendel's laws: why the white flower comes back a generation later"}
      actions={
        <>
          <Button size="sm" className="font-semibold" onPress={plant} isDisabled={growing}>
            <Sprout className="w-4 h-4" strokeWidth={2} />
            {ru ? 'Посадить 100 горошин' : 'Plant 100 peas'}
          </Button>
          {field.length > 0 && !growing && (
            <Button size="sm" variant="outline" isIconOnly aria-label={ru ? 'Очистить грядку' : 'Clear the bed'} onPress={() => setField([])}>
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
            </Button>
          )}
        </>
      }
      readouts={[
        { label: ru ? 'По решётке' : 'By the square', value: `${purpleCells} : ${4 - purpleCells}`, color: '#6E54E0' },
        { label: ru ? 'Выросло' : 'Grown', value: `${field.length}` },
        { label: ru ? 'Пурпурных' : 'Purple', value: field.length ? `${p} (${Math.round((p / field.length) * 100)}%)` : '—', color: '#6E54E0' },
        { label: ru ? 'Белых' : 'White', value: field.length ? `${wht} (${Math.round((wht / field.length) * 100)}%)` : '—' },
      ]}
      insight={{
        title: ru ? 'Закон расщепления' : 'The law of segregation',
        text: ru
          ? 'Каждый родитель отдаёт потомку только одну из двух своих копий гена. У двух пурпурных гетерозигот Aa каждый четвёртый потомок получает две «a» и цветёт белым. На 100 растениях доля белых получается около 25%, но не ровно: это случайность.'
          : 'Each parent passes on just one of its two copies of the gene. Two purple Aa parents give white aa offspring one time in four. Over 100 plants white comes out near 25%, but rarely exactly: it is chance.',
      }}
    >
      <div className="grid lg:grid-cols-[auto_1fr] gap-6 p-5 sm:p-6 text-[#E8ECFA]">
        {/* parents and the Punnett square */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-5">
            {picker(ru ? 'Мать' : 'Mother', mother, setMother)}
            {picker(ru ? 'Отец' : 'Father', father, setFather)}
          </div>
          <div className="grid grid-cols-[40px_repeat(2,minmax(0,120px))] gap-2 items-center">
            <span />
            {fg.map((g, i) => (
              <span key={i} className="text-center font-mono font-bold text-[#7FE3FF]">{g}</span>
            ))}
            {mg.map((m, r) => (
              <React.Fragment key={r}>
                <span className="text-center font-mono font-bold text-[#FFB37A]">{m}</span>
                {fg.map((f, c) => {
                  const g = norm(m, f);
                  return (
                    <div key={`${r}${c}${g}`} className={`rounded-2xl border p-2.5 flex flex-col items-center gap-0.5 [animation:score-pop_420ms_cubic-bezier(0.22,1,0.36,1)_both] ${isPurple(g) ? 'border-[#6E54E0]/60 bg-[#6E54E0]/15' : 'border-white/15 bg-white/[0.05]'}`} style={{ animationDelay: `${(r * 2 + c) * 60}ms` }}>
                      <Flower purple={isPurple(g)} />
                      <span className="font-mono font-bold tracking-wider">{g}</span>
                      <span className="text-[11px] text-[#9AA3C7]">25%</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* the field: random fertilisations, one pair of plants at a time */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#9AA3C7]">{ru ? 'Грядка' : 'The bed'}</span>
            <span className="text-xs text-[#9AA3C7]">{ru ? `ожидаем ${Math.round(expected * 100)}% пурпурных` : `expect ${Math.round(expected * 100)}% purple`}</span>
          </div>
          <div className="grid grid-cols-10 gap-1 rounded-2xl bg-[#2A2116]/60 border border-[#4A3A22]/60 p-2 min-h-[200px] content-start">
            {field.map((g, i) => (
              <div key={i} className="aspect-square grid place-items-center [animation:score-pop_360ms_cubic-bezier(0.22,1,0.36,1)_both]" title={g}>
                <Flower purple={isPurple(g)} size={30} />
              </div>
            ))}
            {field.length === 0 && <span className="col-span-10 py-16 text-center text-sm text-[#9AA3C7]">{ru ? 'Нажми «Посадить 100 горошин»' : 'Press “Plant 100 peas”'}</span>}
          </div>
          {/* the tally against what the square predicts */}
          <div className="relative h-4 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-[#9B7BFF] transition-[width] duration-200" style={{ width: `${field.length ? (p / field.length) * 100 : 0}%` }} />
            <div className="absolute inset-y-[-3px] w-0.5 bg-[#FFD25E]" style={{ left: `${expected * 100}%` }} />
          </div>
          <span className="text-xs text-[#9AA3C7]">{ru ? 'Жёлтая черта — сколько предсказывает решётка Пеннета.' : 'The yellow mark is what the Punnett square predicts.'}</span>
        </div>
      </div>
    </SimShell>
  );
};
