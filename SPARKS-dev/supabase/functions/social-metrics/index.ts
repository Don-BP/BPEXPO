import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PostedRow {
    id: string;
    platform: string;
    posted_at: string;
    metrics: Record<string, unknown> | null;
    // posted_id from platform should be persisted in metrics.platform_post_id
}

async function metricsForFacebook(post: PostedRow, accessToken: string): Promise<Record<string, number> | null> {
    const platformPostId = (post.metrics as Record<string, unknown>)?.platform_post_id;
    if (!platformPostId) return null;
    const fields = 'reactions.summary(total_count),comments.summary(total_count),shares';
    const url = `https://graph.facebook.com/v19.0/${platformPostId}?fields=${fields}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return {
        likes: json.reactions?.summary?.total_count ?? 0,
        comments: json.comments?.summary?.total_count ?? 0,
        shares: json.shares?.count ?? 0,
    };
}

async function metricsForThreads(post: PostedRow, accessToken: string): Promise<Record<string, number> | null> {
    const platformPostId = (post.metrics as Record<string, unknown>)?.platform_post_id;
    if (!platformPostId) return null;
    const url = `https://graph.threads.net/v1.0/${platformPostId}/insights?metric=likes,replies,reposts,views&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const out: Record<string, number> = {};
    for (const item of json.data ?? []) {
        if (item.name === 'likes') out.likes = item.values?.[0]?.value ?? 0;
        if (item.name === 'replies') out.comments = item.values?.[0]?.value ?? 0;
        if (item.name === 'reposts') out.shares = item.values?.[0]?.value ?? 0;
        if (item.name === 'views') out.impressions = item.values?.[0]?.value ?? 0;
    }
    return out;
}

Deno.serve(async () => {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: posts, error } = await admin
        .from('social_posts')
        .select('id, platform, posted_at, metrics')
        .eq('status', 'posted')
        .gte('posted_at', since);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const { data: connsData } = await admin
        .from('platform_connections')
        .select('platform, access_token');
    const tokenByPlatform = new Map<string, string>();
    for (const c of (connsData ?? []) as { platform: string; access_token: string }[]) {
        tokenByPlatform.set(c.platform, c.access_token);
    }

    const summary = { processed: 0, updated: 0, skipped: 0 };

    for (const post of (posts ?? []) as PostedRow[]) {
        summary.processed += 1;
        const token = tokenByPlatform.get(post.platform);
        if (!token) { summary.skipped += 1; continue; }

        let metrics: Record<string, number> | null = null;
        try {
            if (post.platform === 'facebook') metrics = await metricsForFacebook(post, token);
            else if (post.platform === 'threads') metrics = await metricsForThreads(post, token);
            else { summary.skipped += 1; continue; }
        } catch (err) {
            console.error(`Metrics for ${post.id} failed:`, err);
            summary.skipped += 1;
            continue;
        }

        if (!metrics) { summary.skipped += 1; continue; }

        const merged = { ...(post.metrics ?? {}), ...metrics };
        const { error: updateErr } = await admin
            .from('social_posts')
            .update({ metrics: merged })
            .eq('id', post.id);
        if (updateErr) {
            console.error(`Metrics write failed for ${post.id}:`, updateErr);
            summary.skipped += 1;
        } else {
            summary.updated += 1;
        }
    }

    return new Response(JSON.stringify(summary), {
        headers: { 'Content-Type': 'application/json' },
    });
});
