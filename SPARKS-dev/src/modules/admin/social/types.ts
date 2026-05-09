export type Platform = 'instagram' | 'facebook' | 'threads' | 'tiktok' | 'pinterest' | 'twitter';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type PlatformStatus = 'active' | 'paused' | 'stopped';
export type PostStatus = 'scheduled' | 'posted' | 'failed' | 'failed_permanently' | 'skipped';

export interface SocialCampaign {
    id: string;
    name: string;
    goal: string;
    audience: string;
    tone: string;
    key_message: string;
    status: CampaignStatus;
    start_at: string;
    created_at: string;
    updated_at: string;
}

export interface CampaignPlatform {
    id: string;
    campaign_id: string;
    platform: Platform;
    status: PlatformStatus;
    created_at: string;
}

export interface PostMetrics {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
    impressions?: number;
}

export interface SocialPost {
    id: string;
    campaign_id: string;
    platform: Platform;
    content: string;
    scheduled_at: string;
    posted_at: string | null;
    status: PostStatus;
    retry_count: number;
    metrics: PostMetrics | null;
    created_at: string;
    updated_at: string;
}

export interface PlatformConnection {
    id: string;
    platform: Platform;
    account_name: string;
    account_id: string;
    connected_at: string;
}

export interface CampaignInputs {
    goal: string;
    audience: string;
    tone: string;
    key_message: string;
    platforms: Platform[];
    start_at: string;
}

export interface GeneratedCampaignPlan {
    posts: { platform: Platform; content: string; scheduled_at: string }[];
    schedule_summary: string;
}
