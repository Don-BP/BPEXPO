import type { CampaignStats } from './types';

interface Props {
    campaigns: CampaignStats[];
    loading: boolean;
}

export function CampaignTable({ campaigns, loading }: Props) {
    const sorted = [...campaigns].sort((a, b) => b.engagementRate - a.engagementRate);

    if (!loading && sorted.length === 0) {
        return (
            <div className="analytics-table-empty">
                No campaign data yet — launch a campaign in Social Media to see performance here.
            </div>
        );
    }

    return (
        <div className="analytics-table-wrapper">
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Goal</th>
                        <th>Platforms</th>
                        <th>Posts Sent</th>
                        <th>Total Reach</th>
                        <th>Total Engagement</th>
                        <th>Engagement Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="analytics-table-loading">Loading…</td>
                        </tr>
                    ) : (
                        sorted.map((c) => (
                            <tr
                                key={c.id}
                                className="analytics-table-row"
                                onClick={() => { window.location.href = '/admin/social'; }}
                            >
                                <td className="analytics-table-name">{c.name}</td>
                                <td>{c.goal}</td>
                                <td>{c.platforms.join(', ')}</td>
                                <td>{c.postsSent}</td>
                                <td>{c.totalReach.toLocaleString()}</td>
                                <td>{c.totalEngagement.toLocaleString()}</td>
                                <td>{c.engagementRate.toFixed(1)}%</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
