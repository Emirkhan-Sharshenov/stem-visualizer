-- "Бой функций": 14 bots from 800 to 2200 (src/components/games/funcwar/bots.ts).
-- A ranked game is played against the bot nearest to the player's rating; the server checks that,
-- so a win can't be claimed against a much stronger bot than the one the queue hands out.
create or replace function public.fw_bot_result(p_bot int, p_won boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  r fw_ratings;
  today date := (now() at time zone 'utc')::date;
  d int := 0;
  bots int[] := array[800, 950, 1050, 1150, 1200, 1250, 1300, 1350, 1450, 1550, 1650, 1800, 1950, 2200];
  gap int;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if not (p_bot = any(bots)) then raise exception 'bad_bot'; end if;
  r := fw_row(uid);
  -- the nearest bot, with some slack for a rating that moved during the game
  select min(abs(b - r.rating)) into gap from unnest(bots) b;
  if abs(p_bot - r.rating) > gap + 100 then raise exception 'bad_bot'; end if;
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

grant execute on function public.fw_bot_result(int, boolean) to authenticated;
