-- Run in Supabase Dashboard SQL Editor after deploying the function.
-- Requires app.supabase_url and app.service_role_key GUC params (same as social-poster/social-metrics).
-- Run every Monday at 9am UTC.

SELECT cron.schedule(
    'auto-learn-weekly',
    '0 9 * * 1',
    $$
    SELECT net.http_post(
        url     := current_setting('app.supabase_url') || '/functions/v1/auto-learn',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
        ),
        body    := '{"triggered_by": "cron"}'::jsonb
    )
    $$
);

-- Verify:
-- SELECT * FROM cron.job WHERE jobname = 'auto-learn-weekly';
