import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Platforms that CANNOT publish text-only via API.
const MEDIA_REQUIRED = new Set(['instagram', 'tiktok', 'pinterest']);

interface Post {
    id: string;
    campaign_id: string;
    platform: string;
    content: string;
    retry_count: number;
    metrics: Record<string, unknown> | null;
}

interface Connection {
    platform: string;
    access_token: string;
    account_id: string;
}

async function postToFacebook(content: string, conn: Connection): Promise<string> {
    // account_id should be the Page ID
    const url = `https://graph.facebook.com/v19.0/${conn.account_id}/feed`;
    const params = new URLSearchParams({
        message: content,
        access_token: conn.access_token,
    });
    const res = await fetch(url, { method: 'POST', body: params });
    if (!res.ok) throw new Error(`Facebook post failed: ${await res.text()}`);
    const json = await res.json();
    return String(json.id ?? '');
}

async function postToThreads(content: string, conn: Connection): Promise<string> {
    // Two-step: create container, then publish
    const createRes = await fetch(`https://graph.threads.net/v1.0/${conn.account_id}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            media_type: 'TEXT',
            text: content,
            access_token: conn.access_token,
        }),
    });
    if (!createRes.ok) throw new Error(`Threads container failed: ${await createRes.text()}`);
    const created = await createRes.json();

    const publishRes = await fetch(`https://graph.threads.net/v1.0/${conn.account_id}/threads_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            creation_id: created.id,
            access_token: conn.access_token,
        }),
    });
    if (!publishRes.ok) throw new Error(`Threads publish failed: ${await publishRes.text()}`);
    const published = await publishRes.json();
    return String(published.id ?? created.id ?? '');
}

Deno.serve(async () => {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: due, error: dueErr } = await admin
        .from('social_posts')
        .select('id, campaign_id, platform, content, retry_count, metrics')
        .lte('scheduled_at', new Date().toISOString())
        .eq('status', 'scheduled')
        .lt('retry_count', 3);

    if (dueErr) {
        console.error('Failed to load due posts:', dueErr);
        return new Response(JSON.stringify({ error: dueErr.message }), { status: 500 });
    }

    const summary = { processed: 0, posted: 0, skipped: 0, failed: 0 };

    for (const post of (due ?? []) as Post[]) {
        summary.processed += 1;

        // Always skip media-required platforms — text-only impossible
        if (MEDIA_REQUIRED.has(post.platform)) {
            await admin.from('social_posts').update({ status: 'skipped' }).eq('id', post.id);
            summary.skipped += 1;
            continue;
        }

        // Check campaign status
        const { data: campaign, error: campaignErr } = await admin
            .from('social_campaigns')
            .select('status')
            .eq('id', post.campaign_id)
            .single();
        if (campaignErr && campaignErr.code !== 'PGRST116') {
            console.error(`Campaign query failed for post ${post.id}:`, campaignErr);
        }
        if (!campaign || campaign.status !== 'active') {
            await admin.from('social_posts').update({ status: 'skipped' }).eq('id', post.id);
            summary.skipped += 1;
            continue;
        }

        // Check campaign_platform status
        const { data: cp, error: cpErr } = await admin
            .from('social_campaign_platforms')
            .select('status')
            .eq('campaign_id', post.campaign_id)
            .eq('platform', post.platform)
            .single();
        if (cpErr && cpErr.code !== 'PGRST116') {
            console.error(`Campaign platform query failed for post ${post.id}:`, cpErr);
        }
        if (!cp || cp.status !== 'active') {
            await admin.from('social_posts').update({ status: 'skipped' }).eq('id', post.id);
            summary.skipped += 1;
            continue;
        }

        // Check platform connection
        const { data: connRow, error: connErr } = await admin
            .from('platform_connections')
            .select('platform, access_token, account_id')
            .eq('platform', post.platform)
            .single();
        if (connErr && connErr.code !== 'PGRST116') {
            console.error(`Connection query failed for post ${post.id}:`, connErr);
        }
        if (!connRow) {
            await admin.from('social_posts').update({ status: 'skipped' }).eq('id', post.id);
            summary.skipped += 1;
            continue;
        }
        const conn = connRow as Connection;

        try {
            let platformPostId = '';
            if (post.platform === 'facebook') {
                platformPostId = await postToFacebook(post.content, conn);
            } else if (post.platform === 'threads') {
                platformPostId = await postToThreads(post.content, conn);
            } else {
                // twitter or unknown — skip
                await admin.from('social_posts').update({ status: 'skipped' }).eq('id', post.id);
                console.warn(`Unknown platform skipped: ${post.platform}`);
                summary.skipped += 1;
                continue;
            }

            await admin
                .from('social_posts')
                .update({
                    status: 'posted',
                    posted_at: new Date().toISOString(),
                    metrics: { ...(post.metrics ?? {}), platform_post_id: platformPostId },
                })
                .eq('id', post.id);
            summary.posted += 1;
        } catch (err) {
            console.error(`Post ${post.id} failed:`, err);
            const nextRetry = post.retry_count + 1;
            const newStatus = nextRetry >= 3 ? 'failed_permanently' : 'failed';
            await admin
                .from('social_posts')
                .update({ status: newStatus, retry_count: nextRetry })
                .eq('id', post.id);
            summary.failed += 1;
        }
    }

    return new Response(JSON.stringify(summary), {
        headers: { 'Content-Type': 'application/json' },
    });
});
