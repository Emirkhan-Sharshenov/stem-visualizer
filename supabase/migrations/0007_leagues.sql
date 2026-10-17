-- STEM Visualizer: experience points, weekly leagues and leaderboards
-- Run once in Supabase → SQL Editor, after 0006_edge_functions.sql.
--
-- Points are earned in the app (problems, tests, questions of the day) and sent here through add_xp,
-- which caps every call and every day so the tables can't be pumped from the browser console.
-- Leagues work like Duolingo's: every week each learner joins a group of up to 30 in their tier;
-- the top 7 move up a tier the next week, the bottom 5 (and anyone with 0 points) move down.

-- 1. Tables (no direct access: everything goes through the functions below)
create table if not exists public.xp_total (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  xp bigint not null default 0,
  day date not null default current_date,
  day_xp int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_weekly (
  user_id uuid not null references auth.users (id) on delete cascade,
  week date not null,
  tier smallint not null default 0 check (tier between 0 and 5),
  grp int not null,
  xp int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, week)
);

create index if not exists xp_weekly_group on public.xp_weekly (week, tier, grp, xp desc);
create index if not exists xp_total_xp on public.xp_total (xp desc);

alter table public.xp_total enable row level security;
alter table public.xp_weekly enable row level security;

-- 2. Helpers
-- the league week starts on Monday, Bishkek time
create or replace function public.league_week()
returns date language sql stable as $$
  select date_trunc('week', now() at time zone 'Asia/Bishkek')::date;
$$;

-- "Айгерим К." from the profile name; never the full surname or e-mail
create or replace function public.default_nickname(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select nullif(trim(split_part(trim(name), ' ', 1) || coalesce(' ' || nullif(left(split_part(trim(name), ' ', 2), 1), '') || '.', '')), '')
       from public.profiles where id = uid),
    'Ученик');
$$;

-- this week's league row, creating it if needed: the tier comes from last week's place
create or replace function public.ensure_league(uid uuid)
returns public.xp_weekly language plpgsql security definer set search_path = public as $$
declare
  w date := public.league_week();
  r public.xp_weekly;
  prev public.xp_weekly;
  rnk int;
  size int;
  t smallint := 0;
  g int;
begin
  select * into r from public.xp_weekly where user_id = uid and week = w;
  if found then
    return r;
  end if;
  select * into prev from public.xp_weekly where user_id = uid and week < w order by week desc limit 1;
  if found then
    t := prev.tier;
    if prev.week = w - 7 then
      select count(*) into size from public.xp_weekly where week = prev.week and tier = prev.tier and grp = prev.grp;
      -- place in the group; on a tie whoever got there first ranks higher (same order as the table)
      select count(*) + 1 into rnk from public.xp_weekly
      where week = prev.week and tier = prev.tier and grp = prev.grp
        and (xp > prev.xp or (xp = prev.xp and updated_at < prev.updated_at));
      if prev.xp > 0 and rnk <= 7 and t < 5 then
        t := t + 1;
      elsif t > 0 and (prev.xp = 0 or (size >= 10 and rnk > size - 5)) then
        t := t - 1;
      end if;
    else
      -- skipped at least a week: one tier down
      t := greatest(0, prev.tier - 1);
    end if;
  end if;
  -- one learner at a time picks a seat in this tier, so groups never exceed 30
  perform pg_advisory_xact_lock(hashtext('league:' || w::text || ':' || t::text));
  select x.grp into g from public.xp_weekly x where x.week = w and x.tier = t group by x.grp having count(*) < 30 order by x.grp limit 1;
  if g is null then
    select coalesce(max(x.grp), 0) + 1 into g from public.xp_weekly x where x.week = w and x.tier = t;
  end if;
  insert into public.xp_weekly (user_id, week, tier, grp) values (uid, w, t, g) on conflict do nothing;
  select * into r from public.xp_weekly where user_id = uid and week = w;
  return r;
end;
$$;

