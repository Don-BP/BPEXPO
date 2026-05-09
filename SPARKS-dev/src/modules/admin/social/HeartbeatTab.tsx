import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface HeartbeatLog {
    id: string;
    fired_at: string;
    action: string;
    detail: Record<string, unknown>;
    platform: string | null;
}

const ACTION_COLORS: Record<string, string> = {
    posted: '#16a34a',
    alerted: '#d97706',
    paused: '#7c3aed',
    noop: '#6b7280',
};

const HeartbeatTab: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const [logs, setLogs] = useState<HeartbeatLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [firing, setFiring] = useState(false);

    const refresh = useCallback(async () => {
        const [{ data: setting }, { data: logData }] = await Promise.all([
            supabase.from('admin_settings').select('value').eq('key', 'heartbeat_enabled').single(),
            supabase.from('heartbeat_log').select('*').order('fired_at', { ascending: false }).limit(20),
        ]);
        setEnabled(setting?.value === 'true');
        setLogs((logData ?? []) as HeartbeatLog[]);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const toggleEnabled = async () => {
        const next = !enabled;
        setEnabled(next);
        await supabase
            .from('admin_settings')
            .update({ value: next ? 'true' : 'false' })
            .eq('key', 'heartbeat_enabled');
    };

    const fireNow = async () => {
        setFiring(true);
        try {
            await supabase.functions.invoke('social-heartbeat', { body: {} });
            await refresh();
        } finally {
            setFiring(false);
        }
    };

    if (loading) return <div className="social-loading">Loading…</div>;

    return (
        <div className="heartbeat-tab">
            <div className="heartbeat-tab__controls">
                <div className="heartbeat-tab__toggle-row">
                    <span className="heartbeat-tab__label">Heartbeat Agent (fires every 30 min)</span>
                    <button
                        type="button"
                        className={`heartbeat-toggle ${enabled ? 'heartbeat-toggle--on' : ''}`}
                        onClick={toggleEnabled}
                    >
                        {enabled ? 'ON' : 'OFF'}
                    </button>
                </div>
                <button
                    className="ads-btn ads-btn--primary"
                    onClick={fireNow}
                    disabled={firing}
                >
                    {firing ? '⟳ Running…' : 'Fire Now'}
                </button>
            </div>

            <h3 className="heartbeat-tab__section-title">Activity Log</h3>
            {logs.length === 0 ? (
                <p className="heartbeat-tab__empty">No heartbeat activity yet.</p>
            ) : (
                <div className="heartbeat-tab__log">
                    {logs.map(log => (
                        <div key={log.id} className="heartbeat-log-item">
                            <span
                                className="heartbeat-log-item__action"
                                style={{ color: ACTION_COLORS[log.action] ?? '#6b7280' }}
                            >
                                {log.action.toUpperCase()}
                            </span>
                            {log.platform && (
                                <span className="heartbeat-log-item__platform">{log.platform}</span>
                            )}
                            <span className="heartbeat-log-item__reason">
                                {(log.detail?.reason as string) ?? JSON.stringify(log.detail)}
                            </span>
                            <span className="heartbeat-log-item__time">
                                {new Date(log.fired_at).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeartbeatTab;
