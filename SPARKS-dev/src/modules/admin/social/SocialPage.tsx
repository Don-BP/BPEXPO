import React, { useEffect, useState } from 'react';
import PlatformHub from './PlatformHub';
import CampaignList from './CampaignList';
import PostCalendar from './PostCalendar';
import HeartbeatTab from './HeartbeatTab';
import PerformancePanel from './PerformancePanel';
import { usePlatforms } from './usePlatforms';
import { useCampaigns } from './useCampaigns';
import './SocialPage.css';

type Tab = 'platforms' | 'campaigns' | 'calendar' | 'heartbeat';

const SocialPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('platforms');
    const [oauthError, setOauthError] = useState<string | null>(null);
    const platforms = usePlatforms();
    const campaigns = useCampaigns();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('platform_connected')) {
            platforms.refresh();
            setActiveTab('platforms');
        }
        if (params.has('oauth_error')) {
            setOauthError('Platform connection failed — please try again.');
            setActiveTab('platforms');
        }
        if (params.has('platform_connected') || params.has('oauth_error')) {
            params.delete('platform_connected');
            params.delete('oauth_error');
            const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
            window.history.replaceState({}, '', newUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const allPosts = Object.values(campaigns.postsByCampaign).flat();

    return (
        <div className="social-page">
            <div className="social-page__header">
                <h1 className="social-page__title">Social Media</h1>
            </div>

            {oauthError && <div className="social-error">{oauthError}</div>}

            <div className="social-tabs">
                <button
                    className={`social-tab${activeTab === 'platforms' ? ' social-tab--active' : ''}`}
                    onClick={() => setActiveTab('platforms')}
                >
                    Platforms
                </button>
                <button
                    className={`social-tab${activeTab === 'campaigns' ? ' social-tab--active' : ''}`}
                    onClick={() => setActiveTab('campaigns')}
                >
                    Campaigns ({campaigns.campaigns.length})
                </button>
                <button
                    className={`social-tab${activeTab === 'calendar' ? ' social-tab--active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    Calendar
                </button>
                <button
                    className={`social-tab${activeTab === 'heartbeat' ? ' social-tab--active' : ''}`}
                    onClick={() => setActiveTab('heartbeat')}
                >
                    Heartbeat
                </button>
            </div>

            {activeTab === 'platforms' && (
                <PlatformHub
                    connections={platforms.connections}
                    loading={platforms.loading}
                    error={platforms.error}
                    onDisconnect={platforms.disconnect}
                />
            )}

            {activeTab === 'campaigns' && (
                <div>
                    <CampaignList
                        campaigns={campaigns.campaigns}
                        platformsByCampaign={campaigns.platformsByCampaign}
                        postsByCampaign={campaigns.postsByCampaign}
                        onToggle={campaigns.togglePlatform}
                        onStop={campaigns.stopPlatform}
                        onRefresh={campaigns.refresh}
                    />
                    <PerformancePanel />
                </div>
            )}

            {activeTab === 'calendar' && (
                <PostCalendar
                    posts={allPosts}
                    onRetry={campaigns.retryPost}
                    onUpdate={campaigns.updatePost}
                />
            )}

            {activeTab === 'heartbeat' && <HeartbeatTab />}
        </div>
    );
};

export default SocialPage;
