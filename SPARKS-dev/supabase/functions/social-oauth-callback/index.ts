import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const APP_URL = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/social-oauth-callback`;

interface TokenResult {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    account_name: string;
    account_id: string;
}

async function exchangeMeta(code: string, scope: string): Promise<TokenResult> {
    const appId = Deno.env.get('META_APP_ID')!;
    const appSecret = Deno.env.get('META_APP_SECRET')!;

    const params = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: REDIRECT_URI,
        code,
    });
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params}`);
    if (!tokenRes.ok) throw new Error(`Meta token exchange failed: ${await tokenRes.text()}`);
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;

    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
    if (!meRes.ok) throw new Error(`Meta me endpoint failed: ${await meRes.text()}`);
    const me = await meRes.json();

    return {
        access_token: accessToken,
        expires_in: tokenJson.expires_in,
        account_name: me.name ?? scope,
        account_id: String(me.id ?? ''),
    };
}

async function exchangeTikTok(code: string): Promise<TokenResult> {
    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')!;
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')!;

    const body = new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
    });
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!res.ok) throw new Error(`TikTok token exchange failed: ${await res.text()}`);
    const json = await res.json();

    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
        headers: { Authorization: `Bearer ${json.access_token}` },
    });
    if (!userRes.ok) throw new Error(`TikTok user endpoint failed: ${await userRes.text()}`);
    const user = await userRes.json();

    return {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_in: json.expires_in,
        account_name: user?.data?.user?.display_name ?? 'TikTok user',
        account_id: user?.data?.user?.open_id ?? '',
    };
}

async function exchangePinterest(code: string): Promise<TokenResult> {
    const appId = Deno.env.get('PINTEREST_APP_ID')!;
    const appSecret = Deno.env.get('PINTEREST_APP_SECRET')!;

    const auth = btoa(`${appId}:${appSecret}`);
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
    });
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
        },
        body,
    });
    if (!res.ok) throw new Error(`Pinterest token exchange failed: ${await res.text()}`);
    const json = await res.json();

    const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: { Authorization: `Bearer ${json.access_token}` },
    });
    if (!userRes.ok) throw new Error(`Pinterest user endpoint failed: ${await userRes.text()}`);
    const user = await userRes.json();

    return {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_in: json.expires_in,
        account_name: user?.username ?? 'Pinterest user',
        account_id: String(user?.id ?? user?.username ?? ''),
    };
}

Deno.serve(async (req) => {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // platform identifier
    const errorParam = url.searchParams.get('error');

    if (errorParam || !code || !state) {
        return Response.redirect(`${APP_URL}/admin/social?oauth_error=${encodeURIComponent(errorParam ?? 'missing_code')}`, 302);
    }

    try {
        let result: TokenResult;
        switch (state) {
            case 'instagram':
            case 'facebook':
            case 'threads':
                result = await exchangeMeta(code, state);
                break;
            case 'tiktok':
                result = await exchangeTikTok(code);
                break;
            case 'pinterest':
                result = await exchangePinterest(code);
                break;
            default:
                throw new Error(`Unknown platform: ${state}`);
        }

        const expiresAt = result.expires_in
            ? new Date(Date.now() + result.expires_in * 1000).toISOString()
            : null;

        const admin = createClient(SUPABASE_URL, SERVICE_KEY);
        const { error: dbErr } = await admin
            .from('platform_connections')
            .upsert({
                platform: state,
                access_token: result.access_token,
                refresh_token: result.refresh_token ?? null,
                token_expires_at: expiresAt,
                account_name: result.account_name,
                account_id: result.account_id,
                connected_at: new Date().toISOString(),
            }, { onConflict: 'platform' });
        if (dbErr) throw dbErr;

        return Response.redirect(`${APP_URL}/admin/social?platform_connected=${state}`, 302);
    } catch (err) {
        console.error('OAuth callback error:', err);
        return Response.redirect(`${APP_URL}/admin/social?oauth_error=exchange_failed`, 302);
    }
});
