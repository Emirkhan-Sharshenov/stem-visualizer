import {createRoot} from 'react-dom/client';
import {lazy, Suspense, useEffect, useState} from 'react';
import {nextLang, readUiLang, setKyrgyz, type UiLang} from './lib/ky';
import {Landing} from './pages/Landing';
import {Auth} from './pages/Auth';
import {Credits} from './pages/Credits';

// The app (textbook and labs) is large; the landing and auth pages don't need it up front
const App = lazy(() => import('./App.tsx'));
const Parent = lazy(() => import('./pages/Parent'));
import {navigate, useRoute} from './router';
import type {Lang} from './i18n/landing';
import './index.css';
import {initCloudSync} from './lib/cloudSync';
import {initPwa} from './lib/push';
import {completeAuthRedirect} from './lib/supabase';
import {ResetPassword} from './pages/ResetPassword';

initCloudSync();
initPwa();

// returning from an e-mail link or Google: finish sign-in, then route and leave a note for the page
completeAuthRedirect().then((r) => {
  if (!r) return;
  sessionStorage.setItem('authNotice', JSON.stringify(r.notice));
  window.dispatchEvent(new HashChangeEvent('hashchange'));
});

function Root() {
  const route = useRoute();
  // Kyrgyz renders the Russian interface and translates it on the page (see lib/ky)
  const [ui, setUi] = useState<UiLang>(readUiLang);
  const lang: Lang = ui === 'en' ? 'en' : 'ru';
  useEffect(() => setKyrgyz(ui === 'ky'), [ui]);
  const toggleLang = () => {
    const next = nextLang(ui);
    try {
      localStorage.setItem('lang', next);
    } catch {
      // storage unavailable (private mode); language just won't persist
    }
    setUi(next);
  };
  const setLang = toggleLang;


  if (route === 'app')
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper" />}>
        <App lang={lang} setLang={setLang} />
      </Suspense>
    );
  if (route === 'parent')
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper" />}>
        <Parent lang={lang} onToggleLang={toggleLang} />
      </Suspense>
    );
  if (route === 'reset') return <ResetPassword lang={lang} onNavigate={navigate} />;
  if (route === 'credits') return <Credits lang={lang} onBack={() => window.history.back()} />;
  if (route === 'login' || route === 'register') {
    return <Auth key={route} mode={route} lang={lang} onToggleLang={toggleLang} onNavigate={navigate} />;
  }
  return <Landing lang={lang} onToggleLang={toggleLang} onNavigate={navigate} />;
}

createRoot(document.getElementById('root')!).render(<Root />);
