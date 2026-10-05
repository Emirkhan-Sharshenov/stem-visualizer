-- STEM Visualizer: card payments through Freemius
-- Run once in Supabase → SQL Editor, after 0002_subscriptions.sql.

-- which Freemius license a subscription came from (to handle refunds and deletions)
alter table public.subscriptions add column if not exists external_id text;
create index if not exists subscriptions_external_id on public.subscriptions (external_id);

-- the payment webhook knows the buyer's e-mail; this finds the matching account (server only)
create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
security definer set search_path = public, auth
as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke all on function public.user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.user_id_by_email(text) to service_role;
