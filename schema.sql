-- 69STORY Event Calendar V1
-- Run this in Supabase SQL Editor

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  event_date date not null,
  start_time time,
  end_time time,
  type text default 'Live Band',
  poster_url text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events enable row level security;

-- ลูกค้าดูได้ทุกคน
create policy "Public can read events"
on public.events for select
to anon, authenticated
using (true);

-- เฉพาะคน Login แก้ได้
create policy "Authenticated users can insert events"
on public.events for insert
to authenticated
with check (true);

create policy "Authenticated users can update events"
on public.events for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete events"
on public.events for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.events;
