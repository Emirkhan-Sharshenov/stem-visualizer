import React, { useState } from 'react';
import { Dna, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface MomentMendelProps {
  lang: 'ru' | 'en';
}

type Allele = 'A' | 'a';

export const MomentMendel: React.FC<MomentMendelProps> = ({ lang }) => {
  // Parent 1 (Mother) and Parent 2 (Father) alleles
  const [p1Allele1, setP1Allele1] = useState<Allele>('A');
  const [p1Allele2, setP1Allele2] = useState<Allele>('a');

  const [p2Allele1, setP2Allele1] = useState<Allele>('A');
  const [p2Allele2, setP2Allele2] = useState<Allele>('a');

  // Offspring in 4 squares of Punnett grid
  const cell1 = `${p1Allele1}${p2Allele1}`; // Top-left
  const cell2 = `${p1Allele1}${p2Allele2}`; // Top-right
  const cell3 = `${p1Allele2}${p2Allele1}`; // Bottom-left
  const cell4 = `${p1Allele2}${p2Allele2}`; // Bottom-right

  const cells = [cell1, cell2, cell3, cell4];

  // Helper to determine phenotype: 'A' is dominant (Purple flower), 'aa' is recessive (White flower)
  const isDominant = (genotype: string) => genotype.includes('A');

  const dominantCount = cells.filter(isDominant).length;
  const recessiveCount = 4 - dominantCount;

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
              {lang === 'ru' ? '9–10 Класс • Генетика' : 'Grade 9-10 • Genetics'}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {lang === 'ru' ? 'Законы Менделя и Решетка Пеннета' : "Mendel's Laws & Punnett Square"}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {lang === 'ru' ? 'Расщепление признаков: закон чистоты гамет и соотношение 3 : 1' : 'Allele Segregation: Why Recessive Traits Reappear (3 : 1 Ratio)'}
          </h3>
        </div>

        {/* Ratio badges */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'ФЕНОТИП (ВНЕШНИЙ ВИД)' : 'PHENOTYPE RATIO'}</span>
            <span className="font-bold text-purple-400 font-mono text-sm">{dominantCount} : {recessiveCount} </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Punnett Grid */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center bg-slate-950 p-6 rounded-xl border border-slate-800">
        {/* Parent 1 Controls (Mother - Top) */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-mono text-slate-400">
            {lang === 'ru' ? 'Генотип Матери (P₁):' : 'Mother Genotype (P₁):'}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setP1Allele1(p1Allele1 === 'A' ? 'a' : 'A')}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-yellow-400 font-bold font-mono"
              >
                {p1Allele1}
              </button>
              <button
                onClick={() => setP1Allele2(p1Allele2 === 'A' ? 'a' : 'A')}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-yellow-400 font-bold font-mono"
              >
                {p1Allele2}
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {lang === 'ru' ? 'Генотип Отца (P₂):' : 'Father Genotype (P₂):'}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setP2Allele1(p2Allele1 === 'A' ? 'a' : 'A')}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-bold font-mono"
              >
                {p2Allele1}
              </button>
              <button
                onClick={() => setP2Allele2(p2Allele2 === 'A' ? 'a' : 'A')}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-bold font-mono"
              >
                {p2Allele2}
              </button>
            </div>
          </div>
        </div>

        {/* 2x2 Punnett Square Grid */}
        <div className="grid grid-cols-2 gap-3 w-72 h-72">
          {cells.map((cellGenotype, idx) => {
            const dominant = isDominant(cellGenotype);
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  dominant
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                    : 'bg-slate-800/40 border-slate-600/60 text-slate-200'
                }`}
              >
                <span className="text-2xl">{dominant ? '' : ''}</span>
                <span className="text-base font-mono font-bold tracking-widest">{cellGenotype}</span>
                <span className="text-[10px] font-mono opacity-80">
                  {dominant
                    ? (lang === 'ru' ? 'Пурпурный (Доминант)' : 'Purple (Dominant)')
                    : (lang === 'ru' ? 'Белый (Рецессив)' : 'White (Recessive)')}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">25% шанс</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <span className="font-bold text-cyan-400 block mb-1">
          {lang === 'ru' ? 'Почему рецессивный признак возвращается через поколение?' : 'Why recessive traits skip a generation:'}
        </span>
        {lang === 'ru'
          ? 'Если оба родителя внешне пурпурные (гетерозиготы Aa), скрытый ген «a» прячется в ДНК. В 25% случаев при мейозе две рецессивные гаметы сливаются (a + a = aa), и рождается чисто белый цветок!'
          : 'When both parents look purple (heterozygotes Aa), the hidden recessive "a" allele persists silently. In 25% of fertilizations, two recessive gametes unite (a + a = aa), yielding pure white flowers!'}
      </div>
    </div>
  );
};
