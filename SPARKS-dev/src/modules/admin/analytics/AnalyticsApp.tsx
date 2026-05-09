import { useState, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';
import { SummaryRow } from './SummaryRow';
import { PlatformPanel } from './PlatformPanel';
import { CampaignTable } from './CampaignTable';
import type { DateRange, Platform } from './types';
import './AnalyticsApp.css';

const PLATFORM_ORDER: Platform[] = [
    'facebook', 'threads', 'instagram', 'tiktok', 'pinterest', 'youtube',
];

function subDays(d: Date, n: number): Date {
    const result = new Date(d);
    result.setDate(result.getDate() - n);
    return result;
}

export default function AnalyticsApp() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [activePreset, setActivePreset] = useState<7 | 30 | 90 | 0>(30);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const { summary, platformStats, campaignStats, loading, error, refresh } =
        useAnalytics(dateRange);

    const handlePreset = useCallback((days: 7 | 30 | 90) => {
        setActivePreset(days);
        setDateRange({ from: subDays(new Date(), days), to: new Date() });
    }, []);

    const handleApplyCustom = useCallback(() => {
        if (!customFrom || !customTo) return;
        const from = new Date(customFrom + 'T00:00:00');
        const to = new Date(customTo + 'T23:59:59');
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return;
        setActivePreset(0);
        setDateRange({ from, to });
    }, [customFrom, customTo]);

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h1 className="analytics-title">Analytics</h1>
                <div className="analytics-controls">
                    <div className="analytics-presets">
                        {([7, 30, 90] as const).map((d) => (
                            <button
                                key={d}
                                className={`analytics-preset-btn${activePreset === d ? ' active' : ''}`}
                                onClick={() => handlePreset(d)}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                    <div className="analytics-custom-range">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="analytics-date-input"
                        />
                        <span className="analytics-date-sep">to</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="analytics-date-input"
                        />
                        <button className="analytics-apply-btn" onClick={handleApplyCustom}>
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="analytics-error">
                    {error}
                    <button className="analytics-retry-btn" onClick={refresh}>Retry</button>
                </div>
            )}

            <SummaryRow summary={summary} loading={loading} />

            <div className="analytics-platforms-grid">
                {PLATFORM_ORDER.map((platform) => {
                    const stats = platformStats.find((s) => s.platform === platform);
                    if (!stats) return null;
                    return <PlatformPanel key={platform} stats={stats} />;
                })}
            </div>

            <div className="analytics-campaigns-section">
                <h2 className="analytics-section-title">Campaign Performance</h2>
                <CampaignTable campaigns={campaignStats} loading={loading} />
            </div>
        </div>
    );
}
