import { Button } from '@heroui/react';
import React, { useState } from 'react';
import { Check, Copy, Loader2, Send, Users } from 'lucide-react';
import { Currency, PAY_CONTACT, parentLink, saveCurrency } from '../../lib/plan';

type Lang = 'ru' | 'en';
const CURRENCIES: { id: Currency; label: string }[] = [
  { id: 'RUB', label: '₽' },
  { id: 'KGS', label: 'сом' },
  { id: 'USD', label: '$' },
];

/** ₽ / сом / $ switch; the choice is remembered */
export const CurrencySwitch: React.FC<{ value: Currency; onChange: (c: Currency) => void; lang: Lang }> = ({ value, onChange, lang }) => (
  <div className="inline-flex p-0.5 rounded-md bg-muted border border-line text-xs" role="group" aria-label={lang === 'ru' ? 'Валюта' : 'Currency'}>
    {CURRENCIES.map((c) => (
      <Button
        key={c.id}
        size="sm"
        variant={value === c.id ? 'outline' : 'ghost'}
        className={value === c.id ? 'font-medium' : ''}
        onPress={() => {
          saveCurrency(c.id);
          onChange(c.id);
        }}
      >
        {c.id === 'KGS' && lang === 'en' ? 'KGS' : c.label}
      </Button>
    ))}
  </div>
);

/** the card is charged in dollars, and cards of Russian banks don't work abroad: say so honestly */
export const ChargeNote: React.FC<{ cur: Currency; usd: number; lang: Lang }> = ({ cur, usd, lang }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  return (
    <p className="mt-2 text-xs text-center text-ink-3">
      {cur !== 'USD' && L(`Цена примерная: с карты спишется $${usd} по курсу банка. `, `Approximate: the card is charged $${usd} at your bank's rate. `)}
      {cur === 'RUB'
        ? L('Карты российских банков за рубежом не работают — подойдёт карта банка другой страны', 'Russian bank cards don’t work abroad; use a card from a bank in another country')
        : L('Visa и Mastercard любого банка. Оплата через Freemius, данные карты к нам не попадают', 'Any Visa or Mastercard. Paid via Freemius, so your card details never reach us')}
      {cur === 'RUB' && PAY_CONTACT ? (
        <>
          {L(' или ', ' or ')}
          <a href={PAY_CONTACT} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            {L('напишите нам — подскажем, как оплатить из России', 'message us about paying from Russia')}
          </a>
        </>
      ) : null}
      .
    </p>
  );
};

/** "ask a parent": shares the secret parent link through the phone's share sheet, WhatsApp, Telegram or the clipboard */
export const AskParent: React.FC<{ lang: Lang; className?: string }> = ({ lang, className }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const text = L('Посмотри мои успехи в STEM Visualizer. Можно подключить мне Pro? Всё здесь:', 'Here’s my progress in STEM Visualizer. Could you get me Pro? It’s all here:');

  const ask = async () => {
    setBusy(true);
    setError(false);
    try {
      const url = link ?? (await parentLink());
      setLink(url);
      if (navigator.share && /Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
        await navigator.share({ title: 'STEM Visualizer Pro', text, url }).catch(() => {});
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    if (!link) return;
    await navigator.clipboard?.writeText(`${text} ${link}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={className}>
      <Button variant="outline" fullWidth className="text-sm font-medium" onPress={ask} isDisabled={busy}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
        {L('Попросить родителя оплатить', 'Ask a parent to pay')}
      </Button>
      {error && <p className="mt-2 text-xs text-center text-[#CC2F35]">{L('Не получилось. Войди в аккаунт и попробуй ещё раз.', 'That didn’t work. Log in and try again.')}</p>}
      {link && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs text-ink hover:border-accent" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`} target="_blank" rel="noreferrer">
            <Send className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs text-ink hover:border-accent" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
            <Send className="w-3.5 h-3.5" /> Telegram
          </a>
          <Button size="sm" variant="ghost" className="text-xs" onPress={copy}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? L('Скопировано', 'Copied') : L('Копировать', 'Copy')}
          </Button>
        </div>
      )}
      {link && <p className="mt-1 text-[11px] text-center text-ink-3">{L('По ссылке видно только твои успехи и кнопку оплаты.', 'The link shows only your progress and a pay button.')}</p>}
    </div>
  );
};
