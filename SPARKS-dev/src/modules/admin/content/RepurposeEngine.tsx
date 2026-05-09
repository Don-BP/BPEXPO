import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRepurpose } from './useRepurpose';
import { RepurposeSourceType } from './types';

const SOURCE_TYPES: { key: RepurposeSourceType; label: string }[] = [
    { key: 'blog', label: 'Blog Post' },
    { key: 'transcript', label: 'Video Transcript' },
    { key: 'newsletter', label: 'Newsletter' },
    { key: 'tweet_thread', label: 'Tweet Thread' },
];

const scoreColor = (n: number) => n >= 8 ? '#16a34a' : n >= 5 ? '#d97706' : '#dc2626';

const RepurposeEngine: React.FC = () => {
    const [sourceText, setSourceText] = useState('');
    const [sourceType, setSourceType] = useState<RepurposeSourceType>('blog');
    const { variants, loading, error, repurpose } = useRepurpose();

    const addToCalendar = async (platform: string, content: string) => {
        await supabase.from('content_calendar').insert({
            platform,
            content,
            scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'draft',
            source: 'repurpose',
        });
        alert(`Added to Content Calendar as draft for ${platform}`);
    };

    return (
        <div className="repurpose-engine">
            <h2 className="content-section-title">Repurpose Engine</h2>
            <p className="content-section-hint">Paste any content. Get 8 platform-specific adaptations.</p>

            <div className="ads-form__field">
                <label className="ads-label">Source Type</label>
                <div className="ads-format-pills">
                    {SOURCE_TYPES.map(s => (
                        <button
                            key={s.key}
                            type="button"
                            className={`ads-format-pill ${sourceType === s.key ? 'ads-format-pill--active' : ''}`}
                            onClick={() => setSourceType(s.key)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <textarea
                className="ads-textarea"
                rows={10}
                placeholder="Paste your source content here…"
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
            />

            <button
                className="ads-btn ads-btn--primary"
                onClick={() => repurpose(sourceText, sourceType)}
                disabled={loading || !sourceText.trim()}
            >
                {loading ? '⟳ Repurposing…' : 'Repurpose for All Platforms'}
            </button>

            {error && <p className="ads-error">{error}</p>}

            {variants.length > 0 && (
                <div className="ads-variants-grid" style={{ marginTop: '1.5rem' }}>
                    {variants.map((v, i) => (
                        <div key={i} className="ads-variant-card">
                            <div className="ads-variant-card__header">
                                <span className="ads-type-badge">{v.platform}</span>
                                <span className="ads-char-count">{v.char_count} chars</span>
                                <span style={{ color: scoreColor(v.virality_score), fontWeight: 600 }}>
                                    ★ {v.virality_score}
                                </span>
                            </div>
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '.875rem', margin: '0.5rem 0' }}>{v.content}</p>
                            <div className="ads-variant-card__actions">
                                <button
                                    className="ads-btn ads-btn--ghost"
                                    onClick={() => navigator.clipboard.writeText(v.content)}
                                >
                                    Copy
                                </button>
                                <button
                                    className="ads-btn ads-btn--ghost"
                                    onClick={() => addToCalendar(v.platform, v.content)}
                                >
                                    + Calendar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RepurposeEngine;
