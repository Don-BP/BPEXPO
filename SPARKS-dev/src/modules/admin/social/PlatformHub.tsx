import React, { useState } from 'react';
import { Platform, PlatformConnection } from './types';

interface PlatformDef {
    id: Platform;
    label: string;
    appIdEnv: string | undefined | null;
    oauthUrl: ((appId: string, redirectUri: string) => string) | null;
    textOnly: boolean;
    note: string | null;
}

const PLATFORMS: PlatformDef[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        appIdEnv: import.meta.env.VITE_META_APP_ID,
        oauthUrl: (appId, redirectUri) =>
            `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=instagram_basic,instagram_content_publish&state=instagram`,
        textOnly: false,
        note: 'Requires image/video content',
    },
    {
        id: 'facebook',
        label: 'Facebook',
        appIdEnv: import.meta.env.VITE_META_APP_ID,
        oauthUrl: (appId, redirectUri) =>
            `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_manage_posts,pages_read_engagement&state=facebook`,
        textOnly: true,
        note: null,
    },
    {
        id: 'threads',
        label: 'Threads',
        appIdEnv: import.meta.env.VITE_META_APP_ID,
        oauthUrl: (appId, redirectUri) =>
            `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=threads_basic,threads_content_publish&state=threads`,
        textOnly: true,
        note: null,
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        appIdEnv: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
        oauthUrl: (appId, redirectUri) =>
            `https://www.tiktok.com/v2/auth/authorize/?client_key=${appId}&scope=video.upload,video.publish&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=tiktok`,
        textOnly: false,
        note: 'Requires video content',
    },
    {
        id: 'pinterest',
        label: 'Pinterest',
        appIdEnv: import.meta.env.VITE_PINTEREST_APP_ID,
        oauthUrl: (appId, redirectUri) =>
            `https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=pins:write&state=pinterest`,
        textOnly: false,
        note: 'Requires image content',
    },
    {
        id: 'twitter',
        label: 'Twitter / X',
        appIdEnv: null,
        oauthUrl: null,
        textOnly: true,
        note: 'Requires $100/mo paid API plan',
    },
];

interface Props {
    connections: PlatformConnection[];
    loading: boolean;
    error: string | null;
    onDisconnect: (platform: Platform) => Promise<void>;
}

const PlatformHub: React.FC<Props> = ({ connections, loading, error, onDisconnect }) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
    const redirectUri = `${supabaseUrl}/functions/v1/social-oauth-callback`;
    const [disconnectError, setDisconnectError] = useState<string | null>(null);

    const findConnection = (p: Platform) =>
        connections.find(c => c.platform === p);

    const handleConnect = (def: PlatformDef) => {
        if (!def.appIdEnv || !def.oauthUrl) return;
        window.location.href = def.oauthUrl(def.appIdEnv, redirectUri);
    };

    if (loading) {
        return <div className="social-empty-state">Loading platforms…</div>;
    }

    return (
        <>
            {error && <div className="social-error">{error}</div>}
            {disconnectError && <div className="social-error">{disconnectError}</div>}
            <div className="social-platform-grid">
                {PLATFORMS.map(def => {
                    const conn = findConnection(def.id);
                    const isConnected = Boolean(conn);
                    const isDisabled = !def.appIdEnv;
                    const cardClass = [
                        'social-platform-card',
                        isConnected ? 'social-platform-card--connected' : '',
                        isDisabled && !isConnected ? 'social-platform-card--disabled' : '',
                    ].filter(Boolean).join(' ');

                    const tooltip = isDisabled && def.id !== 'twitter'
                        ? `Not configured — add ${def.id === 'tiktok' ? 'VITE_TIKTOK_CLIENT_KEY' : def.id === 'pinterest' ? 'VITE_PINTEREST_APP_ID' : 'VITE_META_APP_ID'} to .env`
                        : undefined;

                    return (
                        <div key={def.id} className={cardClass}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="social-platform-icon">
                                    {def.label.slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{def.label}</div>
                                    {isConnected && conn ? (
                                        <div style={{ fontSize: 12, color: 'var(--social-status-active-text)' }}>
                                            Connected as @{conn.account_name}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                                            {def.note ?? 'Not connected'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                {isConnected ? (
                                    <button
                                        className="social-btn social-btn--danger"
                                        onClick={async () => {
                                            try {
                                                setDisconnectError(null);
                                                await onDisconnect(def.id);
                                            } catch {
                                                setDisconnectError('Failed to disconnect — please try again.');
                                            }
                                        }}
                                    >
                                        Disconnect
                                    </button>
                                ) : def.oauthUrl !== null ? (
                                    <button
                                        className="social-connect-btn"
                                        disabled={isDisabled}
                                        title={tooltip}
                                        onClick={() => handleConnect(def)}
                                    >
                                        Connect
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default PlatformHub;
