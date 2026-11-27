import { Button } from '@heroui/react';
import React, { useState } from 'react';
import { ArrowRight, Check, Search, Sparkles } from 'lucide-react';
import { Logo, LogoMark } from '../components/brand/Logo';
import { OrbitalStage, StageOrbital } from '../components/brand/OrbitalStage';
import { Reveal } from '../components/ui/Reveal';
import { landingCopy, Lang } from '../i18n/landing';
import type { Route } from '../router';
import { langLabel } from '../lib/ky';

interface LandingProps {
  lang: Lang;
  onToggleLang: () => void;
  onNavigate: (route: Route) => void;
}

const SUBJECT_DOT: Record<string, string> = {
  physics: 'bg-physics',
  chemistry: 'bg-chemistry',
  biology: 'bg-biology',
  math: 'bg-math',
};

const ORBITALS: StageOrbital[] = ['2s', '2pz', '2px'];
const ORBITAL_LABEL: Record<StageOrbital, string> = { '2s': '2s', '2pz': '2p_z', '2px': '2p_x' };

const btnPrimary =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover active:bg-accent-active text-[color:var(--sv-on-accent)] text-[15px] font-semibold shadow-[0_10px_30px_-12px_rgba(91,75,255,0.7)] transition-[background-color,transform] duration-150 active:scale-[0.97] cursor-pointer';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-surface border border-line hover:border-line-strong text-ink text-[15px] font-semibold transition-[border-color,transform] duration-150 active:scale-[0.97] cursor-pointer';
const card = 'bg-surface border border-line rounded-3xl';
const h2 = 'font-serif font-bold text-[30px] sm:text-[44px] leading-[1.1] tracking-[-0.03em] text-ink';

