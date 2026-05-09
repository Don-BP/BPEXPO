import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useScriptBuilder } from './useScriptBuilder';
import { ContentScriptFormat } from './types';

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram Reels', 'LinkedIn', 'General'];
const scoreColor = (n: number) => n >= 8 ? '#16a34a' : n >= 5 ? '#d97706' : '#dc2626';

const ScriptBuilder: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [format, setFormat] = useState<ContentScriptFormat>('short');
    const [platform, setPlatform] = useState('YouTube');
    const [referenceUrl, setReferenceUrl] = useState('');
    const { result, loading, error, build } = useScriptBuilder();

    const addToCalendar = async () => {
        if (!result) return;
        await supabase.from('content_calendar').insert({
            platform: platform.toLowerCase().replace(' ', '_'),
            content: result.title_variants[0]?.title ?? topic,
            scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'draft',
            source: 'script_builder',
            virality_score: result.virality_score,
        });
        alert('Added to Content Calendar as draft.');
    };

    return (
        <div className="script-builder">
            <h2 className="content-section-title">Script Builder</h2>
            <p className="content-section-hint">Build short or long-form scripts with viral vector titles.</p>

            <div className="ads-form">
                <div className="ads-form__field">
                    <label className="ads-label">Topic</label>
                    <input className="ads-input" placeholder="What is this script about?"
                        value={topic} onChange={e => setTopic(e.target.value)} />
                </div>
                <div className="ads-form__field">
                    <label className="ads-label">Reference URL (optional)</label>
                    <input className="ads-input" placeholder="Paste a URL for reference content…"
                        value={referenceUrl} onChange={e => setReferenceUrl(e.target.value)} />
                </div>
                <div className="ads-form__field">
                    <label className="ads-label">Format</label>
                    <div className="ads-format-pills">
                        <button type="button"
                            className={`ads-format-pill ${format === 'short' ? 'ads-format-pill--active' : ''}`}
                            onClick={() => setFormat('short')}>Short-form (60-180s)</button>
                        <button type="button"
                            className={`ads-format-pill ${format === 'long' ? 'ads-format-pill--active' : ''}`}
                            onClick={() => setFormat('long')}>Long-form (5-15min)</button>
                    </div>
                </div>
                <div className="ads-form__field">
                    <label className="ads-label">Platform</label>
                    <select className="ads-select" value={platform} onChange={e => setPlatform(e.target.value)}>
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <button className="ads-btn ads-btn--primary"
                    onClick={() => build(topic, format, platform, referenceUrl || undefined)}
                    disabled={loading || !topic.trim()}>
                    {loading ? '⟳ Building Script…' : 'Build Script'}
                </button>
            </div>

            {error && <p className="ads-error">{error}</p>}

            {result && (
                <div className="script-result">
                    <div className="script-result__header">
                        <span style={{ color: scoreColor(result.virality_score), fontWeight: 700, fontSize: '1.1rem' }}>
                            Virality: {result.virality_score}/10
                        </span>
                        <span style={{ color: '#6b7280' }}>
                            ~{Math.round(result.estimated_duration_seconds / 60)} min
                        </span>
                        <button className="ads-btn ads-btn--ghost" onClick={addToCalendar}>
                            + Add to Calendar
                        </button>
                    </div>

                    <div className="script-result__titles">
                        <h4>Title Variants</h4>
                        <div className="ads-format-pills" style={{ flexWrap: 'wrap' }}>
                            {result.title_variants.map((t, i) => (
                                <button key={i} type="button"
                                    className="ads-format-pill"
                                    onClick={() => navigator.clipboard.writeText(t.title)}
                                    title={`Formula: ${t.formula.replace(/_/g, ' ')} — click to copy`}>
                                    {t.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="script-result__script">
                        <div className="script-result__script-header">
                            <h4>Script</h4>
                            <button className="ads-btn ads-btn--ghost"
                                onClick={() => navigator.clipboard.writeText(result.script)}>
                                Copy All
                            </button>
                        </div>
                        <pre className="script-result__script-body">{result.script}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScriptBuilder;
