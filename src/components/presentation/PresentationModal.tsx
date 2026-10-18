import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Crown, Download, GraduationCap, ImageIcon, Loader2, Lock, Presentation, Shuffle, X } from 'lucide-react';
import type { Section, Topic } from '../../data/curriculum';
import { sectionsFor } from '../../data/curriculum';
import { usePlan } from '../../lib/plan';
import { useSession } from '../../lib/supabase';
import {
  accentFor, buildSlides, downloadPptx, fileName, Images, Img, iconsUsed, layoutSlide, NO_IMAGES, Photo, Part, Run, SLIDE_H, SLIDE_W, SlideWithNotes, Theme, ThemeId, themeFor, THEMES,
} from '../../lib/presentation';
import type { PhotoCandidate } from '../../lib/illustrations';

type Lang = 'ru' | 'en';

/* ---------- capturing the formula and the model from the page ---------- */

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = fail;
    i.src = src;
  });

/** a capture that came out as one flat colour (e.g. an undrawn WebGL canvas) is useless */
async function isBlank(src: string) {
  const img = await loadImg(src);
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 27;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 48, 27);
  const d = ctx.getImageData(0, 0, 48, 27).data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return max - min < 12;
}

async function snap(el: HTMLElement | null, bg: string, skipFonts = false, style?: Partial<CSSStyleDeclaration>): Promise<Img | null> {
  if (!el || !el.offsetWidth || !el.offsetHeight) return null;
  try {
    const { toPng } = await import('html-to-image');
    const data = await toPng(el, { pixelRatio: 2, backgroundColor: bg, skipFonts, style, filter: (n) => !(n instanceof HTMLElement && n.dataset.presSkip !== undefined) });
    if (await isBlank(data)) return null;
    return { data, w: el.offsetWidth, h: el.offsetHeight };
  } catch {
    return null;
  }
}

/* ---------- the slide preview: draws the same shapes that go into the file ---------- */

const hex = (c: string) => `#${c}`;
// what the browser shows when Calibri is not installed: metrically compatible Carlito, then system sans
const CSS_FONT: Record<string, string> = {
  head: 'Georgia, "Times New Roman", serif',
  body: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif',
  math: '"Cambria Math", Cambria, Georgia, serif',
};

