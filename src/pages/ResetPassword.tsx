import { Button, Input } from '@heroui/react';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Logo } from '../components/brand/Logo';
import { authErrorText, updatePassword } from '../lib/supabase';
import type { Lang } from '../i18n/landing';
import type { Route } from '../router';

/** "Forgot password" lands here with a temporary session: set a new password */
export const ResetPassword: React.FC<{ lang: Lang; onNavigate: (r: Route) => void }> = ({ lang, onNavigate }) => {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError(L('Минимум 8 символов.', 'At least 8 characters.'));
    setBusy(true);
    setError(null);
    try {
      await updatePassword(pw);
      onNavigate('app');
    } catch (err) {
      setError(authErrorText(err, lang));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-light min-h-screen font-sans flex flex-col">
      <div className="h-14 px-4 sm:px-8 flex items-center">
        <a href="#/" aria-label="STEM Visualizer">
          <Logo size={26} />
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={submit} className="w-full max-w-[400px] flex flex-col gap-4">
          <h1 className="font-serif text-[32px] leading-tight">{L('Новый пароль', 'New password')}</h1>
          <p className="text-[15px] text-ink-2">{L('Придумай новый пароль для входа.', 'Choose a new password to log in with.')}</p>
          <Input
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={L('Минимум 8 символов', 'At least 8 characters')}
            className="w-full"
          />
          {error && <p className="rounded-lg bg-[#FDF0EF] border border-[#F2C8C5] px-3 py-2 text-sm text-[#CC2F35]">{error}</p>}
          <Button size="lg" className="text-sm font-medium" type="submit" isDisabled={busy}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {L('Сохранить и войти', 'Save and continue')}
          </Button>
        </form>
      </div>
    </div>
  );
};
