export type Platform =
    | 'instagram' | 'facebook' | 'tiktok' | 'pinterest'
    | 'twitter_x' | 'linkedin' | 'youtube_shorts' | 'email';

export type AdFormat = 'breaking_news' | 'sms_screenshot' | 'native_post' | 'standard';

export type DraftStatus = 'draft' | 'sent_to_social' | 'sent_to_email';

export interface HyperDopamineScore {
    pattern_interrupt: number;
    curiosity_gap: number;
    benefit_specificity: number;
    total: number;
}

export interface AdAnatomy {
    pattern_interrupt_brief: string;
    headline: string;
    slippery_intro: string;
    link_description: string;
    main_copy: string;
}

export interface ContentVariant {
    platform: Platform;
    format: AdFormat;
    anatomy: AdAnatomy;
    char_count: number;
    hd_score: HyperDopamineScore;
}

export interface AvatarInputs {
    pain_points: string;
    desires: string;
    their_language: string;
}

export interface GenerateInputs {
    goal: string;
    avatar: AvatarInputs;
    tone: string;
    key_message: string;
    format: AdFormat;
    platforms: Platform[];
}

export interface HookVariant {
    hook: string;
    formula: 'unexpected_modifier' | 'curiosity_gap' | 'number' | 'contrast' | 'question';
}

export interface ContentDraft {
    id: string;
    platform: Platform;
    format: AdFormat;
    goal: string;
    avatar: AvatarInputs;
    tone: string;
    key_message: string;
    anatomy: AdAnatomy;
    hd_score: HyperDopamineScore;
    char_count: number;
    status: DraftStatus;
    created_at: string;
    updated_at: string;
}
