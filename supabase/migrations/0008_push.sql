-- STEM Visualizer: push reminders ("your streak ends tonight", "the daily challenge is waiting")
-- Run once after 0007_leagues.sql.
--
-- A browser that turns reminders on stores its Web Push subscription here, with its time zone, the hour to be
-- reminded at and the last day it studied. Every hour pg_cron calls the push-remind edge function, which asks
-- push_due() for the learners whose local hour has come and who have not studied today, and sends one reminder
-- a day at most. Guests can subscribe too, so the table is keyed by the push endpoint, not by the user.

create table if not exists public.push_subs (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  user_id uuid references auth.users (id) on delete cascade,
  lang text not null default 'ru' check (lang in ('ru', 'en')),
  tz smallint not null default 360 check (tz between -720 and 840), -- minutes east of UTC
  hour smallint not null default 18 check (hour between 0 and 23),
  streak int not null default 0,
  last_active date,
  last_sent date,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security; -- no policies: only the functions below touch it

-- save or refresh a subscription (also called when the learner studies, to move last_active)
create or replace function public.push_save(p_endpoint text, p_p256dh text, p_auth text, p_lang text, p_tz int, p_hour int, p_streak int, p_active date)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then
    raise exception 'bad endpoint';
  end if;
  insert into push_subs (endpoint, p256dh, auth, user_id, lang, tz, hour, streak, last_active)
  values (p_endpoint, left(p_p256dh, 200), left(p_auth, 100), auth.uid(), case when p_lang = 'en' then 'en' else 'ru' end,
          greatest(-720, least(840, p_tz)), greatest(0, least(23, p_hour)), greatest(0, least(10000, p_streak)), p_active)
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh, auth = excluded.auth, user_id = coalesce(excluded.user_id, push_subs.user_id),
    lang = excluded.lang, tz = excluded.tz, hour = excluded.hour, streak = excluded.streak,
    last_active = greatest(excluded.last_active, push_subs.last_active);
end $$;

create or replace function public.push_remove(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from push_subs where endpoint = p_endpoint;
$$;

-- who should get a reminder right now: their local hour has come, they have not studied or been reminded today
create or replace function public.push_due()
returns setof public.push_subs language sql security definer set search_path = public as $$
  select * from push_subs s
  where extract(hour from (now() at time zone 'utc') + make_interval(mins => s.tz)) = s.hour
    and coalesce(s.last_active, date '1970-01-01') < ((now() at time zone 'utc') + make_interval(mins => s.tz))::date
    and coalesce(s.last_sent, date '1970-01-01') < ((now() at time zone 'utc') + make_interval(mins => s.tz))::date
  limit 5000;
$$;

create or replace function public.push_mark_sent(p_endpoints text[])
returns void language sql security definer set search_path = public as $$
  update push_subs set last_sent = ((now() at time zone 'utc') + make_interval(mins => tz))::date where endpoint = any (p_endpoints);
$$;

revoke all on function public.push_due() from public, anon, authenticated;
revoke all on function public.push_mark_sent(text[]) from public, anon, authenticated;
grant execute on function public.push_save(text, text, text, text, int, int, int, date) to anon, authenticated;
grant execute on function public.push_remove(text) to anon, authenticated;

-- every hour on the hour: the function only sends what is due, so an extra call does no harm
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.unschedule('push-remind') where exists (select 1 from cron.job where jobname = 'push-remind');
select cron.schedule(
  'push-remind',
  '0 * * * *',
  $$ select net.http_post(url := 'https://bhkvpppmixxxorqumxvg.supabase.co/functions/v1/push-remind', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb) $$
);
