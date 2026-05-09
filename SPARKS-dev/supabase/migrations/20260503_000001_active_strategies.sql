create table if not exists active_strategies (
  module text primary key,
  strategy text not null,
  source_run_id uuid references auto_learn_runs(id),
  is_manual_override boolean default false,
  updated_at timestamptz default now()
);

insert into active_strategies (module, strategy) values
  ('ad_manager', 'No strategy data yet. Run Auto-Learn to generate.'),
  ('social_media', 'No strategy data yet. Run Auto-Learn to generate.'),
  ('cold_email', 'No strategy data yet. Run Auto-Learn to generate.')
on conflict (module) do nothing;
