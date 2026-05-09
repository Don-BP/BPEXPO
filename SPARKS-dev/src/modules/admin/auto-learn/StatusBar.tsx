import React from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import type { AutoLearnRun } from './types';

interface StatusBarProps {
    runs: AutoLearnRun[];
    triggering: boolean;
    onRunNow: () => void;
}

function getNextMonday9amUTC(): Date {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun, 1=Mon
    let daysUntil = (1 - day + 7) % 7;
    if (daysUntil === 0) {
        const todayAt9 = new Date(now);
        todayAt9.setUTCHours(9, 0, 0, 0);
        if (now >= todayAt9) daysUntil = 7;
    }
    const next = new Date(now);
    next.setUTCDate(now.getUTCDate() + daysUntil);
    next.setUTCHours(9, 0, 0, 0);
    return next;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export const StatusBar: React.FC<StatusBarProps> = ({ runs, triggering, onRunNow }) => {
    const latest = runs[0] ?? null;
    const nextRun = getNextMonday9amUTC();

    return (
        <div className="al-status-bar">
            <div className="al-status-bar__stats">
                <div className="al-stat">
                    <span className="al-stat__label">Last run</span>
                    <span className="al-stat__value">
                        {latest ? timeAgo(latest.ran_at) : '—'}
                    </span>
                </div>
                <div className="al-stat">
                    <span className="al-stat__label">Next scheduled</span>
                    <span className="al-stat__value">
                        {nextRun.toLocaleString(undefined, {
                            weekday: 'short', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </span>
                </div>
                <div className="al-stat">
                    <span className="al-stat__label">Total cycles</span>
                    <span className="al-stat__value">{runs.length}</span>
                </div>
                {latest && (
                    <div className="al-stat">
                        <span className="al-stat__label">Last cycle</span>
                        <span className="al-stat__value">
                            {latest.posts_analyzed} analyzed · {latest.posts_generated} generated
                        </span>
                    </div>
                )}
            </div>
            <button
                className="al-run-btn"
                onClick={onRunNow}
                disabled={triggering}
            >
                {triggering
                    ? <><RefreshCw size={14} className="al-run-btn__spinner" /> Running…</>
                    : <><Brain size={14} /> Run Now</>
                }
            </button>
        </div>
    );
};
