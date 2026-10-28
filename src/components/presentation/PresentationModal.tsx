import { Choice } from '../ui/Choice';
import { Check as CheckBox } from '../ui/Check';
import { Button, Tooltip, Input, TextArea } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { ArrowLeft, ArrowRight, Check, Crown, Dices, Download, Eye, EyeOff, GraduationCap, ImageIcon, Loader2, Lock, Presentation, Shuffle, Trash2, Upload, X } from 'lucide-react';
import type { Section, Topic } from '../../data/curriculum';
import { sectionsFor } from '../../data/curriculum';
import { usePlan } from '../../lib/plan';
import { useSession } from '../../lib/supabase';
import {
  ACCENTS, accentFor, Branding, EndLayoutId, HeaderId, IntroLayoutId, PointLayoutId, QuizLayoutId, SummaryLayoutId, TEMPLATES, buildSlides, LESSON_PARTS, LessonPart, Slide, DecorId, DEFAULT_STYLE, DesignStyle, FONT_PAIRS, FontPairId, ScaleId, TitleLayoutId, buildPptx, saveFile, isPhone, inAppBrowser, fileName, Images, Img, iconsUsed, layoutSlide, NO_IMAGES, Photo, Part, Run, SLIDE_H, SLIDE_W, SlideWithNotes, Theme, ThemeId, themeFor, THEMES,
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
const rgba = (c: string, a: number) => `rgba(${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)}, ${a})`;
// what the browser shows when Calibri is not installed: metrically compatible Carlito, then system sans
const CSS_FACE: Record<string, string> = {
  Georgia: 'Georgia, "Times New Roman", serif',
  Calibri: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif',
  Arial: 'Arial, Helvetica, sans-serif',
  Cambria: 'Cambria, Caladea, Georgia, serif',
  'Trebuchet MS': '"Trebuchet MS", "Segoe UI", sans-serif',
  math: '"Cambria Math", Cambria, Georgia, serif',
};
const cssFont = (style: DesignStyle, f: 'head' | 'body' | 'math') => (f === 'math' ? CSS_FACE.math : CSS_FACE[FONT_PAIRS[style.fonts][f]]);

export const SlideView: React.FC<{ slide: SlideWithNotes; style: DesignStyle; theme: Theme; images: Images; width: number; index: number; total: number; deck: string; brand?: Branding }> = ({ slide, style, theme, images, width, index, total, deck, brand }) => {
  const k = width / SLIDE_W;
  const pt = (n: number) => (n / 72) * k;
  const { bg, prims } = layoutSlide(slide, { style, theme, accent: theme.accent, images, deck, index, total, brand });
  return (
    <div style={{ position: 'relative', width, height: SLIDE_H * k, background: hex(bg), overflow: 'hidden' }}>
      {prims.map((p, i) => {
        const box: React.CSSProperties = { position: 'absolute', left: p.x * k, top: p.y * k, width: p.w * k, height: p.h * k };
        // fills and outlines keep their own transparency, as in PowerPoint
        const lineW = `${Math.max(1, (1.5 / 72) * k)}px`;
        if (p.t === 'rect')
          return <div key={i} style={{ ...box, background: rgba(p.fill, p.alpha ?? 1), border: p.line ? `${lineW} solid ${hex(p.line)}` : undefined, borderRadius: p.r ? p.r * k : 0 }} />;
        if (p.t === 'ellipse')
          return <div key={i} style={{ ...box, background: rgba(p.fill, p.alpha ?? 1), border: p.line ? `${lineW} solid ${rgba(p.line, p.lineAlpha ?? 1)}` : undefined, borderRadius: '50%' }} />;
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
              fontFamily: cssFont(style, p.font),
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

/* ---------- teacher tools ---------- */

/** an uploaded picture, shrunk so the file stays small */
async function readImage(file: File, max: number, photo: boolean): Promise<Img> {
  const url = await new Promise<string>((ok, fail) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = fail;
    r.readAsDataURL(file);
  });
  const img = await loadImg(url);
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return { data: photo ? c.toDataURL('image/jpeg', 0.86) : c.toDataURL('image/png'), w: c.width, h: c.height };
}

type Edit = { title?: string; body?: string };
/** the slide's own heading and main text, which the teacher can rewrite */
const editable = (s: Slide): { title?: string; body?: string } => {
  const title = 'title' in s ? (s as { title: string }).title : undefined;
  if (s.k === 'text' || s.k === 'point') return { title, body: s.text };
  if (s.k === 'title' || s.k === 'end') return { title, body: s.subtitle };
  if (s.k === 'example') return { title, body: s.problem };
  if (s.k === 'quiz') return { body: s.q };
  return { title };
};
function applyEdit(s: SlideWithNotes, e?: Edit): SlideWithNotes {
  if (!e) return s;
  const out = { ...s } as SlideWithNotes & Record<string, unknown>;
  if (e.title !== undefined && 'title' in out) out.title = e.title;
  if (e.body !== undefined) {
    if (s.k === 'text' || s.k === 'point') out.text = e.body;
    else if (s.k === 'title' || s.k === 'end') out.subtitle = e.body;
    else if (s.k === 'example') out.problem = e.body;
    else if (s.k === 'quiz') out.q = e.body;
  }
  return out;
}

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
  // downloads are for paid Pro; the free week only previews
  const paid = plan.pro && !plan.trial;
  const { user } = useSession();
  const teacher = plan.plan === 'teacher';
  const section: Section | undefined = sectionsFor(topic.subject, topic.grade).find((s) => s.id === topic.sectionId);
  const accent = accentFor(topic.subject);

  // the look is remembered between presentations
  const [style, setStyleState] = useState<DesignStyle>(() => {
    try {
      return { ...DEFAULT_STYLE, ...JSON.parse(localStorage.getItem('presStyle') ?? '{}') };
    } catch {
      return DEFAULT_STYLE;
    }
  });
  const setStyle = (patch: Partial<DesignStyle>) =>
    setStyleState((s) => {
      const n = { ...s, ...patch };
      try {
        localStorage.setItem('presStyle', JSON.stringify(n));
      } catch {
        /* private mode */
      }
      return n;
    });
  const surprise = () => {
    const any = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
    const tp = any(TEMPLATES);
    setStyle({ ...tp.style, template: undefined, theme: any(THEMES), fonts: any(Object.keys(FONT_PAIRS) as FontPairId[]), accent: Math.random() < 0.5 ? null : any(ACCENTS), decor: any(['none', 'dots', 'grid', 'blobs', 'rings'] as DecorId[]), title: any(['split', 'full', 'center', 'band', 'frame', 'minimal', 'magazine', 'blocks', 'split-left'] as TitleLayoutId[]) });
  };
  const [parts, setParts] = useState<Set<Part>>(() => new Set<Part>(['title', 'intro', 'points', 'formula', 'model', 'summary', 'end']));
  const [notes, setNotes] = useState(false);
  // the teacher's details are remembered between presentations
  const [brand, setBrandState] = useState<Branding>(() => {
    try {
      return JSON.parse(localStorage.getItem('presBrand') ?? '{}');
    } catch {
      return {};
    }
  });
  const setBrand = (patch: Partial<Branding>) =>
    setBrandState((b) => {
      const n = { ...b, ...patch };
      try {
        localStorage.setItem('presBrand', JSON.stringify(n));
      } catch {
        /* too big or private mode */
      }
      return n;
    });
  const [titlePhoto, setTitlePhoto] = useState<Photo | null>(null);
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
  // phones: the file is built first, then a second tap opens the share sheet
  const [ready, setReady] = useState<Blob | null>(null);

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

  // one object per look, or every render would count as a change and throw away the prepared file
  const theme = useMemo(() => themeFor(style.theme, topic.subject, style.accent), [style.theme, topic.subject, style.accent]);
  const deck = whole && teacher && section ? section.title[lang] : topic.title[lang];
  const useSection = whole && teacher && !!section;
  const built = useMemo(
    () =>
      buildSlides({
        lang,
        topic,
        section: useSection ? section : undefined,
        parts: teacher ? parts : new Set([...parts].filter((p) => p !== 'quiz' && p !== 'answers' && !LESSON_PARTS.includes(p as LessonPart))),
        notes: teacher && notes,
        hasFormulaImage: !!images.formula[topic.id],
        hasModel: capturing || !!images.model[topic.id],
      }),
    [images, capturing, lang, topic, section, useSection, parts, notes, teacher],
  );
  // the teacher's changes to the deck: order, hidden slides and rewritten texts; a new set of slides starts clean
  const builtKey = built.map((x) => x.k).join();
  const [order, setOrder] = useState<number[] | null>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [edits, setEdits] = useState<Record<number, Edit>>({});
  useEffect(() => {
    setOrder(null);
    setHidden(new Set());
    setEdits({});
  }, [builtKey]);
  const ordered = useMemo(() => (order && order.length === built.length ? order : built.map((_, i) => i)), [order, built]);
  const visible = ordered.filter((i) => !hidden.has(i));
  const slides = useMemo(() => visible.map((i) => applyEdit(built[i], edits[i])), [visible.join(), built, edits]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setCurrent((c) => Math.min(c, Math.max(0, ordered.length - 1))), [ordered.length]);
  const curSrc = ordered[current] ?? 0;
  const curSlide = built.length ? applyEdit(built[curSrc], edits[curSrc]) : null;
  const move = (dir: -1 | 1) => {
    const j = current + dir;
    if (j < 0 || j >= ordered.length) return;
    const n = [...ordered];
    [n[current], n[j]] = [n[j], n[current]];
    setOrder(n);
    setCurrent(j);
  };

  // icons in the subject colour for every slide that has one
  const [icons, setIcons] = useState<Images['icons']>({});
  const iconKey = iconsUsed(slides).join();
  useEffect(() => {
    let alive = true;
    const names = iconKey ? (iconKey.split(',') as ReturnType<typeof iconsUsed>) : [];
    import('../../lib/illustrations').then(async (m) => {
      const out: Images['icons'] = {};
      for (const n of names) out[n] = await m.iconImage(n, theme.accent);
      if (alive) setIcons(out);
    });
    return () => {
      alive = false;
    };
  }, [iconKey, theme.accent]);
  // the file waits until every picture is ready
  const waiting = capturing || (usePhotos && !useSection && (cands === null || photoBusy));
  const all: Images = useMemo(
    () => ({ ...images, photos: [...(teacher && titlePhoto ? [titlePhoto] : []), ...(usePhotos && !useSection ? photos : [])], icons }),
    [images, usePhotos, useSection, photos, icons, teacher, titlePhoto],
  );
  const brandOn = teacher ? brand : undefined;

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
    if (!paid) return upgrade();
    if (waiting || !slides.length) return;
    if (ready) {
      await saveFile(ready, fileName(deck));
      setReady(null);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
      return;
    }
    setBusy(true);
    try {
      const blob = await buildPptx(slides, style, theme, all, deck, user?.email ?? undefined, brandOn);
      if (isPhone()) setReady(blob);
      else {
        await saveFile(blob, fileName(deck));
        setDone(true);
        setTimeout(() => setDone(false), 2500);
      }
    } catch (e) {
      console.error(e);
      alert(L('Не получилось собрать презентацию. Попробуйте ещё раз.', 'Could not build the presentation. Please try again.'));
    } finally {
      setBusy(false);
    }
  };
  // any change makes the prepared file stale
  useEffect(() => setReady(null), [slides, style, theme, all, brandOn, deck]);
  const inApp = inAppBrowser();

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

  // Esc, the backdrop and the scroll lock come from the dialog
  return (
    <Dialog onClose={onClose} label={L('Презентация по теме', 'Presentation')} className="soft-scroll max-w-6xl max-h-[94vh] p-0 bg-paper flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-5 py-4 border-b border-line bg-surface">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: hex(accent) + '1F', color: hex(accent) }}>
            <Presentation className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl text-ink leading-tight">{L('Презентация по теме', 'Presentation')}</h2>
            <p className="text-sm text-ink-2 truncate">{useSection ? section!.title[lang] : topic.title[lang]}</p>
          </div>
          {!paid && (
            <span className="hidden sm:inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-medium bg-[#FFF4DC] text-[#9A6400]">
              <Crown className="w-3.5 h-3.5" /> Pro
            </span>
          )}
          <Button variant="ghost" isIconOnly className="w-9" onPress={() => onClose()} aria-label={L('Закрыть', 'Close')}>
            <X className="w-5 h-5 text-ink-2" />
          </Button>
        </header>

        <div className="flex-1 min-h-0 grid lg:grid-cols-[300px_1fr] overflow-y-auto lg:overflow-hidden">
          {/* settings */}
          <aside className="p-5 border-b lg:border-b-0 lg:border-r border-line flex flex-col gap-5 lg:overflow-y-auto">
            <DesignPanel lang={lang} style={style} setStyle={setStyle} onSurprise={surprise} topic={topic} teacher={teacher} onUpgrade={upgrade} />
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
                  <Button variant="outline" size="sm" className="ml-7 mt-1 text-xs" onPress={() => setPhotoAt((n) => n + 2)} isDisabled={photoBusy}>
                    {photoBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shuffle className="w-3.5 h-3.5" />}
                    {L('Другие картинки', 'Other pictures')}
                  </Button>
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
              {!useSection && (
                <>
                  <p className="mt-3 mb-0.5 text-[11px] font-medium uppercase tracking-[0.05em] text-ink-3">{L('Структура урока', 'Lesson structure')}</p>
                  {(
                    [
                      ['goals', L('Цели урока', 'Lesson goals'), L('«узнаем» и «научимся»', '“learn” and “be able to”')],
                      ['warmup', L('Разминка', 'Warm-up'), L('3 вопроса по прошлой теме', '3 questions on the previous topic')],
                      ['terms', L('Ключевые понятия', 'Key terms'), L('словарик темы', 'topic glossary')],
                      ['example', L('Задача у доски', 'Worked example'), L('решение по шагам и ответ', 'steps and the answer')],
                      ['homework', L('Домашнее задание', 'Homework'), L('3 задачи, ответы в заметках', '3 problems, answers in the notes')],
                      ['reflection', L('Рефлексия', 'Reflection'), L('светофор и «продолжи фразу»', 'traffic light and sentence starters')],
                    ] as [LessonPart, string, string][]
                  ).map(([id, label, hint]) => (
                    <Row key={id} locked={!teacher} on={parts.has(id)} onClick={() => toggle(id)} label={label} hint={hint} />
                  ))}
                </>
              )}
              <p className="mt-3 mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-ink-3">{L('Школа и класс', 'School and class')}</p>
              <div className={`flex flex-col gap-1.5 ${teacher ? '' : 'opacity-60'}`} onClickCapture={teacher ? undefined : (e) => { e.preventDefault(); e.stopPropagation(); upgrade(); }}>
                {(
                  [
                    ['teacher', L('Учитель (ФИО)', 'Teacher')],
                    ['school', L('Школа', 'School')],
                    ['klass', L('Класс, например 8 «А»', 'Class, e.g. 8A')],
                    ['date', L('Дата урока', 'Lesson date')],
                  ] as [keyof Branding, string][]
                ).map(([k, ph]) => (
                  <Input key={k} value={(brand[k] as string) ?? ''} onChange={(e) => setBrand({ [k]: e.target.value })} placeholder={ph} readOnly={!teacher} className="text-sm" />
                ))}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <label className="h-8 px-2.5 rounded-lg border border-line hover:bg-muted text-xs text-ink inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> {brand.logo ? L('Другой логотип', 'Change logo') : L('Логотип школы', 'School logo')}
                    <input type="file" accept="image/*" className="hidden" disabled={!teacher} onChange={async (e) => { const f = e.target.files?.[0]; if (f) setBrand({ logo: await readImage(f, 500, false) }); e.target.value = ''; }} />
                  </label>
                  {brand.logo && (
                    <Tooltip><Tooltip.Trigger><Button aria-label={L('Убрать логотип', 'Remove logo')} variant="outline" isIconOnly size="sm" className="w-8" onPress={() => setBrand({ logo: undefined })}>
                      <Trash2 className="w-3.5 h-3.5 text-ink-2" />
                    </Button></Tooltip.Trigger><Tooltip.Content>{L('Убрать логотип', 'Remove logo')}</Tooltip.Content></Tooltip>
                  )}
                  <label className="h-8 px-2.5 rounded-lg border border-line hover:bg-muted text-xs text-ink inline-flex items-center gap-1.5 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5" /> {titlePhoto ? L('Другое фото', 'Change photo') : L('Своё фото на титул', 'Own title photo')}
                    <input type="file" accept="image/*" className="hidden" disabled={!teacher} onChange={async (e) => { const f = e.target.files?.[0]; if (f) setTitlePhoto({ ...(await readImage(f, 1600, true)), credit: '', photo: true }); e.target.value = ''; }} />
                  </label>
                  {titlePhoto && (
                    <Tooltip><Tooltip.Trigger><Button aria-label={L('Убрать фото', 'Remove photo')} variant="outline" isIconOnly size="sm" className="w-8" onPress={() => setTitlePhoto(null)}>
                      <Trash2 className="w-3.5 h-3.5 text-ink-2" />
                    </Button></Tooltip.Trigger><Tooltip.Content>{L('Убрать фото', 'Remove photo')}</Tooltip.Content></Tooltip>
                  )}
                </div>
                <p className="text-[11px] text-ink-3">{L('Учитель, класс и дата — на титульном слайде, логотип — на каждом.', 'Teacher, class and date go on the title, the logo on every slide.')}</p>
              </div>
              {!teacher && (
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onPress={() => upgrade()}>
                  {L('Всё это — в тарифе «Учитель»', 'All of this is in the Teacher plan')}
                </Button>
              )}
            </div>
          </aside>

          {/* preview */}
          <section className="order-first lg:order-none p-4 sm:p-5 flex flex-col gap-4 min-w-0 lg:overflow-y-auto bg-muted/40">
            {built.length === 0 || !curSlide ? (
              <div className="flex-1 min-h-[300px] flex items-center justify-center text-sm text-ink-2">{L('Выбери хотя бы один слайд.', 'Pick at least one slide.')}</div>
            ) : (
              <>
                <PreviewMain slide={curSlide} index={Math.max(0, visible.indexOf(curSrc))} total={slides.length} hidden={hidden.has(curSrc)} style={style} theme={theme} images={all} deck={deck} brand={brandOn} />
                <div className="flex items-center justify-between text-xs text-ink-2">
                  <span>
                    {L('Слайд', 'Slide')} {current + 1} {L('из', 'of')} {ordered.length}
                    {hidden.size > 0 && ` · ${L('скрыто', 'hidden')}: ${hidden.size}`}
                  </span>
                  {curSlide.notes && <span className="truncate max-w-[60%]">📝 {curSlide.notes.split('\n')[0]}</span>}
                </div>
                <div className="shrink-0 flex gap-2 overflow-x-auto pb-2">
                  {ordered.map((src, i) => (
                    <button key={src} onClick={() => setCurrent(i)} className={`relative shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${i === current ? 'border-accent' : 'border-transparent opacity-80 hover:opacity-100'} ${hidden.has(src) ? 'opacity-35' : ''}`}>
                      <SlideView slide={applyEdit(built[src], edits[src])} style={style} theme={theme} images={all} width={128} index={Math.max(0, visible.indexOf(src))} total={slides.length} deck={deck} brand={brandOn} />
                      {hidden.has(src) && <EyeOff className="absolute inset-0 m-auto w-5 h-5 text-ink" />}
                    </button>
                  ))}
                </div>
                {teacher ? (
                  <div className="shrink-0 rounded-xl border border-line bg-surface p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mr-auto">{L('Этот слайд', 'This slide')}</span>
                      <Tooltip><Tooltip.Trigger><Button aria-label={L('Сдвинуть влево', 'Move left')} variant="outline" isIconOnly size="sm" className="w-8" onPress={() => move(-1)} isDisabled={current === 0}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button></Tooltip.Trigger><Tooltip.Content>{L('Сдвинуть влево', 'Move left')}</Tooltip.Content></Tooltip>
                      <Tooltip><Tooltip.Trigger><Button aria-label={L('Сдвинуть вправо', 'Move right')} variant="outline" isIconOnly size="sm" className="w-8" onPress={() => move(1)} isDisabled={current === ordered.length - 1}>
                        <ArrowRight className="w-4 h-4" />
                      </Button></Tooltip.Trigger><Tooltip.Content>{L('Сдвинуть вправо', 'Move right')}</Tooltip.Content></Tooltip>
                      <Button variant="outline" size="sm" className="text-xs" onPress={() => setHidden((h) => { const n = new Set(h); if (n.has(curSrc)) n.delete(curSrc); else n.add(curSrc); return n; })}>
                        {hidden.has(curSrc) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} {hidden.has(curSrc) ? L('Показать', 'Show') : L('Скрыть', 'Hide')}
                      </Button>
                      {edits[curSrc] && (
                        <Button variant="outline" size="sm" className="text-xs" onPress={() => setEdits((e) => { const n = { ...e }; delete n[curSrc]; return n; })}>
                          {L('Вернуть текст', 'Reset text')}
                        </Button>
                      )}
                    </div>
                    {editable(curSlide).title !== undefined && (
                      <Input value={editable(curSlide).title} onChange={(e) => setEdits((x) => ({ ...x, [curSrc]: { ...x[curSrc], title: e.target.value } }))} className="text-sm" aria-label={L('Заголовок', 'Title')} />
                    )}
                    {editable(curSlide).body !== undefined && (
                      <TextArea value={editable(curSlide).body} onChange={(e) => setEdits((x) => ({ ...x, [curSrc]: { ...x[curSrc], body: e.target.value } }))} rows={3} className="text-sm" aria-label={L('Текст', 'Text')} />
                    )}
                  </div>
                ) : (
                  <button onClick={upgrade} className="shrink-0 text-left rounded-xl border border-dashed border-line-strong p-3 text-xs text-ink-2 hover:border-accent cursor-pointer inline-flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> {L('Свой текст на слайдах, скрытие и порядок слайдов — в тарифе «Учитель»', 'Your own slide text, hiding and reordering are in the Teacher plan')}
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-t border-line bg-surface">
          {inApp && paid ? (
            <p className="text-xs flex-1 min-w-[200px] text-amber-700 dark:text-amber-400">{L('Встроенный браузер приложения может не сохранять файлы. Если не скачается — откройте сайт в Safari или Chrome (меню ⋯ → «Открыть в браузере»).', 'In-app browsers may not save files. If nothing downloads, open the site in Safari or Chrome (⋯ menu → Open in browser).')}</p>
          ) : (
            <p className="text-xs text-ink-3 flex-1 min-w-[200px]">{ready ? L('Файл готов — нажмите «Сохранить» и выберите «Сохранить в Файлы» или нужное приложение.', 'The file is ready: tap Save and pick Save to Files or an app.') : L('Файл .pptx открывается в PowerPoint, Google Slides и Keynote — его можно редактировать.', 'The .pptx opens in PowerPoint, Google Slides and Keynote, and stays editable.')}</p>
          )}
          <button
            onClick={download}
            disabled={busy || (paid && waiting) || !slides.length}
            className="h-11 px-5 rounded-lg text-sm font-medium inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-transform active:scale-[0.98]"
            style={{ background: ready ? '#16A34A' : paid ? '#2F5BFF' : '#16171A', color: '#fff' }}
          >
            {busy || (paid && waiting) ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <Check className="w-4 h-4" /> : paid ? <Download className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {done ? L('Скачано', 'Downloaded') : ready ? L('Сохранить файл', 'Save file') : busy ? L('Собираем…', 'Building…') : paid && waiting ? L('Готовим картинки…', 'Preparing pictures…') : paid ? L(`Скачать .pptx · ${slides.length} слайдов`, `Download .pptx · ${slides.length} slides`) : L('Скачать — в Pro', 'Download with Pro')}
          </button>
        </footer>
    </Dialog>
  );
};

/** the big preview fills the available width */
const PreviewMain: React.FC<{ slide: SlideWithNotes; index: number; total: number; hidden: boolean; style: DesignStyle; theme: Theme; images: Images; deck: string; brand?: Branding }> = ({ slide, index, total, hidden, style, theme, images, deck, brand }) => {
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
      <div key={`${slide.k}${index}`} className={`relative rounded-xl overflow-hidden shadow-lg border border-line mx-auto anim-page ${hidden ? 'opacity-40' : ''}`} style={{ width: w }}>
        <SlideView slide={slide} style={style} theme={theme} images={images} width={w} index={index} total={total} deck={deck} brand={brand} />
      </div>
    </div>
  );
};

export default PresentationModal;

/* ---------- the design panel ---------- */

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2 mb-2">{title}</p>
    {children}
  </div>
);

const DesignPanel: React.FC<{ lang: Lang; style: DesignStyle; setStyle: (p: Partial<DesignStyle>) => void; onSurprise: () => void; topic: Topic; teacher: boolean; onUpgrade: () => void }> = ({ lang, style, setStyle, onSurprise, topic, teacher, onUpgrade }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const theme = themeFor(style.theme, topic.subject, style.accent);
  const titleSlide = { k: 'title' as const, label: L('Предмет · класс', 'Subject · grade'), title: topic.title[lang], subtitle: '', grade: topic.grade, topicId: topic.id };
  const textSlide = { k: 'text' as const, label: '', title: L('О чём тема', 'About'), text: topic.intro[lang] };
  const chip = (on: boolean) => `rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${on ? 'border-accent shadow-md scale-[1.03]' : 'border-transparent hover:border-line-strong'}`;
  const pointSlide = { k: 'point' as const, label: L('Предмет · класс', 'Subject · grade'), n: 1, total: 3, of: L('Шаг 1 из 3', 'Step 1 of 3'), title: topic.points[0]?.title[lang] ?? topic.title[lang], text: topic.points[0]?.text[lang] ?? topic.intro[lang], icon: 'Atom' as const };
  const [showAll, setShowAll] = useState(false);
  const [fine, setFine] = useState(false);
  const list = showAll ? TEMPLATES : TEMPLATES.slice(0, 8);
  const select = <V extends string>(label: string, value: V, set: (v: V) => void, opts: [V, string][]) => (
    <label className="flex items-center justify-between gap-2 text-xs text-ink-2">
      <span>{label}</span>
      <Choice aria-label={label} className="max-w-[60%]" value={value} onChange={(v) => set(v as V)} options={opts.map(([v, n]) => ({ value: v, label: n }))} />
    </label>
  );
  return (
    <div className="flex flex-col gap-5">
      <Group title={L(`Шаблоны · ${TEMPLATES.length}`, `Templates · ${TEMPLATES.length}`)}>
        <div className="grid grid-cols-2 gap-2">
          {list.map((tp) => {
            const st = { ...style, ...tp.style, template: tp.id };
            const th = themeFor(st.theme, topic.subject, st.accent);
            return (
              <button key={tp.id} onClick={() => setStyle({ ...tp.style, template: tp.id })} className={`text-left ${chip(style.template === tp.id)}`}>
                <SlideView slide={titleSlide} style={st} theme={th} images={NO_IMAGES} width={124} index={0} total={9} deck="" />
                <SlideView slide={pointSlide} style={st} theme={th} images={NO_IMAGES} width={124} index={2} total={9} deck="" />
                <span className="block text-[11px] py-1 px-1.5 text-ink bg-surface font-medium truncate">{tp.name[lang]}</span>
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" fullWidth className="mt-2 text-xs" onPress={() => setShowAll(!showAll)}>
          {showAll ? L('Свернуть', 'Show fewer') : L(`Показать все ${TEMPLATES.length} шаблонов`, `Show all ${TEMPLATES.length} templates`)}
        </Button>
      </Group>
      <div>
        <Button variant="ghost" size="sm" fullWidth className="justify-between text-xs font-medium uppercase tracking-[0.05em]" onPress={() => setFine(!fine)}>
          {L('Макет каждого слайда', 'Layout of each slide')} <span className="text-ink-3">{fine ? '−' : '+'}</span>
        </Button>
        {fine && (
          <div className="mt-2 flex flex-col gap-1.5">
            {select(L('Титульный', 'Title'), style.title, (v) => setStyle({ title: v }), [
              ['split', L('Две части, фото справа', 'Split, photo right')],
              ['split-left', L('Две части, фото слева', 'Split, photo left')],
              ['full', L('Фото на весь слайд', 'Full-bleed photo')],
              ['center', L('По центру с кольцами', 'Centred with rings')],
              ['band', L('Цветная полоса', 'Colour band')],
              ['frame', L('В рамке', 'Framed')],
              ['minimal', L('Минималистичный', 'Minimal')],
              ['magazine', L('Журнальный', 'Magazine')],
              ['blocks', L('Мозаика', 'Mosaic')],
            ])}
            {select(L('Заголовки', 'Headings'), style.header ?? 'kicker', (v: HeaderId) => setStyle({ header: v }), [
              ['kicker', L('Подпись и заголовок', 'Label and title')],
              ['band', L('Цветная шапка', 'Colour header')],
              ['underline', L('С линией', 'Underlined')],
              ['side', L('Полоса сбоку', 'Side stripe')],
            ])}
            {select(L('Подтемы', 'Sub-topics'), style.point ?? 'panel', (v: PointLayoutId) => setStyle({ point: v }), [
              ['panel', L('Панель слева', 'Panel left')],
              ['panel-right', L('Панель справа', 'Panel right')],
              ['band', L('Цветная шапка', 'Colour header')],
              ['card', L('Карточка', 'Card')],
              ['big-number', L('Большая цифра', 'Big number')],
              ['steps', L('Шаги сверху', 'Steps on top')],
            ])}
            {select(L('Введение', 'Intro'), style.intro ?? 'quote', (v: IntroLayoutId) => setStyle({ intro: v }), [
              ['quote', L('Цитата', 'Quote')],
              ['card', L('Карточка', 'Card')],
              ['centered', L('По центру', 'Centred')],
              ['band', L('Цветная полоса', 'Colour band')],
            ])}
            {select(L('Главное', 'Key points'), style.summary ?? 'cards', (v: SummaryLayoutId) => setStyle({ summary: v }), [
              ['cards', L('Карточки', 'Cards')],
              ['list', L('Нумерованный список', 'Numbered list')],
              ['timeline', L('Лента времени', 'Timeline')],
              ['columns', L('Колонки с иконками', 'Icon columns')],
            ])}
            {select(L('Тест', 'Quiz'), style.quiz ?? 'grid', (v: QuizLayoutId) => setStyle({ quiz: v }), [
              ['grid', L('Сетка 2 × 2', '2 × 2 grid')],
              ['list', L('Список', 'List')],
              ['tiles', L('Плитки в ряд', 'Tiles in a row')],
            ])}
            {select(L('Финал', 'Closing'), style.end ?? 'center', (v: EndLayoutId) => setStyle({ end: v }), [
              ['center', L('По центру', 'Centred')],
              ['split', L('С вопросом', 'With a question mark')],
              ['band', L('Цветная полоса', 'Colour band')],
            ])}
          </div>
        )}
      </div>
      <Button variant="outline" className="text-sm" onPress={() => onSurprise()}>
        <Dices className="w-4 h-4" /> {L('Удиви меня — случайный стиль', 'Surprise me')}
      </Button>
      <Group title={L('Тема', 'Theme')}>
        <div className="grid grid-cols-4 gap-1.5">
          {THEMES.map((id) => {
            const t = themeFor(id, topic.subject, style.accent);
            return (
              <button key={id} onClick={() => setStyle({ theme: id })} className={chip(style.theme === id)} title={t.name[lang]}>
                <SlideView slide={titleSlide} style={{ ...style, theme: id }} theme={t} images={NO_IMAGES} width={60} index={0} total={1} deck="" />
                <span className="block text-[10px] leading-tight py-0.5 text-ink-2 bg-surface truncate px-0.5">{t.name[lang]}</span>
              </button>
            );
          })}
        </div>
      </Group>
      <Group title={L('Цвет акцента', 'Accent colour')}>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="outline" size="sm" className={`text-xs ${style.accent === null ? 'text-accent' : 'text-ink-2'}`} onPress={() => setStyle({ accent: null })}>
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-[-1px]" style={{ background: `#${themeFor(style.theme, topic.subject, null).accent}` }} />
            {L('Как у предмета', 'Subject')}
          </Button>
          {ACCENTS.map((c) => (
            <button key={c} onClick={() => setStyle({ accent: c })} aria-label={c} className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 ${style.accent === c ? 'ring-2 ring-offset-2 ring-ink' : ''}`} style={{ background: `#${c}` }} />
          ))}
          {/* any colour, e.g. the school's own: a teacher feature */}
          <label className={`relative w-7 h-7 rounded-full cursor-pointer border-2 border-dashed border-line-strong flex items-center justify-center text-ink-3 ${style.accent && !ACCENTS.includes(style.accent) ? 'ring-2 ring-offset-2 ring-ink' : ''}`} title={teacher ? L('Свой цвет', 'Custom colour') : L('Свой цвет — в тарифе «Учитель»', 'Custom colour: Teacher plan')} style={style.accent && !ACCENTS.includes(style.accent) ? { background: `#${style.accent}`, borderStyle: 'solid' } : undefined} onClick={teacher ? undefined : (e) => { e.preventDefault(); onUpgrade(); }}>
            {!(style.accent && !ACCENTS.includes(style.accent)) && (teacher ? '+' : <Lock className="w-3 h-3" />)}
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" disabled={!teacher} value={`#${style.accent ?? '2F5BFF'}`} onChange={(e) => setStyle({ accent: e.target.value.slice(1).toUpperCase() })} />
          </label>
        </div>
      </Group>
      <Group title={L('Шрифты', 'Fonts')}>
        <div className="grid grid-cols-1 gap-1">
          {(Object.keys(FONT_PAIRS) as FontPairId[]).map((id) => {
            const f = FONT_PAIRS[id];
            return (
              <button key={id} onClick={() => setStyle({ fonts: id })} className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg border text-left cursor-pointer transition-colors ${style.fonts === id ? 'border-accent bg-accent-soft' : 'border-line hover:bg-muted'}`}>
                <span className="text-xl w-9 text-ink" style={{ fontFamily: CSS_FACE[f.head], fontWeight: f.headBold ? 700 : 400 }}>Аа</span>
                <span className="min-w-0">
                  <span className="block text-sm text-ink">{f.name[lang]}</span>
                  <span className="block text-[11px] text-ink-3 truncate">{f.head === f.body ? f.head : `${f.head} + ${f.body}`}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Group>
      <Group title={L('Фон слайдов', 'Background')}>
        <div className="grid grid-cols-5 gap-1.5">
          {([['none', L('Чистый', 'Plain')], ['dots', L('Точки', 'Dots')], ['grid', L('Клетка', 'Grid')], ['blobs', L('Пятна', 'Blobs')], ['rings', L('Кольца', 'Rings')]] as [DecorId, string][]).map(([id, name]) => (
            <button key={id} onClick={() => setStyle({ decor: id })} className={chip(style.decor === id)} title={name}>
              <SlideView slide={textSlide} style={{ ...style, decor: id }} theme={theme} images={NO_IMAGES} width={46} index={1} total={9} deck="" />
              <span className="block text-[10px] py-0.5 text-ink-2 bg-surface truncate">{name}</span>
            </button>
          ))}
        </div>
      </Group>
      <Group title={L('Детали', 'Details')}>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex p-0.5 rounded-lg bg-muted border border-line">
            {([['full', L('Подвал полностью', 'Full footer')], ['number', L('Только номер', 'Number only')], ['none', L('Без подвала', 'No footer')]] as ['full' | 'number' | 'none', string][]).map(([id, name]) => (
              <Button variant={(style.footer ?? 'full') === id ? 'outline' : 'ghost'} size="sm" className={`flex-1 text-xs ${(style.footer ?? 'full') === id ? 'font-medium' : ''}`} key={id} onPress={() => setStyle({ footer: id })}>
                {name}
              </Button>
            ))}
          </div>
          <div className="flex p-0.5 rounded-lg bg-muted border border-line">
            {([['round', L('Скруглённые карточки', 'Rounded cards')], ['sharp', L('Острые углы', 'Square corners')]] as ['round' | 'sharp', string][]).map(([id, name]) => (
              <Button variant={(style.corners ?? 'round') === id ? 'outline' : 'ghost'} size="sm" className={`flex-1 text-xs ${(style.corners ?? 'round') === id ? 'font-medium' : ''}`} key={id} onPress={() => setStyle({ corners: id })}>
                {name}
              </Button>
            ))}
          </div>
          <CheckBox checked={style.icons !== false} onChange={(v) => setStyle({ icons: v })}>{L('Иконки на слайдах', 'Icons on slides')}</CheckBox>
        </div>
      </Group>
      <Group title={L('Размер текста', 'Text size')}>
        <div className="flex p-0.5 rounded-lg bg-muted border border-line text-sm">
          {([['compact', L('Компактно', 'Compact')], ['normal', L('Обычно', 'Normal')], ['large', L('Крупно', 'Large')]] as [ScaleId, string][]).map(([id, name]) => (
            <Button variant={style.scale === id ? 'outline' : 'ghost'} size="sm" className={`flex-1 ${style.scale === id ? 'font-medium' : ''}`} key={id} onPress={() => setStyle({ scale: id })}>
              {name}
            </Button>
          ))}
        </div>
      </Group>
    </div>
  );
};
