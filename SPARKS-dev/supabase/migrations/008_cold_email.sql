-- 008_cold_email.sql
-- Campaign-First cold email pipeline: campaigns + prospects with full funnel tracking

create table if not exists email_campaigns (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  goal        text        not null,
  status      text        not null default 'draft'
              check (status in ('draft', 'active', 'completed')),
  created_at  timestamptz not null default now()
);

create table if not exists email_prospects (
  id                 uuid        primary key default gen_random_uuid(),
  campaign_id        uuid        not null references email_campaigns(id) on delete cascade,
  name               text        not null default '',
  email              text        not null,
  website            text        not null default '',
  country            text        not null default '',
  role               text        not null default '',
  scraped_context    text        not null default '',
  draft_subject      text        not null default '',
  draft_body         text        not null default '',
  send_status        text        not null default 'pending'
                     check (send_status in (
                       'pending', 'enriched', 'drafted',
                       'sent', 'opened', 'clicked', 'bounced', 'replied',
                       'converted', 'interested', 'not_interested', 'skipped'
                     )),
  resend_message_id  text        not null default '',
  tracking_token     text        not null default '',
  reply_to_address   text        not null default '',
  scheduled_at       timestamptz,
  sent_at            timestamptz,
  replied_at         timestamptz,
  converted_at       timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_email_prospects_campaign
  on email_prospects(campaign_id);

create index if not exists idx_email_prospects_resend_id
  on email_prospects(resend_message_id)
  where resend_message_id <> '';

create index if not exists idx_email_prospects_tracking_token
  on email_prospects(tracking_token)
  where tracking_token <> '';

alter table email_campaigns enable row level security;
alter table email_prospects enable row level security;

create policy "authenticated_all" on email_campaigns
  for all to authenticated using (true) with check (true);

create policy "authenticated_all" on email_prospects
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on email_campaigns to authenticated;
grant select, insert, update, delete on email_prospects to authenticated;
