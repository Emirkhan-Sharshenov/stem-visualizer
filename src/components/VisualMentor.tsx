import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Bot, Crown, RotateCcw, X } from 'lucide-react';
import { topicById } from '../data/curriculum';
import type { Topic } from '../data/curriculum/types';
import { authHeaders, FREE_MENTOR_DAILY, GUEST_MENTOR_DAILY, MENTOR_URL, usePlan } from '../lib/plan';
import { useMentorTopic } from '../lib/mentorTopic';
import { Formula } from './Formula';
import { inlineTex, prepareAnswer, tidyTex } from '../lib/mathText';
import { usePageContext } from '../lib/pageContext';
import { Eye } from 'lucide-react';

type Lang = 'ru' | 'en';
interface Msg {
  role: 'user' | 'mentor';
  text: string;
  upgrade?: boolean;
}

interface VisualMentorProps {
  lang: Lang;
  /** legacy lab id or a textbook topic id from the "Ask the mentor" button */
  currentTopic: string;
  currentState: any;
  isOpen: boolean;
  onClose: () => void;
}

const SUBJECT: Record<string, { ru: string; en: string; color: string }> = {
  physics: { ru: 'Физика', en: 'Physics', color: '#E5484D' },
  chemistry: { ru: 'Химия', en: 'Chemistry', color: '#30A46C' },
  biology: { ru: 'Биология', en: 'Biology', color: '#F5A524' },
  mathematics: { ru: 'Математика', en: 'Maths', color: '#8E4EC6' },
};

/** compact topic description sent to the server so answers stay on the page's content */
function topicContext(t: Topic, lang: Lang) {
  return {
    title: t.title[lang],
    subject: t.subject,
    grade: t.grade,
    intro: t.intro[lang],
    points: t.points.map((p) => `${p.title[lang]}: ${p.text[lang]}`).join('\n').slice(0, 3500),
    formula: t.formula,
  };
}

function suggestions(t: Topic | undefined, lang: Lang): string[] {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  if (!t)
    return [
      L('Как лучше готовиться к ОРТ по физике?', 'How should I prepare for the physics exam?'),
      L('Объясни закон сохранения энергии на примере', 'Explain conservation of energy with an example'),
      L('Чем ион отличается от атома?', 'How is an ion different from an atom?'),
    ];
  const p = t.points[0]?.title[lang];
  return [
    p ? L(`Объясни «${p}» простыми словами`, `Explain “${p}” in simple words`) : L('Объясни эту тему простыми словами', 'Explain this topic simply'),
    L('Где это встречается в жизни?', 'Where do I meet this in real life?'),
    L('Дай задачу по теме и разбери решение', 'Give me a problem on this and walk through it'),
    L('Проверь меня: задай 3 вопроса', 'Quiz me with 3 questions'),
  ];
}

/* ---------- renderer: headings, paragraphs, lists, **bold**, *italic*, $inline$ and $$display$$ math ---------- */

// formulas first-class: $...$ must not start/end with a space, so "5 $ and 6 $" is not treated as math
const INLINE = /(\*\*[^\n]+?\*\*|\$(?=[^\s$])[^$\n]*?[^\s$]\$|\*(?=[^\s*])[^*\n]*?[^\s*]\*)/g;

function Inline({ text }: { text: string }) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((p, i) => {
        if (p.length > 4 && p.startsWith('**') && p.endsWith('**'))
          return (
            <strong key={i} className="font-semibold">
              <Inline text={p.slice(2, -2)} />
            </strong>
          );
        if (p.length > 2 && p.startsWith('$') && p.endsWith('$')) {
          const tex = inlineTex(p.slice(1, -1));
          // full-size fractions need room above and below the line
          return <Formula key={i} tex={tex} className={tex.startsWith('\\displaystyle') ? 'inline-block mx-px my-1 align-middle' : 'mx-px'} />;
        }
        if (p.length > 2 && p.startsWith('*') && p.endsWith('*'))
          return (
            <em key={i}>
              <Inline text={p.slice(1, -1)} />
            </em>
          );
        // plain text: a lone * between words is multiplication
        return <React.Fragment key={i}>{p.replace(/(\S) \* (?=\S)/g, '$1 · ')}</React.Fragment>;
      })}
    </>
  );
}

type Block =
  | { kind: 'math'; tex: string }
  | { kind: 'h'; text: string }
  | { kind: 'list'; ordered: boolean; start: number; items: string[] }
  | { kind: 'p'; lines: string[] }
  | { kind: 'answer'; text: string };

