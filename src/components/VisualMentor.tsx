import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, HelpCircle, Compass, Check, Crown } from 'lucide-react';
import { authHeaders, FREE_MENTOR_DAILY, GUEST_MENTOR_DAILY } from '../lib/plan';

interface VisualMentorProps {
  lang: 'ru' | 'en';
  currentTopic: string;
  currentState: any;
  isOpen: boolean;
  onClose: () => void;
}

export const VisualMentor: React.FC<VisualMentorProps> = ({
  lang,
  currentTopic,
  currentState,
  isOpen,
  onClose
}) => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'mentor'; text: string; actionSuggestion?: string; upgrade?: boolean }[]
  >([
    {
      role: 'mentor',
      text:
        lang === 'ru'
          ? 'Привет! Я твой визуальный наставник. Вместо длинных лекций я подсказываю, на какие параметры модели обратить внимание прямо сейчас. Задавай любой вопрос!'
          : 'Hi! I am your visual STEM mentor. Instead of long textbook lectures, I direct your attention to the on-screen visual parameters. Ask me anything!'
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pre-cooked topic-specific quick prompts
  const suggestedQuestions: Record<string, { en: string; ru: string }[]> = {
    orbitals: [
      { en: 'Why is the s-orbital spherical while p has two lobes?', ru: 'Почему s-орбиталь сферическая, а p имеет две доли?' },
      { en: 'What does the nodal plane ψ = 0 mean physically?', ru: 'Что физически означает узловая плоскость ψ = 0?' },
      { en: 'What changes when I increase principal number n?', ru: 'Что происходит при увеличении главного квантового числа n?' }
    ],
    deconstruct_h2o: [
      { en: 'Why does water bend to 104.5° instead of 180°?', ru: 'Почему вода сгибается до 104.5°, а не остаётся прямой?' },
      { en: 'Where are the lone pairs located in 3D space?', ru: 'Где в пространстве находятся неподелённые электронные пары?' }
    ],
    gravity: [
      { en: 'Why does force drop by 4x when distance doubles?', ru: 'Почему сила падает в 4 раза при удвоении расстояния?' },
      { en: 'How does circular orbital speed depend on mass?', ru: 'Как круговая скорость зависит от массы центрального тела?' }
    ],
    revolution: [
      { en: 'How do flat 2D discs dx sum up to a 3D solid volume?', ru: 'Как плоские 2D диски dx складываются в 3D объём?' }
    ],
    divergence: [
      { en: 'What is the visual difference between source and sink?', ru: 'В чем визуальная разница между истоком и стоком?' }
    ],
    mitochondria: [
      { en: 'How does the proton turbine physically spin?', ru: 'Как ток протонов физически вращает нано-турбину АТФ?' }
    ]
  };

  const currentSuggestions = suggestedQuestions[currentTopic] || suggestedQuestions.orbitals;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const auth = await authHeaders();
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({
          question: textToSend,
          topic: currentTopic,
          state: currentState,
          lang
        })
      });
      if (res.status === 402) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'mentor',
            upgrade: true,
            text: !auth.Authorization
              ? lang === 'ru'
                ? `Без аккаунта можно задать ${GUEST_MENTOR_DAILY} вопроса в день. Войди — и получишь ${FREE_MENTOR_DAILY} в день бесплатно, а с Pro — без ограничений.`
                : `Guests get ${GUEST_MENTOR_DAILY} questions a day. Log in for ${FREE_MENTOR_DAILY} a day for free, or get Pro for unlimited questions.`
              : lang === 'ru'
                ? `На сегодня бесплатные вопросы закончились (${FREE_MENTOR_DAILY} в день). Завтра лимит обновится — или подключи Pro, и спрашивай сколько угодно.`
                : `You've used today's free questions (${FREE_MENTOR_DAILY} a day). The limit resets tomorrow, or get Pro for unlimited questions.`
          }
        ]);
        return;
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'mentor', text: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'mentor',
          text:
            lang === 'ru'
              ? 'Посмотри на панель параметров справа: изменение квантового числа или геометрии сразу отражается в модели.'
              : 'Take a look at the parameter sliders on the panel: adjusting values immediately updates the spatial model.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bot className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{lang === 'ru' ? 'Наставник' : 'Mentor'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {lang === 'ru' ? 'Фокус на интерактивных параметрах' : 'Context-aware visual guidance'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested quick chips */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
          {lang === 'ru' ? 'БЫСТРЫЕ ВОПРОСЫ ПО ЭТОЙ МОДЕЛИ:' : 'QUICK QUESTIONS FOR THIS MODEL:'}
        </span>
        <div className="flex flex-col gap-1">
          {currentSuggestions.slice(0, 2).map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s[lang])}
              className="text-left text-xs p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700/60 transition-all cursor-pointer flex items-center justify-between"
            >
              <span className="line-clamp-1">{s[lang]}</span>
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat scroll area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1 text-xs max-w-[90%] ${
              m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div
              className={`p-3.5 rounded-2xl leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-md rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
            {m.upgrade && (
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('open-pro'));
                  onClose();
                }}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                {lang === 'ru' ? 'Подробнее о Pro' : 'About Pro'}
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>{lang === 'ru' ? 'Анализирую параметры модели...' : 'Analyzing 3D model parameters...'}</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            lang === 'ru' ? 'Спроси: «Почему p-орбиталь такой формы?»' : 'Ask: "Why does p-orbital have this shape?"'
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!question.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
