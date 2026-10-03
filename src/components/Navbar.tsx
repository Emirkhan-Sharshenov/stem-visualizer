import React from 'react';
import { VisualMode } from '../types/stem';
import { Atom, Layers, Orbit, Rotate3d, Activity, Flame, Share2, Search, Award, Bot, Globe, BookOpen, Scale, Rocket, Zap } from 'lucide-react';

interface NavbarProps {
  currentMode: VisualMode;
  onSelectMode: (mode: VisualMode) => void;
  lang: 'ru' | 'en';
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onOpenMilestones: () => void;
  onToggleMentor: () => void;
  unlockedMilestonesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenSearch,
  onOpenMilestones,
  onToggleMentor,
  unlockedMilestonesCount
}) => {
  const navItems: { id: VisualMode; label: { en: string; ru: string }; icon: React.ReactNode; isPrimary?: boolean }[] = [
    { id: 'textbook', label: { en: '📖 Textbook 5–11', ru: '📖 Учебник 5–11 кл' }, icon: <BookOpen className="w-4 h-4" />, isPrimary: true },
    { id: 'moment_diffusion', label: { en: '5-6: Diffusion', ru: '5-6 кл: Диффузия' }, icon: <Zap className="w-4 h-4 text-pink-400" /> },
    { id: 'moment_lever', label: { en: '5-6: Lever', ru: '5-6 кл: Рычаг' }, icon: <Scale className="w-4 h-4 text-amber-400" /> },
    { id: 'moment_states', label: { en: '7-8: Ice-Water-Gas', ru: '7-8 кл: Фазы Лёд-Пар' }, icon: <Rotate3d className="w-4 h-4 text-cyan-400" /> },
    { id: 'moment_optics', label: { en: '7-8: Optics', ru: '7-8 кл: Оптика Снеллиуса' }, icon: <Orbit className="w-4 h-4 text-indigo-400" /> },
    { id: 'moment_collision', label: { en: '9: Newton Impact', ru: '9 кл: Удар Ньютона' }, icon: <Flame className="w-4 h-4 text-rose-400" /> },
    { id: 'orbitals', label: { en: '10-11: Orbitals', ru: '10-11 кл: Орбитали' }, icon: <Atom className="w-4 h-4 text-cyan-400" /> },
    { id: 'deconstruction', label: { en: '10-11: Deconstruct H₂O', ru: '10-11 кл: Разбор H₂O' }, icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'moment_induction', label: { en: '10-11: Faraday Induction', ru: '10-11 кл: Индукция' }, icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'moment_relativity', label: { en: '10-11: Einstein Relativity', ru: '10-11 кл: Время Эйнштейна' }, icon: <Rocket className="w-4 h-4 text-purple-400" /> },
    { id: 'math_revolution', label: { en: '10-11: Calculus 2D↔3D', ru: '10-11 кл: Интегралы 2D↔3D' }, icon: <Rotate3d className="w-4 h-4 text-blue-400" /> },
    { id: 'biology_cell', label: { en: '10-11: ATP Synthase', ru: '10-11 кл: Клетка и АТФ' }, icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { id: 'break_model', label: { en: '⚡ Sandbox Challenge', ru: '⚡ Сломай модель' }, icon: <Flame className="w-4 h-4 text-orange-400" /> },
    { id: 'knowledge_map', label: { en: '🗺️ Knowledge Map', ru: '🗺️ Карта понятий' }, icon: <Share2 className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectMode('orbitals')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                STEM <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Visualizer</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
              {lang === 'ru' ? 'От абстракции — к ментальной модели' : 'Abstract Definition → Tactile Mental Model'}
            </p>
          </div>
        </div>

        {/* Global Search trigger ("I don't understand...") */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-inner max-w-xs w-full"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate">
            {lang === 'ru' ? '«Я не понимаю дивергенцию...»' : 'Search: "I don\'t understand..."'}
          </span>
          <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Right utility items */}
        <div className="flex items-center gap-2">
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Discoveries counter */}
          <button
            onClick={onOpenMilestones}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title={lang === 'ru' ? 'Открытия' : 'Discoveries'}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-xs">{unlockedMilestonesCount}</span>
          </button>

          {/* AI Mentor Trigger */}
          <button
            onClick={onToggleMentor}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">{lang === 'ru' ? 'AI-Наставник' : 'AI Mentor'}</span>
          </button>

          {/* Language Switch */}
          <button
            onClick={onToggleLang}
            className="p-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
            title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ru' ? 'RU' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/60 overflow-x-auto flex items-center gap-1 py-1.5 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectMode(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              currentMode === item.id || (item.id === 'math_revolution' && currentMode === 'math_divergence')
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {item.icon}
            <span>{item.label[lang]}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
