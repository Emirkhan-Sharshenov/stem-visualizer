import React, { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authErrorText, cloudEnabled, resendSignupCode, resetPassword, signIn, signInWithGoogle, signUp, updatePassword, verifyEmailCode } from '../lib/supabase';
import { Logo } from '../components/brand/Logo';
import { OrbitalStage } from '../components/brand/OrbitalStage';
import { authCopy } from '../i18n/auth';
import type { Lang } from '../i18n/landing';
import type { Route } from '../router';

interface AuthProps {
  mode: 'login' | 'register';
  lang: Lang;
  onToggleLang: () => void;
  onNavigate: (route: Route) => void;
}

type Role = 'student' | 'teacher';
type Errors = Partial<Record<'name' | 'email' | 'password', string>>;

const GRADES = ['5', '6', '7', '8', '9', '10', '11'];

const inputBase =
  'w-full h-11 px-3 rounded-lg bg-surface border text-[15px] text-ink placeholder:text-ink-3 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent';

export const Auth: React.FC<AuthProps> = ({ mode, lang, onToggleLang, onNavigate }) => {
  const t = authCopy[lang];
  const copy = mode === 'login' ? t.login : t.register;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [grade, setGrade] = useState('9');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** waiting for the code from the e-mail */
  const [codeFor, setCodeFor] = useState<{ email: string; kind: 'signup' | 'recovery' } | null>(null);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  // message left by an e-mail confirmation redirect
  useEffect(() => {
    const raw = sessionStorage.getItem('authNotice');
    if (!raw) return;
    sessionStorage.removeItem('authNotice');
    const n = JSON.parse(raw);
    if (n === 'confirmed') setNotice(L('Почта подтверждена! Теперь войди со своим паролем.', 'Email confirmed! Now log in with your password.'));
    else if (n && typeof n === 'object' && n.error) setFormError(/expired|invalid/i.test(n.error) ? L('Ссылка устарела или уже использована. Войди с паролем или запроси новое письмо.', 'The link has expired or was already used. Log in with your password or request a new email.') : n.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): Errors => {
    const next: Errors = {};
    if (mode === 'register' && !name.trim()) next.name = t.errors.name;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t.errors.email;
    if (password.length < 8) next.password = t.errors.password;
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;
    // without Supabase keys the app still works, progress just stays in this browser
    if (!cloudEnabled) return onNavigate('app');
    setBusy(true);
    try {
      if (mode === 'register') {
        const { needsConfirmation } = await signUp(email.trim(), password, { name: name.trim(), role, grade: role === 'student' ? Number(grade) : null });
        if (needsConfirmation) {
          setCodeFor({ email: email.trim(), kind: 'signup' });
          setNotice(L(`Мы отправили код на ${email}. Введи его ниже.`, `We sent a code to ${email}. Enter it below.`));
          return;
        }
      } else await signIn(email.trim(), password);
      onNavigate('app');
    } catch (err) {
      // signed up earlier but never confirmed: send a fresh code
      if (/not confirmed/i.test(String((err as { message?: string })?.message))) {
        try {
          await resendSignupCode(email.trim());
        } catch {
          // the old code may still be valid
        }
        setCodeFor({ email: email.trim(), kind: 'signup' });
        setNotice(L(`Почта ещё не подтверждена. Мы отправили новый код на ${email}.`, `Your email isn’t confirmed yet. We sent a new code to ${email}.`));
        return;
      }
      setFormError(authErrorText(err, lang));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setFormError(null);
    if (!cloudEnabled) return onNavigate('app');
    try {
      await signInWithGoogle();
    } catch (err) {
      setFormError(authErrorText(err, lang));
    }
  };

  const forgot = async () => {
    setFormError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErrors((p) => ({ ...p, email: t.errors.email }));
    try {
      await resetPassword(email.trim());
      setCodeFor({ email: email.trim(), kind: 'recovery' });
      setNotice(L(`Код для сброса пароля отправлен на ${email}.`, `A password reset code was sent to ${email}.`));
    } catch (err) {
      setFormError(authErrorText(err, lang));
    }
  };

  const clearError = (field: keyof Errors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeFor) return;
    setFormError(null);
    const token = code.replace(/\D/g, '');
    if (token.length < 6) return setFormError(L('Введи код из письма целиком.', 'Enter the whole code from the email.'));
    if (codeFor.kind === 'recovery' && newPassword.length < 8) return setFormError(t.errors.password);
    setBusy(true);
    try {
      await verifyEmailCode(codeFor.email, token, codeFor.kind);
      if (codeFor.kind === 'recovery') await updatePassword(newPassword);
      sessionStorage.setItem('authNotice', '"welcome"');
      onNavigate('app');
    } catch (err) {
      setFormError(/expired|invalid/i.test(String((err as { message?: string })?.message)) ? L('Код неверный или устарел. Проверь письмо или запроси новый код.', 'The code is wrong or expired. Check the email or request a new one.') : authErrorText(err, lang));
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    if (!codeFor) return;
    setFormError(null);
    try {
      if (codeFor.kind === 'signup') await resendSignupCode(codeFor.email);
      else await resetPassword(codeFor.email);
      setNotice(L('Новый код отправлен. Проверь также папку «Спам».', 'A new code is on its way. Check the spam folder too.'));
    } catch (err) {
      setFormError(authErrorText(err, lang));
    }
  };

  return (
    <div className="page-light min-h-screen font-sans grid lg:grid-cols-2">
      {/* Form column */}
      <div className="flex flex-col min-h-screen">
        <div className="h-14 px-4 sm:px-8 flex items-center justify-between">
          <a href="#/" aria-label="STEM Visualizer">
            <Logo size={26} />
          </a>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleLang}
              className="h-8 px-2.5 rounded-md text-xs font-mono text-ink-2 hover:text-ink hover:bg-hover transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'EN' : 'RU'}
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="h-8 px-2.5 rounded-md inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink hover:bg-hover transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              {t.back}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="font-serif text-[32px] sm:text-[36px] leading-tight tracking-[-0.02em]">{copy.title}</h1>
            <p className="mt-2 text-[15px] text-ink-2">{copy.subtitle}</p>

            <button
              type="button"
              onClick={google}
              className="mt-8 w-full h-11 rounded-lg bg-surface border border-line hover:bg-muted hover:border-line-strong text-sm font-medium text-ink inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <GoogleIcon />
              {t.google}
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-ink-3">
              <span className="flex-1 h-px bg-line" />
              {t.or}
              <span className="flex-1 h-px bg-line" />
            </div>

            {codeFor ? (
              <form onSubmit={confirmCode} noValidate className="space-y-4">
                <p className="text-[15px] text-ink">
                  {codeFor.kind === 'signup' ? L('Подтверждение почты', 'Confirm your email') : L('Новый пароль', 'New password')}: <b>{codeFor.email}</b>
                </p>
                <Field label={L('Код из письма', 'Code from the email')}>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                    placeholder="123456"
                    className={`${inputBase} border-line font-mono text-xl tracking-[0.4em] text-center`}
                  />
                </Field>
                {codeFor.kind === 'recovery' && (
                  <Field label={L('Новый пароль', 'New password')} hint={t.fields.passwordHint}>
                    <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputBase} border-line`} />
                  </Field>
                )}
                {formError && <p className="rounded-lg bg-[#FDF0EF] border border-[#F2C8C5] px-3 py-2 text-sm text-[#CC2F35]">{formError}</p>}
                {notice && <p className="rounded-lg bg-[#EAF6EF] border border-[#BFE3CC] px-3 py-2 text-sm text-[#1E7A4C]">{notice}</p>}
                <button type="submit" disabled={busy} className="w-full h-11 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-70 text-white text-sm font-medium cursor-pointer inline-flex items-center justify-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
                  {codeFor.kind === 'signup' ? L('Подтвердить', 'Confirm') : L('Сменить пароль', 'Change password')}
                </button>
                <div className="flex justify-between text-sm">
                  <button type="button" onClick={resend} className="text-accent hover:text-accent-hover cursor-pointer">
                    {L('Отправить код ещё раз', 'Send the code again')}
                  </button>
                  <button type="button" onClick={() => { setCodeFor(null); setNotice(null); setFormError(null); setCode(''); }} className="text-ink-2 hover:text-ink cursor-pointer">
                    {L('Назад', 'Back')}
                  </button>
                </div>
                <p className="text-xs text-ink-3">{L('Письмо не пришло? Подожди минуту и проверь папку «Спам» или «Промоакции».', 'No email? Wait a minute and check Spam or Promotions.')}</p>
              </form>
            ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <span className="block text-sm font-medium text-ink mb-1.5">{t.fields.role}</span>
                    <div className="grid grid-cols-2 p-1 rounded-lg bg-muted border border-line">
                      {(['student', 'teacher'] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`h-9 rounded-md text-sm transition-colors cursor-pointer ${
                            role === r ? 'bg-surface border border-line text-ink font-medium' : 'text-ink-2 hover:text-ink'
                          }`}
                        >
                          {t.fields[r]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label={t.fields.name} error={errors.name}>
                    <input
                      type="text"
                      autoComplete="given-name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); clearError('name'); }}
                      placeholder={t.fields.namePlaceholder}
                      className={`${inputBase} ${errors.name ? 'border-physics' : 'border-line'}`}
                    />
                  </Field>

                  {role === 'student' && (
                    <div>
                      <span className="block text-sm font-medium text-ink mb-1.5">{t.fields.grade}</span>
                      <div className="flex gap-1.5">
                        {GRADES.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGrade(g)}
                            className={`flex-1 h-9 rounded-md font-mono text-sm border transition-colors cursor-pointer ${
                              grade === g ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-ink-2 hover:border-line-strong'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <Field label={t.fields.email} error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  placeholder={t.fields.emailPlaceholder}
                  className={`${inputBase} ${errors.email ? 'border-physics' : 'border-line'}`}
                />
              </Field>

              <Field
                label={t.fields.password}
                error={errors.password}
                hint={mode === 'register' ? t.fields.passwordHint : undefined}
                aside={mode === 'login' ? (
                  <button type="button" onClick={forgot} className="text-sm text-accent hover:text-accent-hover cursor-pointer">{t.login.forgot}</button>
                ) : undefined}
              >
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                    className={`${inputBase} pr-11 ${errors.password ? 'border-physics' : 'border-line'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-ink-3 hover:text-ink hover:bg-hover cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                </div>
              </Field>

              {formError && <p className="rounded-lg bg-[#FDF0EF] border border-[#F2C8C5] px-3 py-2 text-sm text-[#CC2F35]">{formError}</p>}
              {notice && <p className="rounded-lg bg-[#EAF6EF] border border-[#BFE3CC] px-3 py-2 text-sm text-[#1E7A4C]">{notice}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-lg bg-accent hover:bg-accent-hover active:bg-accent-active disabled:opacity-70 text-white text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
                {copy.submit}
              </button>
            </form>
            )}

            {mode === 'register' && <p className="mt-4 text-xs leading-relaxed text-ink-3">{t.register.terms}</p>}

            <p className="mt-8 text-sm text-ink-2">
              {copy.switchText}{' '}
              <button
                onClick={() => onNavigate(mode === 'login' ? 'register' : 'login')}
                className="text-accent hover:text-accent-hover font-medium cursor-pointer"
              >
                {copy.switchLink}
              </button>
            </p>
            <button
              onClick={() => onNavigate('app')}
              className="mt-2 text-sm text-ink-3 hover:text-ink underline underline-offset-4 decoration-line-strong cursor-pointer"
            >
              {t.guest}
            </button>
          </div>
        </div>
      </div>

      {/* Visual column */}
      <div className="hidden lg:block p-3">
        <div className="relative h-full rounded-2xl bg-stage overflow-hidden">
          <div className="absolute inset-0 tech-grid opacity-60" />
          <OrbitalStage orbital={mode === 'login' ? '2pz' : '2px'} className="absolute inset-0" />
          <div className="absolute left-10 right-10 bottom-10">
            <p className="font-serif text-[26px] leading-snug text-[#EDEDED] max-w-md">{t.sideQuote}</p>
            <p className="mt-3 font-mono text-xs text-[#8C8F98]">{t.sideCaption}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; error?: string; hint?: string; aside?: React.ReactNode; children: React.ReactNode }> = ({
  label,
  error,
  hint,
  aside,
  children,
}) => (
  <label className="block">
    <span className="flex items-center justify-between mb-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {aside}
    </span>
    {children}
    {error ? (
      <span className="mt-1.5 block text-[13px] text-physics">{error}</span>
    ) : hint ? (
      <span className="mt-1.5 block text-[13px] text-ink-3">{hint}</span>
    ) : null}
  </label>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);
