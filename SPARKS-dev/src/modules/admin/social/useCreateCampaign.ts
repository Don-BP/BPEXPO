import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { callAi } from '../../../lib/ai';
import {
    CampaignInputs,
    GeneratedCampaignPlan,
    SocialCampaign,
    Platform,
} from './types';

const buildPrompt = (inputs: CampaignInputs): string => `You are a social media strategist for SPARKS, an educational app for teachers in Japan.

Create a social media campaign plan based on:
- Goal: ${inputs.goal}
- Audience: ${inputs.audience}
- Tone: ${inputs.tone}
- Key message: ${inputs.key_message}
- Platforms: ${inputs.platforms.join(', ')}
- Start date: ${inputs.start_at}
- Campaign duration: 4 weeks

Return ONLY valid JSON, no other text:
{
  "schedule_summary": "Brief description of posting schedule (1-2 sentences)",
  "posts": [
    { "platform": "facebook", "content": "...", "scheduled_at": "2026-05-05T09:00:00+09:00" }
  ]
}

Guidelines per platform:
- facebook: 2-4 sentences, can include a question to drive comments.
- threads: 1-2 punchy sentences. Conversational.
- instagram: 1-3 sentences + 5-10 hashtags. (Note: requires image to post — will be saved as draft only)
- tiktok: Hook sentence + 3-5 hashtags. (Note: requires video — will be saved as draft only)
- pinterest: 2-3 descriptive sentences + keywords. (Note: requires image — will be saved as draft only)

Generate 3 posts per platform per week for 4 weeks (12 posts per platform).
Use JST (UTC+9) for all timestamps.
Best posting times: facebook Mon-Thu 13:00-15:00 JST, threads any day 08:00-10:00 JST,
instagram Tue-Fri 09:00-11:00 JST, tiktok Tue/Thu/Sat 19:00-21:00 JST, pinterest Wed/Sat 20:00-23:00 JST.`;

const stripJsonFences = (text: string): string => {
    return text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
};

export const useCreateCampaign = () => {
    const [plan, setPlan] = useState<GeneratedCampaignPlan | null>(null);
    const [inputs, setInputs] = useState<CampaignInputs | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (next: CampaignInputs): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const raw = await callAi(buildPrompt(next), 'gemini-2.0-flash');
            if (!raw) throw new Error('AI returned no content');
            const parsed = JSON.parse(stripJsonFences(raw)) as GeneratedCampaignPlan;
            if (!Array.isArray(parsed.posts)) throw new Error('Invalid plan shape');
            setPlan(parsed);
            setInputs(next);
        } catch (err) {
            console.error('generate failed:', err);
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const editPost = useCallback((index: number, content: string) => {
        setPlan(prev => {
            if (!prev) return prev;
            const posts = prev.posts.slice();
            if (!posts[index]) return prev;
            posts[index] = { ...posts[index], content };
            return { ...prev, posts };
        });
    }, []);

    const launch = useCallback(async (name: string, startAt: string, platforms: Platform[]): Promise<void> => {
        if (!plan || !inputs) throw new Error('No plan to launch');
        setLoading(true);
        setError(null);
        try {
            const { data: campaign, error: cErr } = await supabase
                .from('social_campaigns')
                .insert({
                    name,
                    goal: inputs.goal,
                    audience: inputs.audience,
                    tone: inputs.tone,
                    key_message: inputs.key_message,
                    status: 'active',
                    start_at: startAt,
                })
                .select()
                .single();
            if (cErr || !campaign) throw cErr ?? new Error('Insert failed');

            const campaignId = campaign.id;
            try {
                const platformRows = platforms.map(p => ({
                    campaign_id: campaignId,
                    platform: p,
                    status: 'active' as const,
                }));
                const { error: pErr } = await supabase
                    .from('social_campaign_platforms')
                    .insert(platformRows);
                if (pErr) throw pErr;

                const postRows = plan.posts.map(p => ({
                    campaign_id: campaignId,
                    platform: p.platform,
                    content: p.content,
                    scheduled_at: p.scheduled_at,
                    status: 'scheduled' as const,
                }));
                if (postRows.length > 0) {
                    const { error: postErr } = await supabase
                        .from('social_posts')
                        .insert(postRows);
                    if (postErr) throw postErr;
                }
            } catch (innerErr) {
                // rollback: delete the orphaned campaign
                await supabase.from('social_campaigns').delete().eq('id', campaignId);
                throw innerErr;
            }
        } catch (err) {
            console.error('launch failed:', err);
            setError(err instanceof Error ? err.message : 'Launch failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [plan, inputs]);

    const reset = useCallback(() => {
        setPlan(null);
        setInputs(null);
        setError(null);
    }, []);

    return { generate, launch, plan, editPost, loading, error, reset };
};

export type Platforms = Platform[];
