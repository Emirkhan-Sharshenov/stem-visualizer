import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, Download, Lock, Share2, X } from 'lucide-react';
import { TOPICS } from '../../data/curriculum';
import type { Progress } from '../../lib/progress';
import { SITE } from '../../lib/shareCard';

/* Course certificates: a subject and grade with 80% of its topics understood unlocks a certificate with the
   learner's name, drawn on a canvas and saved as a one-page A4 PDF (a JPEG inside a tiny hand-made PDF). */

type Lang = 'ru' | 'en';
const NEED = 0.8;
const NAME_KEY = 'stem-duel-name';
const SUBJ = [
  { id: 'physics', ru: 'Физика', en: 'Physics', color: '#E5484D' },
  { id: 'chemistry', ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  { id: 'biology', ru: 'Биология', en: 'Biology', color: '#F5A524' },
  { id: 'mathematics', ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
];
const W = 2339; // A4 landscape at 200 dpi
const H = 1654;

interface Course {
  subject: (typeof SUBJ)[number];
  grade: number;
  total: number;
  done: number;
  avg: number | null;
}

export function courses(p: Progress): Course[] {
  return SUBJ.flatMap((s) =>
    [...new Set(TOPICS.filter((t) => t.subject === s.id).map((t) => t.grade))]
      .sort((a, b) => a - b)
      .map((grade) => {
        const all = TOPICS.filter((t) => t.subject === s.id && t.grade === grade);
        const quiz = all.map((t) => p.quiz[t.id]).filter(Boolean);
        return {
          subject: s,
          grade,
          total: all.length,
          done: all.filter((t) => p.completed[t.id]).length,
          avg: quiz.length ? Math.round((quiz.reduce((a, q) => a + q.best / q.total, 0) / quiz.length) * 100) : null,
        };
      }),
  );
}

/** a short stable number for the certificate, from the name, course and date */
const certNo = (s: string) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `SV-${(h >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7)}`;
};

async function drawCertificate(c: Course, name: string, lang: Lang): Promise<HTMLCanvasElement> {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  await document.fonts?.ready;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;
  const col = c.subject.color;
  const serif = (w: number, s: number, it = false) => `${it ? 'italic ' : ''}${w} ${s}px Newsreader, Georgia, serif`;
  const sans = (w: number, s: number) => `${w} ${s}px Inter, system-ui, sans-serif`;
  // paper and frame
  g.fillStyle = '#FBF8F1';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = col;
  g.lineWidth = 14;
  g.strokeRect(70, 70, W - 140, H - 140);
  g.lineWidth = 3;
  g.strokeRect(105, 105, W - 210, H - 210);
  // corner ornaments
  for (const [x, y] of [[105, 105], [W - 105, 105], [105, H - 105], [W - 105, H - 105]]) {
    g.beginPath();
    g.arc(x, y, 26, 0, Math.PI * 2);
    g.fillStyle = col;
    g.fill();
  }
  g.textAlign = 'center';
  g.fillStyle = '#2E2A24';
  g.font = sans(700, 40);
  g.fillText('STEM VISUALIZER', W / 2, 300);
  g.font = serif(600, 150);
  g.fillText(L('Сертификат', 'Certificate'), W / 2, 470);
  g.font = serif(400, 54, true);
  g.fillStyle = '#7C7263';
  g.fillText(L('подтверждает, что', 'this certifies that'), W / 2, 590);
  // the name, shrunk to fit
  let size = 150;
  g.font = serif(600, size);
  while (g.measureText(name).width > W - 600 && size > 70) g.font = serif(600, (size -= 6));
  g.fillStyle = '#16171A';
  g.fillText(name, W / 2, 770);
  g.fillStyle = col;
  g.fillRect(W / 2 - 520, 815, 1040, 5);
  g.fillStyle = '#2E2A24';
  g.font = serif(400, 60);
  g.fillText(L('освоил(а) курс', 'has completed the course'), W / 2, 940);
  g.font = serif(600, 84);
  g.fillStyle = col;
  g.fillText(`${c.subject[lang]} · ${L(`${c.grade} класс`, `Grade ${c.grade}`)}`, W / 2, 1060);
  g.fillStyle = '#5A5D66';
  g.font = sans(500, 40);
  g.fillText(`${L(`Понято тем: ${c.done} из ${c.total}`, `Topics understood: ${c.done} of ${c.total}`)}${c.avg !== null ? L(` · средний балл тестов ${c.avg}%`, ` · average test score ${c.avg}%`) : ''}`, W / 2, 1160);

  // date, seal, number
  const date = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const no = certNo(`${name}|${c.subject.id}|${c.grade}|${new Date().toISOString().slice(0, 10)}`);
  g.textAlign = 'left';
  g.font = sans(500, 36);
  g.fillStyle = '#2E2A24';
  g.fillText(date, 300, 1380);
  g.fillStyle = '#7C7263';
  g.font = sans(400, 30);
  g.fillText(L('дата выдачи', 'date of issue'), 300, 1430);
  g.textAlign = 'right';
  g.font = sans(600, 36);
  g.fillStyle = '#2E2A24';
  g.fillText(no, W - 300, 1380);
  g.fillStyle = '#7C7263';
  g.font = sans(400, 30);
  g.fillText(SITE, W - 300, 1430);
  // the seal
  g.textAlign = 'center';
  const sx = W / 2;
  const sy = 1360;
  g.beginPath();
  g.arc(sx, sy, 120, 0, Math.PI * 2);
  g.fillStyle = col;
  g.fill();
  g.beginPath();
  g.arc(sx, sy, 100, 0, Math.PI * 2);
  g.strokeStyle = 'rgba(255,255,255,0.7)';
  g.lineWidth = 4;
  g.stroke();
  g.fillStyle = '#fff';
  g.font = sans(800, 44);
  g.fillText('STEM', sx, sy + 4);
  g.font = sans(600, 22);
  g.fillText(String(new Date().getFullYear()), sx, sy + 44);
  return cv;
}

/** one A4 landscape page with the picture on it; PDF is simple enough to write by hand */
async function toPdf(cv: HTMLCanvasElement): Promise<Blob> {
  const jpg = new Uint8Array(await (await new Promise<Blob>((r) => cv.toBlob((b) => r(b!), 'image/jpeg', 0.92))).arrayBuffer());
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let len = 0;
  const push = (b: Uint8Array | string) => {
    const u = typeof b === 'string' ? enc.encode(b) : b;
    parts.push(u);
    len += u.length;
  };
  const obj = (n: number, body: string, stream?: Uint8Array | string) => {
    offsets[n] = len;
    push(`${n} 0 obj\n${body}\n`);
    if (stream !== undefined) {
      push('stream\n');
      push(stream);
      push('\nendstream\n');
    }
    push('endobj\n');
  };
  const content = 'q 842 0 0 595 0 0 cm /Im0 Do Q';
  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
  obj(4, `<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>`, jpg);
  obj(5, `<< /Length ${content.length} >>`, content);
  const xref = len;
  push(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: 'application/pdf' });
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 60_000);
}

