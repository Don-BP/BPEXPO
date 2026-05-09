import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const LOOKBACK_DAYS = 90;
const MAX_POSTS = 100;

const SYSTEM_PROMPT = `You are a social media optimization AI for SPARKS, an educational app for teachers in the Philippines.
Analyze the provided social posts and their engagement metrics. Identify patterns that correlate with higher engagement (reach, likes, comments, shares). Generate new post content that embodies the winning patterns.

Return ONLY a JSON object with this exact structure:
{
  "patterns": [{"pattern": "string", "evidence": "string", "lift": "string"}],
  "hypotheses": [{"hypothesis": "string", "rationale": "string"}],
  "new_posts": [{"platform": "string", "content": "string", "scheduled_at": "ISO8601 string"}],
  "summary": "string"
}

Rules:
- patterns: 3-5 items. lift is a percentage or multiplier vs average (e.g. "+42% reach" or "2.1x engagement").
- hypotheses: 2-3 items proposing what content style to test next.
- new_posts: 1-2 posts per active platform per hypothesis, scheduled 3-7 days from today. Platforms: instagram, facebook, threads, tiktok, pinterest only.
- summary: 2-3 sentence narrative of what you found and what you are testing next.`;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let triggeredBy = 'cron';
    try {
        const body = await req.json();
        const allowed = ['cron', 'manual'];
        triggeredBy = allowed.includes(body.triggered_by) ? body.triggered_by : 'cron';
    } catch { /* body is optional */ }

    // 1. Fetch posted posts with metrics from the last 90 days
    const since = new Date();
    since.setDate(since.getDate() - LOOKBACK_DAYS);

    const { data: posts, error: postsErr } = await supabase
        .from('social_posts')
        .select('platform, content, posted_at, metrics')
        .eq('status', 'posted')
        .not('metrics', 'is', null)
        .not('posted_at', 'is', null)
        .gte('posted_at', since.toISOString())
        .order('posted_at', { ascending: false })
        .limit(MAX_POSTS);

    if (postsErr) {
        return logAndRespond(supabase, triggeredBy, `DB error fetching posts: ${postsErr.message}`);
    }

    // 2. Fetch active campaigns (injection targets)
    const { data: campaigns, error: campErr } = await supabase
        .from('social_campaigns')
        .select('id, name, goal, tone, key_message')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (campErr) {
        return logAndRespond(supabase, triggeredBy, `DB error fetching campaigns: ${campErr.message}`);
    }

    // Insufficient data — no posts with metrics yet
    if (!posts || posts.length === 0) {
        await insertRun(supabase, {
            triggered_by: triggeredBy,
            posts_analyzed: 0,
            posts_generated: 0,
            patterns: [],
            hypotheses: [],
            new_posts: [],
            summary: 'Insufficient data — no posted content with metrics found.',
        });
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
            headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    // 3. Call Gemini
    const today = new Date().toISOString().split('T')[0];
    const userContent = JSON.stringify({
        posts: posts.map((p) => ({
            platform: p.platform,
            content: p.content,
            posted_at: p.posted_at,
            metrics: p.metrics,
        })),
        campaigns: (campaigns ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            goal: c.goal,
            tone: c.tone,
            key_message: c.key_message,
        })),
        today,
    });

    let result: {
        patterns: Array<{ pattern: string; evidence: string; lift: string }>;
        hypotheses: Array<{ hypothesis: string; rationale: string }>;
        new_posts: Array<{ platform: string; content: string; scheduled_at: string }>;
        summary: string;
    };

    try {
        const geminiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    contents: [{ role: 'user', parts: [{ text: userContent }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
            }
        );

        if (!geminiResp.ok) {
            const errText = await geminiResp.text();
            return logAndRespond(supabase, triggeredBy, `Gemini API error ${geminiResp.status}: ${errText}`);
        }

        const geminiData = await geminiResp.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (!rawText) {
            return logAndRespond(supabase, triggeredBy, 'Gemini returned no content (possible safety block or empty candidates)');
        }
        result = JSON.parse(rawText);
    } catch (e) {
        return logAndRespond(supabase, triggeredBy, `Gemini parse error: ${(e as Error).message}`);
    }

    // 4. Insert generated posts into the most recently created active campaign
    let postsGenerated = 0;
    const targetCampaign = campaigns?.[0] ?? null;

    if (targetCampaign && result.new_posts?.length > 0) {
        const toInsert = result.new_posts.map((p) => ({
            campaign_id: targetCampaign.id,
            platform: p.platform,
            content: p.content,
            scheduled_at: p.scheduled_at,
            status: 'scheduled',
            retry_count: 0,
            metrics: null,
        }));

        const { error: insertErr } = await supabase.from('social_posts').insert(toInsert);
        if (insertErr) {
            return logAndRespond(supabase, triggeredBy, `Post insert error: ${insertErr.message}`);
        }
        postsGenerated = toInsert.length;
    }

    // 5. Log the run
    await insertRun(supabase, {
        triggered_by: triggeredBy,
        posts_analyzed: posts.length,
        posts_generated: postsGenerated,
        patterns: result.patterns ?? [],
        hypotheses: result.hypotheses ?? [],
        new_posts: result.new_posts ?? [],
        summary: result.summary ?? '',
    });

    // 6. Generate per-module strategies and update active_strategies (best-effort)
    try {
        const strategyPrompt = `Based on this social media performance analysis, write one plain-English instruction block per module.
Each instruction block tells the module's AI generator what patterns to apply and what to avoid.
Be specific and actionable — these instructions will be prepended to AI generation prompts.

Analysis data:
${JSON.stringify({ patterns: result.patterns, hypotheses: result.hypotheses, summary: result.summary })}

Return ONLY a JSON object (no other text):
{
  "ad_manager": "For Facebook/Instagram ads: [2-3 specific actionable instructions based on the patterns above]",
  "social_media": "For social posts: [2-3 specific actionable instructions based on the patterns above]",
  "cold_email": "For cold email outreach: [2-3 specific actionable instructions based on the patterns above]"
}`;

        const stratResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: strategyPrompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
            }
        );

        if (stratResp.ok) {
            const stratData = await stratResp.json();
            const stratText = stratData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (stratText) {
                const strategies = JSON.parse(stratText) as Record<string, string>;
                // Get the run id we just inserted
                const { data: latestRun } = await supabase
                    .from('auto_learn_runs')
                    .select('id')
                    .order('ran_at', { ascending: false })
                    .limit(1)
                    .single();

                for (const [module, strategy] of Object.entries(strategies)) {
                    if (typeof strategy === 'string' && strategy.length > 0) {
                        // Only update rows that are NOT manually overridden
                        await supabase
                            .from('active_strategies')
                            .update({
                                strategy,
                                source_run_id: latestRun?.id ?? null,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('module', module)
                            .eq('is_manual_override', false);
                    }
                }
            }
        }
    } catch { /* strategy generation is best-effort — never fail the run over this */ }

    return new Response(
        JSON.stringify({ ok: true, posts_analyzed: posts.length, posts_generated: postsGenerated }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
});

// ── Helpers ──

type RunPayload = {
    triggered_by: string;
    posts_analyzed: number;
    posts_generated: number;
    patterns: unknown[];
    hypotheses: unknown[];
    new_posts: unknown[];
    summary: string;
};

// deno-lint-ignore no-explicit-any
async function insertRun(supabase: any, run: RunPayload) {
    await supabase.from('auto_learn_runs').insert([run]);
}

// deno-lint-ignore no-explicit-any
async function logAndRespond(supabase: any, triggeredBy: string, errorMsg: string): Promise<Response> {
    await insertRun(supabase, {
        triggered_by: triggeredBy,
        posts_analyzed: 0,
        posts_generated: 0,
        patterns: [],
        hypotheses: [],
        new_posts: [],
        summary: `ERROR: ${errorMsg}`,
    });
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), {
        status: 200, // 200 so pg_cron doesn't retry endlessly
        headers: { ...CORS, 'Content-Type': 'application/json' },
    });
}
