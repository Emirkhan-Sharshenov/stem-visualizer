-- STEM Visualizer: separate "Teacher" plan and a launch promo code
-- Run once in Supabase → SQL Editor, after 0004_classes.sql.

-- 1. Only the Teacher plan can create classes (Pro is for students)
create or replace function public.is_teacher(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.subscriptions where user_id = uid and plan = 'teacher' and status = 'active' and expires_at > now());
$$;

drop policy if exists "classes: pro teacher creates" on public.classes;
drop policy if exists "classes: teacher plan creates" on public.classes;
create policy "classes: teacher plan creates" on public.classes for insert with check (teacher_id = auth.uid() and public.is_teacher(auth.uid()));

-- 2. Redeeming a Pro code must not downgrade someone who already has the Teacher plan
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

  select greatest(coalesce(max(expires_at), now()), now()) into base from public.subscriptions where user_id = uid and status = 'active';
  new_expiry := coalesce(base, now()) + make_interval(days => c.days);

  insert into public.subscriptions (user_id, plan, status, expires_at, source, updated_at)
  values (uid, c.plan, 'active', new_expiry, 'promo', now())
  on conflict (user_id) do update set
    plan = case when public.subscriptions.plan = 'teacher' and public.subscriptions.expires_at > now() then 'teacher' else excluded.plan end,
    status = 'active', expires_at = excluded.expires_at, source = 'promo', updated_at = now();

  update public.promo_codes set used = used + 1 where code = c.code;
  insert into public.promo_redemptions (code, user_id) values (c.code, uid);
  return new_expiry;
end;
$$;

grant execute on function public.redeem_code(text) to authenticated;

-- 3. Launch codes. Change days / limits / dates as you like.
-- START2026: 14 days of Pro for anyone, until the end of 2026
insert into public.promo_codes (code, days, plan, max_uses, expires_at)
values ('START2026', 14, 'pro', 100000, '2026-12-31 23:59:59+06')
on conflict (code) do nothing;
-- UCHITEL: 30 days of the Teacher plan for teachers you invite
insert into public.promo_codes (code, days, plan, max_uses, expires_at)
values ('UCHITEL', 30, 'teacher', 200, '2026-12-31 23:59:59+06')
on conflict (code) do nothing;
