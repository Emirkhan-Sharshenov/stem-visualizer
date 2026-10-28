import React, { useEffect, useRef, useState } from 'react';
import { VisualMode } from '../types/stem';
import { LogoMark } from './brand/Logo';
import { Search, User, BookOpen, FlaskConical, Target, Flame, Trophy, Gamepad2 } from 'lucide-react';
import { dayStreak, useProgress } from '../lib/progress';
import { signOut, useSession } from '../lib/supabase';
import { LogOut, Crown, Users, GraduationCap, Moon, Sun, BarChart3, FileText } from 'lucide-react';
import { useIsAdmin } from '../lib/admin';
import { Button } from '@heroui/react';
import { useTheme } from '../lib/theme';
import { usePlan } from '../lib/plan';

interface NavbarProps {
  currentMode: VisualMode;
  onSelectMode: (mode: VisualMode) => void;
  lang: 'ru' | 'en';
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onToggleMentor: () => void;
}

const NAV_ITEMS: { id: VisualMode; label: { en: string; ru: string } }[] = [
  { id: 'textbook', label: { en: 'Textbook', ru: 'Учебник' } },
  { id: 'labs', label: { en: 'Labs', ru: 'Лаборатории' } },
  { id: 'practice', label: { en: 'Practice', ru: 'Практикум' } },
  { id: 'games', label: { en: 'Games', ru: 'Игры' } },
  { id: 'rating', label: { en: 'Leagues', ru: 'Рейтинг' } },
  { id: 'course_map', label: { en: 'Map', ru: 'Карта' } },
  { id: 'formulas', label: { en: 'Formulas', ru: 'Формулы' } },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenSearch,
  onToggleMentor,
}) => {
  const SECTIONS: VisualMode[] = ['labs', 'practice', 'course_map', 'progress', 'pro', 'teacher', 'classes', 'sandbox', 'circuits', 'optics', 'chemlab', 'genetics', 'heat', 'ecosystem', 'molbuilder', 'space3d', 'efield', 'waves', 'titration', 'formulas', 'rating', 'atom', 'kinetics', 'selection', 'photosynthesis', 'projectile', 'plotter', 'enzymes', 'galvanic', 'games'];
  const plan = usePlan();
  const isActive = (id: VisualMode) => (id === 'textbook' ? !SECTIONS.includes(currentMode) : currentMode === id);
  const p = useProgress();
  const streak = dayStreak(p);
  const done = Object.values(p.completed).filter(Boolean).length;

  return (
    <>
      <header className="print:hidden sticky top-0 z-40 w-full bg-paper/95 border-b border-line">
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-4">
          <a href="#/" className="flex items-center gap-2.5 shrink-0" aria-label="STEM Visualizer">
            <LogoMark size={26} />
            <span className="hidden sm:block text-[15px] font-medium tracking-[-0.01em] text-ink">STEM Visualizer</span>
          </a>

          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {NAV_ITEMS.map((item) => (
              <Button variant="ghost" size="sm" className={`text-sm whitespace-nowrap ${item.id === 'formulas' || item.id === 'course_map' ? 'hidden xl:block' : ''} ${isActive(item.id) ? 'text-accent font-medium' : 'text-ink-2'}`} key={item.id} onPress={() => onSelectMode(item.id)}>
                {item.label[lang]}
              </Button>
            ))}
          </nav>

          <Button variant="outline" className="hidden md:flex lg:hidden xl:flex flex-1 min-w-0 mx-auto text-sm" onPress={() => onOpenSearch()}>
            <Search className="w-4 h-4" strokeWidth={1.75} />
            <span className="truncate">{lang === 'ru' ? 'Что непонятно? Например, электролиз' : 'What’s confusing? E.g. electrolysis'}</span>
            <kbd className="ml-auto font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted border border-line text-ink-3">⌘K</kbd>
          </Button>

          <div className="ml-auto md:ml-0 flex items-center gap-1 shrink-0">
            <Button variant="ghost" isIconOnly className="md:hidden lg:flex xl:hidden w-9" onPress={() => onOpenSearch()} aria-label={lang === 'ru' ? 'Поиск' : 'Search'}>
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Button>

            <Button aria-label={lang === 'ru' ? 'Мой прогресс' : 'My progress'} variant="outline" size="sm" className={`hidden sm:inline-flex text-sm ${currentMode === 'progress' ? 'text-accent' : 'text-ink-2'}`} onPress={() => onSelectMode('progress')}>
              <Flame className={`w-4 h-4 ${streak ? 'text-[#F76B15]' : ''}`} strokeWidth={1.75} />
              <span className="font-mono text-xs">{streak}</span>
              {/* topics done: on wide screens only, the header is tight between lg and xl */}
              <span className="w-px h-3.5 bg-line lg:hidden xl:inline" />
              <span className="font-mono text-xs lg:hidden xl:inline">{done}</span>
              <span className="text-xs lg:hidden xl:inline">{lang === 'ru' ? 'тем' : 'topics'}</span>
            </Button>

            <Button aria-label={plan.pro ? 'Pro' : lang === 'ru' ? 'Тарифы' : 'Plans'} variant="ghost" size="sm" className={`hidden sm:inline-flex text-sm font-medium ${currentMode === 'pro' ? 'text-[#8A4B0F]' : 'text-[#B5651D]'}`} onPress={() => onSelectMode('pro')}>
              <Crown className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="lg:hidden xl:inline">{plan.pro ? 'Pro ✓' : 'Pro'}</span>
            </Button>

            <Button variant="outline" size="sm" className="text-sm" onPress={() => onToggleMentor()}>
              {lang === 'ru' ? 'Наставник' : 'Mentor'}
            </Button>

            {/* one button that switches to the other language */}
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex font-mono uppercase" aria-label={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'} onPress={() => onToggleLang()}>
              {lang === 'ru' ? 'en' : 'ru'}
            </Button>

            <ThemeSwitch lang={lang} />
            <AccountButton lang={lang} onSelect={onSelectMode} />
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="print:hidden lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-14">
          <TabButton active={isActive('textbook')} onClick={() => onSelectMode('textbook')} icon={<BookOpen className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Учебник' : 'Textbook'} />
          <TabButton active={isActive('labs')} onClick={() => onSelectMode('labs')} icon={<FlaskConical className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Лаборатории' : 'Labs'} />
          <TabButton active={isActive('practice')} onClick={() => onSelectMode('practice')} icon={<Target className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Практикум' : 'Practice'} />
          <TabButton active={isActive('rating')} onClick={() => onSelectMode('rating')} icon={<Trophy className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Рейтинг' : 'Leagues'} />
          <TabButton active={isActive('games')} onClick={() => onSelectMode('games')} icon={<Gamepad2 className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Игры' : 'Games'} />
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

/** avatar: sign-in link for guests, a small menu for signed-in users */
const AccountButton: React.FC<{ lang: 'ru' | 'en'; onSelect: (m: VisualMode) => void }> = ({ lang, onSelect }) => {
  const onProgress = () => onSelect('progress');
  const onPro = () => onSelect('pro');
  const { user, ready } = useSession();
  const admin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);
  if (!ready)
    return <span aria-hidden="true" className="w-8 h-8 ml-1 rounded-full bg-muted animate-pulse" />;
  if (!user)
    return (
      <a href="#/login" aria-label={lang === 'ru' ? 'Войти' : 'Log in'} title={lang === 'ru' ? 'Войти' : 'Log in'} className="w-8 h-8 ml-1 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center text-white transition-colors">
        <User className="w-4 h-4" strokeWidth={1.75} />
      </a>
    );
  const name = (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || user.email || '';
  return (
    <div ref={ref} className="relative ml-1">
      <Button isIconOnly size="sm" className="w-8 text-sm font-medium" onPress={() => setOpen((o) => !o)} aria-label={name}>
        {name.slice(0, 1).toUpperCase()}
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl bg-surface border border-line shadow-xl p-1.5">
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-ink truncate">{name}</div>
            <div className="text-xs text-ink-3 truncate">{user.email}</div>
            <div className="mt-1 text-[11px] text-[#1E7A4C]">{lang === 'ru' ? '✓ прогресс сохраняется в аккаунте' : '✓ progress saved to your account'}</div>
          </div>
          <button onClick={() => { setOpen(false); onProgress(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted cursor-pointer">
            {lang === 'ru' ? 'Мой прогресс' : 'My progress'}
          </button>
          <button onClick={() => { setOpen(false); onSelect('classes'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <Users className="w-4 h-4 text-ink-2" strokeWidth={1.75} />
            {lang === 'ru' ? 'Мои классы' : 'My classes'}
          </button>
          <button onClick={() => { setOpen(false); onSelect('teacher'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <GraduationCap className="w-4 h-4 text-ink-2" strokeWidth={1.75} />
            {lang === 'ru' ? 'Кабинет учителя' : 'Teacher dashboard'}
          </button>
          <button onClick={() => { setOpen(false); onSelect('tests'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4 text-ink-2" strokeWidth={1.75} />
            {lang === 'ru' ? 'Конструктор контрольных' : 'Test builder'}
          </button>
          <button onClick={() => { setOpen(false); onPro(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <Crown className="w-4 h-4 text-[#B5651D]" strokeWidth={1.75} />
            {lang === 'ru' ? 'Подписка Pro' : 'Pro plan'}
          </button>
          {admin && (
            <button onClick={() => { setOpen(false); onSelect('admin'); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
              <BarChart3 className="w-4 h-4 text-accent" strokeWidth={1.75} />
              {lang === 'ru' ? 'Статистика' : 'Statistics'}
            </button>
          )}
          <button onClick={() => { setOpen(false); signOut(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-2 hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            {lang === 'ru' ? 'Выйти' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  );
};

/** night lab ↔ white */
const ThemeSwitch: React.FC<{ lang: 'ru' | 'en' }> = ({ lang }) => {
  const [mode, setMode] = useTheme();
  const label = mode === 'dark' ? (lang === 'ru' ? 'Светлая тема' : 'Light theme') : lang === 'ru' ? 'Ночная тема' : 'Night theme';
  return (
    <Button isIconOnly size="sm" variant="ghost" aria-label={label} onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      {mode === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
    </Button>
  );
};
