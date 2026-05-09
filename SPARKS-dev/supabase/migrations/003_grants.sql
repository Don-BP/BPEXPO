-- SPARKS Teacher App — Table-level grants for authenticated role
-- Run this in the Supabase SQL Editor after 001_schema.sql and 002_rls.sql.
-- RLS policies control which ROWS a user can touch; these grants allow the
-- role to attempt table access in the first place. Without them you get 403.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_data      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tango_sets     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_progress  TO authenticated;

-- Read-only for anon (needed for public API calls like health checks)
GRANT SELECT ON public.users TO anon;

-- Service role grants (needed by Edge Functions that use the service_role key)
-- service_role bypasses RLS but still needs explicit table privileges
GRANT SELECT, UPDATE ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO service_role;
