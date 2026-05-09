-- Run in Supabase Dashboard SQL Editor after deploying the function.
-- Daily at 6am JST = 21:00 UTC previous day.

SELECT cron.schedule(
    'social-metrics-cron',
    '0 21 * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/social-metrics',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
        ),
        body := '{}'::jsonb
    )
    $$
);

-- Verify both cron jobs:
-- SELECT * FROM cron.job WHERE jobname IN ('social-poster-cron', 'social-metrics-cron');
