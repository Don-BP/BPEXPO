import React, { useState } from 'react';
import { SocialCampaign, CampaignPlatform, SocialPost, Platform, PlatformStatus } from './types';

interface Props {
    campaign: SocialCampaign;
    platforms: CampaignPlatform[];
    posts: SocialPost[];
    onToggle: (platform: Platform, status: PlatformStatus) => Promise<void>;
    onStop: (platform: Platform) => Promise<void>;
}

const CampaignCard: React.FC<Props> = ({ campaign, platforms, posts, onToggle, onStop }) => {
    const [expanded, setExpanded] = useState(false);
    const [confirmingStop, setConfirmingStop] = useState<Platform | null>(null);

    const stats = posts.reduce(
        (acc, p) => {
            if (p.status === 'posted') acc.posted += 1;
            else if (p.status === 'scheduled') acc.scheduled += 1;
            else if (p.status === 'failed' || p.status === 'failed_permanently') acc.failed += 1;
            else if (p.status === 'skipped') acc.skipped += 1;
            return acc;
        },
        { posted: 0, scheduled: 0, failed: 0, skipped: 0 }
    );

    const pillClass = (status: PlatformStatus) =>
        `social-platform-pill social-platform-pill--${status}`;

    const handleStopClick = async (platform: Platform) => {
        if (confirmingStop === platform) {
            await onStop(platform);
            setConfirmingStop(null);
        } else {
            setConfirmingStop(platform);
        }
    };

    return (
        <div className="social-campaign-card">
            <div className="social-campaign-card__row" onClick={() => setExpanded(v => !v)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontWeight: 600 }}>{campaign.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{campaign.goal}</div>
                    <div className="social-campaign-card__stats">
                        {stats.posted} posted · {stats.scheduled} scheduled · {stats.failed} failed · {stats.skipped} skipped
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`social-status-badge social-status-badge--${campaign.status}`}>
                        {campaign.status}
                    </span>
                    <div className="social-platform-pills">
                        {platforms.map(p => (
                            <span key={p.platform} className={pillClass(p.status)}>
                                {p.platform}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="social-campaign-card__body">
                    {platforms.map(p => {
                        const isStopped = p.status === 'stopped';
                        const isPaused = p.status === 'paused';
                        return (
                            <div
                                key={p.platform}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 0',
                                }}
                            >
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span className={pillClass(p.status)}>{p.platform}</span>
                                    <span style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>
                                        {p.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        className="social-btn"
                                        disabled={isStopped}
                                        onClick={() =>
                                            onToggle(p.platform, isPaused ? 'active' : 'paused')
                                        }
                                    >
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        className="social-btn social-btn--danger"
                                        disabled={isStopped}
                                        onClick={() => handleStopClick(p.platform)}
                                    >
                                        {confirmingStop === p.platform ? 'Confirm Stop' : 'Stop'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CampaignCard;