export const Landing: React.FC<LandingProps> = ({ lang, onToggleLang, onNavigate }) => {
  const t = landingCopy[lang];
  const [orbital, setOrbital] = useState<StageOrbital>('2pz');

  return (
    <div className="page-light min-h-screen font-sans overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <a href="#/" aria-label="STEM Visualizer" className="flex items-center gap-2.5 shrink-0">
            <LogoMark size={32} animate />
            <span className="hidden sm:inline font-serif text-[18px] font-extrabold tracking-[-0.03em] text-ink">STEM <span className="font-medium text-ink-2">Visualizer</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-ink-2">
            <a href="#features" className="hover:text-ink transition-colors">{t.nav.features}</a>
            <a href="#subjects" className="hover:text-ink transition-colors">{t.nav.subjects}</a>
            <a href="#how" className="hover:text-ink transition-colors">{t.nav.how}</a>
            <a href="#pricing" className="hover:text-ink transition-colors">{t.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs font-mono" onPress={() => onToggleLang()}>
              {langLabel()}
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-sm font-semibold" onPress={() => onNavigate('login')}>
              {t.nav.login}
            </Button>
            <Button size="sm" className="whitespace-nowrap text-sm font-semibold bg-ink text-paper" onPress={() => onNavigate('register')}>
              {t.nav.start}
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-20 grid lg:grid-cols-[1fr_1.02fr] gap-12 lg:gap-14 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-surface border border-line text-[14px] font-medium text-ink-2">
                <span className="px-2.5 py-0.5 rounded-full bg-accent-soft text-accent text-[12px] font-semibold">{t.hero.badge}</span>
                {t.hero.news}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 font-serif font-extrabold text-[44px] leading-[1] sm:text-[72px] tracking-[-0.045em] text-ink">
                {t.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-lg sm:text-[19px] leading-relaxed text-ink-2 max-w-xl">{t.hero.subtitle}</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => onNavigate('register')} className={btnPrimary}>
                  {t.hero.primary}
                  <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                </button>
                <button onClick={() => onNavigate('app')} className={btnSecondary}>
                  {t.hero.secondary}
                </button>
              </div>
              <p className="mt-4 text-sm text-ink-3">{t.hero.note}</p>
            </Reveal>
          </div>

          {/* Live 3D stage with floating cards around it */}
          <Reveal delay={120} className="relative sm:py-7">
            <div className={`${card} overflow-hidden shadow-[0_40px_80px_-40px_rgba(30,24,110,0.45)]`}>
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <span className="w-2 h-2 rounded-full bg-chemistry" />
                  {t.hero.stageTitle} {ORBITAL_LABEL[orbital]}
                </span>
                <div className="inline-flex p-1 rounded-xl bg-muted font-mono text-[13px]" role="group" aria-label={t.hero.stageHint}>
                  {ORBITALS.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOrbital(o)}
                      aria-pressed={orbital === o}
                      className={`h-8 px-3 rounded-lg transition-colors cursor-pointer ${orbital === o ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-ink-2 hover:text-ink'}`}
                    >
                      {ORBITAL_LABEL[o]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative bg-stage aspect-[4/3]">
                <div className="absolute inset-0 tech-grid opacity-60" />
                <OrbitalStage orbital={orbital} className="absolute inset-0" />
                <span className="absolute left-4 bottom-3.5 font-mono text-[12px] text-[#9AA3C7] pointer-events-none">{t.hero.nodal[orbital]}</span>
                <span className="absolute right-4 top-3.5 font-mono text-[12px] text-[#9AA3C7] pointer-events-none">|ψ(r, θ, φ)|²</span>
              </div>
            </div>

            <div className="hidden sm:flex float-card absolute -left-6 bottom-0 w-64 flex-col gap-2.5 p-4 rounded-2xl bg-surface border border-line shadow-[0_24px_50px_-24px_rgba(30,24,110,0.45)]" style={{ animationDelay: '0.6s' }}>
              <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink-2">{t.features.predict.title}</span>
              <span className="text-[15px] font-semibold leading-snug text-ink">{t.features.predict.question}</span>
              {t.features.predict.options.slice(0, 2).map((o, i) => (
                <span key={o} className={`text-sm px-3 py-2 rounded-lg border ${i === 1 ? 'border-accent bg-accent-soft text-accent font-semibold' : 'border-line text-ink-2'}`}>
                  {o}
                  {i === 1 ? ' ✓' : ''}
                </span>
              ))}
            </div>

            <div className="hidden sm:flex float-card absolute -right-6 top-[46%] max-w-[250px] gap-2.5 items-start p-3.5 rounded-2xl bg-[#0E1024] text-[#F4F6FF] shadow-[0_24px_50px_-20px_rgba(14,16,36,0.6)]" style={{ animationDelay: '0.9s' }}>
              <span className="shrink-0 w-7 h-7 rounded-lg bg-[#5B4BFF] grid place-items-center">
                <Sparkles className="w-4 h-4" strokeWidth={2} />
              </span>
              <span className="text-sm leading-snug">{t.features.mentor.answer}</span>
            </div>
          </Reveal>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
          <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line rounded-3xl overflow-hidden">
            {t.stats.map((s) => (
              <div key={s.label} className="bg-surface px-6 py-6">
                <div className="font-serif font-extrabold text-[32px] sm:text-[40px] tracking-[-0.03em] text-ink">{s.value}</div>
                <div className="mt-1 text-[15px] text-ink-2">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </section>

        {/* Problem */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
          <Reveal>
            <p className={`${h2} max-w-3xl`}>{t.problem.quote}</p>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-2 max-w-2xl">{t.problem.text}</p>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            <Reveal className={`${card} p-7`}>
              <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink-2">{t.problem.before}</div>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">{t.problem.beforeText}</p>
              <div className="mt-5 font-mono text-sm text-ink-2 bg-muted rounded-lg px-3 py-2 inline-block">ψ₂ₚ = R₂₁(r) · Y₁⁰(θ, φ)</div>
            </Reveal>
            <Reveal delay={100} className="rounded-3xl p-7 bg-[#5B4BFF] text-white">
              <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#E2DEFF]">{t.problem.after}</div>
              <p className="mt-4 text-lg leading-relaxed">{t.problem.afterText}</p>
              <svg viewBox="0 0 220 80" className="mt-4 w-full max-w-[260px] h-20" aria-hidden="true">
                <line x1="10" y1="40" x2="210" y2="40" stroke="#E2DEFF" strokeDasharray="4 4" strokeWidth="1.5" />
                <ellipse cx="110" cy="22" rx="16" ry="18" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="1.5" />
                <ellipse cx="110" cy="58" rx="16" ry="18" fill="#3DD6FF" fillOpacity="0.35" stroke="#3DD6FF" strokeWidth="1.5" />
                <circle cx="110" cy="40" r="2.5" fill="#fff" />
              </svg>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 scroll-mt-16">
          <Reveal>
            <h2 className={h2}>{t.how.title}</h2>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {t.how.steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="pt-5 border-t-2 border-ink">
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <h3 className="mt-3 font-serif font-bold text-2xl tracking-[-0.02em] text-ink">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-2">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 scroll-mt-16">
          <Reveal>
            <h2 className={h2}>{t.features.title}</h2>
            <p className="mt-4 text-[17px] text-ink-2 leading-relaxed max-w-2xl">{t.features.subtitle}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-6 gap-5">
            {/* Labs */}
            <Reveal className="md:col-span-4 relative overflow-hidden rounded-3xl bg-[#0E1024] text-[#F4F6FF] p-8 min-h-[300px] flex flex-col">
              <h3 className="font-serif font-bold text-[26px] tracking-[-0.02em]">{t.features.labs.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#B4BBD9] max-w-md">{t.features.labs.text}</p>
              <div className="mt-auto pt-8 flex flex-wrap gap-2 font-mono text-[13px]">
                {['ε = −dΦ/dt', 'V = π∫f(x)²dx', 'ATP · ΔμH⁺', 'Γ = 1/√(1 − v²/c²)'].map((f) => (
                  <span key={f} className="px-3.5 py-2 rounded-full bg-white/[0.08] border border-white/[0.14]">{f}</span>
                ))}
              </div>
              <CutCube className="absolute -right-8 -top-8 w-56 h-56 opacity-90" />
            </Reveal>

            {/* Mentor */}
            <Reveal delay={90} className={`${card} md:col-span-2 p-7 flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{t.features.mentor.title}</h3>
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-accent-soft text-accent">{t.features.mentor.badge}</span>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-2">{t.features.mentor.text}</p>
              <div className="ml-auto max-w-[85%] w-fit rounded-2xl rounded-br-md bg-ink text-paper text-sm px-3.5 py-2.5">{t.features.mentor.question}</div>
              <div className="max-w-[92%] w-fit rounded-2xl rounded-bl-md bg-muted text-ink text-sm px-3.5 py-2.5 leading-relaxed">{t.features.mentor.answer}</div>
            </Reveal>

            {/* Predict */}
            <Reveal className={`${card} md:col-span-2 p-7 flex flex-col gap-3`}>
              <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{t.features.predict.title}</h3>
              <p className="text-[15px] text-ink-2">{t.features.predict.text}</p>
              <p className="mt-1 text-[15px] font-semibold text-ink">{t.features.predict.question}</p>
              <div className="space-y-2">
                {t.features.predict.options.map((o, i) => (
                  <div key={o} className={`text-sm px-3 py-2 rounded-xl border ${i === 1 ? 'border-accent bg-accent-soft text-accent font-semibold' : 'border-line text-ink-2'}`}>
                    {o}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Search */}
            <Reveal delay={90} className={`${card} md:col-span-2 p-7 flex flex-col gap-3`}>
              <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{t.features.search.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-2">{t.features.search.text}</p>
              <div className="mt-auto flex items-center gap-2.5 px-3.5 h-12 rounded-xl border-[1.5px] border-accent ring-4 ring-accent-soft bg-surface">
                <Search className="w-4 h-4 text-ink-2" strokeWidth={2} />
                <span className="text-[15px] text-ink">{t.features.search.placeholder}</span>
                <span className="w-px h-4 bg-accent animate-pulse" />
              </div>
            </Reveal>

            {/* Practice + map */}
            <Reveal delay={180} className={`${card} md:col-span-2 p-7 flex flex-col gap-3`}>
              <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{t.features.breakModel.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-2">{t.features.breakModel.text}</p>
              <div className="mt-auto space-y-2" aria-hidden="true">
                {[2, 0].map((ans, row) => (
                  <div key={row} className="flex items-center gap-2 text-[13px] font-semibold text-ink-2">
                    <span className="w-4">{row + 1}</span>
                    {['А', 'Б', 'В', 'Г', 'Д'].map((l, k) => (
                      <span key={l} className={`w-8 h-8 rounded-full grid place-items-center ${k === ans ? 'bg-accent text-[color:var(--sv-on-accent)]' : 'border-[1.5px] border-line-strong'}`}>{l}</span>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className={`${card} md:col-span-3 p-7 flex flex-col gap-3`}>
              <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{t.features.map.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-2">{t.features.map.text}</p>
              <div className="mt-auto pt-3 flex items-center" aria-hidden="true">
                {['bg-physics', 'bg-chemistry', 'bg-biology', 'bg-math'].map((c, i) => (
                  <React.Fragment key={c}>
                    {i > 0 && <span className="flex-1 h-0.5 bg-line-strong" />}
                    <span className={`w-3.5 h-3.5 rounded-full ${c}`} />
                  </React.Fragment>
                ))}
              </div>
            </Reveal>

            <Reveal delay={90} className={`${card} md:col-span-3 p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{t.features.languages.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{t.features.languages.text}</p>
              </div>
              <div className="flex flex-wrap gap-2 font-serif font-semibold">
                <span className="px-3 py-1.5 rounded-lg bg-muted">Понимать</span>
                <span className="px-3 py-1.5 rounded-lg bg-muted">Understand</span>
                <span className="px-3 py-1.5 rounded-lg bg-muted">Түшүнүү</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Subjects */}
        <section id="subjects" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 scroll-mt-16">
          <Reveal>
            <h2 className={h2}>{t.subjects.title}</h2>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.subjects.list.map((s, i) => (
              <Reveal key={s.key} delay={i * 90} className={`${card} p-7`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${SUBJECT_DOT[s.key]}`} />
                  <h3 className="font-serif font-bold text-[22px] tracking-[-0.02em] text-ink">{s.name}</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.topics.map((topic) => (
                    <span key={topic} className="text-sm px-3 py-1.5 rounded-lg bg-muted text-ink">{topic}</span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 scroll-mt-16">
          <Reveal>
            <h2 className={h2}>{t.pricing.title}</h2>
            <p className="mt-4 text-[17px] text-ink-2 leading-relaxed max-w-2xl">{t.pricing.subtitle}</p>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-4xl">
            <Reveal>
              <PriceCard plan={t.pricing.free} onClick={() => onNavigate('register')} />
            </Reveal>
            <Reveal delay={90}>
              <PriceCard plan={t.pricing.pro} dark badge={lang === 'ru' ? 'ОРТ' : 'ORT'} onClick={() => onNavigate('register')} />
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <Reveal className="relative overflow-hidden rounded-[32px] bg-[#5B4BFF] text-white px-7 py-12 sm:px-14 sm:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="relative">
              <h2 className="font-serif font-extrabold text-[30px] sm:text-[48px] leading-[1.05] tracking-[-0.035em]">{t.cta.title}</h2>
              <p className="mt-3 text-[17px] text-[#E2DEFF]">{t.cta.text}</p>
            </div>
            <button onClick={() => onNavigate('register')} className="relative shrink-0 inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-white text-[#2F22C8] text-[17px] font-bold transition-transform active:scale-[0.97] cursor-pointer">
              {t.cta.button}
              <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
            </button>
            <CutCube outline className="absolute -right-16 -bottom-28 w-80 h-80 opacity-25 pointer-events-none" />
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-ink-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Logo size={22} />
            <span className="text-ink-3">{t.footer.tagline} · {t.footer.made}</span>
          </div>
          <span className="text-ink-3">
            <a href="/privacy" className="hover:text-ink mr-4">{lang === 'ru' ? 'Конфиденциальность' : 'Privacy'}</a>
            <a href="/terms" className="hover:text-ink mr-4">{lang === 'ru' ? 'Условия' : 'Terms'}</a>
            <a href="#/credits" className="hover:text-ink mr-4">{lang === 'ru' ? 'Источники моделей' : 'Model sources'}</a>© {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
};

/** the brand cube as a large decoration: filled in brand colours, or as a white outline */
const CutCube: React.FC<{ className?: string; outline?: boolean }> = ({ className, outline }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    {outline ? (
      <g fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M93 43 60 24 27 43 43.5 52.5 60 43 76.5 52.5Z" />
        <path d="M60 81 76.5 71.5 60 62 43.5 71.5Z" />
        <path d="M76.5 52.5 60 43 60 62 76.5 71.5Z" />
        <path d="M43.5 52.5 60 43 60 62 43.5 71.5Z" />
        <path d="M60 81 43.5 71.5 43.5 52.5 27 43 27 81 60 100Z" />
        <path d="M76.5 52.5 93 43 93 81 60 100 60 81 76.5 71.5Z" />
      </g>
    ) : (
      <g stroke="#0E1024" strokeWidth="2" strokeLinejoin="round">
        <path d="M93 43 60 24 27 43 43.5 52.5 60 43 76.5 52.5Z" fill="#8B7CFF" />
        <path d="M60 81 76.5 71.5 60 62 43.5 71.5Z" fill="#8B7CFF" />
        <path d="M76.5 52.5 60 43 60 62 76.5 71.5Z" fill="#5B4BFF" />
        <path d="M43.5 52.5 60 43 60 62 43.5 71.5Z" fill="#3DD6FF" />
        <path d="M60 81 43.5 71.5 43.5 52.5 27 43 27 81 60 100Z" fill="#5B4BFF" />
        <path d="M76.5 52.5 93 43 93 81 60 100 60 81 76.5 71.5Z" fill="#3DD6FF" />
      </g>
    )}
  </svg>
);

interface Plan {
  readonly name: string;
  readonly price: string;
  readonly period: string;
  readonly cta: string;
  readonly items: readonly string[];
}

const PriceCard: React.FC<{ plan: Plan; dark?: boolean; badge?: string; onClick: () => void }> = ({ plan, dark, badge, onClick }) => (
  <div className={`h-full rounded-3xl p-8 flex flex-col ${dark ? 'bg-[#0E1024] text-[#F4F6FF] shadow-[0_30px_60px_-30px_rgba(91,75,255,0.6)]' : 'bg-surface border border-line text-ink'}`}>
    <div className="flex items-center justify-between text-[17px] font-semibold">
      {plan.name}
      {badge && <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#5B4BFF] text-white">{badge}</span>}
    </div>
    <div className="mt-4 flex items-baseline gap-2 flex-wrap">
      <span className="font-serif font-extrabold text-[48px] leading-none tracking-[-0.03em]">{plan.price}</span>
      {plan.period && <span className={`text-[15px] ${dark ? 'text-[#9AA3C7]' : 'text-ink-2'}`}>{plan.period}</span>}
    </div>
    <ul className="mt-6 space-y-3 flex-1">
      {plan.items.map((item) => (
        <li key={item} className={`flex items-start gap-2.5 text-[15px] ${dark ? 'text-[#C6CBE3]' : 'text-ink-2'}`}>
          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? 'text-[#3DD6FF]' : 'text-accent'}`} strokeWidth={2.4} />
          {item}
        </li>
      ))}
    </ul>
    <button
      onClick={onClick}
      className={`mt-8 h-12 rounded-xl font-semibold transition-transform active:scale-[0.97] cursor-pointer ${dark ? 'bg-[#5B4BFF] text-white hover:bg-[#4A3BEB]' : 'border border-line text-ink hover:border-line-strong'}`}
    >
      {plan.cta}
    </button>
  </div>
);
