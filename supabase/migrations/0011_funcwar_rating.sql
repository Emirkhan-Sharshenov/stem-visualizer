-- STEM Visualizer: an Elo rating for "Бой функций"
-- Run once after 0010_admin_stats.sql.
--
-- Everyone starts at 1000. Ranked games are 1 v 1: against a live opponent found in the queue, or against a bot
-- of a matching level when nobody is waiting. Results are applied here, never by the client:
--   * a player who reports their own loss is believed at once;
--   * a claimed win counts when the opponent reports the same, or after 10 minutes without a word from them;
--   * the same pair counts at most 3 games a day, and bot games at most 15 a day per player.

create table if not exists public.fw_ratings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  rating int not null default 1000,
  games int not null default 0,
  wins int not null default 0,
  bot_day date,
  bot_games int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.fw_ratings enable row level security; -- no policies: only the functions below touch it

create table if not exists public.fw_matches (
  id text primary key,
  a uuid not null references auth.users (id) on delete cascade,
  b uuid not null references auth.users (id) on delete cascade,
  claims jsonb not null default '{}'::jsonb, -- reporter id -> winner id
  winner uuid,
  applied boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.fw_matches enable row level security;
create index if not exists fw_matches_pending on public.fw_matches (applied, created_at);

-- rating change for a player with rating ra against rb; score 1 = win, 0 = loss
create or replace function public.fw_elo(ra int, rb int, score numeric, k int)
returns int language sql immutable as $$
  select round(k * (score - 1 / (1 + power(10, (rb - ra) / 400.0))))::int;
$$;

create or replace function public.fw_row(uid uuid)
returns public.fw_ratings language plpgsql security definer set search_path = public as $$
declare r fw_ratings;
begin
  insert into fw_ratings (user_id) values (uid) on conflict (user_id) do nothing;
  select * into r from fw_ratings where user_id = uid for update;
  return r;
end $$;

-- settle a match: move both ratings (unless the pair already played 3 counted games today)
create or replace function public.fw_apply(m public.fw_matches, win uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  lose uuid := case when win = m.a then m.b else m.a end;
  rw fw_ratings := fw_row(win);
  rl fw_ratings := fw_row(lose);
  counted int;
  d int;
begin
  select count(*) into counted from fw_matches
  where applied and winner is not null and least(a, b) = least(m.a, m.b) and greatest(a, b) = greatest(m.a, m.b)
    and created_at > now() - interval '1 day';
  if counted < 3 then
    d := fw_elo(rw.rating, rl.rating, 1, 24);
    update fw_ratings set rating = rating + d, games = games + 1, wins = wins + 1, updated_at = now() where user_id = win;
    update fw_ratings set rating = greatest(100, rating - d), games = games + 1, updated_at = now() where user_id = lose;
  end if;
  update fw_matches set applied = true, winner = win where id = m.id;
end $$;

-- wins nobody disputed within 10 minutes
create or replace function public.fw_settle_stale()
returns void language plpgsql security definer set search_path = public as $$
declare m fw_matches;
begin
  for m in select * from fw_matches where not applied and created_at < now() - interval '10 minutes' and jsonb_typeof(claims) = 'object' for update skip locked loop
    if (select count(*) from jsonb_object_keys(m.claims)) = 1 then
      perform fw_apply(m, (select value #>> '{}' from jsonb_each(m.claims) limit 1)::uuid);
    else
      update fw_matches set applied = true where id = m.id; -- the two reports disagree: nobody gains
    end if;
  end loop;
end $$;

-- my rating, games and place
create or replace function public.fw_me()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  r fw_ratings;
begin
  if uid is null then return null; end if;
  perform fw_settle_stale();
  select * into r from fw_ratings where user_id = uid;
  if r.user_id is null then
    return jsonb_build_object('rating', 1000, 'games', 0, 'wins', 0, 'place', null);
  end if;
  return jsonb_build_object('rating', r.rating, 'games', r.games, 'wins', r.wins,
    'place', (select count(*) + 1 from fw_ratings where games > 0 and rating > r.rating));
end $$;

-- the leaderboard: players with at least one counted game
create or replace function public.fw_top(p_limit int default 50)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'nick', coalesce(t.nickname, default_nickname(r.user_id)), 'rating', r.rating, 'games', r.games, 'wins', r.wins, 'me', r.user_id = auth.uid())
    order by r.rating desc, r.updated_at), '[]'::jsonb)
  from (select * from fw_ratings where games > 0 order by rating desc, updated_at limit least(greatest(p_limit, 1), 100)) r
  left join xp_total t on t.user_id = r.user_id;
$$;

-- a ranked game against a bot (950 rookie, 1150 fighter, 1350 pro)
create or replace function public.fw_bot_result(p_bot int, p_won boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  r fw_ratings;
  today date := (now() at time zone 'utc')::date;
  d int := 0;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if p_bot not in (950, 1150, 1350) then raise exception 'bad_bot'; end if;
  r := fw_row(uid);
  if r.bot_day is distinct from today then
    update fw_ratings set bot_day = today, bot_games = 0 where user_id = uid;
    r.bot_games := 0;
  end if;
  if r.bot_games < 15 then
    d := fw_elo(r.rating, p_bot, case when p_won then 1 else 0 end, 16);
    update fw_ratings set rating = greatest(100, rating + d), games = games + 1, wins = wins + (case when p_won then 1 else 0 end),
      bot_games = bot_games + 1, updated_at = now() where user_id = uid;
  end if;
  return jsonb_build_object('rating', (select rating from fw_ratings where user_id = uid), 'delta', d, 'capped', r.bot_games >= 15);
end $$;

-- a ranked game against a person: each side reports; see the rules at the top
create or replace function public.fw_pvp_result(p_match text, p_opponent uuid, p_won boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  m fw_matches;
  claimed uuid := case when p_won then auth.uid() else p_opponent end;
  before int;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if p_opponent is null or p_opponent = uid or length(p_match) > 60 then raise exception 'bad_match'; end if;
  if not exists (select 1 from auth.users where id = p_opponent) then raise exception 'bad_match'; end if;
  before := (fw_row(uid)).rating;
  insert into fw_matches (id, a, b) values (p_match, least(uid, p_opponent), greatest(uid, p_opponent)) on conflict (id) do nothing;
  select * into m from fw_matches where id = p_match for update;
  if uid not in (m.a, m.b) or p_opponent not in (m.a, m.b) then raise exception 'bad_match'; end if;
  if not m.applied then
    m.claims := m.claims || jsonb_build_object(uid::text, claimed::text);
    update fw_matches set claims = m.claims where id = m.id;
    if not p_won then
      perform fw_apply(m, p_opponent); -- an admitted loss
    elsif (select count(distinct value) from jsonb_each(m.claims)) = 1 and (select count(*) from jsonb_object_keys(m.claims)) = 2 then
      perform fw_apply(m, claimed); -- both agree
    end if;
  end if;
  select * into m from fw_matches where id = p_match;
  return jsonb_build_object('rating', (select rating from fw_ratings where user_id = uid), 'delta', (select rating from fw_ratings where user_id = uid) - before, 'pending', not m.applied);
end $$;

revoke all on function public.fw_row(uuid) from public, anon, authenticated;
revoke all on function public.fw_apply(public.fw_matches, uuid) from public, anon, authenticated;
revoke all on function public.fw_settle_stale() from public, anon, authenticated;
grant execute on function public.fw_me() to authenticated;
grant execute on function public.fw_top(int) to anon, authenticated;
grant execute on function public.fw_bot_result(int, boolean) to authenticated;
grant execute on function public.fw_pvp_result(text, uuid, boolean) to authenticated;
