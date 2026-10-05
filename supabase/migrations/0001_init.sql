-- STEM Visualizer: accounts and learning progress
-- Run once in Supabase → SQL Editor (or `supabase db push`).

-- 1. Profiles: one row per user, filled from the sign-up form
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text check (role in ('student', 'teacher')) default 'student',
  grade smallint check (grade between 5 and 11),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

-- create the profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, grade)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    nullif(new.raw_user_meta_data ->> 'grade', '')::smallint
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Progress: the whole learner state as one JSON document per user
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "progress: read own" on public.progress;
create policy "progress: read own" on public.progress for select using (auth.uid() = user_id);

drop policy if exists "progress: insert own" on public.progress;
create policy "progress: insert own" on public.progress for insert with check (auth.uid() = user_id);

drop policy if exists "progress: update own" on public.progress;
create policy "progress: update own" on public.progress for update using (auth.uid() = user_id);
