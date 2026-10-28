import { Button, Card, Input } from '@heroui/react';
import React, { useMemo, useState } from 'react';
import { Crown, Dices, FileText, Printer, Save, Trash2 } from 'lucide-react';
import { gradeName, gradesFor, sectionsFor, SUBJECTS } from '../../data/curriculum';
import { usePlan } from '../../lib/plan';
import { buildTest, DEFAULT_SETTINGS, LETTERS, LETTERS_EN, maxPoints, topicPool, type TaskKind, type TestSettings, type Variant } from '../../lib/testgen';
import { Formula } from '../Formula';

/* "Конструктор контрольных": printable tests in up to 8 variants with a custom header, scoring, layout,
   answer sheet and answer key. Printing goes through the browser, so "Save as PDF" works everywhere. */

type Lang = 'ru' | 'en';
const SUBJ_NAME: Record<string, { ru: string; en: string }> = {
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
  mathematics: { ru: 'Математика', en: 'Maths' },
  astronomy: { ru: 'Астрономия', en: 'Astronomy' },
};
const ACCENTS = ['#2F5BFF', '#16171A', '#E5484D', '#30A46C', '#8E4EC6', '#F76B15', '#0EA5A4'];
const TEMPLATES_KEY = 'stem-testgen-templates';
const LIMITS = { free: { variants: 1, count: 10 }, pro: { variants: 3, count: 25 }, teacher: { variants: 8, count: 40 } };

const readTemplates = (): Record<string, TestSettings> => {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
  } catch {
    return {};
  }
};

