-- 006_auto_learn.sql
-- Auto-Learn run history table
-- Stores results from each Auto-Learn analysis cycle

-- ── auto_learn_runs ──────────────────────────────────────────────
create table if not exists auto_learn_runs (
  id               uuid        primary key default gen_random_uuid(),
  ran_at           timestamptz not null default now(),
  posts_analyzed   integer     not null default 0,
  posts_generated  integer     not null default 0,
  patterns         jsonb       not null default '[]',
  hypotheses       jsonb       not null default '[]',
  new_posts        jsonb       not null default '[]',
  summary          text        not null default '',
  triggered_by     text        not null default 'cron'
);

create index if not exists idx_auto_learn_runs_ran_at on auto_learn_runs(ran_at desc);
