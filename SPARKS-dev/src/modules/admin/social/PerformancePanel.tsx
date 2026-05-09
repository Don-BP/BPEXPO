import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { callAi } from '../../../lib/ai';

interface PlatformStats {
    platform: string;
    best_content_type: string;
    optimal_hour: number;
    optimal_day: string;
    avg_engagement: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PerformancePanel: React.FC = () => {
    const [stats, setStats] = useState<PlatformStats[]>([]);
    const [analyzerInput, setAnalyzerInput] = useState('');
    const [analyzerResult, setAnalyzerResult] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: posts } = await supabase
            .from('social_posts')
            .select('platform, content, metrics, posted_at')
            .eq('status', 'posted')
            .not('metrics', 'is', null)
            .gte('posted_at', thirtyDaysAgo);

        if (!posts || posts.length === 0) { setLoading(false); return; }

        const grouped: Record<string, Array<{ engagement: number; hour: number; day: number }>> = {};
        for (const p of posts) {
            if (!grouped[p.platform]) grouped[p.platform] = [];
            const eng = (p.metrics as Record<string, number>)?.engagement ?? 0;
            const date = new Date(p.posted_at);
            grouped[p.platform].push({ engagement: eng, hour: date.getHours(), day: date.getDay() });
        }

        const result: PlatformStats[] = Object.entries(grouped).map(([platform, entries]) => {
            const avg = entries.reduce((a, b) => a + b.engagement, 0) / entries.length;
            const hourCounts: Record<number, number> = {};
            const dayCounts: Record<number, number> = {};
            entries.forEach(e => {
                hourCounts[e.hour] = (hourCounts[e.hour] ?? 0) + e.engagement;
                dayCounts[e.day] = (dayCounts[e.day] ?? 0) + e.engagement;
            });
            const optHour = Number(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 12);
            const optDay = Number(Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 1);
            return {
                platform, avg_engagement: Math.round(avg),
                optimal_hour: optHour, optimal_day: DAY_NAMES[optDay],
                best_content_type: 'Mixed (more data needed)',
            };
        });

        setStats(result);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const analyzePost = async () => {
        if (!analyzerInput.trim()) return;
        setAnalyzing(true);
        const prompt = `You are a viral content analyst. Score this social post using the Viral Vector Formula.

Post: "${analyzerInput}"

Return a JSON object:
{
  "overall_score": 7,
  "modifier_type": "unexpected_modifier | curiosity_gap | number | contrast | question | none",
  "specificity": 6,
  "curiosity_gap": 8,
  "clarity": 7,
  "predicted_ctr": "medium | low | high",
  "improvements": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"],
  "rewritten": "Your improved version applying viral vector formula"
}`;
        try {
            const text = await callAi(prompt, 'gemini-2.0-flash');
            if (text) {
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed = JSON.parse(cleaned);
                setAnalyzerResult(JSON.stringify(parsed, null, 2));
            }
        } catch {
            setAnalyzerResult('Analysis failed — please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="social-loading">Loading performance data…</div>;

    return (
        <div className="performance-panel">
            <h3 className="performance-panel__title">Performance Intelligence</h3>

            {stats.length === 0 ? (
                <p className="performance-panel__empty">No performance data yet — post some content first.</p>
            ) : (
                <div className="performance-panel__stats-grid">
                    {stats.map(s => (
                        <div key={s.platform} className="performance-stat-card">
                            <div className="performance-stat-card__platform">{s.platform}</div>
                            <div className="performance-stat-card__metric">
                                <span>Optimal time</span>
                                <strong>{s.optimal_day} {s.optimal_hour}:00</strong>
                            </div>
                            <div className="performance-stat-card__metric">
                                <span>Avg engagement</span>
                                <strong>{s.avg_engagement}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h3 className="performance-panel__title" style={{ marginTop: '2rem' }}>Viral Vector Analyzer</h3>
            <p className="performance-panel__hint">Paste any post to score it against the viral vector formula.</p>
            <textarea
                className="ads-textarea"
                rows={4}
                placeholder="Paste a post here…"
                value={analyzerInput}
                onChange={e => setAnalyzerInput(e.target.value)}
            />
            <button
                className="ads-btn ads-btn--primary"
                onClick={analyzePost}
                disabled={analyzing || !analyzerInput.trim()}
            >
                {analyzing ? '⟳ Analyzing…' : 'Analyze'}
            </button>
            {analyzerResult && (
                <pre className="performance-panel__result">{analyzerResult}</pre>
            )}
        </div>
    );
};

export default PerformancePanel;
