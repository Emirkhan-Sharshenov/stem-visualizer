-- STEM Visualizer: a private statistics page for the site's owners
-- Run once after 0009_trial_parent.sql.

-- who may see it (rows are added by hand in the SQL editor)
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security; -- no policies: only the functions below read it

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

-- everything the page shows, in one call; days are UTC dates, like the study days the site records
create or replace function public.admin_stats(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer set search_path = public, auth
as $$
declare
  since date := (now() at time zone 'utc')::date - greatest(7, least(p_days, 180)) + 1;
  today date := (now() at time zone 'utc')::date;
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;
  return jsonb_build_object(
    'totals', (
      select jsonb_build_object(
        'users', count(*),
        'confirmed', count(*) filter (where email_confirmed_at is not null),
        'new_today', count(*) filter (where (created_at at time zone 'utc')::date = today),
        'new_7d', count(*) filter (where created_at > now() - interval '7 days'),
        'teachers', (select count(*) from profiles where role = 'teacher'),
        'push', (select count(*) from push_subs)
      ) from auth.users
    ),
    'daily', (
      with days as (select generate_series(since, today, interval '1 day')::date as d),
           study as (
             select distinct p.user_id, s.d::date as d
             from progress p, jsonb_array_elements_text(coalesce(p.data -> 'days', '[]'::jsonb)) as s(d)
             where s.d ~ '^\d{4}-\d{2}-\d{2}$' and s.d::date >= since
           )
      select jsonb_agg(jsonb_build_object(
        'day', to_char(days.d, 'YYYY-MM-DD'),
        'signups', (select count(*) from auth.users u where (u.created_at at time zone 'utc')::date = days.d),
        'active', (select count(*) from study where study.d = days.d)
      ) order by days.d) from days
    ),
    'returning', (
      select jsonb_build_object(
        'learners', count(*),
        'days2', count(*) filter (where n >= 2),
        'days3', count(*) filter (where n >= 3),
        'days7', count(*) filter (where n >= 7),
        'active_today', count(*) filter (where data -> 'days' ? to_char(today, 'YYYY-MM-DD')),
        'active_7d', count(*) filter (where updated_at > now() - interval '7 days')
      ) from (select data, updated_at, jsonb_array_length(coalesce(data -> 'days', '[]'::jsonb)) as n from progress) p
    ),
    'plans', (
      select jsonb_build_object(
        'trial_active', count(*) filter (where source = 'trial' and status = 'active' and expires_at > now()),
        'trial_ended', count(*) filter (where source = 'trial' and expires_at <= now()),
        'paid_active', count(*) filter (where source = 'freemius' and status = 'active' and expires_at > now()),
        'paid_ever', count(*) filter (where source = 'freemius'),
        'promo_active', count(*) filter (where source = 'promo' and status = 'active' and expires_at > now()),
        'teacher_active', count(*) filter (where plan = 'teacher' and status = 'active' and expires_at > now())
      ) from subscriptions
    ),
    'top_topics', (
      select coalesce(jsonb_agg(jsonb_build_object('id', id, 'n', n) order by n desc), '[]'::jsonb) from (
        select k as id, count(*) as n
        from progress p, jsonb_each(coalesce(p.data -> 'completed', '{}'::jsonb)) as c(k, v)
        where v = 'true'::jsonb
        group by k order by count(*) desc limit 10
      ) t
    )
  );
end;
$$;
grant execute on function public.admin_stats(int) to authenticated;
