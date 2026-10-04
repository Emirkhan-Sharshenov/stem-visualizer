import {createRoot} from 'react-dom/client';
import {lazy, Suspense, useState} from 'react';
import {Landing} from './pages/Landing';
import {Auth} from './pages/Auth';
import {Credits} from './pages/Credits';

// The app (textbook and labs) is large; the landing and auth pages don't need it up front
const App = lazy(() => import('./App.tsx'));
import {navigate, useRoute} from './router';
import type {Lang} from './i18n/landing';
import './index.css';

function readLang(): Lang {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'ru';
  } catch {
    return 'ru';
  }
}

function Root() {
  const route = useRoute();
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      // storage unavailable (private mode); language just won't persist
    }
  };
  const toggleLang = () => setLang(lang === 'ru' ? 'en' : 'ru');

  if (route === 'app')
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper" />}>
        <App lang={lang} setLang={setLang} />
      </Suspense>
    );
  if (route === 'credits') return <Credits lang={lang} onBack={() => window.history.back()} />;
  if (route === 'login' || route === 'register') {
    return <Auth key={route} mode={route} lang={lang} onToggleLang={toggleLang} onNavigate={navigate} />;
  }
  return <Landing lang={lang} onToggleLang={toggleLang} onNavigate={navigate} />;
}

createRoot(document.getElementById('root')!).render(<Root />);
