export type ContentScriptFormat = 'short' | 'long';

export interface TitleVariant {
    title: string;
    formula: 'unexpected_modifier' | 'curiosity_gap' | 'number' | 'contrast' | 'question';
}

export interface ScriptResult {
    title_variants: TitleVariant[];
    estimated_duration_seconds: number;
    virality_score: number;
    script: string;
}

export interface RepurposeVariant {
    platform: string;
    content: string;
    char_count: number;
    virality_score: number;
}

export type RepurposeSourceType = 'blog' | 'transcript' | 'newsletter' | 'tweet_thread';

export interface CalendarEntry {
    id: string;
    platform: string;
    content: string;
    scheduled_at: string;
    virality_score: number | null;
    status: 'draft' | 'scheduled' | 'posted';
    source: string | null;
    created_at: string;
}
