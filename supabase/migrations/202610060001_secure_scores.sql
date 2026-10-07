begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

-- Upgrade legacy profile tables in place. `create table if not exists` does not
-- add columns when a table from an earlier prototype is already present.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists created_at timestamptz default now();

-- Supabase Auth is the authoritative source for account email addresses.
update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id
  and profile.email is distinct from auth_user.email;

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null;

-- Enforced immediately for new/changed rows. NOT VALID preserves any legacy
-- orphan profile until it can be reviewed instead of deleting it silently.
alter table public.profiles drop constraint if exists profiles_email_required;
alter table public.profiles
  add constraint profiles_email_required check (email is not null) not valid;

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_name text not null,
  date_str text not null,
  raw_ms bigint not null,
  penalty_seconds integer not null default 0,
  effective_ms bigint not null,
  tiles_count integer not null default 12,
  created_at timestamptz not null default now(),
  constraint unique_user_daily unique (user_id, date_str),
  constraint valid_score_date check (date_str ~ '^\d{4}-\d{2}-\d{2}$'),
  constraint valid_score_values check (
    raw_ms between 1000 and 3600000
    and penalty_seconds between 0 and 3600
    and effective_ms = raw_ms + (penalty_seconds * 1000::bigint)
    and tiles_count = 12
  )
);

-- `create table if not exists` does not retrofit constraints on an existing
-- prototype table, so enforce them explicitly as part of the migration.
-- Legacy roles cannot be trusted: the prototype allowed clients to edit any
-- profile and also inferred teacher access from user-controlled data. Reset
-- every existing account to student; trusted teachers are promoted manually
-- after this migration using the documented admin-only statement.
update public.profiles
set role = 'student'
where role is distinct from 'student';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'teacher'));
alter table public.profiles alter column role set default 'student';
alter table public.profiles alter column role set not null;

alter table public.scores drop constraint if exists valid_score_date;
alter table public.scores
  add constraint valid_score_date check (date_str ~ '^\d{4}-\d{2}-\d{2}$');
alter table public.scores drop constraint if exists valid_score_values;
alter table public.scores
  add constraint valid_score_values check (
    raw_ms between 1000 and 3600000
    and penalty_seconds between 0 and 3600
    and effective_ms = raw_ms + (penalty_seconds * 1000::bigint)
    and tiles_count = 12
  );

create index if not exists idx_scores_date_str on public.scores (date_str);
create index if not exists idx_scores_user_id on public.scores (user_id);
create index if not exists idx_scores_effective_ms on public.scores (effective_ms asc);

alter table public.profiles enable row level security;
alter table public.scores enable row level security;
revoke all on public.profiles from anon;
revoke all on public.scores from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.scores to authenticated;

-- Remove every policy shipped by the prototype. Those policies allowed any
-- browser, including anonymous users, to edit or delete any row.
drop policy if exists "Guztiek ikusi sailkapena" on public.scores;
drop policy if exists "Ikasleek gorde dezakete emaitza" on public.scores;
drop policy if exists "Ikasleek eguneratu dezakete emaitza" on public.scores;
drop policy if exists "Irakasleak ezabatu dezake puntuazioa" on public.scores;
drop policy if exists "Profilak ikusi" on public.profiles;
drop policy if exists "Profilak sortu eta editatu" on public.profiles;
drop policy if exists "Authenticated users read scores" on public.scores;
drop policy if exists "Students insert own daily score" on public.scores;
drop policy if exists "Authenticated users read profiles" on public.profiles;
drop policy if exists "Students insert own profile" on public.profiles;
drop policy if exists "Students update own profile" on public.profiles;

create policy "Authenticated users read scores"
  on public.scores for select
  to authenticated
  using (true);

create policy "Students insert own daily score"
  on public.scores for insert
  to authenticated
  with check (
    lower(user_id) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and date_str = (timezone('Europe/Madrid', now())::date)::text
    and tiles_count = 12
    and effective_ms = raw_ms + (penalty_seconds * 1000::bigint)
  );

-- Scores are immutable. There is deliberately no UPDATE or DELETE policy.

create policy "Authenticated users read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Students insert own profile"
  on public.profiles for insert
  to authenticated
  with check (
    id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = 'student'
  );

create policy "Students update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() and role = 'student')
  with check (
    id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and role = 'student'
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.reset_daily_score(
  target_user_id text,
  target_date_str text default (timezone('Europe/Madrid', now())::date)::text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  ) then
    raise exception 'teacher role required' using errcode = '42501';
  end if;

  delete from public.scores
  where lower(user_id) = lower(target_user_id)
    and date_str = target_date_str;
end;
$$;

revoke all on function public.reset_daily_score(text, text) from public;
grant execute on function public.reset_daily_score(text, text) to authenticated;

commit;
