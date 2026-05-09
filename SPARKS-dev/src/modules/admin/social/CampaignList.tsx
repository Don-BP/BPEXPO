import React, { useState } from 'react';
import CampaignCard from './CampaignCard';
import CreateCampaignForm from './CreateCampaignForm';
import { SocialCampaign, CampaignPlatform, SocialPost, Platform, PlatformStatus } from './types';

interface Props {
    campaigns: SocialCampaign[];
    platformsByCampaign: Record<string, CampaignPlatform[]>;
    postsByCampaign: Record<string, SocialPost[]>;
    onToggle: (campaignId: string, platform: Platform, status: PlatformStatus) => Promise<void>;
    onStop: (campaignId: string, platform: Platform) => Promise<void>;
    onRefresh: () => Promise<void>;
}

const CampaignList: React.FC<Props> = ({
    campaigns,
    platformsByCampaign,
    postsByCampaign,
    onToggle,
    onStop,
    onRefresh,
}) => {
    const [creating, setCreating] = useState(false);

    const handleLaunched = async () => {
        setCreating(false);
        await onRefresh();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {!creating && (
                    <button
                        className="social-btn social-btn--primary"
                        onClick={() => setCreating(true)}
                    >
                        + New Campaign
                    </button>
                )}
            </div>

            {creating && (
                <CreateCampaignForm
                    onLaunched={handleLaunched}
                    onCancel={() => setCreating(false)}
                />
            )}

            {campaigns.length === 0 ? (
                <div className="social-empty-state">
                    No campaigns yet — create your first campaign.
                </div>
            ) : (
                <div className="social-campaign-list">
                    {[...campaigns].sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    ).map(c => (
                        <CampaignCard
                            key={c.id}
                            campaign={c}
                            platforms={platformsByCampaign[c.id] ?? []}
                            posts={postsByCampaign[c.id] ?? []}
                            onToggle={(platform, status) => onToggle(c.id, platform, status)}
                            onStop={(platform) => onStop(c.id, platform)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignList;
