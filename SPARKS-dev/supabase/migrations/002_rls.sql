-- SPARKS Teacher App — Row Level Security Policies
-- Run this AFTER 001_schema.sql
-- All tables in public schema must have RLS enabled.

-- =========================================
-- ENABLE RLS ON ALL TABLES
-- =========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tango_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- =========================================
-- USERS TABLE POLICIES
-- Users can only access their own profile row.
-- sparks, subscription_tier, and last_ai_usage are write-protected at column level
-- (only the Edge Function / service role can modify them).
-- =========================================
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Prevent clients from writing monetization-critical columns
REVOKE UPDATE (sparks, subscription_tier, last_ai_usage) ON public.users FROM authenticated;

-- =========================================
-- PLANS TABLE POLICIES
-- Users can CRUD their own plans.
-- Members of a group that a plan is shared with can also read it.
-- =========================================
CREATE POLICY "plans_select_own" ON public.plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "plans_insert_own" ON public.plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plans_update_own" ON public.plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "plans_delete_own" ON public.plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "plans_select_shared_with_group" ON public.plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_groups g
      WHERE g.id = ANY(plans.shared_with_groups)
        AND auth.uid() = ANY(g.member_ids)
    )
  );

-- =========================================
-- TEACHER GROUPS TABLE POLICIES
-- Members can read/update groups they belong to.
-- Only creator can delete a group.
-- =========================================
CREATE POLICY "groups_select_member" ON public.teacher_groups
  FOR SELECT USING (auth.uid() = ANY(member_ids));

CREATE POLICY "groups_insert_own" ON public.teacher_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update_member" ON public.teacher_groups
  FOR UPDATE USING (auth.uid() = ANY(member_ids));

CREATE POLICY "groups_delete_creator" ON public.teacher_groups
  FOR DELETE USING (auth.uid() = created_by);

-- =========================================
-- GROUP MESSAGES TABLE POLICIES
-- Only group members can read or send messages.
-- =========================================
CREATE POLICY "messages_select_member" ON public.group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_groups g
      WHERE g.id = group_messages.group_id
        AND auth.uid() = ANY(g.member_ids)
    )
  );

CREATE POLICY "messages_insert_member" ON public.group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.teacher_groups g
      WHERE g.id = group_messages.group_id
        AND auth.uid() = ANY(g.member_ids)
    )
  );

-- =========================================
-- TOOL DATA TABLE POLICIES (PRO only)
-- =========================================
CREATE POLICY "tool_data_pro_only" ON public.tool_data
  FOR ALL USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.subscription_tier IN ('PRO', 'TEACHER_PLUS')
    )
  );

-- =========================================
-- TANGO SETS TABLE POLICIES (PRO only)
-- =========================================
CREATE POLICY "tango_sets_pro_only" ON public.tango_sets
  FOR ALL USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.subscription_tier IN ('PRO', 'TEACHER_PLUS')
    )
  );

-- =========================================
-- GAME PROGRESS TABLE POLICIES (all users)
-- =========================================
CREATE POLICY "game_progress_own" ON public.game_progress
  FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- PRIVATE SCHEMA + ATOMIC SPARK DEDUCTION FUNCTION
-- Used by the generate-lesson Edge Function (called with service role key).
-- NOT callable by the anon or authenticated roles.
-- =========================================
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.deduct_sparks(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_sparks integer;
BEGIN
  SELECT sparks INTO current_sparks
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF current_sparks IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF current_sparks < p_amount THEN
    RETURN false;
  END IF;

  UPDATE public.users
  SET sparks = sparks - p_amount,
      last_ai_usage = now()
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

-- Only service_role may call this function
REVOKE ALL ON FUNCTION private.deduct_sparks(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.deduct_sparks(uuid, integer) TO service_role;

-- Public wrapper so supabase.rpc() can reach it from the Edge Function
CREATE OR REPLACE FUNCTION public.deduct_sparks(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT private.deduct_sparks(p_user_id, p_amount);
$$;

REVOKE ALL ON FUNCTION public.deduct_sparks(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_sparks(uuid, integer) FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.deduct_sparks(uuid, integer) TO service_role;

-- =========================================
-- REALTIME: add users table to publication
-- Needed for useWallet real-time sparks updates
-- =========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
