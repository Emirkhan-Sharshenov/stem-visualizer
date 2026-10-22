// Push reminders as a Supabase Edge Function (Deno), called every hour by pg_cron (see 0008_push.sql).
// Sends one Web Push a day to each subscribed browser whose local reminder hour has come and whose owner
// has not studied today: "your streak ends tonight" or "the daily challenge is waiting".
// Subscriptions the push service no longer knows (404/410) are deleted.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
webpush.setVapidDetails('mailto:sgoo0931@gmail.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

interface Sub {
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: 'ru' | 'en';
  streak: number;
}

const days = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'дня' : 'дней');

function message(s: Sub) {
  const ru = s.lang !== 'en';
  const url = '/#/app?lab=games&daily=1';
  if (s.streak > 1)
    return {
      title: ru ? `🔥 Серия ${s.streak} ${days(s.streak)} сгорит сегодня` : `🔥 Your ${s.streak}-day streak ends tonight`,
      body: ru ? 'Реши вызов дня — 10 задач, меньше минуты.' : 'Do the daily challenge: ten problems, under a minute.',
      url,
    };
  return {
    title: ru ? '🧪 Вызов дня ждёт' : '🧪 The daily challenge is waiting',
    body: ru ? '10 задач, одни на весь мир. Сможешь решить все?' : 'Ten problems, the same for everyone. Can you get them all?',
    url,
  };
}

Deno.serve(async () => {
  const { data, error } = await admin.rpc('push_due');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const subs = (data ?? []) as Sub[];
  const sent: string[] = [];
  const gone: string[] = [];
  // a few at a time, so one slow push service does not hold up the rest
  for (let i = 0; i < subs.length; i += 20) {
    await Promise.all(
      subs.slice(i, i + 20).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(message(s)), { TTL: 6 * 3600, urgency: 'normal' });
          sent.push(s.endpoint);
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) gone.push(s.endpoint);
          else console.warn('[push] failed', code, (e as Error).message);
        }
      }),
    );
  }
  if (sent.length) await admin.rpc('push_mark_sent', { p_endpoints: sent });
  for (const ep of gone) await admin.rpc('push_remove', { p_endpoint: ep });
  return new Response(JSON.stringify({ due: subs.length, sent: sent.length, removed: gone.length }), { headers: { 'Content-Type': 'application/json' } });
});
