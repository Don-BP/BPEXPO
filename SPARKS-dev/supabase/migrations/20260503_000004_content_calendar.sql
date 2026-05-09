create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  content text not null,
  scheduled_at timestamptz not null,
  virality_score int,
  status text default 'draft',
  source text,
  created_at timestamptz default now()
);
