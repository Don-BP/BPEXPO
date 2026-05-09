import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Platform, DateRange, AnalyticsSummary, PlatformStats, CampaignStats, TimeSeriesPoint } from './types';

const PLATFORMS: Platform[] = ['facebook', 'threads', 'instagram', 'tiktok', 'pinterest', 'youtube'];

function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

interface UseAnalyticsReturn {
    summary: AnalyticsSummary;
    platformStats: PlatformStats[];
    campaignStats: CampaignStats[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const EMPTY_SUMMARY: AnalyticsSummary = {
    totalPostsSent: 0,
    totalReach: 0,
    totalEngagement: 0,
    topPlatform: null,
};

interface PlatformAccum {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalImpressions: number;
    dayMap: Map<string, TimeSeriesPoint>;
}

interface CampaignAccum {
    id: string;
    name: string;
    goal: string;
    status: string;
    platforms: Set<string>;
    postsSent: number;
    totalReach: number;
    totalEngagement: number;
}

export function useAnalytics(dateRange: DateRange): UseAnalyticsReturn {
    const isMountedRef = useRef(true);
    const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
    const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
    const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [postsResult, connectionsResult] = await Promise.all([
            supabase
                .from('social_posts')
                .select(`
                    id, campaign_id, platform, status, posted_at, metrics,
                    social_campaigns ( id, name, goal, status )
                `)
                .eq('status', 'posted')
                .gte('posted_at', dateRange.from.toISOString())
                .lte('posted_at', dateRange.to.toISOString()),
            supabase
                .from('platform_connections')
                .select('platform'),
        ]);

        if (postsResult.error || connectionsResult.error) {
            setError('Failed to load analytics');
            setLoading(false);
            return;
        }

        const posts = postsResult.data ?? [];
        const connectedPlatforms = new Set(
            (connectionsResult.data ?? []).map((c: { platform: string }) => c.platform)
        );

        // Per-platform accumulators
        const platformMap = new Map<Platform, PlatformAccum>();
        for (const p of PLATFORMS) {
            platformMap.set(p, {
                totalPosts: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                totalReach: 0,
                totalImpressions: 0,
                dayMap: new Map(),
            });
        }

        // Per-campaign accumulators
        const campaignMap = new Map<string, CampaignAccum>();

        for (const post of posts) {
            if (!post.posted_at) continue;
            const platform = post.platform as Platform;
            const pAcc = platformMap.get(platform);
            const m = (post.metrics ?? {}) as Record<string, number>;
            const likes = m.likes ?? 0;
            const comments = m.comments ?? 0;
            const shares = m.shares ?? 0;
            const reach = m.reach ?? 0;
            const impressions = m.impressions ?? 0;

            if (pAcc) {
                pAcc.totalPosts++;
                pAcc.totalLikes += likes;
                pAcc.totalComments += comments;
                pAcc.totalShares += shares;
                pAcc.totalReach += reach;
                pAcc.totalImpressions += impressions;

                const dateKey = toDateKey(new Date(post.posted_at));
                const existing = pAcc.dayMap.get(dateKey) ?? {
                    date: dateKey, likes: 0, comments: 0, shares: 0, reach: 0,
                };
                pAcc.dayMap.set(dateKey, {
                    date: dateKey,
                    likes: existing.likes + likes,
                    comments: existing.comments + comments,
                    shares: existing.shares + shares,
                    reach: existing.reach + reach,
                });
            }

            // Campaign aggregation — social_campaigns is a nested object from the join
            const campaign = (post as Record<string, unknown>).social_campaigns as {
                id: string; name: string; goal: string; status: string;
            } | null;

            if (campaign) {
                const cId = campaign.id;
                const existing = campaignMap.get(cId) ?? {
                    id: cId,
                    name: campaign.name,
                    goal: campaign.goal,
                    status: campaign.status,
                    platforms: new Set<string>(),
                    postsSent: 0,
                    totalReach: 0,
                    totalEngagement: 0,
                };
                existing.postsSent++;
                existing.platforms.add(platform);
                existing.totalReach += reach;
                existing.totalEngagement += likes + comments + shares;
                campaignMap.set(cId, existing);
            }
        }

        // Build PlatformStats[]
        const newPlatformStats: PlatformStats[] = PLATFORMS.map((p) => {
            const acc = platformMap.get(p)!;
            const engagement = acc.totalLikes + acc.totalComments + acc.totalShares;
            const engagementRate = acc.totalReach > 0 ? (engagement / acc.totalReach) * 100 : 0;
            const timeSeries = Array.from(acc.dayMap.values()).sort((a, b) =>
                a.date.localeCompare(b.date)
            );
            return {
                platform: p,
                connected: p === 'youtube' ? false : connectedPlatforms.has(p),
                totalPosts: acc.totalPosts,
                totalLikes: acc.totalLikes,
                totalComments: acc.totalComments,
                totalShares: acc.totalShares,
                totalReach: acc.totalReach,
                totalImpressions: acc.totalImpressions,
                engagementRate,
                timeSeries,
            };
        });

        // Build CampaignStats[]
        const newCampaignStats: CampaignStats[] = Array.from(campaignMap.values()).map((c) => ({
            id: c.id,
            name: c.name,
            goal: c.goal,
            status: c.status,
            platforms: Array.from(c.platforms),
            postsSent: c.postsSent,
            totalReach: c.totalReach,
            totalEngagement: c.totalEngagement,
            engagementRate: c.totalReach > 0 ? (c.totalEngagement / c.totalReach) * 100 : 0,
        }));

        // Compute AnalyticsSummary
        let topPlatform: Platform | null = null;
        let maxEngagement = 0;
        for (const s of newPlatformStats) {
            const e = s.totalLikes + s.totalComments + s.totalShares;
            if (e > maxEngagement) {
                maxEngagement = e;
                topPlatform = s.platform;
            }
        }

        const newSummary: AnalyticsSummary = {
            totalPostsSent: posts.length,
            totalReach: newPlatformStats.reduce((acc, s) => acc + s.totalReach, 0),
            totalEngagement: newPlatformStats.reduce(
                (acc, s) => acc + s.totalLikes + s.totalComments + s.totalShares, 0
            ),
            topPlatform: maxEngagement > 0 ? topPlatform : null,
        };

        if (!isMountedRef.current) return;
        setSummary(newSummary);
        setPlatformStats(newPlatformStats);
        setCampaignStats(newCampaignStats);
        setLoading(false);
    }, [dateRange]);

    useEffect(() => {
        isMountedRef.current = true;
        load();
        return () => { isMountedRef.current = false; };
    }, [load]);

    return { summary, platformStats, campaignStats, loading, error, refresh: load };
}
