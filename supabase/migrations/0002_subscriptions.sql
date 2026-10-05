-- STEM Visualizer: Pro subscriptions and promo codes
-- Run once in Supabase → SQL Editor, after 0001_init.sql.

-- 1. Subscriptions: one row per user. Only the server (payment webhook, admin, redeem_code) writes here.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'pro' check (plan in ('pro', 'teacher')),
  status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
  expires_at timestamptz not null,
  source text not null default 'manual', -- manual | promo | freedompay | …
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions: read own" on public.subscriptions;
create policy "subscriptions: read own" on public.subscriptions for select using (auth.uid() = user_id);
-- no insert/update policies: users can't grant themselves Pro

-- 2. Promo codes: give Pro for N days (used for manual payments, gifts, schools, testers)
create table if not exists public.promo_codes (
  code text primary key,
  days int not null check (days > 0),
  plan text not null default 'pro' check (plan in ('pro', 'teacher')),
  max_uses int not null default 1,
  used int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;
-- no policies: codes are only readable through redeem_code()

create table if not exists public.promo_redemptions (
  code text references public.promo_codes (code) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, user_id)
);

alter table public.promo_redemptions enable row level security;

-- 3. Redeem a code: checks it, extends (or starts) the subscription, returns the new expiry
create or replace function public.redeem_code(p_code text)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  c public.promo_codes;
  uid uuid := auth.uid();
  base timestamptz;
  new_expiry timestamptz;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into c from public.promo_codes where code = upper(trim(p_code)) for update;
  if not found then raise exception 'invalid_code'; end if;
  if c.expires_at is not null and c.expires_at < now() then raise exception 'code_expired'; end if;
  if c.used >= c.max_uses then raise exception 'code_used_up'; end if;
  if exists (select 1 from public.promo_redemptions where code = c.code and user_id = uid) then raise exception 'already_redeemed'; end if;

  select greatest(coalesce(max(expires_at), now()), now()) into base from public.subscriptions where user_id = uid;
  new_expiry := coalesce(base, now()) + make_interval(days => c.days);

  insert into public.subscriptions (user_id, plan, status, expires_at, source, updated_at)
  values (uid, c.plan, 'active', new_expiry, 'promo', now())
  on conflict (user_id) do update set plan = excluded.plan, status = 'active', expires_at = excluded.expires_at, source = 'promo', updated_at = now();

  update public.promo_codes set used = used + 1 where code = c.code;
  insert into public.promo_redemptions (code, user_id) values (c.code, uid);
  return new_expiry;
end;
$$;

grant execute on function public.redeem_code(text) to authenticated;

-- 4. Mentor usage: questions per day, counted on the server so the free limit can't be bypassed
create table if not exists public.mentor_usage (
  user_id uuid references auth.users (id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.mentor_usage enable row level security;

drop policy if exists "mentor_usage: read own" on public.mentor_usage;
create policy "mentor_usage: read own" on public.mentor_usage for select using (auth.uid() = user_id);

-- Example: a code for 30 days of Pro, usable by 100 people
-- insert into public.promo_codes (code, days, max_uses) values ('STEM30', 30, 100);
