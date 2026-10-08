-- STEM Visualizer: storage for the serverless mentor (Supabase Edge Functions)
-- Run once in Supabase → SQL Editor, after 0005_teacher_plan.sql.

-- Questions asked today, per signed-in user ("u:<id>") or per guest ("g:<hashed ip>")
create table if not exists public.mentor_counter (
  key text not null,
  day date not null default current_date,
  count int not null default 0,
  primary key (key, day)
);
alter table public.mentor_counter enable row level security;
-- no policies: only the server (service role) touches it

-- Count one question atomically; returns how many are left today, or -1 if the limit is reached
create or replace function public.use_mentor(p_key text, p_limit int)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  n int;
begin
  insert into public.mentor_counter (key, day, count) values (p_key, current_date, 0)
  on conflict (key, day) do nothing;
  update public.mentor_counter set count = count + 1
  where key = p_key and day = current_date and count < p_limit
  returning count into n;
  if n is null then return -1; end if;
  return p_limit - n;
end;
$$;

revoke all on function public.use_mentor(text, int) from public, anon, authenticated;
grant execute on function public.use_mentor(text, int) to service_role;

-- old rows are useless after a day; keep the table small
create index if not exists mentor_counter_day on public.mentor_counter (day);
