import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Bot, Crown, RotateCcw, X } from 'lucide-react';
import { topicById } from '../data/curriculum';
import type { Topic } from '../data/curriculum/types';
import { authHeaders, FREE_MENTOR_DAILY, GUEST_MENTOR_DAILY, MENTOR_URL, usePlan } from '../lib/plan';
import { useMentorTopic } from '../lib/mentorTopic';
import { Formula } from './Formula';

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
  mathematics: { ru: 'Математика', en: 'Maths', color: '#2F5BFF' },
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

/* ---------- tiny renderer: paragraphs, lists, **bold** and $formulas$ ---------- */

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$\n]+\$|\*\*[^*]+\*\*|\*[^*\s][^*\n]*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$$') ? (
          <Formula key={i} tex={p.slice(2, -2)} display />
        ) : p.startsWith('$') && p.length > 2 ? (
          <Formula key={i} tex={p.slice(1, -1)} />
        ) : p.startsWith('**') ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

const BULLET = /^\s*([-*•]|\d+[.)])\s+/;

function Rich({ text }: { text: string }) {
  // group consecutive list lines into lists and the rest into paragraphs
  const blocks: { list: boolean; ordered: boolean; lines: string[] }[] = [];
  for (const line of text.trim().split('\n')) {
    if (!line.trim()) {
      blocks.push({ list: false, ordered: false, lines: [] });
      continue;
    }
    const list = BULLET.test(line);
    const last = blocks[blocks.length - 1];
    if (last && last.list === list && last.lines.length) last.lines.push(line);
    else blocks.push({ list, ordered: list && /^\s*\d/.test(line), lines: [line] });
  }
  return (
    <div className="flex flex-col gap-2">
      {blocks
        .filter((b) => b.lines.length)
        .map((b, i) => {
          if (b.list) {
            const Tag = b.ordered ? 'ol' : 'ul';
            return (
              <Tag key={i} className={`pl-5 flex flex-col gap-1 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
                {b.lines.map((l, k) => (
                  <li key={k}>
                    <Inline text={l.replace(BULLET, '')} />
                  </li>
                ))}
              </Tag>
            );
          }
          return (
            <p key={i}>
              {b.lines.map((l, k) => (
                <React.Fragment key={k}>
                  {k > 0 && <br />}
                  <Inline text={l.replace(/^#+\s*/, '')} />
                </React.Fragment>
              ))}
            </p>
          );
        })}
    </div>
  );
}

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
  const chips = useMemo(() => suggestions(topic, lang), [topic, lang]);

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
        body: JSON.stringify({ question: q, lang, topic: topic ? topicContext(topic, lang) : null, history }),
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

      {topic && subj && (
        <div className="px-4 py-2.5 border-b border-line bg-surface text-xs text-ink-2 flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: subj.color }} />
          <span className="truncate">
            {L('Тема', 'Topic')}: <span className="text-ink">{topic.title[lang]}</span> · {subj[lang]}, {topic.grade} {L('кл.', 'gr.')}
          </span>
        </div>
      )}

      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl rounded-tl-sm bg-surface border border-line px-4 py-3 text-[14.5px] leading-relaxed text-ink">
              {topic
                ? L(`Привет! Спрашивай что угодно по теме «${topic.title.ru}» — объясню проще, приведу пример или дам задачу.`, `Hi! Ask me anything about “${topic.title.en}”: I can explain it more simply, give examples or set a problem.`)
                : L('Привет! Я помогу разобраться в физике, химии и биологии. Открой тему в учебнике — и я буду отвечать именно по ней.', 'Hi! I help with physics, chemistry and biology. Open a textbook topic and I will answer about it.')}
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
            <div key={i} className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-[14.5px] leading-relaxed" style={{ color: '#fff' }}>
              {m.text}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[92%] flex flex-col gap-2">
              <div className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-[14.5px] leading-relaxed text-ink ${m.upgrade ? 'bg-[#FFF8E8] border-[#F3D9A4]' : 'bg-surface border-line'}`}>
                <Rich text={m.text} />
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
