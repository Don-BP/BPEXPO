import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { AutoLearnRun } from './types';

interface InsightsPanelProps {
    latestRun: AutoLearnRun | null;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ latestRun }) => {
    if (!latestRun) {
        return (
            <div className="al-insights">
                <h2 className="al-section-title">Latest Insights</h2>
                <div className="al-empty">
                    <TrendingUp size={32} opacity={0.3} />
                    <p>No analysis run yet. Click <strong>Run Now</strong> to start the first cycle.</p>
                </div>
            </div>
        );
    }

    const isError = latestRun.summary.startsWith('ERROR:');
    const isSkipped = latestRun.posts_analyzed === 0 && !isError;

    return (
        <div className="al-insights">
            <div className="al-insights__header">
                <h2 className="al-section-title">Latest Insights</h2>
                <span className="al-insights__meta">
                    {new Date(latestRun.ran_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                    {' · '}
                    <span className={`al-badge al-badge--${latestRun.triggered_by}`}>
                        {latestRun.triggered_by}
                    </span>
                </span>
            </div>

            {(isError || isSkipped) ? (
                <p className="al-insights__summary al-insights__summary--muted">
                    {latestRun.summary}
                </p>
            ) : (
                <>
                    <p className="al-insights__summary">{latestRun.summary}</p>
                    <div className="al-patterns">
                        {latestRun.patterns.map((p, i) => (
                            <div key={i} className="al-pattern-card">
                                <div className="al-pattern-card__lift">{p.lift}</div>
                                <p className="al-pattern-card__pattern">{p.pattern}</p>
                                <p className="al-pattern-card__evidence">{p.evidence}</p>
                            </div>
                        ))}
                    </div>
                    {latestRun.hypotheses.length > 0 && (
                        <div className="al-hypotheses">
                            <h3 className="al-subsection-title">Testing Next</h3>
                            {latestRun.hypotheses.map((h, i) => (
                                <div key={i} className="al-hypothesis">
                                    <span className="al-hypothesis__label">H{i + 1}</span>
                                    <div>
                                        <p className="al-hypothesis__text">{h.hypothesis}</p>
                                        <p className="al-hypothesis__rationale">{h.rationale}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
