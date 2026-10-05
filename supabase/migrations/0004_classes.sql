-- STEM Visualizer: teacher dashboard (classes, join codes, assignments)
-- Run once in Supabase → SQL Editor, after 0002_subscriptions.sql.

-- 1. Tables
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid references public.classes (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  kind text not null check (kind in ('topic', 'section')),
  ref_id text not null,
  title text not null,
  due date,
  created_at timestamptz not null default now()
);

create index if not exists class_members_user on public.class_members (user_id);
create index if not exists assignments_class on public.assignments (class_id);

-- 2. Helpers (security definer, so policies don't recurse into each other)
create or replace function public.is_pro(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.subscriptions where user_id = uid and status = 'active' and expires_at > now());
$$;

create or replace function public.teaches_class(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = cid and teacher_id = auth.uid());
$$;

create or replace function public.in_class(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.class_members where class_id = cid and user_id = auth.uid());
$$;

create or replace function public.teaches_student(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m join public.classes c on c.id = m.class_id
    where m.user_id = sid and c.teacher_id = auth.uid()
  );
$$;

-- 3. Row level security
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "classes: teacher reads" on public.classes;
create policy "classes: teacher reads" on public.classes for select using (teacher_id = auth.uid() or public.in_class(id));
drop policy if exists "classes: pro teacher creates" on public.classes;
create policy "classes: pro teacher creates" on public.classes for insert with check (teacher_id = auth.uid() and public.is_pro(auth.uid()));
drop policy if exists "classes: teacher edits" on public.classes;
create policy "classes: teacher edits" on public.classes for update using (teacher_id = auth.uid());
drop policy if exists "classes: teacher deletes" on public.classes;
create policy "classes: teacher deletes" on public.classes for delete using (teacher_id = auth.uid());

drop policy if exists "members: read" on public.class_members;
create policy "members: read" on public.class_members for select using (user_id = auth.uid() or public.teaches_class(class_id));
drop policy if exists "members: leave or remove" on public.class_members;
create policy "members: leave or remove" on public.class_members for delete using (user_id = auth.uid() or public.teaches_class(class_id));
-- joining goes through join_class() below

drop policy if exists "assignments: read" on public.assignments;
create policy "assignments: read" on public.assignments for select using (public.teaches_class(class_id) or public.in_class(class_id));
drop policy if exists "assignments: teacher writes" on public.assignments;
create policy "assignments: teacher writes" on public.assignments for all using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

-- a teacher can see the progress and name of students in their classes
drop policy if exists "progress: teacher reads students" on public.progress;
create policy "progress: teacher reads students" on public.progress for select using (public.teaches_student(user_id));
drop policy if exists "profiles: teacher reads students" on public.profiles;
create policy "profiles: teacher reads students" on public.profiles for select using (public.teaches_student(id));
-- and a student can see their teacher's name
drop policy if exists "profiles: student reads teacher" on public.profiles;
create policy "profiles: student reads teacher" on public.profiles for select using (
  exists (select 1 from public.classes c where c.teacher_id = profiles.id and public.in_class(c.id))
);

-- 4. Join a class by its code
create or replace function public.join_class(p_code text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  cid uuid;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select id into cid from public.classes where join_code = upper(trim(p_code));
  if cid is null then raise exception 'invalid_code'; end if;
  if exists (select 1 from public.classes where id = cid and teacher_id = auth.uid()) then raise exception 'own_class'; end if;
  insert into public.class_members (class_id, user_id) values (cid, auth.uid()) on conflict do nothing;
  return cid;
end;
$$;

grant execute on function public.join_class(text) to authenticated;
