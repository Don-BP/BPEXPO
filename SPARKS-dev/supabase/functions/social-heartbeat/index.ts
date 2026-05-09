import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Check if heartbeat is enabled
    const { data: setting } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'heartbeat_enabled')
        .single();

    if (setting?.value !== 'true') {
        return new Response(JSON.stringify({ ok: true, skipped: 'heartbeat disabled' }), {
            headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    const now = new Date();
    const windowEnd = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    const logs: Array<{ action: string; platform: string | null; detail: Record<string, unknown> }> = [];

    // 1. Check posts due in the next 30-min window
    const { data: duePosts } = await supabase
        .from('social_posts')
        .select('id, platform, content, campaign_id')
        .eq('status', 'scheduled')
        .lte('scheduled_at', windowEnd)
        .gte('scheduled_at', now.toISOString());

    if (duePosts && duePosts.length > 0) {
        for (const post of duePosts) {
            logs.push({
                action: 'alerted',
                platform: post.platform,
                detail: { post_id: post.id, reason: 'Post due — OAuth not configured, manual posting required' },
            });
        }
    }

    // 2. Check metric anomalies
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentPosts } = await supabase
        .from('social_posts')
        .select('id, platform, metrics, posted_at')
        .eq('status', 'posted')
        .not('metrics', 'is', null)
        .gte('posted_at', thirtyDaysAgo);

    if (recentPosts && recentPosts.length >= 5) {
        const byPlatform: Record<string, number[]> = {};
        for (const p of recentPosts) {
            const eng = (p.metrics as Record<string, number>)?.engagement ?? 0;
            if (!byPlatform[p.platform]) byPlatform[p.platform] = [];
            byPlatform[p.platform].push(eng);
        }
        for (const [platform, values] of Object.entries(byPlatform)) {
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const latest = values[values.length - 1];
            if (avg > 0 && (latest > avg * 2 || latest < avg * 0.5)) {
                logs.push({
                    action: 'alerted',
                    platform,
                    detail: {
                        reason: `Engagement anomaly: latest=${latest.toFixed(0)}, avg=${avg.toFixed(0)} (${latest > avg * 2 ? '>2×' : '<0.5×'})`,
                    },
                });
            }
        }
    }

    // 3. Check stale campaigns
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: campaigns } = await supabase
        .from('social_campaigns')
        .select('id, name, updated_at')
        .eq('status', 'active');

    if (campaigns) {
        for (const c of campaigns) {
            const { count } = await supabase
                .from('social_posts')
                .select('id', { count: 'exact', head: true })
                .eq('campaign_id', c.id)
                .gte('created_at', fourteenDaysAgo);
            if ((count ?? 0) === 0) {
                logs.push({
                    action: 'alerted',
                    platform: null,
                    detail: { reason: `Campaign "${c.name}" has no new posts in 14 days — consider resuming or archiving` },
                });
            }
        }
    }

    // Write to heartbeat_log
    if (logs.length === 0) {
        await supabase.from('heartbeat_log').insert([{
            action: 'noop',
            detail: { reason: 'Nothing to do' },
            platform: null,
        }]);
    } else {
        await supabase.from('heartbeat_log').insert(logs);
    }

    return new Response(
        JSON.stringify({ ok: true, actions: logs.length }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
});
