import type { AnalyticsSummary } from './types';

interface Props {
    summary: AnalyticsSummary;
    loading: boolean;
}

function fmt(n: number): string {
    return n === 0 ? '—' : n.toLocaleString();
}

export function SummaryRow({ summary, loading }: Props) {
    return (
        <div className="analytics-summary-row">
            <div className="analytics-kpi-card">
                <div className="analytics-kpi-value">
                    {loading ? <div className="analytics-skeleton" /> : fmt(summary.totalPostsSent)}
                </div>
                <div className="analytics-kpi-label">Posts Sent</div>
                <div className="analytics-kpi-sublabel">Total posts published in period</div>
            </div>

            <div className="analytics-kpi-card">
                <div className="analytics-kpi-value">
                    {loading ? <div className="analytics-skeleton" /> : fmt(summary.totalReach)}
                </div>
                <div className="analytics-kpi-label">Total Reach</div>
                <div className="analytics-kpi-sublabel">Unique accounts reached</div>
            </div>

            <div className="analytics-kpi-card">
                <div className="analytics-kpi-value">
                    {loading ? <div className="analytics-skeleton" /> : fmt(summary.totalEngagement)}
                </div>
                <div className="analytics-kpi-label">Total Engagement</div>
                <div className="analytics-kpi-sublabel">Likes + comments + shares</div>
            </div>

            <div className="analytics-kpi-card">
                <div className="analytics-kpi-value analytics-kpi-platform">
                    {loading
                        ? <div className="analytics-skeleton" />
                        : (summary.topPlatform ?? '—')
                    }
                </div>
                <div className="analytics-kpi-label">Top Platform</div>
                <div className="analytics-kpi-sublabel">Platform with highest engagement</div>
            </div>
        </div>
    );
}
