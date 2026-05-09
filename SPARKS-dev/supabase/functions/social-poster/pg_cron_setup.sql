-- Run in Supabase Dashboard SQL Editor after deploying the function.
-- Requires pg_cron and pg_net extensions enabled in Database → Extensions.

-- One-time: store secrets in Postgres GUC (only needs to run once per project).
-- Replace YOUR_SUPABASE_URL and YOUR_SERVICE_ROLE_KEY before running.
ALTER DATABASE postgres SET app.supabase_url = 'YOUR_SUPABASE_URL';
ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY';

-- Schedule the poster (every 15 minutes)
SELECT cron.schedule(
    'social-poster-cron',
    '*/15 * * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/social-poster',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
        ),
        body := '{}'::jsonb
    )
    $$
);

-- Verify:
-- SELECT * FROM cron.job WHERE jobname = 'social-poster-cron';
