import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { AutoLearnRun } from './types';

interface RunHistoryProps {
    runs: AutoLearnRun[];
}

export const RunHistory: React.FC<RunHistoryProps> = ({ runs }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (runs.length === 0) return null;

    return (
        <div className="al-history">
            <h2 className="al-section-title">Run History</h2>
            <table className="al-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Date</th>
                        <th>Triggered by</th>
                        <th>Analyzed</th>
                        <th>Generated</th>
                        <th>Top Pattern</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map((run) => {
                        const isExpanded = expandedId === run.id;
                        const topPattern = run.patterns[0]?.pattern ?? run.summary.slice(0, 60);
                        return (
                            <React.Fragment key={run.id}>
                                <tr
                                    className="al-table__row al-table__row--clickable"
                                    onClick={() => setExpandedId(isExpanded ? null : run.id)}
                                >
                                    <td className="al-table__chevron">
                                        {isExpanded
                                            ? <ChevronDown size={14} />
                                            : <ChevronRight size={14} />
                                        }
                                    </td>
                                    <td>
                                        {new Date(run.ran_at).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </td>
                                    <td>
                                        <span className={`al-badge al-badge--${run.triggered_by}`}>
                                            {run.triggered_by}
                                        </span>
                                    </td>
                                    <td>{run.posts_analyzed}</td>
                                    <td>{run.posts_generated}</td>
                                    <td className="al-table__pattern">{topPattern}</td>
                                </tr>
                                {isExpanded && (
                                    <tr className="al-table__detail">
                                        <td colSpan={6}>
                                            <div className="al-detail">
                                                <p className="al-detail__summary">{run.summary}</p>
                                                {run.patterns.length > 0 && (
                                                    <div className="al-detail__section">
                                                        <strong>Patterns</strong>
                                                        <ul>
                                                            {run.patterns.map((p, i) => (
                                                                <li key={i}>
                                                                    <span className="al-detail__lift">{p.lift}</span>
                                                                    {' '}{p.pattern} — <em>{p.evidence}</em>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {run.hypotheses.length > 0 && (
                                                    <div className="al-detail__section">
                                                        <strong>Hypotheses tested</strong>
                                                        <ul>
                                                            {run.hypotheses.map((h, i) => (
                                                                <li key={i}>
                                                                    {h.hypothesis} — <em>{h.rationale}</em>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
