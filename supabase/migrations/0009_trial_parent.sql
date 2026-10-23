-- STEM Visualizer: a free week of Pro, and a link that lets a parent see the progress and pay
-- Run once after 0008_push.sql.

-- 1. Trial: seven days of Pro, once per account. An account that has ever had a subscription row
--    (trial, promo or payment) cannot start one; the payment webhook simply overwrites the row.
alter table public.subscriptions add column if not exists reminded_at timestamptz;

create or replace function public.start_trial()
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  until timestamptz := now() + interval '7 days';
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from subscriptions where user_id = uid) then raise exception 'trial_used'; end if;
  -- only confirmed e-mails, so a throwaway sign-up without the code does not count
  if not exists (select 1 from auth.users where id = uid and email_confirmed_at is not null) then raise exception 'not_confirmed'; end if;
  insert into subscriptions (user_id, plan, status, expires_at, source) values (uid, 'pro', 'active', until, 'trial');
  return until;
end;
$$;

grant execute on function public.start_trial() to authenticated;

-- trials ending within two days whose owner has push reminders on and has not been told yet
create or replace function public.trial_ending()
returns table (user_id uuid, endpoint text, p256dh text, auth text, lang text, streak int, expires_at timestamptz)
language sql security definer set search_path = public as $$
  select s.user_id, p.endpoint, p.p256dh, p.auth, p.lang, p.streak, s.expires_at
  from subscriptions s join push_subs p on p.user_id = s.user_id
  where s.source = 'trial' and s.status = 'active' and s.reminded_at is null
    and s.expires_at > now() and s.expires_at < now() + interval '2 days'
    and extract(hour from (now() at time zone 'utc') + make_interval(mins => p.tz)) = p.hour
  limit 5000;
$$;

create or replace function public.trial_mark_reminded(p_users uuid[])
returns void language sql security definer set search_path = public as $$
  update subscriptions set reminded_at = now() where user_id = any (p_users);
$$;

revoke all on function public.trial_ending() from public, anon, authenticated;
revoke all on function public.trial_mark_reminded(uuid[]) from public, anon, authenticated;

-- 2. Parent link: the learner shares a secret link; whoever opens it sees the progress and can pay for Pro
create table if not exists public.parent_links (
  token text primary key default replace(gen_random_uuid()::text, '-', ''),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.parent_links enable row level security; -- no policies: only the functions below touch it

-- the learner's own link (made on first request)
create or replace function public.parent_link()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select token into t from parent_links where user_id = uid;
  if t is null then
    insert into parent_links (user_id) values (uid) returning token into t;
  end if;
  return t;
end;
$$;

-- what the parent page shows: name, grade, the e-mail the payment is matched by, the plan and the progress
create or replace function public.parent_card(p_token text)
returns jsonb
language sql
security definer set search_path = public, auth
as $$
  select jsonb_build_object(
    'name', pr.name,
    'grade', pr.grade,
    'email', u.email,
    'plan', case when s.status = 'active' and s.expires_at > now() then s.plan end,
    'source', s.source,
    'expires_at', s.expires_at,
    -- the saved mistakes carry whole questions; the parent only needs how many there are
    'progress', coalesce(g.data - 'mistakes', '{}'::jsonb),
    'mistakes', (select count(*) from jsonb_object_keys(coalesce(g.data -> 'mistakes', '{}'::jsonb)))
  )
  from parent_links l
  join auth.users u on u.id = l.user_id
  left join profiles pr on pr.id = l.user_id
  left join subscriptions s on s.user_id = l.user_id
  left join progress g on g.user_id = l.user_id
  where l.token = p_token and length(p_token) = 32;
$$;

grant execute on function public.parent_link() to authenticated;
grant execute on function public.parent_card(text) to anon, authenticated;
