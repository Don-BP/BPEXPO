create table if not exists heartbeat_log (
  id uuid primary key default gen_random_uuid(),
  fired_at timestamptz default now(),
  action text not null,
  detail jsonb,
  platform text
);

create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into admin_settings (key, value) values
  ('heartbeat_enabled', 'false')
on conflict (key) do nothing;
