import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import {
    SocialCampaign,
    CampaignPlatform,
    SocialPost,
    Platform,
    PlatformStatus,
} from './types';

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);
    const [platformsByCampaign, setPlatformsByCampaign] = useState<Record<string, CampaignPlatform[]>>({});
    const [postsByCampaign, setPostsByCampaign] = useState<Record<string, SocialPost[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        const [campaignsRes, platformsRes, postsRes] = await Promise.all([
            supabase
                .from('social_campaigns')
                .select('*')
                .order('created_at', { ascending: false }),
            supabase.from('social_campaign_platforms').select('*'),
            supabase.from('social_posts').select('*'),
        ]);

        if (campaignsRes.error || platformsRes.error || postsRes.error) {
            setError('Failed to load campaigns');
            setLoading(false);
            return;
        }

        setCampaigns((campaignsRes.data ?? []) as SocialCampaign[]);

        const platformMap: Record<string, CampaignPlatform[]> = {};
        ((platformsRes.data ?? []) as CampaignPlatform[]).forEach(p => {
            (platformMap[p.campaign_id] ||= []).push(p);
        });
        setPlatformsByCampaign(platformMap);

        const postMap: Record<string, SocialPost[]> = {};
        ((postsRes.data ?? []) as SocialPost[]).forEach(p => {
            (postMap[p.campaign_id] ||= []).push(p);
        });
        setPostsByCampaign(postMap);

        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const togglePlatform = async (
        campaignId: string,
        platform: Platform,
        status: PlatformStatus
    ): Promise<void> => {
        setPlatformsByCampaign(prev => ({
            ...prev,
            [campaignId]: (prev[campaignId] ?? []).map(p =>
                p.platform === platform ? { ...p, status } : p
            ),
        }));
        const { error: err } = await supabase
            .from('social_campaign_platforms')
            .update({ status })
            .eq('campaign_id', campaignId)
            .eq('platform', platform);
        if (err) {
            setError('Failed to update platform status');
            await refresh();
        }
    };

    const stopPlatform = async (campaignId: string, platform: Platform): Promise<void> => {
        await togglePlatform(campaignId, platform, 'stopped');

        const nowIso = new Date().toISOString();
        setPostsByCampaign(prev => ({
            ...prev,
            [campaignId]: (prev[campaignId] ?? []).map(p =>
                p.platform === platform && p.status === 'scheduled' && p.scheduled_at > nowIso
                    ? { ...p, status: 'skipped' }
                    : p
            ),
        }));

        const { error: err } = await supabase
            .from('social_posts')
            .update({ status: 'skipped' })
            .eq('campaign_id', campaignId)
            .eq('platform', platform)
            .eq('status', 'scheduled')
            .gt('scheduled_at', nowIso);
        if (err) {
            setError('Failed to stop platform posts');
            await refresh();
        }
    };

    const retryPost = async (postId: string): Promise<void> => {
        setPostsByCampaign(prev => {
            const next: Record<string, SocialPost[]> = {};
            for (const [cid, posts] of Object.entries(prev)) {
                next[cid] = posts.map(p =>
                    p.id === postId ? { ...p, status: 'scheduled', retry_count: 0 } : p
                );
            }
            return next;
        });
        const { error: err } = await supabase
            .from('social_posts')
            .update({ status: 'scheduled', retry_count: 0 })
            .eq('id', postId);
        if (err) {
            setError('Failed to retry post');
            await refresh();
        }
    };

    const updatePost = async (
        postId: string,
        content: string,
        scheduledAt: string
    ): Promise<void> => {
        setPostsByCampaign(prev => {
            const next: Record<string, SocialPost[]> = {};
            for (const [cid, posts] of Object.entries(prev)) {
                next[cid] = posts.map(p =>
                    p.id === postId ? { ...p, content, scheduled_at: scheduledAt } : p
                );
            }
            return next;
        });
        const { error: err } = await supabase
            .from('social_posts')
            .update({ content, scheduled_at: scheduledAt })
            .eq('id', postId);
        if (err) {
            setError('Failed to update post');
            await refresh();
        }
    };

    return {
        campaigns,
        platformsByCampaign,
        postsByCampaign,
        loading,
        error,
        togglePlatform,
        stopPlatform,
        retryPost,
        updatePost,
        refresh,
    };
};
