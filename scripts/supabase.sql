-- Supabase schema for attendance and voting
-- Run this in your Supabase SQL editor

create table if not exists public.attendance (
  id text not null,
  time timestamptz not null default now()
);

create index if not exists attendance_time_idx on public.attendance (time desc);

create table if not exists public.vote_records (
  poll_id text not null,
  option int not null,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_hash)
);

create index if not exists vote_records_poll_idx on public.vote_records (poll_id);
create index if not exists vote_records_option_idx on public.vote_records (poll_id, option);

-- Optional: RLS policies (adjust as needed)
alter table public.attendance enable row level security;
alter table public.vote_records enable row level security;

-- Allow anonymous inserts and reads (adjust for your security model)
create policy if not exists attendance_insert on public.attendance for insert to anon with check (true);
create policy if not exists attendance_select on public.attendance for select to anon using (true);

create policy if not exists vote_insert on public.vote_records for insert to anon with check (true);
create policy if not exists vote_select on public.vote_records for select to anon using (true);