import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import App from './App.tsx';
import {Landing} from './pages/Landing';
import {Auth} from './pages/Auth';
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

  if (route === 'app') return <App lang={lang} setLang={setLang} />;
  if (route === 'login' || route === 'register') {
    return <Auth key={route} mode={route} lang={lang} onToggleLang={toggleLang} onNavigate={navigate} />;
  }
  return <Landing lang={lang} onToggleLang={toggleLang} onNavigate={navigate} />;
}

createRoot(document.getElementById('root')!).render(<Root />);
