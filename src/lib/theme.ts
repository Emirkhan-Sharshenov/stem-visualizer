import { useSyncExternalStore } from 'react';

/* The STEM Lab theme: "dark" (night lab, the default) or "light" (white). index.html applies the saved choice
   before the first paint; this module switches it later and lets components follow. */

export type ThemeMode = 'dark' | 'light';
const KEY = 'sv-theme';
const listeners = new Set<() => void>();

export const getTheme = (): ThemeMode => (document.documentElement.dataset.theme === 'stem-lab' ? 'light' : 'dark');

export function setTheme(mode: ThemeMode) {
  const r = document.documentElement;
  r.dataset.theme = mode === 'dark' ? 'stem-lab-dark' : 'stem-lab';
  r.classList.toggle('dark', mode === 'dark');
  r.classList.toggle('light', mode === 'light');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#070B16' : '#F7F9FC');
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* the choice lasts for this visit */
  }
  listeners.forEach((f) => f());
}

export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const mode = useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    getTheme,
    () => 'dark' as ThemeMode,
  );
  return [mode, setTheme];
}
