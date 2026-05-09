-- SPARKS Teacher App — Database Schema
-- Run this in Supabase SQL Editor before running 002_rls.sql

-- =========================================
-- USERS TABLE
-- Single unified profile for the entire app (Teacher Tools, Tango, Planner).
-- Planner-specific fields (nationality, experience, etc.) live here — no separate profile table.
-- =========================================
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  sparks integer NOT NULL DEFAULT 0,
  subscription_tier text NOT NULL DEFAULT 'FREE'
    CHECK (subscription_tier IN ('FREE', 'PRO', 'TEACHER_PLUS')),
  active_unlocks jsonb NOT NULL DEFAULT '{}',
  last_ai_usage timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz NOT NULL DEFAULT now(),
  -- Planner profile fields (formerly in modules/planner/types.ts UserProfile)
  nationality text,
  experience text,
  phone text,
  specializations text[] NOT NULL DEFAULT '{}',
  school_name text,
  role text,
  employee_id text,
  connected_teachers jsonb NOT NULL DEFAULT '[]'
);

-- =========================================
-- PLANS TABLE
-- Lesson plans created by the AI planner or manually.
-- Complex lesson data stored in JSONB 'data' column.
-- =========================================
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  data jsonb NOT NULL DEFAULT '{}',
  shared_with_groups uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX plans_user_id_idx ON public.plans(user_id);
CREATE INDEX plans_shared_groups_idx ON public.plans USING gin(shared_with_groups);

-- =========================================
-- TEACHER GROUPS TABLE
-- Collaborative groups for sharing lesson plans and messaging.
-- =========================================
CREATE TABLE public.teacher_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX teacher_groups_member_ids_idx ON public.teacher_groups USING gin(member_ids);

-- =========================================
-- GROUP MESSAGES TABLE
-- Chat messages within teacher groups, optionally sharing lesson plans.
-- =========================================
CREATE TABLE public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.teacher_groups(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  text text,
  link jsonb,
  shared_plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX group_messages_group_id_idx ON public.group_messages(group_id);

-- =========================================
-- TOOL DATA TABLE
-- PRO-only: persistent data for teacher tools (e.g. saved configurations).
-- =========================================
CREATE TABLE public.tool_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_key)
);

-- =========================================
-- TANGO SETS TABLE
-- PRO-only: user-created Tango flashcard sets.
-- =========================================
CREATE TABLE public.tango_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================
-- GAME PROGRESS TABLE
-- All users: tracks completion/progress for individual games.
-- =========================================
CREATE TABLE public.game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  progress jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);
