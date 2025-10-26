-- Supabase schema for attendance, voting, and profiles
-- Run this in your Supabase SQL editor

-- Attendance
create table if not exists public.attendance (
  id text not null,
  time timestamptz not null default now()
);
create index if not exists attendance_time_idx on public.attendance (time desc);

-- Votes
create table if not exists public.vote_records (
  poll_id text not null,
  option int not null,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_hash)
);
create index if not exists vote_records_poll_idx on public.vote_records (poll_id);
create index if not exists vote_records_option_idx on public.vote_records (poll_id, option);

-- Profiles (role management by email, decoupled from auth.users id)
create table if not exists public.profiles (
  email text primary key,
  role text not null default 'user' check (role in ('user','admin')),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles (role);

-- Helper function: returns true if current JWT email has admin role
create or replace function public.is_admin() returns boolean
language sql
stable
as $
  select exists(
    select 1
    from public.profiles p
    where p.email = coalesce(nullif((auth.jwt() ->> 'email'), ''), '')
      and p.role = 'admin'
  );
$;

-- Enable RLS
alter table public.attendance enable row level security;
alter table public.vote_records enable row level security;
alter table public.profiles enable row level security;

-- Policies:
-- Authenticated-only writes on attendance and votes, open read to authenticated
drop policy if exists attendance_insert on public.attendance;
drop policy if exists attendance_select on public.attendance;
create policy attendance_insert on public.attendance for insert
  to authenticated
  with check (true);
create policy attendance_select on public.attendance for select
  to authenticated
  using (true);

drop policy if exists vote_insert on public.vote_records;
drop policy if exists vote_select on public.vote_records;
create policy vote_insert on public.vote_records for insert
  to authenticated
  with check (true);
create policy vote_select on public.vote_records for select
  to authenticated
  using (true);

-- Profiles: allow any authenticated user to read roles, but only admins can insert/update/delete
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_write on public.profiles;
drop policy if exists profiles_bootstrap on public.profiles;

create policy profiles_select on public.profiles for select
  to authenticated
  using (true);

-- Bootstrap policy: allow first admin to create themselves if no admin exists yet
create policy profiles_bootstrap on public.profiles for insert
  to authenticated
  with check (
    (select count(*) from public.profiles where role = 'admin') = 0
    and email = coalesce(nullif((auth.jwt() ->> 'email'), ''), '')
  );

create policy profiles_write on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());