create or replace function public.ensure_xp_row(uid uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.xp_total (user_id, nickname, day) values (uid, public.default_nickname(uid), (now() at time zone 'Asia/Bishkek')::date)
  on conflict (user_id) do nothing;
$$;

-- 3. API for the app
-- add points (max 200 per call, 2000 per day)
create or replace function public.add_xp(p_amount int)
returns json language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := (now() at time zone 'Asia/Bishkek')::date;
  a int := least(greatest(coalesce(p_amount, 0), 0), 200);
  tot public.xp_total;
  wk public.xp_weekly;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  perform public.ensure_xp_row(uid);
  select * into tot from public.xp_total where user_id = uid for update;
  if tot.day <> d then
    tot.day_xp := 0;
  end if;
  a := least(a, greatest(0, 2000 - tot.day_xp));
  update public.xp_total set xp = xp + a, day = d, day_xp = tot.day_xp + a, updated_at = now() where user_id = uid returning * into tot;
  wk := public.ensure_league(uid);
  update public.xp_weekly set xp = xp + a, updated_at = now() where user_id = uid and week = wk.week returning * into wk;
  return json_build_object('added', a, 'total', tot.xp, 'week', wk.xp, 'tier', wk.tier, 'capped', a < least(greatest(coalesce(p_amount, 0), 0), 200));
end;
$$;

-- my league group this week, best first
create or replace function public.my_league()
returns json language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  wk public.xp_weekly;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  perform public.ensure_xp_row(uid);
  wk := public.ensure_league(uid);
  return json_build_object(
    'week', wk.week,
    'ends', ((wk.week + 7)::timestamp at time zone 'Asia/Bishkek'),
    'tier', wk.tier,
    'xp', wk.xp,
    'nickname', (select nickname from public.xp_total where user_id = uid),
    'members', (
      select coalesce(json_agg(json_build_object('nick', t.nickname, 'xp', w.xp, 'me', w.user_id = uid) order by w.xp desc, w.updated_at), '[]'::json)
      from public.xp_weekly w join public.xp_total t on t.user_id = w.user_id
      where w.week = wk.week and w.tier = wk.tier and w.grp = wk.grp
    )
  );
end;
$$;

-- all-time top 50 and my place
create or replace function public.top_total()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'top', (select coalesce(json_agg(json_build_object('nick', s.nickname, 'xp', s.xp, 'me', s.user_id = auth.uid())), '[]'::json)
            from (select * from public.xp_total where xp > 0 order by xp desc, updated_at limit 50) s),
    'me', (select json_build_object('xp', t.xp, 'rank', (select count(*) + 1 from public.xp_total o where o.xp > t.xp))
           from public.xp_total t where t.user_id = auth.uid())
  );
$$;

-- this week's points in every class I teach or belong to
create or replace function public.class_board()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object(
    'id', c.id,
    'name', c.name,
    'members', (
      select coalesce(json_agg(json_build_object('nick', coalesce(t.nickname, public.default_nickname(m.user_id)), 'week', coalesce(w.xp, 0), 'total', coalesce(t.xp, 0), 'me', m.user_id = auth.uid())
                               order by coalesce(w.xp, 0) desc, coalesce(t.xp, 0) desc), '[]'::json)
      from public.class_members m
      left join public.xp_total t on t.user_id = m.user_id
      left join public.xp_weekly w on w.user_id = m.user_id and w.week = public.league_week()
      where m.class_id = c.id
    )
  ) order by c.created_at), '[]'::json)
  from public.classes c
  where c.teacher_id = auth.uid() or exists (select 1 from public.class_members m where m.class_id = c.id and m.user_id = auth.uid());
$$;

-- the name shown in leagues: 2–20 letters, digits, spaces, dots, dashes or underscores
create or replace function public.set_nickname(p text)
returns text language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  n text := trim(regexp_replace(coalesce(p, ''), '\s+', ' ', 'g'));
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if char_length(n) < 2 or char_length(n) > 20 or n !~ '^[[:alpha:][:digit:] ._-]+$' then
    raise exception 'bad nickname';
  end if;
  insert into public.xp_total (user_id, nickname) values (uid, n)
  on conflict (user_id) do update set nickname = excluded.nickname, updated_at = now();
  return n;
end;
$$;

-- 4. Permissions: only the API functions are callable, and only when signed in
revoke all on function public.ensure_league(uuid) from public, anon, authenticated;
revoke all on function public.ensure_xp_row(uuid) from public, anon, authenticated;
revoke all on function public.default_nickname(uuid) from public, anon, authenticated;
revoke all on function public.add_xp(int) from public, anon;
revoke all on function public.my_league() from public, anon;
revoke all on function public.top_total() from public, anon;
revoke all on function public.class_board() from public, anon;
revoke all on function public.set_nickname(text) from public, anon;
grant execute on function public.add_xp(int) to authenticated;
grant execute on function public.my_league() to authenticated;
grant execute on function public.top_total() to authenticated;
grant execute on function public.class_board() to authenticated;
grant execute on function public.set_nickname(text) to authenticated;
