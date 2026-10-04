import React, { useState } from 'react';
import { CONCEPTS_LIST } from '../data/concepts';
import { TEXTBOOK_LESSONS } from '../data/textbookCurriculum';
import { VisualMode } from '../types/stem';
import { Search, X, ArrowRight, Sparkles, Compass, BookOpen } from 'lucide-react';

interface SearchModalProps {
  lang: 'ru' | 'en';
  onClose: () => void;
  onSelectConcept: (mode: VisualMode, initialParams?: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ lang, onClose, onSelectConcept }) => {
  const [query, setQuery] = useState<string>('');

  const filteredLessons = TEXTBOOK_LESSONS.filter((l) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      l.title[lang].toLowerCase().includes(q) ||
      l.subtitle[lang].toLowerCase().includes(q) ||
      l.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const popularQueries = [
    { text: lang === 'ru' ? '5-6 кл: Диффузия и молекулы' : 'Gr 5-6: Diffusion', mode: 'moment_diffusion' as VisualMode },
    { text: lang === 'ru' ? '5-6 кл: Рычаг Архимеда' : 'Gr 5-6: Lever Rule', mode: 'moment_lever' as VisualMode },
    { text: lang === 'ru' ? '6-7 кл: Фотосинтез (Хлоропласт)' : 'Gr 6-7: Photosynthesis', mode: 'moment_photosynthesis' as VisualMode },
    { text: lang === 'ru' ? '7 кл: Закон Паскаля и пресс' : 'Gr 7: Pascal Press', mode: 'moment_pascal' as VisualMode },
    { text: lang === 'ru' ? '7-8 кл: Лёд → Вода → Пар' : 'Gr 7-8: States of Matter', mode: 'moment_states' as VisualMode },
    { text: lang === 'ru' ? '8 кл: Закон Ома и цепь' : 'Gr 8: Ohm Circuit', mode: 'moment_circuit' as VisualMode },
    { text: lang === 'ru' ? '8 кл: Теорема Пифагора' : 'Gr 8: Pythagoras', mode: 'moment_pythagoras' as VisualMode },
    { text: lang === 'ru' ? '8-9 кл: Химическая связь' : 'Gr 8-9: Chemical Bond', mode: 'moment_chemical_bond' as VisualMode },
    { text: lang === 'ru' ? '8-9 кл: Электролиз CuCl₂' : 'Gr 8-9: Electrolysis', mode: 'moment_electrolysis' as VisualMode },
    { text: lang === 'ru' ? '8-9 кл: Нейрон и синапс' : 'Gr 8-9: Neuron Synapse', mode: 'moment_neuron' as VisualMode },
    { text: lang === 'ru' ? '9 кл: Маятник и энергия' : 'Gr 9: Pendulum', mode: 'moment_pendulum' as VisualMode },
    { text: lang === 'ru' ? '9 кл: Эффект Допплера' : 'Gr 9: Doppler Wave', mode: 'moment_doppler' as VisualMode },
    { text: lang === 'ru' ? '9-10 кл: Тригонометрический круг' : 'Gr 9-10: Trig Circle', mode: 'moment_trig_circle' as VisualMode },
    { text: lang === 'ru' ? '9-10 кл: Генетика Менделя 3:1' : 'Gr 9-10: Mendel Genetics', mode: 'moment_mendel' as VisualMode },
    { text: lang === 'ru' ? '9-10 кл: Спираль ДНК' : 'Gr 9-10: DNA Helix', mode: 'moment_dna' as VisualMode },
    { text: lang === 'ru' ? '10-11 кл: Производная (касательная)' : 'Gr 10-11: Derivative', mode: 'moment_derivative' as VisualMode },
    { text: lang === 'ru' ? '10-11 кл: Доска Гальтона (Гаусс)' : 'Gr 10-11: Galton Board', mode: 'moment_gauss' as VisualMode },
    { text: lang === 'ru' ? '10-11 кл: Орбитали (s, p, d, f)' : 'Gr 10-11: Orbitals', mode: 'orbitals' as VisualMode },
    { text: lang === 'ru' ? '10-11 кл: АТФ-синтаза (9000 об/мин)' : 'Gr 10-11: ATP Synthase', mode: 'biology_cell' as VisualMode },
    { text: lang === 'ru' ? '10-11 кл: Замедление времени' : 'Gr 10-11: Time Dilation', mode: 'moment_relativity' as VisualMode },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-[rgba(17,17,17,0.45)] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'ru'
                ? 'Ищи любую тему 5-11 класса: «диффузия», «рычаг», «лед», «оптика», «орбиталь»...'
                : 'Search any Grade 5-11 topic: "diffusion", "lever", "ice", "optics", "orbital"...'
            }
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>

        {/* Quick search inspiration chips */}
        {!query && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              {lang === 'ru' ? 'ШКОЛЬНАЯ ПРОГРАММА 5-11 КЛАССОВ:' : 'SCHOOL CURRICULUM TOPICS (5-11):'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularQueries.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectConcept(pq.mode);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-cyan-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{pq.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Concept Results */}
        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
          {filteredLessons.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectConcept(item.viewMode, item.initialParams);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                      {item.gradeBadge[lang]}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {item.title[lang]}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle[lang]}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-cyan-400 transition-colors">
                <span className="hidden sm:inline text-[11px] font-mono">
                  {lang === 'ru' ? 'Симуляция' : 'Simulate'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

