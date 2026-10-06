import React, { useEffect, useRef, useState } from 'react';
import { VisualMode } from '../types/stem';
import { LogoMark } from './brand/Logo';
import { Search, User, BookOpen, Network, FlaskConical, Target, Flame } from 'lucide-react';
import { dayStreak, useProgress } from '../lib/progress';
import { signOut, useSession } from '../lib/supabase';
import { LogOut, Crown, Users, GraduationCap } from 'lucide-react';
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
  { id: 'course_map', label: { en: 'Map', ru: 'Карта' } },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenSearch,
  onToggleMentor,
}) => {
  const SECTIONS: VisualMode[] = ['labs', 'practice', 'course_map', 'progress', 'pro', 'teacher', 'classes', 'sandbox', 'circuits', 'optics', 'chemlab', 'genetics'];
  const plan = usePlan();
  const isActive = (id: VisualMode) => (id === 'textbook' ? !SECTIONS.includes(currentMode) : currentMode === id);
  const p = useProgress();
  const streak = dayStreak(p);
  const done = Object.values(p.completed).filter(Boolean).length;

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
            <span className="truncate">{lang === 'ru' ? 'Что непонятно? Например, электролиз' : 'What’s confusing? E.g. electrolysis'}</span>
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
              onClick={() => onSelectMode('progress')}
              title={lang === 'ru' ? 'Мой прогресс' : 'My progress'}
              className={`hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-sm transition-colors cursor-pointer ${
                currentMode === 'progress' ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface hover:bg-muted text-ink-2 hover:text-ink'
              }`}
            >
              <Flame className={`w-4 h-4 ${streak ? 'text-[#F76B15]' : ''}`} strokeWidth={1.75} />
              <span className="font-mono text-xs">{streak}</span>
              <span className="w-px h-3.5 bg-line" />
              <span className="font-mono text-xs">{done}</span>
              <span className="text-xs">{lang === 'ru' ? 'тем' : 'topics'}</span>
            </button>

            <button
              onClick={() => onSelectMode('pro')}
              title={plan.pro ? 'Pro' : lang === 'ru' ? 'Тарифы' : 'Plans'}
              className={`hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentMode === 'pro' ? 'bg-[#FFE7B3] text-[#8A4B0F]' : 'bg-[#FFF4DA] hover:bg-[#FFE7B3] text-[#B5651D]'
              }`}
            >
              <Crown className="w-3.5 h-3.5" strokeWidth={2} />
              {plan.pro ? 'Pro ✓' : 'Pro'}
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

            <AccountButton lang={lang} onSelect={onSelectMode} />
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-14">
          <TabButton active={isActive('textbook')} onClick={() => onSelectMode('textbook')} icon={<BookOpen className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Учебник' : 'Textbook'} />
          <TabButton active={isActive('labs')} onClick={() => onSelectMode('labs')} icon={<FlaskConical className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Лаборатории' : 'Labs'} />
          <TabButton active={isActive('practice')} onClick={() => onSelectMode('practice')} icon={<Target className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Практикум' : 'Practice'} />
          <TabButton active={isActive('course_map')} onClick={() => onSelectMode('course_map')} icon={<Network className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Карта' : 'Map'} />
          <TabButton active={isActive('progress')} onClick={() => onSelectMode('progress')} icon={<Flame className="w-5 h-5" strokeWidth={1.5} />} label={lang === 'ru' ? 'Прогресс' : 'Progress'} />
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
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);
  if (!user)
    return (
      <a href="#/login" aria-label={lang === 'ru' ? 'Войти' : 'Log in'} title={lang === 'ru' ? 'Войти' : 'Log in'} className="w-8 h-8 ml-1 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center text-white transition-colors">
        <User className="w-4 h-4" strokeWidth={1.75} />
      </a>
    );
  const name = (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || user.email || '';
  return (
    <div ref={ref} className="relative ml-1">
      <button onClick={() => setOpen((o) => !o)} aria-label={name} className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center text-sm font-medium cursor-pointer" style={{ color: '#fff' }}>
        {name.slice(0, 1).toUpperCase()}
      </button>
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
          <button onClick={() => { setOpen(false); onPro(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <Crown className="w-4 h-4 text-[#B5651D]" strokeWidth={1.75} />
            {lang === 'ru' ? 'Подписка Pro' : 'Pro plan'}
          </button>
          <button onClick={() => { setOpen(false); signOut(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-2 hover:bg-muted inline-flex items-center gap-2 cursor-pointer">
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            {lang === 'ru' ? 'Выйти' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  );
};
