import { Button } from '@heroui/react';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Box, Move3d, RotateCcw, X } from 'lucide-react';
import { PartInfo, StageOptions, ThreeStage } from '../../lib/three/ThreeStage';

const ArView = lazy(() => import('./ArView'));

interface Stage3DProps {
  lang: 'ru' | 'en';
  options?: Omit<StageOptions, 'onPick' | 'onHover'>;
  /** Called once with the live stage; return a cleanup */
  onReady: (stage: ThreeStage) => void | (() => void);
  /** Called when a part with `goTo` is opened from its info card */
  onGoTo?: (goTo: string) => void;
  onReset?: (stage: ThreeStage) => void;
  /** Controlled selection, so side panels can open the same info card */
  selected: PartInfo | null;
  onSelect: (info: PartInfo | null) => void;
  className?: string;
  children?: React.ReactNode;
}

/** Dark 3D stage with orbit controls, hover labels and a click-to-learn info card */
export const Stage3D: React.FC<Stage3DProps> = ({ lang, options, onReady, onGoTo, onReset, selected, onSelect, className = '', children }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<ThreeStage | null>(null);
  const [hover, setHover] = useState<{ info: PartInfo; x: number; y: number } | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [hintVisible, setHintVisible] = useState(true);
  const [ar, setAr] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const stage = new ThreeStage(mount, options);
    stageRef.current = stage;
    stage.setHandlers(
      (info) => {
        onSelectRef.current(info);
        setHintVisible(false);
      },
      (info, pos) => setHover(info && pos ? { info, ...pos } : null),
    );
    const cleanup = onReady(stage);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      stage.dispose();
      stageRef.current = null;
    };
    // The stage lives for the whole mount; content updates go through refs in onReady
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`lab-stage relative overflow-hidden select-none ${className}`}>
      <div ref={mountRef} className="absolute inset-0" />

      {children}

      {/* Hover label */}
      {hover && !selected && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-md bg-[#1A1C21] border border-[#2c2f36] text-[12px] text-[#EDEDED] whitespace-nowrap"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
        >
          {hover.info.title[lang]}
        </div>
      )}

      {/* Controls hint */}
      <div
        className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#1A1C21]/90 border border-[#2c2f36] text-[12px] text-[#A0A3AB] inline-flex items-center gap-2 transition-opacity duration-500 whitespace-nowrap ${
          hintVisible && !selected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Move3d className="w-3.5 h-3.5" strokeWidth={1.75} />
        {lang === 'ru' ? 'Крути, приближай, нажимай на части модели' : 'Rotate, zoom, and tap parts of the model'}
      </div>

      {/* Reset view */}
      {onReset && (
        <Button variant="outline" isIconOnly size="sm" className="absolute top-3 right-3 z-10 w-8" onPress={() => stageRef.current && onReset(stageRef.current)} aria-label={lang === 'ru' ? 'Сбросить вид' : 'Reset view'}>
          <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
        </Button>
      )}

      {/* See the model in the room */}
      <Button variant="outline" size="sm" className={`absolute top-3 z-10 font-medium ${onReset ? 'right-[52px]' : 'right-3'}`} onPress={() => setAr(true)} aria-label={lang === 'ru' ? 'Посмотреть в комнате' : 'View in your room'}>
        <Box className="w-4 h-4" strokeWidth={1.75} /> {lang === 'ru' ? 'В комнате' : 'AR'}
      </Button>
      {ar && stageRef.current && (
        <Suspense fallback={null}>
          <ArView lang={lang} load={() => stageRef.current!.exportGlb()} onClose={() => setAr(false)} />
        </Suspense>
      )}

      {/* Info card */}
      <div
        className={`absolute z-20 left-3 right-3 bottom-3 sm:right-auto sm:w-[340px] rounded-xl bg-[#17181B]/95 border border-[#2c2f36] p-4 transition-all duration-300 ${
          selected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {selected && (
          <>
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-serif text-lg leading-snug text-[#EDEDED]">{selected.title[lang]}</h4>
              <Button variant="ghost" isIconOnly size="sm" className="shrink-0 w-7 -mr-1 -mt-1" onPress={() => onSelect(null)} aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}>
                <X className="w-4 h-4" strokeWidth={1.75} />
              </Button>
            </div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#B5B8C0]">{selected.text[lang]}</p>
            {selected.goTo && onGoTo && (
              <Button size="sm" className="mt-3 font-medium" onPress={() => {
                  onGoTo(selected.goTo!);
                  onSelect(null);
                }}>
                {lang === 'ru' ? 'Приблизить' : 'Zoom in'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
