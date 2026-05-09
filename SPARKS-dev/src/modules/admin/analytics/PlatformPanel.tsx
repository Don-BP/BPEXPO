import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { PlatformStats } from './types';

const LABELS: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    threads: 'Threads',
    tiktok: 'TikTok',
    pinterest: 'Pinterest',
    youtube: 'YouTube',
};

const ABBR: Record<string, string> = {
    instagram: 'IG',
    facebook: 'FB',
    threads: 'TH',
    tiktok: 'TT',
    pinterest: 'PT',
    youtube: 'YT',
};

function formatAxisDate(dateStr: string): string {
    // dateStr is YYYY-MM-DD; append T00:00:00 to parse as local time
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
    stats: PlatformStats;
}

export function PlatformPanel({ stats }: Props) {
    const label = LABELS[stats.platform] ?? stats.platform;
    const abbr = ABBR[stats.platform] ?? stats.platform.slice(0, 2).toUpperCase();

    const header = (
        <div className="analytics-panel-header">
            <div className="analytics-platform-badge">{abbr}</div>
            <div className="analytics-platform-name">{label}</div>
        </div>
    );

    if (stats.platform === 'youtube') {
        return (
            <div className="analytics-platform-panel">
                {header}
                <p className="analytics-panel-message">
                    Coming soon — connect your YouTube channel when it launches.
                </p>
            </div>
        );
    }

    if (!stats.connected) {
        return (
            <div className="analytics-platform-panel">
                {header}
                <p className="analytics-panel-message">
                    Not connected —{' '}
                    <a href="/admin/social" className="analytics-panel-link">
                        go to Social Media →
                    </a>
                </p>
            </div>
        );
    }

    if (stats.totalPosts === 0) {
        return (
            <div className="analytics-platform-panel">
                {header}
                <p className="analytics-panel-message">
                    No data yet — metrics are collected nightly after posts go live.
                </p>
            </div>
        );
    }

    const chartData = stats.timeSeries.map((p) => ({
        date: formatAxisDate(p.date),
        reach: p.reach,
        engagement: p.likes + p.comments + p.shares,
    }));

    const engagement = stats.totalLikes + stats.totalComments + stats.totalShares;

    return (
        <div className="analytics-platform-panel">
            {header}
            <div className="analytics-metric-pills">
                <div className="analytics-pill">
                    <span className="analytics-pill-value">{stats.totalReach.toLocaleString()}</span>
                    <span className="analytics-pill-label">Reach</span>
                </div>
                <div className="analytics-pill">
                    <span className="analytics-pill-value">{stats.totalImpressions.toLocaleString()}</span>
                    <span className="analytics-pill-label">Impressions</span>
                </div>
                <div className="analytics-pill">
                    <span className="analytics-pill-value">{engagement.toLocaleString()}</span>
                    <span className="analytics-pill-label">Engagement</span>
                </div>
                <div className="analytics-pill">
                    <span className="analytics-pill-value">{stats.engagementRate.toFixed(1)}%</span>
                    <span className="analytics-pill-label">Avg Rate</span>
                </div>
            </div>
            <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="reach"
                            stroke="var(--analytics-chart-reach)"
                            dot={false}
                            strokeWidth={2}
                            name="Reach"
                        />
                        <Line
                            type="monotone"
                            dataKey="engagement"
                            stroke="var(--analytics-chart-engagement)"
                            dot={false}
                            strokeWidth={2}
                            name="Engagement"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