const BULLET = /^\s*([-*•]|\d+[.)])\s+/;
const HEAD = /^\s*#{1,6}\s+/;
const ANSWER = /^\s*\**\s*(Ответ|Answer)\s*:?\s*\**\s*:?\s*/i;

function parseBlocks(src: string): Block[] {
  const out: Block[] = [];
  // odd pieces are the insides of $$...$$ (may span several lines)
  src
    .trim()
    .split(/\$\$([\s\S]+?)\$\$/g)
    .forEach((piece, idx) => {
      if (idx % 2 === 1) {
        const tex = piece.trim();
        if (tex) out.push({ kind: 'math', tex });
        return;
      }
      let open: Block | null = null;
      for (const raw of piece.split('\n')) {
        const line = raw.trimEnd();
        if (!line.trim()) {
          // a blank line between list items does not end the list
          if (open?.kind !== 'list') open = null;
          continue;
        }
        if (ANSWER.test(line) && !BULLET.test(line)) {
          out.push({ kind: 'answer', text: line.replace(ANSWER, '') });
          open = null;
          continue;
        }
        if (HEAD.test(line)) {
          out.push({ kind: 'h', text: line.replace(HEAD, '') });
          open = null;
          continue;
        }
        if (BULLET.test(line)) {
          const ordered = /^\s*\d/.test(line);
          const item = line.replace(BULLET, '');
          if (open && open.kind === 'list' && open.ordered === ordered) {
            open.items.push(item);
          } else {
            open = { kind: 'list', ordered, start: ordered ? parseInt(line.trim(), 10) || 1 : 1, items: [item] };
            out.push(open);
          }
          continue;
        }
        // an indented line under a list item belongs to that item
        if (open && open.kind === 'list' && /^\s{2,}/.test(raw)) {
          open.items[open.items.length - 1] += `\n${line.trim()}`;
          continue;
        }
        if (open && open.kind === 'list') open = null;
        if (open && open.kind === 'p') {
          open.lines.push(line);
        } else {
          open = { kind: 'p', lines: [line] };
          out.push(open);
        }
      }
    });
  return out;
}

