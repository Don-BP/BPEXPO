drop table if exists admin_content_drafts;

create table admin_content_drafts (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'instagram',
  format text not null default 'standard',
  goal text not null default '',
  avatar jsonb not null default '{}',
  tone text not null default '',
  key_message text not null default '',
  anatomy jsonb not null default '{}',
  hd_score jsonb not null default '{}',
  char_count int not null default 0,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