/* ---------------- small controls ---------------- */

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="p-4">
    <Card.Content className="flex flex-col gap-3">
      <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-ink-2">{title}</h3>
      {children}
    </Card.Content>
  </Card>
);
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
    <span>{label}</span>
    {children}
  </label>
);
const Toggle: React.FC<{ label: string; on: boolean; set: (v: boolean) => void; disabled?: boolean }> = ({ label, on, set, disabled }) => (
  <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-ink-3' : 'text-ink'} cursor-pointer`}>
    <input type="checkbox" checked={on} disabled={disabled} onChange={(e) => set(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
    {label}
  </label>
);
function Seg<T extends string | number>({ value, options, set }: { value: T; options: { v: T; label: string }[]; set: (v: T) => void }) {
  return (
    <div className="inline-flex p-0.5 rounded-md bg-muted border border-line">
      {options.map((o) => (
        <Button key={String(o.v)} size="sm" variant={value === o.v ? 'outline' : 'ghost'} className={`text-xs ${value === o.v ? 'font-medium' : ''}`} onPress={() => set(o.v)}>
          {o.label}
        </Button>
      ))}
    </div>
  );
}
const Num: React.FC<{ value: number; set: (v: number) => void; min: number; max: number; step?: number; label: string }> = ({ value, set, min, max, step = 1, label }) => (
  <input type="number" aria-label={label} value={value} min={min} max={max} step={step} onChange={(e) => set(Math.min(max, Math.max(min, Number(e.target.value) || min)))} className="w-20 h-9 px-2 rounded-lg border border-line bg-surface text-ink text-sm font-mono" />
);

/* ---------------- the printed paper ---------------- */

const Paper: React.FC<{ s: TestSettings; variants: Variant[]; lang: Lang; footer: boolean }> = ({ s, variants, lang, footer }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const letters = lang === 'ru' ? LETTERS : LETTERS_EN;
  const gap = { compact: 8, normal: 14, roomy: 22 }[s.spacing];
  const num = (i: number) => (s.numbering === 'paren' ? `${i})` : s.numbering === 'word' ? L(`Задание ${i}.`, `Task ${i}.`) : `${i}.`);
  const field = (label: string, w = 160) => (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginRight: 18, whiteSpace: 'nowrap' }}>
      {label}
      <span style={{ display: 'inline-block', width: w, borderBottom: '1px solid #444' }} />
    </span>
  );
  const answerText = (t: Variant['tasks'][number]) => {
    const o = t.q.options[t.q.correct];
    const val = o.tex ? o.ru : o[lang];
    return t.kind === 'choice' ? `${letters[t.q.correct]}) ${val}` : val;
  };
  return (
    <div id="testgen-print" style={{ color: '#111', fontSize: s.fontSize, fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif', lineHeight: 1.45 }}>
      {variants.map((v, vi) => {
        const total = maxPoints(v);
        return (
          <section key={v.n} className={vi && s.newPagePerVariant ? 'tg-break' : ''} style={{ background: '#fff', padding: '28px 32px', marginBottom: 24, borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
            <header style={{ borderBottom: `2px solid ${s.accent}`, paddingBottom: 10, marginBottom: 12 }}>
              {s.school && <div style={{ fontSize: '0.85em', color: '#555' }}>{s.school}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <div style={{ fontSize: '1.35em', fontWeight: 700, color: s.accent }}>{s.title || L('Контрольная работа', 'Test')}</div>
                <div style={{ fontSize: '0.9em', color: '#333', whiteSpace: 'nowrap' }}>
                  {SUBJ_NAME[s.subject]?.[lang]} · {gradeName(s.grade, lang)}
                  {s.variants > 1 && ` · ${L('Вариант', 'Variant')} ${v.n}`}
                </div>
              </div>
              {s.subtitle && <div style={{ color: '#444' }}>{s.subtitle}</div>}
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', rowGap: 8 }}>
                {s.fields.name && field(L('Фамилия, имя', 'Name'), 220)}
                {s.fields.cls && field(L('Класс', 'Class'), 60)}
                {s.fields.date && field(L('Дата', 'Date'), 90)}
                {s.fields.variant && s.variants <= 1 && field(L('Вариант', 'Variant'), 40)}
                {s.fields.grade && field(L('Оценка', 'Mark'), 50)}
                {s.fields.extra && field(s.fields.extra, 120)}
              </div>
              {(s.instructions || s.minutes > 0) && (
                <div style={{ marginTop: 8, fontSize: '0.9em', color: '#333' }}>
                  {s.minutes > 0 && <strong>{L(`Время: ${s.minutes} мин. `, `Time: ${s.minutes} min. `)}</strong>}
                  {s.instructions}
                </div>
              )}
            </header>

            <ol style={{ listStyle: 'none', margin: 0, padding: 0, columnCount: s.columns, columnGap: 28 }}>
              {v.tasks.map((t, i) => (
                <li key={i} style={{ breakInside: 'avoid', marginBottom: gap }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <strong style={{ color: s.accent, minWidth: s.numbering === 'word' ? 'auto' : 22 }}>{num(i + 1)}</strong>
                    <div style={{ flex: 1 }}>
                      <span>{t.q.prompt[lang]}</span>
                      {s.showPoints && <span style={{ color: '#777', fontSize: '0.85em' }}> ({t.points} {L('б.', 'pt')})</span>}
                      {s.showTopics && <div style={{ color: '#888', fontSize: '0.75em' }}>{t.topic.title[lang]}</div>}
                      {t.kind === 'choice' && (
                        <div style={{ display: 'grid', gridTemplateColumns: s.columns === 2 ? '1fr' : '1fr 1fr', gap: '2px 18px', marginTop: 4 }}>
                          {t.q.options.map((o, k) => (
                            <div key={k}>
                              {letters[k]}) {o.tex ? <Formula tex={o.ru} /> : o[lang]}
                            </div>
                          ))}
                        </div>
                      )}
                      {t.kind === 'short' && (
                        <div style={{ marginTop: 6 }}>
                          {L('Ответ:', 'Answer:')} <span style={{ display: 'inline-block', width: 160, height: 22, border: '1px solid #555', verticalAlign: 'middle', borderRadius: 3 }} />
                        </div>
                      )}
                      {t.kind === 'long' && (
                        <div style={{ marginTop: 6 }}>
                          {Array.from({ length: s.longLines }, (_, k) => (
                            <div key={k} style={{ height: 24, borderBottom: '1px solid #bbb' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {s.answerSheet && (
              <div style={{ marginTop: 14, breakInside: 'avoid' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{L('Бланк ответов', 'Answer sheet')}</div>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.9em' }}>
                  <tbody>
                    <tr>
                      {v.tasks.map((_, i) => (
                        <td key={i} style={{ border: '1px solid #555', width: 34, textAlign: 'center', padding: 2 }}>{i + 1}</td>
                      ))}
                    </tr>
                    <tr>
                      {v.tasks.map((_, i) => (
                        <td key={i} style={{ border: '1px solid #555', height: 30 }} />
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 14, fontSize: '0.85em', color: '#555', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span>
                {L(`Максимум: ${total} б.`, `Maximum: ${total} pt.`)}
                {s.scale.on &&
                  L(
                    ` «5» — от ${Math.ceil((total * s.scale.five) / 100)}, «4» — от ${Math.ceil((total * s.scale.four) / 100)}, «3» — от ${Math.ceil((total * s.scale.three) / 100)} б.`,
                    ` A from ${Math.ceil((total * s.scale.five) / 100)}, B from ${Math.ceil((total * s.scale.four) / 100)}, C from ${Math.ceil((total * s.scale.three) / 100)} pt.`,
                  )}
              </span>
              {footer && <span>{L('Сделано в STEM Visualizer', 'Made with STEM Visualizer')}</span>}
            </div>
          </section>
        );
      })}

      {s.answerKey && variants.length > 0 && (
        <section className="tg-break" style={{ background: '#fff', padding: '28px 32px', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '1.2em', fontWeight: 700, color: s.accent, marginBottom: 10 }}>{L('Ответы для учителя', 'Answer key')}</div>
          {variants.map((v) => (
            <div key={v.n} style={{ marginBottom: 14, breakInside: 'avoid' }}>
              {variants.length > 1 && <div style={{ fontWeight: 600, marginBottom: 4 }}>{L(`Вариант ${v.n}`, `Variant ${v.n}`)}</div>}
              <ol style={{ margin: 0, paddingLeft: 22 }}>
                {v.tasks.map((t, i) => (
                  <li key={i} style={{ marginBottom: s.solutions ? 6 : 1 }}>
                    <strong>{answerText(t)}</strong>
                    {s.solutions && t.q.explain && <div style={{ color: '#444', fontSize: '0.9em' }}>{t.q.explain[lang]}</div>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

/* ---------------- the builder ---------------- */

export const TestBuilder: React.FC<{ lang: Lang }> = ({ lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const plan = usePlan();
  const tier = plan.plan === 'teacher' ? 'teacher' : plan.pro && !plan.trial ? 'pro' : 'free';
  const lim = LIMITS[tier];
  const [s, setS] = useState<TestSettings>(() => ({ ...DEFAULT_SETTINGS, seed: Math.floor(Math.random() * 1e6) }));
  const [templates, setTemplates] = useState(readTemplates);
  const [tplName, setTplName] = useState('');
  const set = <K extends keyof TestSettings>(k: K, v: TestSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const eff = { ...s, variants: Math.min(s.variants, lim.variants), count: Math.min(s.count, lim.count) };
  const variants = useMemo(() => buildTest(eff), [JSON.stringify(eff)]); // eslint-disable-line react-hooks/exhaustive-deps
  const pool = useMemo(() => topicPool(eff).length, [eff.subject, eff.grade, eff.sections.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const sections = sectionsFor(s.subject, s.grade);
  const grades = gradesFor(s.subject);
  const locked = (n: number, max: number) => n > max;

  const saveTemplate = () => {
    const name = tplName.trim();
    if (!name) return;
    const next = { ...templates, [name]: s };
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
    setTplName('');
  };
  const dropTemplate = (name: string) => {
    const next = { ...templates };
    delete next[name];
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body * { visibility: hidden !important; }
          #testgen-print, #testgen-print * { visibility: visible !important; }
          #testgen-print { position: absolute; left: 0; top: 0; width: 100%; }
          #testgen-print section { box-shadow: none !important; padding: 0 !important; margin: 0 0 12px !important; }
          .tg-break { break-before: page; }
        }
      `}</style>
      <header className="print:hidden">
        <h1 className="font-serif text-[34px] leading-tight text-ink inline-flex items-center gap-2">
          <FileText className="w-8 h-8 text-accent" /> {L('Конструктор контрольных', 'Test builder')}
        </h1>
        <p className="mt-1 text-[15px] text-ink-2 max-w-3xl">
          {L('Выбери темы — и получи готовую к печати контрольную в нескольких вариантах: с выбором ответа, полями для ответа и задачами с решением, шапкой, баллами, бланком и ключами.', 'Pick topics and get a print-ready test in several variants: multiple choice, answer boxes and worked problems, with a header, points, an answer sheet and a key.')}
        </p>
        {tier !== 'teacher' && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#B5651D]">
            <Crown className="w-4 h-4" />
            {tier === 'free'
              ? L('Бесплатно: 1 вариант и до 10 заданий. Pro — до 3 вариантов и 25 заданий, тариф «Учитель» — до 8 вариантов и 40 заданий без подписи сайта.', 'Free: 1 variant, up to 10 tasks. Pro: 3 variants and 25 tasks; Teacher: 8 variants and 40 tasks, no site footer.')
              : L('Pro: до 3 вариантов и 25 заданий. Тариф «Учитель» — до 8 вариантов и 40 заданий без подписи сайта.', 'Pro: up to 3 variants and 25 tasks. Teacher: 8 variants and 40 tasks, no site footer.')}
          </p>
        )}
      </header>

      <div className="grid xl:grid-cols-[400px_1fr] gap-5 items-start">
        <div className="flex flex-col gap-3 print:hidden">
          <Group title={L('Содержание', 'Content')}>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECTS.map((id) => (
                <Button key={id} size="sm" variant={s.subject === id ? 'primary' : 'outline'} className="text-xs" onPress={() => setS((x) => ({ ...x, subject: id, grade: gradesFor(id).includes(x.grade) ? x.grade : gradesFor(id)[0], sections: [] }))}>
                  {SUBJ_NAME[id][lang]}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {grades.map((g) => (
                <Button key={g} size="sm" variant={s.grade === g ? 'outline' : 'ghost'} className="text-xs" onPress={() => setS((x) => ({ ...x, grade: g, sections: [] }))}>
                  {gradeName(g, lang)}
                </Button>
              ))}
            </div>
            <div className="max-h-44 overflow-y-auto flex flex-col gap-1 pr-1">
              <span className="text-xs text-ink-3">{L('Разделы (если ничего не выбрано — весь класс):', 'Sections (none ticked = the whole grade):')}</span>
              {sections.map((sec) => (
                <Toggle key={sec.id} label={sec.title[lang]} on={s.sections.includes(sec.id)} set={(on) => set('sections', on ? [...s.sections, sec.id] : s.sections.filter((x) => x !== sec.id))} />
              ))}
            </div>
            <Row label={L(`Заданий (до ${lim.count})`, `Tasks (up to ${lim.count})`)}>
              <Num label={L('Заданий', 'Tasks')} value={s.count} set={(v) => set('count', v)} min={3} max={40} />
            </Row>
            {locked(s.count, lim.count) && <p className="text-xs text-[#B5651D]">{L(`Будет напечатано ${lim.count}.`, `${lim.count} will be printed.`)}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Toggle label={L('С выбором ответа', 'Multiple choice')} on={s.kinds.choice} set={(v) => set('kinds', { ...s.kinds, choice: v })} />
              <Toggle label={L('Поле для ответа', 'Answer box')} on={s.kinds.short} set={(v) => set('kinds', { ...s.kinds, short: v })} />
              <Toggle label={L('С решением', 'Worked problem')} on={s.kinds.long} set={(v) => set('kinds', { ...s.kinds, long: v })} />
            </div>
            <Row label={L(`Расчётных задач: ${s.calcShare}%`, `Calculations: ${s.calcShare}%`)}>
              <input type="range" min={0} max={100} step={10} value={s.calcShare} onChange={(e) => set('calcShare', Number(e.target.value))} className="w-40 accent-[var(--accent)]" aria-label={L('Доля расчётных задач', 'Share of calculations')} />
            </Row>
            <Row label={L('Порядок', 'Order')}>
              <Seg value={s.order} set={(v) => set('order', v)} options={[{ v: 'easy-first', label: L('от простого', 'easy first') }, { v: 'mixed', label: L('вперемешку', 'mixed') }]} />
            </Row>
            <p className="text-xs text-ink-3">{L(`В выбранных темах: ${pool} тем.`, `${pool} topics in the selection.`)}</p>
          </Group>

          <Group title={L('Варианты', 'Variants')}>
            <Row label={L(`Вариантов (до ${lim.variants})`, `Variants (up to ${lim.variants})`)}>
              <Num label={L('Вариантов', 'Variants')} value={s.variants} set={(v) => set('variants', v)} min={1} max={8} />
            </Row>
            {locked(s.variants, lim.variants) && <p className="text-xs text-[#B5651D]">{L(`Будет напечатано ${lim.variants}.`, `${lim.variants} will be printed.`)}</p>}
            <Seg
              value={s.variantMode}
              set={(v) => set('variantMode', v)}
              options={[
                { v: 'numbers', label: L('те же темы, другие числа', 'same topics, new numbers') },
                { v: 'shuffle', label: L('перемешать', 'shuffle') },
                { v: 'different', label: L('разные', 'different') },
              ]}
            />
            <Toggle label={L('Перемешивать варианты ответа', 'Shuffle answer options')} on={s.shuffleOptions} set={(v) => set('shuffleOptions', v)} />
            <Button variant="outline" size="sm" className="self-start text-xs" onPress={() => set('seed', Math.floor(Math.random() * 1e6))}>
              <Dices className="w-4 h-4" /> {L('Другие задания', 'New tasks')}
            </Button>
          </Group>

          <Group title={L('Шапка', 'Header')}>
            <Input value={s.title} onChange={(e) => set('title', e.target.value)} placeholder={L('Название работы', 'Title')} aria-label={L('Название работы', 'Title')} />
            <Input value={s.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder={L('Подзаголовок, например «Тема: давление»', 'Subtitle, e.g. “Topic: pressure”')} aria-label={L('Подзаголовок', 'Subtitle')} />
            <Input value={s.school} onChange={(e) => set('school', e.target.value)} placeholder={L('Школа, учитель', 'School, teacher')} aria-label={L('Школа', 'School')} />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Toggle label={L('Фамилия, имя', 'Name')} on={s.fields.name} set={(v) => set('fields', { ...s.fields, name: v })} />
              <Toggle label={L('Класс', 'Class')} on={s.fields.cls} set={(v) => set('fields', { ...s.fields, cls: v })} />
              <Toggle label={L('Дата', 'Date')} on={s.fields.date} set={(v) => set('fields', { ...s.fields, date: v })} />
              <Toggle label={L('Вариант', 'Variant')} on={s.fields.variant} set={(v) => set('fields', { ...s.fields, variant: v })} />
              <Toggle label={L('Оценка', 'Mark')} on={s.fields.grade} set={(v) => set('fields', { ...s.fields, grade: v })} />
            </div>
            <Input value={s.fields.extra} onChange={(e) => set('fields', { ...s.fields, extra: e.target.value })} placeholder={L('Своё поле, например «Подпись учителя»', 'Your own field, e.g. “Signature”')} aria-label={L('Своё поле', 'Custom field')} />
            <textarea value={s.instructions} onChange={(e) => set('instructions', e.target.value)} rows={3} aria-label={L('Инструкция', 'Instructions')} className="w-full p-2 rounded-lg border border-line bg-surface text-sm text-ink" />
            <Row label={L('Время, минут (0 — не писать)', 'Minutes (0 = none)')}>
              <Num label={L('Минут', 'Minutes')} value={s.minutes} set={(v) => set('minutes', v)} min={0} max={240} step={5} />
            </Row>
          </Group>

          <Group title={L('Баллы и оценка', 'Points and marks')}>
            {(['choice', 'short', 'long'] as TaskKind[]).map((k) => (
              <Row key={k} label={{ choice: L('С выбором ответа', 'Multiple choice'), short: L('Поле для ответа', 'Answer box'), long: L('С решением', 'Worked problem') }[k]}>
                <Num label={L('Баллы', 'Points')} value={s.points[k]} set={(v) => set('points', { ...s.points, [k]: v })} min={1} max={10} />
              </Row>
            ))}
            <Toggle label={L('Показывать баллы у заданий', 'Show points per task')} on={s.showPoints} set={(v) => set('showPoints', v)} />
            <Toggle label={L('Шкала оценок внизу', 'Marking scale at the end')} on={s.scale.on} set={(v) => set('scale', { ...s.scale, on: v })} />
            {s.scale.on && (
              <div className="flex flex-wrap gap-3 text-sm text-ink">
                {(['five', 'four', 'three'] as const).map((k) => (
                  <label key={k} className="inline-flex items-center gap-1.5">
                    «{{ five: 5, four: 4, three: 3 }[k]}» {L('от', 'from')}
                    <Num label={L('Порог, %', 'Threshold, %')} value={s.scale[k]} set={(v) => set('scale', { ...s.scale, [k]: v })} min={1} max={100} step={5} />%
                  </label>
                ))}
              </div>
            )}
          </Group>

          <Group title={L('Оформление', 'Layout')}>
            <Row label={L('Шрифт', 'Font')}>
              <Seg value={s.fontSize} set={(v) => set('fontSize', v)} options={[{ v: 12, label: 'S' }, { v: 14, label: 'M' }, { v: 16, label: 'L' }]} />
            </Row>
            <Row label={L('Колонки', 'Columns')}>
              <Seg value={s.columns} set={(v) => set('columns', v)} options={[{ v: 1, label: '1' }, { v: 2, label: '2' }]} />
            </Row>
            <Row label={L('Интервал', 'Spacing')}>
              <Seg value={s.spacing} set={(v) => set('spacing', v)} options={[{ v: 'compact', label: L('плотно', 'tight') }, { v: 'normal', label: L('обычно', 'normal') }, { v: 'roomy', label: L('просторно', 'roomy') }]} />
            </Row>
            <Row label={L('Нумерация', 'Numbering')}>
              <Seg value={s.numbering} set={(v) => set('numbering', v)} options={[{ v: 'dot', label: '1.' }, { v: 'paren', label: '1)' }, { v: 'word', label: L('Задание 1', 'Task 1') }]} />
            </Row>
            <Row label={L('Строк для решения', 'Lines for working')}>
              <Num label={L('Строк', 'Lines')} value={s.longLines} set={(v) => set('longLines', v)} min={2} max={15} />
            </Row>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-ink">{L('Цвет', 'Colour')}</span>
              {ACCENTS.map((c) => (
                <button key={c} type="button" aria-label={c} onClick={() => set('accent', c)} className={`w-7 h-7 rounded-full cursor-pointer ${s.accent === c ? 'ring-2 ring-offset-2 ring-ink' : ''}`} style={{ background: c }} />
              ))}
            </div>
            <Toggle label={L('Бланк ответов', 'Answer sheet')} on={s.answerSheet} set={(v) => set('answerSheet', v)} />
            <Toggle label={L('Ключ ответов для учителя', 'Answer key')} on={s.answerKey} set={(v) => set('answerKey', v)} />
            <Toggle label={L('…с решениями задач', '…with worked solutions')} on={s.solutions} set={(v) => set('solutions', v)} disabled={!s.answerKey} />
            <Toggle label={L('Каждый вариант с новой страницы', 'Each variant on a new page')} on={s.newPagePerVariant} set={(v) => set('newPagePerVariant', v)} />
            <Toggle label={L('Подписывать тему задания', 'Show each task’s topic')} on={s.showTopics} set={(v) => set('showTopics', v)} />
          </Group>

          <Group title={L('Шаблоны', 'Templates')}>
            {tier === 'free' ? (
              <p className="text-sm text-ink-3">{L('Сохранение шаблонов — в Pro и тарифе «Учитель».', 'Saving templates comes with Pro and Teacher.')}</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder={L('Название, например «8А, давление»', 'Name, e.g. “8A, pressure”')} aria-label={L('Название шаблона', 'Template name')} className="flex-1" />
                  <Button size="sm" className="text-xs" onPress={saveTemplate} isDisabled={!tplName.trim()}>
                    <Save className="w-4 h-4" /> {L('Сохранить', 'Save')}
                  </Button>
                </div>
                {Object.keys(templates).map((name) => (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    <button type="button" onClick={() => setS({ ...DEFAULT_SETTINGS, ...templates[name] })} className="flex-1 text-left text-accent hover:underline cursor-pointer truncate">{name}</button>
                    <Button isIconOnly size="sm" variant="ghost" aria-label={L('Удалить шаблон', 'Delete template')} onPress={() => dropTemplate(name)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </Group>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button size="lg" className="text-sm font-medium" onPress={() => window.print()} isDisabled={!variants.length}>
              <Printer className="w-4 h-4" /> {L('Печать / сохранить PDF', 'Print / save as PDF')}
            </Button>
            <span className="text-xs text-ink-3">{L('В окне печати выбери «Сохранить как PDF», чтобы получить файл.', 'Choose “Save as PDF” in the print dialog to get a file.')}</span>
          </div>
          <div className="rounded-xl bg-[#E9EAEE] p-3 sm:p-5 overflow-x-auto">
            {variants.length ? <Paper s={eff} variants={variants} lang={lang} footer={tier !== 'teacher'} /> : <p className="text-sm text-[#555]">{L('В выбранных разделах нет тем.', 'No topics in the selection.')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBuilder;
