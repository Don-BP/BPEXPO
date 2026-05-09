-- Run in Supabase SQL editor AFTER deploying the edge function
-- Requires pg_cron and net extensions to be enabled

select cron.schedule(
  'social-heartbeat',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.edge_function_url') || '/social-heartbeat',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  )
  $$
);
