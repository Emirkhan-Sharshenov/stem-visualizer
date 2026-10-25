import { Dialog } from './ui/Dialog';
import { Button, Input } from '@heroui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { SECTIONS, Topic, TOPICS, topicById } from '../data/curriculum';
import { gradeName } from '../data/curriculum/index';

interface SearchModalProps {
  lang: 'ru' | 'en';
  onClose: () => void;
  onOpenTopic: (id: string) => void;
}

const COLOR: Record<string, string> = { physics: '#E5484D', chemistry: '#30A46C', biology: '#F5A524', mathematics: '#8E4EC6', astronomy: '#4C6FFF' };
const NAME: Record<string, { ru: string; en: string }> = {
  physics: { ru: 'Физика', en: 'Physics' },
  chemistry: { ru: 'Химия', en: 'Chemistry' },
  biology: { ru: 'Биология', en: 'Biology' },
  mathematics: { ru: 'Математика', en: 'Maths' },
  astronomy: { ru: 'Астрономия', en: 'Astronomy' },
};

const SUGGEST = ['p7-liquid-pressure', 'p8-conduction', 'p11-lorentz', 'c8-combustion', 'c11-redox', 'c8-lattices', 'b9-mitosis', 'b8-bones', 'b8-blood-groups', 'b11-adaptations'];

// strip common "I don't understand" phrasing so natural queries still match
const STOP = ['не понимаю', 'непонятно', 'что такое', 'как работает', 'почему', 'объясни', 'i don’t get', "i don't get", 'what is', 'how does', 'explain'];

function score(t: Topic, words: string[], lang: 'ru' | 'en') {
  const title = t.title[lang].toLowerCase();
  const intro = t.intro[lang].toLowerCase();
  const points = t.points.map((p) => `${p.title[lang]} ${p.text[lang]}`.toLowerCase()).join(' ');
  let s = 0;
  for (const w of words) {
    const stem = w.length > 5 ? w.slice(0, w.length - 2) : w;
    if (title.includes(stem)) s += 10;
    else if (intro.includes(stem)) s += 4;
    else if (points.includes(stem)) s += 2;
    else return 0;
  }
  return s;
}

/** Search across every topic of the textbook, including its sub-points */
export const SearchModal: React.FC<SearchModalProps> = ({ lang, onClose, onOpenTopic }) => {
  const [query, setQuery] = useState('');
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    let q = query.trim().toLowerCase();
    STOP.forEach((s) => (q = q.replace(s, ' ')));
    const words = q.split(/\s+/).filter((w) => w.length >= 2);
    if (!words.length) return null;
    return TOPICS.map((t) => ({ t, s: score(t, words, lang) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 30)
      .map((x) => x.t);
  }, [query, lang]);

  const list = results ?? (SUGGEST.map(topicById).filter(Boolean) as Topic[]);
  const sectionTitle = (t: Topic) => SECTIONS.find((s) => s.id === t.sectionId)?.title[lang];
  const open = (id: string) => {
    onOpenTopic(id);
    onClose();
  };

  return (
    <Dialog onClose={onClose} label={L('Поиск', 'Search')} placement="top" className="max-w-2xl p-0 flex flex-col overflow-hidden">
        <div className="relative border-b border-line">
          <Search className="w-5 h-5 text-ink-3 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && list[0] && open(list[0].id)}
            placeholder={L('Что непонятно? Например: «не понимаю электролиз»', 'What’s confusing? E.g. “I don’t get electrolysis”')}
            className="w-full pl-12 pr-12"
          />
          <Button variant="ghost" isIconOnly size="sm" className="absolute right-3 top-1/2 w-8" onPress={() => onClose()} aria-label={L('Закрыть', 'Close')}>
            <X className="w-4 h-4" strokeWidth={1.75} />
          </Button>
        </div>
        <div className="px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-[0.05em] text-ink-3">
          {results ? L(`Найдено: ${results.length}`, `Found: ${results.length}`) : L('Популярные темы', 'Popular topics')}
        </div>
        <ul className="max-h-[56vh] overflow-y-auto p-2 pt-1">
          {list.map((t) => (
            <li key={t.id}>
              <button onClick={() => open(t.id)} className="group w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted flex items-center gap-3 cursor-pointer">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLOR[t.subject] }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] text-ink truncate">{t.title[lang]}</span>
                  <span className="block text-xs text-ink-3 truncate">
                    {NAME[t.subject]?.[lang]} · {gradeName(t.grade, lang)} · {sectionTitle(t)}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-ink-3 group-hover:text-accent shrink-0" strokeWidth={1.75} />
              </button>
            </li>
          ))}
          {results && results.length === 0 && <li className="px-3 py-6 text-sm text-ink-2">{L('Ничего не нашлось. Попробуй другое слово.', 'Nothing found. Try another word.')}</li>}
        </ul>
    </Dialog>
  );
};
