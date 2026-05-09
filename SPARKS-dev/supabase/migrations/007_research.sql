-- 007_research.sql
-- Research results: stores AI-generated research findings per category.

create table if not exists research_results (
  id          uuid        primary key default gen_random_uuid(),
  category    text        not null,
  query       text        not null,
  title       text        not null,
  url         text        not null default '',
  summary     text        not null,
  source      text        not null,
  searched_at timestamptz not null default now()
);

create index if not exists idx_research_results_category_date
  on research_results(category, searched_at desc);

grant select, insert on research_results to authenticated;

alter table research_results enable row level security;

create policy "authenticated_all" on research_results
  for all to authenticated using (true) with check (true);

alter table research_results
  add constraint research_results_source_check
  check (source in ('exa', 'firecrawl', 'gemini'));