const Rich = React.memo(function Rich({ text, lang }: { text: string; lang: Lang }) {
  const blocks = useMemo(() => parseBlocks(prepareAnswer(text)), [text]);
  return (
    <div className="flex flex-col gap-2.5 min-w-0 break-words">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'math':
            return (
              <div key={i} className="max-w-full overflow-x-auto overflow-y-hidden rounded-xl bg-paper border border-line px-3 py-2.5 text-center text-[1.08em] [scrollbar-width:thin]">
                <Formula tex={tidyTex(b.tex)} display />
              </div>
            );
          case 'answer':
            return (
              <div key={i} className="rounded-xl border border-[#BFE3CF] bg-[#EEF8F2] px-3 py-2 text-ink">
                <span className="font-semibold text-[#1E7A4C]">{lang === 'en' ? 'Answer: ' : 'Ответ: '}</span>
                <Inline text={b.text} />
              </div>
            );
          case 'h':
            return (
              <p key={i} className="font-semibold text-ink">
                <Inline text={b.text} />
              </p>
            );
          case 'list': {
            const Tag = b.ordered ? 'ol' : 'ul';
            return (
              <Tag key={i} {...(b.ordered ? { start: b.start } : {})} className={`pl-5 flex flex-col gap-1.5 ${b.ordered ? 'list-decimal' : 'list-disc'} marker:text-ink-3`}>
                {b.items.map((l, k) => (
                  <li key={k} className="pl-0.5">
                    {l.split('\n').map((part, j) => {
                      // a formula on its own line inside an item is shown as a display formula
                      const only = part.match(/^\$\$?([^$]+)\$?\$$/);
                      return only ? (
                        <div key={j} className="my-1.5 max-w-full overflow-x-auto overflow-y-hidden rounded-xl bg-paper border border-line px-3 py-2 text-center [scrollbar-width:thin]">
                          <Formula tex={tidyTex(only[1])} display />
                        </div>
                      ) : (
                        <React.Fragment key={j}>
                          {j > 0 && <br />}
                          <Inline text={part} />
                        </React.Fragment>
                      );
                    })}
                  </li>
                ))}
              </Tag>
            );
          }
          default:
            return (
              <p key={i}>
                {b.lines.map((l, k) => (
                  <React.Fragment key={k}>
                    {k > 0 && <br />}
                    <Inline text={l} />
                  </React.Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
});

/* ---------- panel ---------- */

export const VisualMentor: React.FC<VisualMentorProps> = ({ lang, currentTopic, isOpen, onClose }) => {
  const openId = useMentorTopic();
  const topic = topicById(openId ?? '') ?? topicById(currentTopic);
  const plan = usePlan();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  // what is on screen right now: the section, a problem, the state of a lab
  const page = usePageContext();
  const chips = useMemo(() => {
    const L2 = (ru: string, en: string) => (lang === 'ru' ? ru : en);
    if (page.kind === 'question')
      return [L2('Объясни эту задачу', 'Explain this problem'), L2('Дай подсказку, но не решай', 'Give me a hint, not the answer'), L2('Какая формула здесь нужна?', 'Which formula do I need here?')];
    if (page.kind === 'lab')
      return [L2('Что здесь сейчас происходит?', 'What is happening here?'), L2('Почему получилось именно так?', 'Why did it turn out like this?'), L2('Какой опыт мне тут попробовать?', 'What experiment should I try here?')];
    return suggestions(topic, lang);
  }, [page.kind, topic, lang]);

  // a new topic starts a new conversation
  useEffect(() => setMessages([]), [topic?.id]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);
  useEffect(() => {
    if (isOpen) setTimeout(() => input.current?.focus(), 50);
  }, [isOpen]);

  const send = async (text?: string) => {
    const q = (text ?? question).trim();
    if (!q || loading) return;
    const history = messages.filter((m) => !m.upgrade).slice(-6);
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuestion('');
    setLoading(true);
    try {
      const auth = await authHeaders();
      const res = await fetch(MENTOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ question: q, lang, topic: topic ? topicContext(topic, lang) : null, history, page: { where: page.where, details: page.details.slice(0, 1800) } }),
      });
      const leftHeader = res.headers.get('X-Mentor-Left');
      if (leftHeader !== null) setLeft(leftHeader === 'Infinity' ? null : Number(leftHeader));
      if (res.status === 402) {
        setLeft(0);
        setMessages((m) => [
          ...m,
          {
            role: 'mentor',
            upgrade: true,
            text: !auth.Authorization
              ? L(
                  `Без аккаунта можно задать ${GUEST_MENTOR_DAILY} вопроса в день. Войди — и получишь ${FREE_MENTOR_DAILY} в день бесплатно, а с Pro — без ограничений.`,
                  `Guests get ${GUEST_MENTOR_DAILY} questions a day. Log in for ${FREE_MENTOR_DAILY} a day for free, or get Pro for unlimited questions.`,
                )
              : L(
                  `На сегодня бесплатные вопросы закончились (${FREE_MENTOR_DAILY} в день). Завтра лимит обновится — или подключи Pro и спрашивай сколько угодно.`,
                  `You've used today's free questions (${FREE_MENTOR_DAILY} a day). The limit resets tomorrow, or get Pro for unlimited questions.`,
                ),
          },
        ]);
        return;
      }
      const data = await res.json();
      setMessages((m) => [...m, { role: 'mentor', text: data.answer || L('Не получилось ответить. Попробуй ещё раз.', 'Could not answer. Try again.') }]);
    } catch {
      setMessages((m) => [...m, { role: 'mentor', text: L('Нет связи с сервером. Проверь интернет и попробуй ещё раз.', 'Cannot reach the server. Check your connection and try again.') }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const subj = topic ? SUBJECT[topic.subject] : undefined;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-paper border-l border-line shadow-2xl flex flex-col animate-slideLeft">
      <div className="px-4 h-14 border-b border-line flex items-center gap-3 shrink-0">
        <span className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
          <Bot className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium text-ink leading-tight">{L('Наставник', 'Mentor')}</div>
          <div className="text-[11px] text-ink-3 leading-tight">
            {plan.pro ? L('Pro · без ограничений', 'Pro · unlimited') : left !== null ? L(`осталось сегодня: ${left}`, `left today: ${left}`) : L('объясняет темы учебника', 'explains textbook topics')}
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} title={L('Новый разговор', 'New conversation')} className="w-8 h-8 rounded-md flex items-center justify-center text-ink-2 hover:text-ink hover:bg-hover cursor-pointer">
            <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
        <button onClick={onClose} aria-label={L('Закрыть', 'Close')} className="w-8 h-8 rounded-md flex items-center justify-center text-ink-2 hover:text-ink hover:bg-hover cursor-pointer">
          <X className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
      </div>

      {topic && subj ? (
        <div className="px-4 py-2.5 border-b border-line bg-surface text-xs text-ink-2 flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: subj.color }} />
          <span className="truncate">
            {L('Тема', 'Topic')}: <span className="text-ink">{topic.title[lang]}</span> · {subj[lang]}, {topic.grade} {L('кл.', 'gr.')}
          </span>
        </div>
      ) : (
        <div className="px-4 py-2.5 border-b border-line bg-surface text-xs text-ink-2 flex items-center gap-2 shrink-0" title={page.details}>
          <Eye className="w-3.5 h-3.5 shrink-0 text-accent" strokeWidth={2} />
          <span className="truncate">
            {L('Вижу', 'I can see')}: <span className="text-ink">{page.where}</span>
            {page.kind === 'question' && <span> · {L('задача на экране', 'a problem on screen')}</span>}
          </span>
        </div>
      )}

      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl rounded-tl-sm bg-surface border border-line px-4 py-3 text-[14.5px] leading-relaxed text-ink">
              {page.kind === 'question'
                ? L('Вижу задачу на твоём экране. Могу объяснить её, подсказать ход решения или формулу — спрашивай.', 'I can see the problem on your screen. I can explain it, hint at the method or the formula: just ask.')
                : page.kind === 'lab'
                  ? L(`Вижу, где ты: ${page.where}, — и что у тебя сейчас на экране. Спроси, что происходит и почему.`, `I can see where you are (${page.where}) and what is on your screen. Ask what is happening and why.`)
                  : topic
                    ? L(`Привет! Спрашивай что угодно по теме «${topic.title.ru}» — объясню проще, приведу пример или дам задачу.`, `Hi! Ask me anything about “${topic.title.en}”: I can explain it more simply, give examples or set a problem.`)
                    : L('Привет! Я помогу разобраться в физике, химии и биологии. Я вижу, в каком ты разделе, — спрашивай про то, что у тебя на экране.', 'Hi! I help with physics, chemistry and biology. I can see which section you are in, so ask about what is on your screen.')}
            </div>
            <div className="flex flex-col gap-1.5">
              {chips.map((c) => (
                <button key={c} onClick={() => send(c)} className="self-start text-left text-sm px-3 py-2 rounded-xl border border-line bg-surface hover:border-accent hover:bg-accent-soft text-ink-2 hover:text-ink transition-colors cursor-pointer">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="self-end max-w-[85%] min-w-0 rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: '#fff' }}>
              {m.text}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[94%] min-w-0 flex flex-col gap-2">
              <div className={`min-w-0 rounded-2xl rounded-tl-sm border px-4 py-3 text-[14.5px] leading-[1.65] text-ink ${m.upgrade ? 'bg-[#FFF8E8] border-[#F3D9A4]' : 'bg-surface border-line'}`}>
                <Rich text={m.text} lang={lang} />
              </div>
              {m.upgrade && (
                <button
                  onClick={() => {
                    window.dispatchEvent(new Event('open-pro'));
                    onClose();
                  }}
                  className="self-start inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#FFE7B3] hover:bg-[#FFDB8F] text-[#8A4B0F] text-sm font-medium cursor-pointer"
                >
                  <Crown className="w-4 h-4" strokeWidth={1.75} />
                  {L('Подробнее о Pro', 'About Pro')}
                </button>
              )}
            </div>
          ),
        )}
        {loading && (
          <div className="self-start rounded-2xl rounded-tl-sm bg-surface border border-line px-4 py-3 flex gap-1">
            {[0, 1, 2].map((k) => (
              <span key={k} className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce" style={{ animationDelay: `${k * 120}ms` }} />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-line bg-surface shrink-0">
        <div className="flex items-end gap-2 rounded-xl border border-line bg-paper focus-within:border-accent px-3 py-2">
          <textarea
            ref={input}
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 600))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={topic ? L('Спроси про эту тему…', 'Ask about this topic…') : L('Задай вопрос…', 'Ask a question…')}
            className="flex-1 resize-none bg-transparent text-[14.5px] text-ink placeholder:text-ink-3 outline-none max-h-32 py-1"
          />
          <button
            onClick={() => send()}
            disabled={!question.trim() || loading}
            aria-label={L('Отправить', 'Send')}
            className="w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
            style={{ color: '#fff' }}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-3 text-center">{L('ИИ может ошибаться — сверяйся с учебником.', 'AI can make mistakes; check with the textbook.')}</p>
      </div>
    </div>
  );
};
