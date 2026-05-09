export type Platform = 'instagram' | 'facebook' | 'threads' | 'tiktok' | 'pinterest' | 'youtube';

export interface DateRange {
    from: Date;
    to: Date;
}

export interface PostMetrics {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
    impressions?: number;
    platform_post_id?: string;
}

export interface PlatformStats {
    platform: Platform;
    connected: boolean;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalImpressions: number;
    engagementRate: number;
    timeSeries: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
    date: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
}

export interface CampaignStats {
    id: string;
    name: string;
    goal: string;
    status: string;
    platforms: string[];
    postsSent: number;
    totalReach: number;
    totalEngagement: number;
    engagementRate: number;
}

export interface AnalyticsSummary {
    totalPostsSent: number;
    totalReach: number;
    totalEngagement: number;
    topPlatform: Platform | null;
}