export const SlideView: React.FC<{ slide: SlideWithNotes; theme: Theme; accent: string; images: Images; width: number; index: number; total: number; deck: string }> = ({ slide, theme, accent, images, width, index, total, deck }) => {
  const k = width / SLIDE_W;
  const pt = (n: number) => (n / 72) * k;
  const { bg, prims } = layoutSlide(slide, { theme, accent, images, deck, index, total });
  return (
    <div style={{ position: 'relative', width, height: SLIDE_H * k, background: hex(bg), overflow: 'hidden' }}>
      {prims.map((p, i) => {
        const box: React.CSSProperties = { position: 'absolute', left: p.x * k, top: p.y * k, width: p.w * k, height: p.h * k };
        if (p.t === 'rect') return <div key={i} style={{ ...box, background: hex(p.fill), opacity: p.alpha ?? 1, borderRadius: p.r ? p.r * k : 0 }} />;
        if (p.t === 'ellipse') return <div key={i} style={{ ...box, background: hex(p.fill), opacity: p.alpha ?? 1, borderRadius: '50%' }} />;
        if (p.t === 'img') return <img key={i} src={p.data} alt="" style={{ ...box, objectFit: p.cover ? 'cover' : 'fill', opacity: p.alpha ?? 1 }} />;
        // runs split into paragraphs at each break
        const paras: Run[][] = [[]];
        p.runs.forEach((r) => {
          paras[paras.length - 1].push(r);
          if (r.br) paras.push([]);
        });
        return (
          <div
            key={i}
            style={{
              ...box,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: p.valign === 'middle' ? 'center' : p.valign === 'bottom' ? 'flex-end' : 'flex-start',
              overflow: 'hidden',
              opacity: p.alpha ?? 1,
              textAlign: p.align ?? 'left',
              fontFamily: CSS_FONT[p.font],
              fontSize: pt(p.size),
              fontWeight: p.bold ? 700 : 400,
              fontStyle: p.italic ? 'italic' : 'normal',
              color: hex(p.color),
              lineHeight: 1.2 * (p.lh ?? 1),
              letterSpacing: p.spacing ? pt(p.spacing) : undefined,
            }}
          >
            {paras.filter((q) => q.length).map((q, j) => (
              <div key={j} style={{ marginBottom: p.para ? pt(p.para) : 0 }}>
                {q.map((r, m) => (
                  <span key={m} style={{ fontWeight: r.bold ? 700 : undefined, color: r.color ? hex(r.color) : undefined, fontSize: r.size ? pt(r.size) : undefined }}>
                    {r.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- the modal ---------- */

interface Props {
  topic: Topic;
  lang: Lang;
  /** the formula and model elements on the topic page, to put their pictures on the slides */
  formulaEl: HTMLElement | null;
  modelEl: HTMLElement | null;
  onClose: () => void;
}

export const PresentationModal: React.FC<Props> = ({ topic, lang, formulaEl, modelEl, onClose }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const { user } = useSession();
  const teacher = plan.plan === 'teacher';
  const section: Section | undefined = sectionsFor(topic.subject, topic.grade).find((s) => s.id === topic.sectionId);
  const accent = accentFor(topic.subject);

  const [themeId, setThemeId] = useState<ThemeId>('light');
  const [parts, setParts] = useState<Set<Part>>(() => new Set<Part>(['title', 'intro', 'points', 'formula', 'model', 'summary', 'end']));
  const [notes, setNotes] = useState(false);
  const [whole, setWhole] = useState(false);
  const [images, setImages] = useState<Images>(NO_IMAGES);
  const [usePhotos, setUsePhotos] = useState(true);
  const [cands, setCands] = useState<PhotoCandidate[] | null>(null);
  const [photoAt, setPhotoAt] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [capturing, setCapturing] = useState(true);
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // teacher extras switch on by default for teachers
  useEffect(() => {
    if (!teacher) return;
    setParts((p) => new Set([...p, 'quiz', 'answers']));
    setNotes(true);
  }, [teacher]);

  useEffect(() => {
    let alive = true;
    // the preview shows at once; pictures of the formula and the model drop in when ready
    const f = snap(formulaEl, '#ffffff', false, { border: 'none', borderRadius: '0', boxShadow: 'none' }).then((img) => alive && img && setImages((s) => ({ ...s, formula: { [topic.id]: img } })));
    const m = (topic.sim && !('lab' in topic.sim) ? snap(modelEl, '#ffffff', true) : Promise.resolve(null)).then((img) => alive && img && setImages((s) => ({ ...s, model: { [topic.id]: img } })));
    Promise.all([f, m]).finally(() => alive && setCapturing(false));
    return () => {
      alive = false;
    };
  }, [formulaEl, modelEl, topic]);

  // Wikipedia pictures for the topic: look them up once, then load two at a time
  useEffect(() => {
    let alive = true;
    import('../../lib/illustrations')
      .then((m) => m.findPhotos([topic.title[lang], `${topic.title[lang]} ${section?.title[lang] ?? ''}`.trim()], lang))
      .then((c) => alive && setCands(c))
      .catch(() => alive && setCands([]));
    return () => {
      alive = false;
    };
  }, [topic, lang, section]);
  useEffect(() => {
    if (!cands) return;
    let alive = true;
    const pick = cands.length <= 2 ? cands : [cands[photoAt % cands.length], cands[(photoAt + 1) % cands.length]];
    setPhotoBusy(true);
    import('../../lib/illustrations')
      .then((m) => m.loadPhotos(pick, lang))
      .then((ph) => alive && setPhotos(ph))
      .catch(() => alive && setPhotos([]))
      .finally(() => alive && setPhotoBusy(false));
    return () => {
      alive = false;
    };
  }, [cands, photoAt, lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const theme = themeFor(themeId, topic.subject);
  const deck = whole && teacher && section ? section.title[lang] : topic.title[lang];
  const useSection = whole && teacher && !!section;
  const slides = useMemo(
    () =>
      buildSlides({ lang, topic, section: useSection ? section : undefined, parts: teacher ? parts : new Set([...parts].filter((p) => p !== 'quiz' && p !== 'answers')), notes: teacher && notes, hasFormulaImage: !!images.formula[topic.id], hasModel: capturing || !!images.model[topic.id] }),
    [images, capturing, lang, topic, section, useSection, parts, notes, teacher],
  );
  useEffect(() => setCurrent((c) => Math.min(c, Math.max(0, slides.length - 1))), [slides.length]);

  // icons in the subject colour for every slide that has one
  const [icons, setIcons] = useState<Images['icons']>({});
  const iconKey = iconsUsed(slides).join();
  useEffect(() => {
    let alive = true;
    const names = iconKey ? (iconKey.split(',') as ReturnType<typeof iconsUsed>) : [];
    import('../../lib/illustrations').then(async (m) => {
      const out: Images['icons'] = {};
      for (const n of names) out[n] = await m.iconImage(n, accent);
      if (alive) setIcons(out);
    });
    return () => {
      alive = false;
    };
  }, [iconKey, accent]);
  // the file waits until every picture is ready
  const waiting = capturing || (usePhotos && !useSection && (cands === null || photoBusy));
  const all: Images = useMemo(() => ({ ...images, photos: usePhotos && !useSection ? photos : [], icons }), [images, usePhotos, useSection, photos, icons]);

  const toggle = (p: Part) => setParts((s) => {
    const n = new Set(s);
    if (n.has(p)) n.delete(p);
    else n.add(p);
    return n;
  });
  const upgrade = () => {
    onClose();
    window.dispatchEvent(new Event('open-pro'));
  };
  const download = async () => {
    if (!plan.pro) return upgrade();
    if (waiting || !slides.length) return;
    setBusy(true);
    try {
      await downloadPptx(slides, theme, accent, all, fileName(deck), deck, user?.email ?? undefined);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  };

  const Row: React.FC<{ on: boolean; onClick: () => void; label: string; hint?: string; locked?: boolean }> = ({ on, onClick, label, hint, locked }) => (
    <button onClick={locked ? upgrade : onClick} className="w-full flex items-start gap-2.5 text-left py-1.5 cursor-pointer group">
      <span className={`mt-0.5 shrink-0 w-4.5 h-4.5 w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors ${locked ? 'border-line bg-muted' : on ? 'bg-accent border-accent' : 'border-line-strong bg-surface group-hover:border-accent'}`}>
        {locked ? <Lock className="w-3 h-3 text-ink-3" /> : on && <Check className="w-3 h-3" color="#fff" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className={`block text-sm ${locked ? 'text-ink-3' : 'text-ink'}`}>{label}</span>
        {hint && <span className="block text-xs text-ink-3">{hint}</span>}
      </span>
    </button>
  );

  const hasModelOpt = !!topic.sim && !('lab' in topic.sim);
  const quizCount = useSection ? Math.min(10, section!.topics.length) : 4;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/55 anim-page" onClick={onClose} />
      <div className="soft-scroll relative w-full max-w-6xl max-h-[94vh] bg-paper rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden anim-page">
        <header className="flex items-center gap-3 px-5 py-4 border-b border-line bg-surface">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: hex(accent) + '1F', color: hex(accent) }}>
            <Presentation className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl text-ink leading-tight">{L('Презентация по теме', 'Presentation')}</h2>
            <p className="text-sm text-ink-2 truncate">{useSection ? section!.title[lang] : topic.title[lang]}</p>
          </div>
          {!plan.pro && (
            <span className="hidden sm:inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-medium bg-[#FFF4DC] text-[#9A6400]">
              <Crown className="w-3.5 h-3.5" /> Pro
            </span>
          )}
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer" aria-label={L('Закрыть', 'Close')}>
            <X className="w-5 h-5 text-ink-2" />
          </button>
        </header>

        <div className="flex-1 min-h-0 grid lg:grid-cols-[300px_1fr] overflow-y-auto lg:overflow-hidden">
          {/* settings */}
          <aside className="p-5 border-b lg:border-b-0 lg:border-r border-line flex flex-col gap-5 lg:overflow-y-auto">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{L('Оформление', 'Theme')}</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((id) => {
                  const t = themeFor(id, topic.subject);
                  return (
                    <button key={id} onClick={() => setThemeId(id)} className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${themeId === id ? 'border-accent scale-[1.03] shadow-md' : 'border-transparent hover:border-line-strong'}`}>
                      <SlideView slide={{ k: 'title', label: '', title: topic.title[lang], subtitle: '', grade: topic.grade, topicId: topic.id }} theme={t} accent={accent} images={NO_IMAGES} width={84} index={0} total={1} deck="" />
                      <span className="block text-[11px] py-1 text-ink-2 bg-surface">{t.name[lang]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-1">{L('Слайды', 'Slides')}</p>
              <Row on={parts.has('title')} onClick={() => toggle('title')} label={L('Титульный слайд', 'Title slide')} />
              <Row on={parts.has('intro')} onClick={() => toggle('intro')} label={L('О чём тема', 'Introduction')} />
              <Row on={parts.has('points')} onClick={() => toggle('points')} label={L('Подтемы', 'Sub-topics')} hint={L(`${topic.points.length} слайда по шагам`, `${topic.points.length} step slides`)} />
              {topic.formula && <Row on={parts.has('formula')} onClick={() => toggle('formula')} label={L('Формула', 'Formula')} />}
              {hasModelOpt && !useSection && (
                <Row on={parts.has('model')} onClick={() => toggle('model')} label={L('Снимок модели', 'Model snapshot')} hint={!capturing && !images.model[topic.id] ? L('эту модель не удалось сфотографировать', 'this model could not be captured') : L('в том виде, как она сейчас на странице', 'exactly as it is on the page now')} />
              )}
              <Row on={parts.has('summary')} onClick={() => toggle('summary')} label={L('Главное', 'Key points')} />
              <Row on={parts.has('end')} onClick={() => toggle('end')} label={L('«Спасибо за внимание»', '“Thank you” slide')} />
            </div>
            {!useSection && (
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-1">{L('Иллюстрации', 'Pictures')}</p>
                <Row
                  on={usePhotos}
                  onClick={() => setUsePhotos(!usePhotos)}
                  label={L('Фото и схемы из Википедии', 'Photos and diagrams from Wikipedia')}
                  hint={cands === null ? L('ищем подходящие…', 'searching…') : cands.length ? L('на титульном слайде и во введении, с автором и лицензией', 'on the title and intro, with author and licence') : L('для этой темы ничего не нашлось', 'nothing found for this topic')}
                />
                {usePhotos && cands && cands.length > 2 && (
                  <button onClick={() => setPhotoAt((n) => n + 2)} disabled={photoBusy} className="ml-7 mt-1 h-8 px-3 rounded-lg border border-line bg-surface hover:bg-muted text-xs text-ink inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
                    {photoBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shuffle className="w-3.5 h-3.5" />}
                    {L('Другие картинки', 'Other pictures')}
                  </button>
                )}
                <p className="ml-7 mt-2 text-xs text-ink-3 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> {L('Иконки по смыслу — на каждом шаге', 'Topic icons on every step')}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-1">
                <GraduationCap className="w-4 h-4" /> {L('Для учителя', 'For teachers')}
              </p>
              <Row locked={!teacher} on={parts.has('quiz')} onClick={() => toggle('quiz')} label={L('Мини-тест', 'Mini quiz')} hint={L(`${quizCount} вопроса с вариантами`, `${quizCount} multiple-choice questions`)} />
              <Row locked={!teacher} on={parts.has('answers')} onClick={() => toggle('answers')} label={L('Слайд с ответами', 'Answer slide')} />
              <Row locked={!teacher} on={notes} onClick={() => setNotes(!notes)} label={L('Заметки для выступающего', 'Speaker notes')} hint={L('что сказать и что спросить у класса', 'what to say and ask the class')} />
              {section && section.topics.length > 1 && (
                <Row locked={!teacher} on={whole} onClick={() => setWhole(!whole)} label={L('Весь раздел', 'Whole section')} hint={`${section.title[lang]} · ${section.topics.length} ${L('тем', 'topics')}`} />
              )}
              {!teacher && (
                <button onClick={upgrade} className="mt-1 text-xs text-accent hover:underline cursor-pointer">
                  {L('Доступно в тарифе «Учитель»', 'Part of the Teacher plan')}
                </button>
              )}
            </div>
          </aside>

          {/* preview */}
          <section className="order-first lg:order-none p-4 sm:p-5 flex flex-col gap-4 min-w-0 lg:overflow-y-auto bg-muted/40">
            {slides.length === 0 ? (
              <div className="flex-1 min-h-[300px] flex items-center justify-center text-sm text-ink-2">{L('Выбери хотя бы один слайд.', 'Pick at least one slide.')}</div>
            ) : (
              <>
                <PreviewMain slides={slides} theme={theme} accent={accent} images={all} current={current} deck={deck} />
                <div className="flex items-center justify-between text-xs text-ink-2">
                  <span>
                    {L('Слайд', 'Slide')} {current + 1} {L('из', 'of')} {slides.length}
                  </span>
                  {slides[current]?.notes && <span className="truncate max-w-[60%]">📝 {slides[current].notes!.split('\n')[0]}</span>}
                </div>
                <div className="shrink-0 flex gap-2 overflow-x-auto pb-2">
                  {slides.map((s, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className={`shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${i === current ? 'border-accent' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                      <SlideView slide={s} theme={theme} accent={accent} images={all} width={128} index={i} total={slides.length} deck={deck} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-t border-line bg-surface">
          <p className="text-xs text-ink-3 flex-1 min-w-[200px]">{L('Файл .pptx открывается в PowerPoint, Google Slides и Keynote — его можно редактировать.', 'The .pptx opens in PowerPoint, Google Slides and Keynote, and stays editable.')}</p>
          <button
            onClick={download}
            disabled={busy || (plan.pro && waiting) || !slides.length}
            className="h-11 px-5 rounded-lg text-sm font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-transform active:scale-[0.98]"
            style={{ background: plan.pro ? '#2F5BFF' : '#16171A', color: '#fff' }}
          >
            {busy || (plan.pro && waiting) ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : plan.pro ? <Download className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {done ? L('Скачано', 'Downloaded') : plan.pro && waiting ? L('Готовим картинки…', 'Preparing pictures…') : plan.pro ? L(`Скачать .pptx · ${slides.length} слайдов`, `Download .pptx · ${slides.length} slides`) : L('Скачать — в Pro', 'Download with Pro')}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

/** the big preview fills the available width */
const PreviewMain: React.FC<{ slides: SlideWithNotes[]; theme: Theme; accent: string; images: Images; current: number; deck: string }> = ({ slides, theme, accent, images, current, deck }) => {
  const [w, setW] = useState(640);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // wide enough to read, short enough to leave room for the slide strip
    const ro = new ResizeObserver(() => setW(Math.max(260, Math.min(el.clientWidth, 860, ((window.innerHeight * 0.94 - 250) * 16) / 9))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full shrink-0">
      <div key={current} className="rounded-xl overflow-hidden shadow-lg border border-line mx-auto anim-page" style={{ width: w }}>
        <SlideView slide={slides[current]} theme={theme} accent={accent} images={images} width={w} index={current} total={slides.length} deck={deck} />
      </div>
    </div>
  );
};

export default PresentationModal;
