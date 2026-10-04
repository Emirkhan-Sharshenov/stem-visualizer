import React from 'react';
import { VisualMode } from '../types/stem';
import { LogoMark } from './brand/Logo';
import { Search, User, BookOpen, Network, Award } from 'lucide-react';

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

const NAV_ITEMS: { id: VisualMode; label: { en: string; ru: string } }[] = [
  { id: 'textbook', label: { en: 'Textbook', ru: 'Учебник' } },
  { id: 'knowledge_map', label: { en: 'Knowledge map', ru: 'Карта понятий' } },
  { id: 'break_model', label: { en: 'Break the model', ru: 'Сломай модель' } },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenSearch,
  onOpenMilestones,
  onToggleMentor,
  unlockedMilestonesCount,
}) => {
  const isActive = (id: VisualMode) =>
    id === 'textbook' ? !['knowledge_map', 'break_model'].includes(currentMode) : currentMode === id;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-paper/95 border-b border-line">
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-4">
          <a href="#/" className="flex items-center gap-2.5 shrink-0" aria-label="STEM Visualizer">
            <LogoMark size={26} />
            <span className="hidden sm:block text-[15px] font-medium tracking-[-0.01em] text-ink">STEM Visualizer</span>
          </a>

          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`h-8 px-3 rounded-md text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  isActive(item.id) ? 'text-accent font-medium' : 'text-ink-2 hover:text-ink hover:bg-hover'
                }`}
              >
                {item.label[lang]}
              </button>
            ))}
          </nav>

          <button
            onClick={onOpenSearch}
            className="hidden md:flex flex-1 max-w-md mx-auto items-center gap-2.5 h-9 px-3 rounded-lg bg-surface border border-line hover:border-line-strong text-sm text-ink-3 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" strokeWidth={1.75} />
            <span className="truncate">{lang === 'ru' ? 'Что непонятно? Например, дивергенция' : 'What’s confusing? E.g. divergence'}</span>
            <kbd className="ml-auto font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted border border-line text-ink-3">⌘K</kbd>
          </button>

          <div className="ml-auto md:ml-0 flex items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              aria-label={lang === 'ru' ? 'Поиск' : 'Search'}
              className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-ink-2 hover:text-ink hover:bg-hover cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            <button
              onClick={onOpenMilestones}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-surface hover:bg-muted text-sm text-ink-2 hover:text-ink transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Открытия' : 'Discoveries'}
              <span className="font-mono text-xs px-1.5 rounded bg-accent-soft text-accent">{unlockedMilestonesCount}</span>
            </button>

            <button
              onClick={onToggleMentor}
              className="inline-flex items-center h-8 px-3 rounded-md border border-line bg-surface hover:bg-muted text-sm text-ink transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'Наставник' : 'Mentor'}
            </button>

            <div className="hidden sm:block w-px h-4 bg-line mx-1" />

            <div className="hidden sm:inline-flex p-0.5 rounded-md bg-muted border border-line">
              {(['ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => l !== lang && onToggleLang()}
                  className={`px-2 h-6 rounded font-mono text-[11px] uppercase cursor-pointer ${
                    lang === l ? 'bg-surface text-ink border border-line' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <a
              href="#/login"
              aria-label={lang === 'ru' ? 'Аккаунт' : 'Account'}
              className="w-8 h-8 ml-1 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center text-white transition-colors"
            >
              <User className="w-4 h-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-14">
          <TabButton active={isActive('textbook')} onClick={() => onSelectMode('textbook')} icon={<BookOpen className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Учебник' : 'Textbook'} />
          <TabButton active={false} onClick={onOpenSearch} icon={<Search className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Поиск' : 'Search'} />
          <TabButton active={isActive('knowledge_map')} onClick={() => onSelectMode('knowledge_map')} icon={<Network className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Карта' : 'Map'} />
          <TabButton
            active={false}
            onClick={onOpenMilestones}
            icon={
              <span className="relative">
                <Award className="w-5 h-5" strokeWidth={1.5} />
                {unlockedMilestonesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-accent text-white text-[10px] font-mono leading-4 text-center">
                    {unlockedMilestonesCount}
                  </span>
                )}
              </span>
            }
            label={lang === 'ru' ? 'Открытия' : 'Discoveries'}
          />
        </div>
      </nav>
    </>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 text-[11px] cursor-pointer ${active ? 'text-accent' : 'text-ink-2'}`}
  >
    {icon}
    {label}
  </button>
);
