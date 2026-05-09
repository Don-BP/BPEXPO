CREATE TABLE IF NOT EXISTS admin_content_drafts (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    type        text        NOT NULL CHECK (type IN ('social', 'ad_copy', 'email')),
    goal        text        NOT NULL,
    audience    text        NOT NULL,
    tone        text        NOT NULL,
    key_message text        NOT NULL,
    content     text        NOT NULL,
    status      text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'sent_to_social', 'sent_to_email')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
