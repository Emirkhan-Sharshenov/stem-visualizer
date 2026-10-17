import React, { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';

/** "+10 XP" that pops up whenever points are earned; quick awards add up into one chip */
export const XpToast: React.FC<{ lang: 'ru' | 'en' }> = ({ lang }) => {
  const [shown, setShown] = useState<{ amount: number; key: number } | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const amount = (e as CustomEvent<{ amount: number }>).detail.amount;
      setShown((s) => ({ amount: (s?.amount ?? 0) + amount, key: (s?.key ?? 0) + 1 }));
      if (hide.current) clearTimeout(hide.current);
      hide.current = setTimeout(() => setShown(null), 1600);
    };
    window.addEventListener('stem-xp', on);
    return () => window.removeEventListener('stem-xp', on);
  }, []);
  if (!shown) return null;
  return (
    <div key={shown.key} className="fixed z-[60] right-4 bottom-20 lg:bottom-6 pointer-events-none animate-[xpPop_0.35s_ease-out]">
      <div className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full shadow-lg text-sm font-semibold" style={{ background: '#16171A', color: '#FFD60A' }}>
        <Zap className="w-4 h-4" strokeWidth={2.25} fill="#FFD60A" />+{shown.amount} {lang === 'ru' ? 'очков' : 'XP'}
      </div>
      <style>{`@keyframes xpPop { from { transform: translateY(12px) scale(0.85); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
    </div>
  );
};
