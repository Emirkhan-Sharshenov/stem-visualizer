import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Loader2, Smartphone, X } from 'lucide-react';

/* "See it in your room": shows the exported model in Google's <model-viewer>, which places it in the room
   through Quick Look on iPhone and WebXR on Android. The library loads only when someone opens this. */

interface ModelViewerElement extends HTMLElement {
  canActivateAR: boolean;
  activateAR: () => Promise<void>;
}

export const ArView: React.FC<{ lang: 'ru' | 'en'; title?: string; load: () => Promise<Blob>; onClose: () => void }> = ({ lang, title, load, onClose }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [canAr, setCanAr] = useState(false);

  useEffect(() => {
    let url = '';
    let alive = true;
    Promise.all([import('@google/model-viewer'), load()])
      .then(([, blob]) => {
        if (!alive || !host.current) return;
        url = URL.createObjectURL(blob);
        const mv = document.createElement('model-viewer') as ModelViewerElement;
        mv.setAttribute('src', url);
        mv.setAttribute('ar', '');
        mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        mv.setAttribute('ar-scale', 'auto');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('shadow-intensity', '1');
        mv.setAttribute('exposure', '1.1');
        mv.setAttribute('alt', title ?? 'model');
        mv.style.cssText = 'width:100%;height:100%;background:transparent;--poster-color:transparent';
        // the built-in AR button is replaced by ours below
        const slot = document.createElement('div');
        slot.setAttribute('slot', 'ar-button');
        slot.style.display = 'none';
        mv.appendChild(slot);
        mv.addEventListener('load', () => {
          setCanAr(!!mv.canActivateAR);
          setState('ready');
        });
        mv.addEventListener('error', () => setState('error'));
        host.current.appendChild(mv);
        viewer.current = mv;
      })
      .catch((e) => {
        console.error(e);
        if (alive) setState('error');
      });
    return () => {
      alive = false;
      viewer.current?.remove();
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col bg-[#0B0C0F] anim-page" role="dialog" aria-modal>
      <header className="flex items-center gap-3 px-4 h-14 border-b border-[#24262B]">
        <Box className="w-5 h-5 text-[#8FA4FF]" />
        <h2 className="flex-1 truncate text-[15px] font-medium text-[#EDEDED]">{title ?? L('Модель в комнате', 'Model in your room')}</h2>
        <button onClick={onClose} aria-label={L('Закрыть', 'Close')} className="w-9 h-9 rounded-lg text-[#A0A3AB] hover:text-white hover:bg-[#1D1F24] flex items-center justify-center cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </header>
      <div className="relative flex-1 min-h-0">
        <div ref={host} className="absolute inset-0" />
        {state === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#A0A3AB]">
            <Loader2 className="w-7 h-7 animate-spin" />
            {L('Готовим модель…', 'Preparing the model…')}
          </div>
        )}
        {state === 'error' && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-[#A0A3AB]">{L('Эту модель не получилось подготовить. Попробуй другую.', 'Could not prepare this model. Try another one.')}</div>}
      </div>
      <footer className="p-4 border-t border-[#24262B] flex flex-col items-center gap-2">
        {canAr ? (
          <button onClick={() => viewer.current?.activateAR()} className="h-12 w-full max-w-sm rounded-xl bg-accent hover:bg-accent-hover font-medium inline-flex items-center justify-center gap-2 cursor-pointer" style={{ color: '#fff' }}>
            <Smartphone className="w-5 h-5" /> {L('Поставить в комнату', 'Place in my room')}
          </button>
        ) : (
          state === 'ready' && (
            <p className="text-sm text-[#A0A3AB] text-center max-w-md">
              {L('Чтобы поставить модель на стол через камеру, открой эту страницу на телефоне (iPhone или Android с Chrome). Здесь модель можно покрутить.', 'To place the model on your desk through the camera, open this page on a phone (iPhone, or Android with Chrome). Here you can turn it around.')}
            </p>
          )
        )}
      </footer>
    </div>,
    document.body,
  );
};

export default ArView;
