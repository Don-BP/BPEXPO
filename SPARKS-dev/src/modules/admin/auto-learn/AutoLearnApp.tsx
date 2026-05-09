import React from 'react';
import { useAutoLearn } from './useAutoLearn';
import { StatusBar } from './StatusBar';
import { InsightsPanel } from './InsightsPanel';
import { RunHistory } from './RunHistory';
import type { ActiveStrategy } from './types';
import './AutoLearnApp.css';

const MODULE_LABELS: Record<string, string> = {
    ad_manager: 'Ad Manager',
    social_media: 'Social Media',
    cold_email: 'Cold Email',
};

interface StrategiesPanelProps {
    strategies: ActiveStrategy[];
    onSave: (module: string, strategy: string) => Promise<void>;
    onReset: (module: string) => Promise<void>;
}

const StrategiesPanel: React.FC<StrategiesPanelProps> = ({ strategies, onSave, onReset }) => {
    const [edits, setEdits] = React.useState<Record<string, string>>({});

    return (
        <div className="al-strategies-panel">
            <h2 className="al-section-title">Active Strategies</h2>
            <p className="al-section-hint">
                These instruction blocks are injected into Ad Manager, Social Media, and Cold Email generation prompts. Auto-Learn rewrites them each run. You can override manually.
            </p>
            <div className="al-strategies-grid">
                {['ad_manager', 'social_media', 'cold_email'].map(module => {
                    const s = strategies.find(x => x.module === module);
                    const text = edits[module] ?? s?.strategy ?? '';
                    return (
                        <div key={module} className="al-strategy-card">
                            <div className="al-strategy-card__header">
                                <span className="al-strategy-card__title">{MODULE_LABELS[module]}</span>
                                {s?.is_manual_override && (
                                    <span className="al-strategy-card__override-badge">Manual Override</span>
                                )}
                            </div>
                            <textarea
                                className="al-strategy-card__textarea"
                                rows={5}
                                value={text}
                                onChange={e => setEdits(prev => ({ ...prev, [module]: e.target.value }))}
                            />
                            <div className="al-strategy-card__actions">
                                <button
                                    className="al-btn al-btn--primary"
                                    onClick={() => onSave(module, text)}
                                >
                                    Save Override
                                </button>
                                <button
                                    className="al-btn al-btn--ghost"
                                    onClick={() => onReset(module)}
                                >
                                    Reset to AI
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AutoLearnApp: React.FC = () => {
    const { runs, loading, error, triggering, triggerRun, strategies, saveStrategyOverride, resetStrategyToAI } = useAutoLearn();

    if (loading) {
        return <div className="al-loading">Loading…</div>;
    }

    if (error) {
        return <div className="al-error">Error: {error}</div>;
    }

    return (
        <div className="al-root">
            <StrategiesPanel
                strategies={strategies}
                onSave={saveStrategyOverride}
                onReset={resetStrategyToAI}
            />
            <div className="al-header">
                <h1 className="al-title">Auto-Learn</h1>
                <p className="al-subtitle">
                    Karpathy loop — AI analyzes post metrics and generates improved content every week.
                </p>
            </div>
            <StatusBar
                runs={runs}
                triggering={triggering}
                onRunNow={triggerRun}
            />
            <InsightsPanel latestRun={runs[0] ?? null} />
            <RunHistory runs={runs} />
        </div>
    );
};

export default AutoLearnApp;
