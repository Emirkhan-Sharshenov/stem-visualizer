import React, { useEffect, useRef, useState } from 'react';

/**
 * Shows its content with a short rise and fade the first time it scrolls into view
 * (curve 0.22,1,0.36,1, the brand's "arrive"). With reduced motion, or without
 * IntersectionObserver, content is shown at once; once it has played it stays put.
 */
export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? 'reveal-in' : ''} ${className}`} style={{ transitionDelay: shown ? `${delay}ms` : undefined }}>
      {children}
    </div>
  );
};
