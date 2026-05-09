-- 005_social_media.sql
-- Social Media Manager schema
-- Sub-project #3 of 7

-- ── social_campaigns ─────────────────────────────────────────────
CREATE TABLE social_campaigns (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    goal        text        NOT NULL,
    audience    text        NOT NULL,
    tone        text        NOT NULL,
    key_message text        NOT NULL,
    status      text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_at    timestamptz NOT NULL DEFAULT now(),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_campaigns_status ON social_campaigns(status);
CREATE INDEX idx_social_campaigns_created_at ON social_campaigns(created_at DESC);

-- ── social_campaign_platforms ────────────────────────────────────
CREATE TABLE social_campaign_platforms (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid        NOT NULL REFERENCES social_campaigns(id) ON DELETE CASCADE,
    platform    text        NOT NULL CHECK (platform IN ('instagram', 'facebook', 'threads', 'tiktok', 'pinterest', 'twitter')),
    status      text        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'paused', 'stopped')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (campaign_id, platform)
);

CREATE INDEX idx_social_campaign_platforms_campaign ON social_campaign_platforms(campaign_id);

-- ── social_posts ─────────────────────────────────────────────────
CREATE TABLE social_posts (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   uuid        NOT NULL REFERENCES social_campaigns(id) ON DELETE CASCADE,
    platform      text        NOT NULL CHECK (platform IN ('instagram', 'facebook', 'threads', 'tiktok', 'pinterest', 'twitter')),
    content       text        NOT NULL,
    scheduled_at  timestamptz NOT NULL,
    posted_at     timestamptz,
    status        text        NOT NULL DEFAULT 'scheduled'
                              CHECK (status IN ('scheduled', 'posted', 'failed', 'failed_permanently', 'skipped')),
    retry_count   int         NOT NULL DEFAULT 0,
    metrics       jsonb,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_posts_campaign ON social_posts(campaign_id);
CREATE INDEX idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_due ON social_posts(scheduled_at, status) WHERE status = 'scheduled';

-- ── platform_connections ─────────────────────────────────────────
CREATE TABLE platform_connections (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    platform         text        NOT NULL UNIQUE
                                 CHECK (platform IN ('instagram', 'facebook', 'threads', 'tiktok', 'pinterest')),
    access_token     text        NOT NULL,
    refresh_token    text,
    token_expires_at timestamptz,
    account_name     text        NOT NULL,
    account_id       text        NOT NULL,
    connected_at     timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION social_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_social_campaigns_updated
    BEFORE UPDATE ON social_campaigns
    FOR EACH ROW EXECUTE FUNCTION social_set_updated_at();

CREATE TRIGGER trg_social_posts_updated
    BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION social_set_updated_at();

CREATE TRIGGER trg_platform_connections_updated
    BEFORE UPDATE ON platform_connections
    FOR EACH ROW EXECUTE FUNCTION social_set_updated_at();

-- No RLS — admin-only tables. Edge functions use service role key.