const CertModal: React.FC<{ lang: Lang; course: Course; onClose: () => void }> = ({ lang, course, onClose }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [img, setImg] = useState<string | null>(null);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const shown = name.trim() || L('Твоё имя', 'Your name');
  // redraw a moment after typing stops; the PDF is ready before the tap, so the share sheet can open at once
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const cv = await drawCertificate(course, shown, lang);
      if (!alive) return;
      setImg(cv.toDataURL('image/jpeg', 0.8));
      setPdf(name.trim() ? await toPdf(cv) : null);
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [course, shown, lang, name]);
  const file = `${L('Сертификат', 'Certificate')} ${course.subject[lang]} ${course.grade}.pdf`;
  const save = () => {
    if (!pdf) return;
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* the name stays only in the file */
    }
    download(pdf, file);
  };
  const share = async () => {
    if (!pdf) return;
    const f = new File([pdf], file, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [f] })) {
      try {
        await navigator.share({ files: [f], text: L(`Я освоил(а) курс «${course.subject.ru}, ${course.grade} класс» в STEM Visualizer 🎓 https://${SITE}`, `I completed ${course.subject.en}, grade ${course.grade} in STEM Visualizer 🎓 https://${SITE}`) });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    save();
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-paper rounded-2xl border border-line shadow-2xl p-4 sm:p-6 flex flex-col gap-4 anim-page">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: course.subject.color }} />
          <h2 className="font-serif text-xl text-ink flex-1">{L('Сертификат', 'Certificate')}: {course.subject[lang]}, {L(`${course.grade} класс`, `grade ${course.grade}`)}</h2>
          <button onClick={onClose} aria-label={L('Закрыть', 'Close')} className="w-8 h-8 rounded-md text-ink-3 hover:text-ink hover:bg-muted flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="rounded-xl border border-line overflow-hidden bg-muted aspect-[2339/1654]">{img && <img src={img} alt="" className="w-full h-full object-contain" />}</div>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={L('Имя и фамилия для сертификата', 'Full name for the certificate')} className="h-11 px-3 rounded-lg border border-line bg-surface text-ink outline-none focus:border-accent" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={save} disabled={!pdf} className="h-11 rounded-lg bg-accent hover:bg-accent-hover font-medium inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40" style={{ color: '#fff' }}>
            <Download className="w-4 h-4" /> {L('Скачать PDF', 'Download PDF')}
          </button>
          <button onClick={share} disabled={!pdf} className="h-11 rounded-lg border border-line hover:bg-muted text-sm font-medium text-ink inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40">
            <Share2 className="w-4 h-4" /> {L('Поделиться', 'Share')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/** the list of courses with how far each is from its certificate */
export const Certificates: React.FC<{ lang: Lang; progress: Progress }> = ({ lang, progress }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const list = useMemo(() => courses(progress), [progress]);
  const [open, setOpen] = useState<Course | null>(null);
  const ready = list.filter((c) => c.done / c.total >= NEED);
  // the nearest locked courses, so there is always a goal in sight
  const near = list
    .filter((c) => c.done / c.total < NEED && c.done > 0)
    .sort((a, b) => b.done / b.total - a.done / a.total)
    .slice(0, Math.max(0, 4 - ready.length));
  const shown = [...ready, ...near];
  return (
    <section className="bg-surface border border-line rounded-xl p-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{L('Сертификаты', 'Certificates')}</h2>
      <p className="mt-1 text-sm text-ink-2">{L(`Пойми ${NEED * 100}% тем курса — и получишь именной сертификат в PDF.`, `Understand ${NEED * 100}% of a course's topics to get a certificate with your name.`)}</p>
      {shown.length ? (
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {shown.map((c) => {
            const ok = c.done / c.total >= NEED;
            const left = Math.ceil(c.total * NEED) - c.done;
            return (
              <button key={`${c.subject.id}${c.grade}`} onClick={() => ok && setOpen(c)} className={`text-left rounded-xl border p-3 flex items-center gap-3 ${ok ? 'border-line hover:border-accent cursor-pointer lift' : 'border-line cursor-default'}`}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: c.subject.color + (ok ? '' : '22'), color: ok ? '#fff' : c.subject.color }}>
                  {ok ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">
                    {c.subject[lang]}, {L(`${c.grade} класс`, `grade ${c.grade}`)}
                  </span>
                  <span className="block text-xs text-ink-2">{ok ? L('Получить сертификат →', 'Get the certificate →') : L(`ещё ${left} ${left === 1 ? 'тема' : left < 5 ? 'темы' : 'тем'}`, `${left} more topic${left === 1 ? '' : 's'}`)}</span>
                  <span className="mt-1.5 block h-1 rounded-full bg-muted overflow-hidden">
                    <span className="block h-full" style={{ width: `${Math.min(100, (c.done / c.total / NEED) * 100)}%`, background: c.subject.color }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-3">{L('Отмечай понятые темы в учебнике — здесь появится ближайший сертификат.', 'Mark topics as understood in the textbook and your nearest certificate shows up here.')}</p>
      )}
      {open && <CertModal lang={lang} course={open} onClose={() => setOpen(null)} />}
    </section>
  );
};
