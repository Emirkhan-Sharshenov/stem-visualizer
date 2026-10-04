import React, { useState } from 'react';
import { ArrowRight, Check, Search, Network, Zap, Award, Languages, Box } from 'lucide-react';
import { Logo, LogoMark } from '../components/brand/Logo';
import { OrbitalStage, StageOrbital } from '../components/brand/OrbitalStage';
import { landingCopy, Lang } from '../i18n/landing';
import type { Route } from '../router';

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
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-sm font-medium transition-colors duration-150 cursor-pointer';
const btnSecondary =
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-surface border border-line hover:bg-muted hover:border-line-strong text-ink text-sm font-medium transition-colors duration-150 cursor-pointer';
const card = 'bg-surface border border-line rounded-xl';

export const Landing: React.FC<LandingProps> = ({ lang, onToggleLang, onNavigate }) => {
  const t = landingCopy[lang];
  const [orbital, setOrbital] = useState<StageOrbital>('2pz');

  return (
    <div className="page-light min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-paper/95 border-b border-line">
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
          <a href="#/" aria-label="STEM Visualizer" className="flex items-center gap-2.5 shrink-0">
            <LogoMark size={26} animate />
            <span className="hidden sm:inline text-[15px] font-medium tracking-[-0.01em] text-ink">STEM Visualizer</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-ink-2">
            <a href="#features" className="hover:text-ink transition-colors">{t.nav.features}</a>
            <a href="#how" className="hover:text-ink transition-colors">{t.nav.how}</a>
            <a href="#subjects" className="hover:text-ink transition-colors">{t.nav.subjects}</a>
            <a href="#pricing" className="hover:text-ink transition-colors">{t.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLang}
              className="h-8 px-2.5 rounded-md text-xs font-mono text-ink-2 hover:text-ink hover:bg-hover transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'EN' : 'RU'}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="hidden sm:inline-flex h-8 px-3 items-center rounded-md text-sm text-ink hover:bg-hover transition-colors cursor-pointer"
            >
              {t.nav.login}
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="inline-flex h-8 px-3 items-center whitespace-nowrap rounded-md bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {t.nav.start}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] uppercase text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {t.hero.eyebrow}
            </div>
            <h1 className="mt-5 font-serif text-[40px] leading-[1.1] sm:text-[56px] sm:leading-[1.05] tracking-[-0.02em] text-ink">
              {t.hero.title}
            </h1>
            <p className="mt-5 font-serif text-lg sm:text-xl leading-relaxed text-ink-2 max-w-xl">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => onNavigate('register')} className={btnPrimary}>
                {t.hero.primary}
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button onClick={() => onNavigate('app')} className={btnSecondary}>
                {t.hero.secondary}
              </button>
            </div>
            <p className="mt-4 text-sm text-ink-3">{t.hero.note}</p>
          </div>

          {/* Live 3D stage */}
          <div className="relative rounded-2xl bg-stage border border-stage-line overflow-hidden aspect-[4/3.4] sm:aspect-[4/3]">
            <div className="absolute inset-0 tech-grid opacity-60" />
            <OrbitalStage orbital={orbital} className="absolute inset-0" />
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 pointer-events-none">
              <div>
                <div className="flex items-center gap-2 text-[13px] text-[#EDEDED]">
                  <span className="w-2 h-2 rounded-full bg-chemistry" />
                  {t.hero.stageTitle} {ORBITAL_LABEL[orbital]}
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#8C8F98]">|ψ(r, θ, φ)|²</div>
              </div>
              <div className="hidden sm:block font-mono text-[11px] text-[#8fa4ff] border border-[#2c3350] rounded-md px-2 py-1 bg-[#151a2c]">
                {t.hero.nodal[orbital]}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[12px] text-[#8C8F98]">{t.hero.stageHint}</span>
              <div className="inline-flex p-1 rounded-lg bg-[#1A1C21] border border-stage-line">
                {ORBITALS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrbital(o)}
                    className={`px-3 h-8 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                      orbital === o ? 'bg-accent text-white' : 'text-[#B5B8C0] hover:text-white'
                    }`}
                  >
                    {ORBITAL_LABEL[o]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-line bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4">
            {t.stats.map((s, i) => (
              <div
                key={s.label}
                className={`py-6 px-2 sm:px-6 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i >= 2 ? 'border-t md:border-t-0 border-line' : ''} ${i === 2 ? 'md:border-l' : ''}`}
              >
                <div className="font-mono text-xl sm:text-2xl text-ink">{s.value}</div>
                <div className="mt-1 text-sm text-ink-2">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="font-serif text-[28px] sm:text-[36px] leading-[1.25] tracking-[-0.015em] text-ink">{t.problem.quote}</p>
            <p className="mt-5 text-base leading-relaxed text-ink-2 max-w-2xl">{t.problem.text}</p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <div className={`${card} p-6`}>
              <div className="text-xs font-medium uppercase tracking-[0.05em] text-ink-3">{t.problem.before}</div>
              <p className="mt-4 font-serif text-lg leading-relaxed text-ink-2">{t.problem.beforeText}</p>
              <div className="mt-5 font-mono text-sm text-ink-2 bg-muted rounded-md px-3 py-2 inline-block">
                ψ₂ₚ = R₂₁(r) · Y₁⁰(θ, φ)
              </div>
            </div>
            <div className={`${card} p-6 border-accent/40`}>
              <div className="text-xs font-medium uppercase tracking-[0.05em] text-accent">{t.problem.after}</div>
              <p className="mt-4 font-serif text-lg leading-relaxed text-ink">{t.problem.afterText}</p>
              <svg viewBox="0 0 220 80" className="mt-4 w-full max-w-[260px] h-20" aria-hidden="true">
                <line x1="10" y1="40" x2="210" y2="40" stroke="#2F5BFF" strokeDasharray="4 4" strokeWidth="1.5" />
                <ellipse cx="110" cy="22" rx="16" ry="18" fill="#2F5BFF" fillOpacity="0.12" stroke="#2F5BFF" strokeWidth="1.5" />
                <ellipse cx="110" cy="58" rx="16" ry="18" fill="#30A46C" fillOpacity="0.12" stroke="#30A46C" strokeWidth="1.5" />
                <circle cx="110" cy="40" r="2.5" fill="#111" />
              </svg>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-surface border-y border-line scroll-mt-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <h2 className="font-serif text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em]">{t.how.title}</h2>
            <div className="mt-12 grid md:grid-cols-3 gap-10 md:gap-8">
              {t.how.steps.map((s, i) => (
                <div key={s.n} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-accent">{s.n}</span>
                    <span className="flex-1 h-px bg-line" />
                  </div>
                  <StepSketch index={i} />
                  <h3 className="mt-5 font-serif text-xl">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 scroll-mt-14">
          <div className="max-w-2xl">
            <h2 className="font-serif text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em]">{t.features.title}</h2>
            <p className="mt-4 text-base text-ink-2 leading-relaxed">{t.features.subtitle}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Labs */}
            <div className={`${card} p-6 md:col-span-4 flex flex-col`}>
              <FeatureHead icon={<Box className="w-4 h-4" strokeWidth={1.75} />} title={t.features.labs.title} />
              <p className="mt-2 text-[15px] text-ink-2 leading-relaxed max-w-lg">{t.features.labs.text}</p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniLab label="ε = −dΦ/dt" dot="bg-physics"><InductionSketch /></MiniLab>
                <MiniLab label="Γ = 1/√(1 − v²/c²)" dot="bg-physics"><RelativitySketch /></MiniLab>
                <MiniLab label="V = π∫f(x)²dx" dot="bg-math"><RevolutionSketch /></MiniLab>
                <MiniLab label="ATP · ΔμH⁺" dot="bg-biology"><CellSketch /></MiniLab>
              </div>
            </div>

            {/* Predict first */}
            <div className={`${card} p-6 md:col-span-2`}>
              <FeatureHead icon={<span className="font-mono text-xs">?</span>} title={t.features.predict.title} />
              <p className="mt-2 text-[15px] text-ink-2">{t.features.predict.text}</p>
              <div className="mt-5 rounded-lg border border-line bg-paper p-3">
                <p className="text-sm text-ink">{t.features.predict.question}</p>
                <div className="mt-3 space-y-1.5">
                  {t.features.predict.options.map((o, i) => (
                    <div
                      key={o}
                      className={`flex items-center gap-2 text-[13px] px-2.5 py-2 rounded-md border ${
                        i === 1 ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-ink-2'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border ${i === 1 ? 'border-accent bg-accent' : 'border-line-strong'}`} />
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mentor */}
            <div className={`${card} p-6 md:col-span-3`}>
              <div className="flex items-center justify-between">
                <FeatureHead icon={<span className="font-serif text-sm">M</span>} title={t.features.mentor.title} />
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent-soft text-accent">{t.features.mentor.badge}</span>
              </div>
              <p className="mt-2 text-[15px] text-ink-2">{t.features.mentor.text}</p>
              <div className="mt-5 space-y-2">
                <div className="ml-auto max-w-[80%] w-fit rounded-xl rounded-br-sm bg-accent text-white text-sm px-3.5 py-2">
                  {t.features.mentor.question}
                </div>
                <div className="max-w-[88%] w-fit rounded-xl rounded-bl-sm bg-muted text-ink text-sm px-3.5 py-2 leading-relaxed">
                  {t.features.mentor.answer}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className={`${card} p-6 md:col-span-3`}>
              <FeatureHead icon={<Search className="w-4 h-4" strokeWidth={1.75} />} title={t.features.search.title} />
              <p className="mt-2 text-[15px] text-ink-2">{t.features.search.text}</p>
              <div className="mt-5 rounded-lg border border-line bg-surface">
                <div className="flex items-center gap-2 px-3 h-11 border-b border-line">
                  <Search className="w-4 h-4 text-ink-3" strokeWidth={1.75} />
                  <span className="text-sm text-ink">{t.features.search.placeholder}</span>
                  <span className="w-px h-4 bg-accent animate-pulse" />
                  <kbd className="ml-auto font-mono text-[11px] text-ink-3 border border-line rounded px-1.5">⌘K</kbd>
                </div>
                <div className="px-3 py-2.5 flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-math" />
                  <span className="text-ink">∇·F</span>
                  <span className="text-ink-2">{lang === 'ru' ? 'Дивергенция векторного поля' : 'Divergence of a vector field'}</span>
                  <ArrowRight className="ml-auto w-4 h-4 text-ink-3" strokeWidth={1.75} />
                </div>
              </div>
            </div>

            {/* Small cards */}
            <SmallFeature icon={<Zap className="w-4 h-4" strokeWidth={1.75} />} title={t.features.breakModel.title} text={t.features.breakModel.text} />
            <SmallFeature icon={<Network className="w-4 h-4" strokeWidth={1.75} />} title={t.features.map.title} text={t.features.map.text} />
            <SmallFeature icon={<Award className="w-4 h-4" strokeWidth={1.75} />} title={t.features.discoveries.title} text={t.features.discoveries.text} />
            <div className={`${card} p-6 md:col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <FeatureHead icon={<Languages className="w-4 h-4" strokeWidth={1.75} />} title={t.features.languages.title} />
                <p className="mt-2 text-[15px] text-ink-2">{t.features.languages.text}</p>
              </div>
              <div className="flex gap-2 font-serif text-lg">
                <span className="px-3 py-1.5 rounded-md bg-muted">Понимать</span>
                <span className="px-3 py-1.5 rounded-md bg-muted">Understand</span>
                <span className="px-3 py-1.5 rounded-md bg-muted">Түшүнүү</span>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section id="subjects" className="bg-surface border-y border-line scroll-mt-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <h2 className="font-serif text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em]">{t.subjects.title}</h2>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {t.subjects.list.map((s) => (
                <div key={s.key}>
                  <div className="flex items-center gap-2 pb-3 border-b border-line">
                    <span className={`w-2 h-2 rounded-full ${SUBJECT_DOT[s.key]}`} />
                    <h3 className="font-serif text-xl">{s.name}</h3>
                    <span className="ml-auto font-mono text-xs text-ink-3">{s.topics.length}</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {s.topics.map((topic) => (
                      <li key={topic} className="text-[15px] text-ink-2">{topic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 scroll-mt-14">
          <div className="max-w-2xl">
            <h2 className="font-serif text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em]">{t.pricing.title}</h2>
            <p className="mt-4 text-base text-ink-2 leading-relaxed">{t.pricing.subtitle}</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-4 max-w-4xl">
            <PriceCard plan={t.pricing.free} highlighted onClick={() => onNavigate('register')} />
            <PriceCard plan={t.pricing.pro} onClick={() => onNavigate('register')} />
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="rounded-2xl bg-stage text-[#EDEDED] px-6 py-12 sm:px-12 sm:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute inset-0 tech-grid opacity-50" />
            <div className="relative">
              <h2 className="font-serif text-[28px] sm:text-[36px] leading-tight tracking-[-0.015em]">{t.cta.title}</h2>
              <p className="mt-3 text-[#A0A3AB]">{t.cta.text}</p>
            </div>
            <button onClick={() => onNavigate('register')} className={`${btnPrimary} relative shrink-0`}>
              {t.cta.button}
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-ink-2">
          <div className="flex items-center gap-3">
            <Logo size={22} />
            <span className="text-ink-3">— {t.footer.tagline}</span>
          </div>
          <span className="text-ink-3">© {new Date().getFullYear()} · {t.footer.made}</span>
        </div>
      </footer>
    </div>
  );
};

const FeatureHead: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2.5">
    <span className="w-8 h-8 rounded-lg bg-muted text-ink flex items-center justify-center">{icon}</span>
    <h3 className="font-serif text-xl">{title}</h3>
  </div>
);

const SmallFeature: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className={`${card} p-6 md:col-span-2`}>
    <FeatureHead icon={icon} title={title} />
    <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">{text}</p>
  </div>
);

const MiniLab: React.FC<{ label: string; dot: string; children: React.ReactNode }> = ({ label, dot, children }) => (
  <div className="rounded-lg border border-line bg-paper overflow-hidden">
    <div className="aspect-[4/3] flex items-center justify-center">{children}</div>
    <div className="px-2.5 py-2 border-t border-line flex items-center gap-1.5 font-mono text-[10.5px] text-ink-2 truncate">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="truncate">{label}</span>
    </div>
  </div>
);

interface Plan {
  readonly name: string;
  readonly price: string;
  readonly period: string;
  readonly cta: string;
  readonly items: readonly string[];
}

const PriceCard: React.FC<{ plan: Plan; highlighted?: boolean; onClick: () => void }> = ({ plan, highlighted, onClick }) => (
  <div className={`${card} p-6 sm:p-8 flex flex-col ${highlighted ? 'border-accent ring-1 ring-accent' : ''}`}>
    <div className="text-sm font-medium text-ink-2">{plan.name}</div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="font-serif text-[40px] leading-none">{plan.price}</span>
      {plan.period && <span className="text-sm text-ink-3">{plan.period}</span>}
    </div>
    <ul className="mt-6 space-y-2.5 flex-1">
      {plan.items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink">
          <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" strokeWidth={2} />
          {item}
        </li>
      ))}
    </ul>
    <button onClick={onClick} className={`mt-8 ${highlighted ? btnPrimary : btnSecondary}`}>
      {plan.cta}
    </button>
  </div>
);

/* Line sketches in the logo style: 1.5px strokes, one accent per drawing */

const StepSketch: React.FC<{ index: number }> = ({ index }) => (
  <svg viewBox="0 0 240 110" className="mt-5 w-full h-28 rounded-lg bg-paper border border-line" aria-hidden="true">
    {index === 0 && (
      <g fill="none" strokeWidth="1.5">
        <circle cx="120" cy="55" r="28" stroke="#D6D4CE" strokeDasharray="4 4" />
        <text x="120" y="62" textAnchor="middle" fontFamily="Newsreader" fontSize="24" fill="#2F5BFF">?</text>
        <path d="M60 55h20M160 55h20" stroke="#D6D4CE" />
      </g>
    )}
    {index === 1 && (
      <g fill="none" strokeWidth="1.5">
        <line x1="40" y1="45" x2="200" y2="45" stroke="#E8E6E1" strokeWidth="4" strokeLinecap="round" />
        <line x1="40" y1="45" x2="140" y2="45" stroke="#2F5BFF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="140" cy="45" r="8" fill="#fff" stroke="#2F5BFF" />
        <text x="40" y="80" fontFamily="JetBrains Mono" fontSize="12" fill="#6B6B6B">ℓ = 1</text>
        <text x="200" y="80" textAnchor="end" fontFamily="JetBrains Mono" fontSize="12" fill="#111">E₂ = −3.40 эВ</text>
      </g>
    )}
    {index === 2 && (
      <g fill="none" strokeWidth="1.5">
        <path d="M30 80 C70 20, 110 20, 150 60 S200 70, 215 40" stroke="#2F5BFF" />
        <path d="M30 80 C70 30, 110 30, 150 66 S200 76, 215 52" stroke="#8C8C88" strokeDasharray="4 4" />
        <circle cx="150" cy="60" r="3" fill="#2F5BFF" stroke="none" />
      </g>
    )}
  </svg>
);

const InductionSketch = () => (
  <svg viewBox="0 0 100 75" className="w-full h-full" aria-hidden="true">
    <rect x="14" y="30" width="14" height="16" fill="#E5484D" fillOpacity="0.15" stroke="#E5484D" strokeWidth="1.2" />
    <g fill="none" stroke="#111" strokeWidth="1.2">
      <ellipse cx="52" cy="38" rx="6" ry="16" />
      <ellipse cx="62" cy="38" rx="6" ry="16" />
      <ellipse cx="72" cy="38" rx="6" ry="16" />
    </g>
    <path d="M30 38h58" stroke="#2F5BFF" strokeWidth="1.2" strokeDasharray="3 3" />
  </svg>
);

const RelativitySketch = () => (
  <svg viewBox="0 0 100 75" className="w-full h-full" aria-hidden="true">
    <path d="M20 15h60M20 60h60" stroke="#111" strokeWidth="1.2" />
    <path d="M30 60 L70 15" stroke="#2F5BFF" strokeWidth="1.5" />
    <path d="M30 60 V15" stroke="#8C8C88" strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);

const RevolutionSketch = () => (
  <svg viewBox="0 0 100 75" className="w-full h-full" aria-hidden="true">
    <path d="M15 38 Q50 10 85 22" fill="none" stroke="#111" strokeWidth="1.2" />
    <path d="M15 38 Q50 66 85 54" fill="none" stroke="#111" strokeWidth="1.2" />
    <ellipse cx="70" cy="38" rx="5" ry="15" fill="#2F5BFF" fillOpacity="0.12" stroke="#2F5BFF" strokeWidth="1.2" />
    <path d="M10 38h80" stroke="#8C8C88" strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);

const CellSketch = () => (
  <svg viewBox="0 0 100 75" className="w-full h-full" aria-hidden="true">
    <rect x="10" y="30" width="80" height="10" fill="#ECEBE6" />
    <rect x="44" y="18" width="12" height="30" rx="3" fill="#F5A524" fillOpacity="0.2" stroke="#F5A524" strokeWidth="1.2" />
    <circle cx="50" cy="56" r="9" fill="#F5A524" fillOpacity="0.2" stroke="#F5A524" strokeWidth="1.2" />
    <path d="M50 8v8" stroke="#2F5BFF" strokeWidth="1.2" />
  </svg>
);
