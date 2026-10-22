import { Choice } from './ui/Choice';
import { Button } from '@heroui/react';
import React from 'react';
import { Bell, BellOff, Download, Share, SquarePlus } from 'lucide-react';
import { usePwa } from '../lib/push';

/* "Remind me about my streak" and "install the app": a small card for the progress page and the games. */
export const Reminders: React.FC<{ lang: 'ru' | 'en'; compact?: boolean }> = ({ lang, compact }) => {
  const L = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const { state, enable, disable, hour, setHour, canInstall, install } = usePwa(lang);
  if (state === 'unsupported' && !canInstall) return null;

  return (
    <div className={`rounded-xl border border-line bg-surface ${compact ? 'p-4' : 'p-5'} flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-[#F76B15]/12 text-[#F76B15] flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-ink">{L('Напоминать о серии', 'Streak reminders')}</h3>
          <p className="text-sm text-ink-2">{L('Одно уведомление вечером, только если сегодня ты ещё не занимался.', 'One notification in the evening, only if you have not studied yet today.')}</p>
        </div>
      </div>

      {state === 'ios-install' && (
        <div className="rounded-lg bg-muted p-3 text-sm text-ink-2 flex flex-col gap-1.5">
          <p className="text-ink font-medium">{L('На iPhone напоминания работают из приложения на экране «Домой»:', 'On iPhone, reminders work from the home-screen app:')}</p>
          <p className="inline-flex items-center gap-1.5">
            1. {L('Нажми', 'Tap')} <Share className="w-4 h-4 text-accent" /> {L('«Поделиться» внизу Safari', 'Share at the bottom of Safari')}
          </p>
          <p className="inline-flex items-center gap-1.5">
            2. {L('Выбери', 'Choose')} <SquarePlus className="w-4 h-4 text-accent" /> {L('«На экран «Домой»»', 'Add to Home Screen')}
          </p>
          <p>3. {L('Открой STEM Visualizer с экрана «Домой» и включи напоминания здесь.', 'Open STEM Visualizer from the home screen and turn reminders on here.')}</p>
        </div>
      )}
      {state === 'denied' && <p className="text-sm text-[#CC2F35]">{L('Уведомления запрещены в настройках браузера для этого сайта. Разреши их там — и вернись сюда.', 'Notifications are blocked for this site in your browser settings. Allow them there and come back.')}</p>}

      {(state === 'off' || state === 'on' || state === 'busy') && (
        <div className="flex flex-wrap items-center gap-2">
          {state === 'on' ? (
            <Button variant="outline" className="text-sm" onPress={() => disable()}>
              <BellOff className="w-4 h-4" /> {L('Выключить', 'Turn off')}
            </Button>
          ) : (
            <Button className="text-sm font-medium" onPress={() => enable()} isDisabled={state === 'busy'}>
              <Bell className="w-4 h-4" /> {L('Включить напоминания', 'Turn reminders on')}
            </Button>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-ink-2">
            {L('в', 'at')}
            <Choice aria-label={L('Время напоминания', 'Reminder time')} className="w-28" value={String(hour)} onChange={(v) => setHour(Number(v))} options={[15, 16, 17, 18, 19, 20, 21].map((h) => ({ value: String(h), label: `${h}:00` }))} />
          </label>
          {state === 'on' && <span className="text-sm text-[#1E7A4C]">✓ {L('включены', 'on')}</span>}
        </div>
      )}

      {canInstall && (
        <Button variant="outline" className="self-start text-sm" onPress={() => install()}>
          <Download className="w-4 h-4" /> {L('Установить как приложение', 'Install as an app')}
        </Button>
      )}
    </div>
  );
};

export default Reminders;
